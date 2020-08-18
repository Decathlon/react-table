import * as React from "react";
import { merge } from "lodash";
import * as memoize from "memoize-one";
import update from "immutability-helper";

import { DEFAULT_ROW_HEIGHT, MouseClickButtons } from "../constants";
import { IColumn, ITree, IColumns, ITrees } from "../table/elementary-table";
import { IRowOptions, IRow } from "../table/row";
import { ICell, ICellCoordinates } from "../table/cell";
import { Nullable } from "../typing";
import { isEmptyObj } from "./common";
import shallowEqual from "./shallowEqual";

// @ts-ignore https://github.com/s-yadav/react-number-format/issues/180
const memoizeFunc = memoize.default || memoize;

export enum ElevationType {
  start = "start",
  end = "end"
}

export interface IElevateds {
  [key: string]: ElevationType;
}

export interface IAbsoluteIndex {
  index: number;
  parentIndex: Nullable<number>;
}

export interface IRelativeIndex {
  index: number;
  subItems?: IRelativeIndexesMap;
}

export interface IAbsoluteIndexesMap {
  [key: number]: IAbsoluteIndex;
}

export interface IRelativeIndexesMap {
  [key: number]: IRelativeIndex;
}

export interface IIndexesMap {
  absolute: IAbsoluteIndexesMap;
  relative: IRelativeIndexesMap;
}

export interface IIndexes {
  [index: number]: any;
}

export interface INode {
  id: string;
}

export interface IIndexesIdsMapping {
  [key: string]: number;
}

export type ICellPath = ICellCoordinates[];

export interface IColspanIndexWithValue {
  // index match with cell index and value is colspan
  [index: string]: number;
}

export interface IIndexToColspanMapping {
  [index: string]: number[];
}

export interface IColspanToIndexMapping {
  [index: string]: number;
}

export interface IIndexColspanMapping {
  isIdentity: boolean;
  indexToColspan: IIndexToColspanMapping;
  colspanToIndex: IColspanToIndexMapping;
}

/**
 * Used for sorting a list of numbers.
 * example of use: [2, 0, 3, 1].sort(compareNumbers) => [0, 1, 2, 3]
 * @param {number} a the first number.
 * @param {number} b the second number.
 * @return {number} The difference between "a" and "b".
 */
export function compareNumbers(a: number, b: number): number {
  return a - b;
}

export const computeCellStyle = (column?: IColumn, options?: IRowOptions): React.CSSProperties => {
  let cellStyle: React.CSSProperties = {};
  if (column) {
    if (column.style) {
      cellStyle = { ...cellStyle, ...column.style };
    }
    cellStyle.width = column.size || "auto";
  }
  cellStyle.height = (options && options.size) || DEFAULT_ROW_HEIGHT;
  return cellStyle;
};

export const computeRowStyle = (options: Nullable<IRowOptions>): React.CSSProperties => {
  const rowStyle: React.CSSProperties = {};
  rowStyle.height = options && options.size ? options.size : DEFAULT_ROW_HEIGHT;
  return rowStyle;
};

/**
 * @param {number} scrollIndex the scroll index computed by the scroller
 * @param {number[]} ignoredIndexes the list of the ignored indexes of the grid
 * @return {number} the index corresponding to the index of the scroller
 */
export const scrollIndexToGridIndex = (scrollIndex: number, ignoredIndexes: number[] = []) => {
  let previousIgnoredIndexes = 0;
  let indexesToJump = 0;
  const isIgnored = ignoredIndexes.includes(scrollIndex);
  for (let i = 0; i < ignoredIndexes.length; i += 1) {
    const ignoredIndex = ignoredIndexes[i];
    if (ignoredIndex <= scrollIndex) {
      previousIgnoredIndexes += 1;
    } else if (isIgnored && scrollIndex + indexesToJump + 1 === ignoredIndex) {
      indexesToJump += 1;
    }
  }

  return scrollIndex + previousIgnoredIndexes + indexesToJump;
};

/**
 * @param {number[]} fixedIndexes a list of number
 * @param {number} indexStart is a number corresponding to the index from which we want to add index to the fixedIndex list.
 * IndexStart is not using the same index scale than fixedIndex list
 * @param {number} maxLength is a number corresponding to the length of the array we work on
 * @param {number} totalCount is a number corresponding to the total length of the returned concatened array
 * @return {number[]} a list of number corresponding to the concatenation between
 * fixed indexes inferior of indexStart and unfixed indexes
 */
export const addSequentialIndexesToFixedIndexList = (
  fixedIndexes: number[],
  indexStart: number,
  maxLength: number,
  totalCount: number,
  hiddenIndexes: number[] = []
): number[] => {
  const result = [];
  let ignoredIndexes = [...fixedIndexes, ...hiddenIndexes];
  const numberOfIndexesToAdd = totalCount - fixedIndexes.length;
  let itemIndex = indexStart;
  // forward
  while (result.length < numberOfIndexesToAdd && itemIndex < maxLength) {
    if (!ignoredIndexes.includes(itemIndex)) {
      result.push(itemIndex);
    }
    itemIndex += 1;
  }
  // backward if not enough items
  if (result.length < numberOfIndexesToAdd) {
    ignoredIndexes = [...ignoredIndexes, ...result];
    while (result.length < numberOfIndexesToAdd && itemIndex > 0) {
      if (!ignoredIndexes.includes(itemIndex) && itemIndex < maxLength) {
        result.push(itemIndex);
      }
      itemIndex -= 1;
    }
  }

  return result.concat(fixedIndexes).sort(compareNumbers);
};

/**
 * @param {number[]} itemsIndexes an ordered list of number
 * @param {number[]} fixedIndexes a list of number
 * @return {IElevateds} returns an oject of numbers contained in both input list, where for each of those values the next one
 * contained in itemIndexes is not contained in fixedIndexes
 */
export const getElevatedIndexes = (
  itemsIndexes: number[],
  fixedIndexes: number[],
  usePrevIndexForLastElevation = false
): IElevateds => {
  const isLimit = (item1: number, item2: number) => {
    return item1 !== undefined && !fixedIndexes.includes(item1) && (item2 === undefined || fixedIndexes.includes(item2));
  };
  return itemsIndexes.reduce((result, itemIndex, index) => {
    const isFixed = fixedIndexes.includes(itemIndex);
    if (isFixed) {
      const nextItem = itemsIndexes[index + 1];
      const prevItem = itemsIndexes[index - 1];
      const isFixedStart = isLimit(nextItem, prevItem);
      const isFixedEnd = !isFixedStart && isLimit(prevItem, nextItem);
      if (isFixedStart || isFixedEnd) {
        const elevationIndex = usePrevIndexForLastElevation && !isFixedStart ? prevItem : itemIndex;
        result[elevationIndex] = isFixedStart ? ElevationType.start : ElevationType.end;
      }
    }
    return result;
  }, {});
};

export const getAllIndexesMap = (trees: ITrees = {}, rows: IRow[], root: Nullable<number> = null): IIndexesMap => {
  const defaultValue = { absolute: {}, relative: {} };
  return rows
    ? rows.reduce((currentValue, _, rowIndex) => {
        return merge(currentValue, getIndexesMap(trees, rowIndex, rows, root));
      }, defaultValue)
    : defaultValue;
};

const defaultAbsoluteIndex = { parentIndex: -1, index: -1 };

export const filterRowsByIndexes = (
  rows: IRow[],
  absoluteIndexes: Nullable<number[]>,
  absoluteIndexesMap: IAbsoluteIndexesMap,
  rootIndex: Nullable<number>,
  fixedRowsIndexes: number[] = []
): [Nullable<number[]>, IRow[]] => {
  if (absoluteIndexes) {
    let onlyFixed = fixedRowsIndexes.length > 0;
    const relativeIndexes = absoluteIndexes.reduce<number[]>((indexes, absoluteIndex) => {
      const { parentIndex, index } = absoluteIndexesMap[absoluteIndex] || defaultAbsoluteIndex;
      if (index >= 0) {
        if (parentIndex === rootIndex) {
          indexes.push(index);
          onlyFixed = onlyFixed && fixedRowsIndexes.indexOf(absoluteIndex) >= 0;
        } else if (onlyFixed || indexes.length === 0) {
          // we add the parent index of the row (absoluteIndex) included in the root row (rootIndex).
          // the row indexed by the parent index must be invisible
          const firstAbsoluteIndex = getRootIndex(absoluteIndex, rootIndex, absoluteIndexesMap);
          if (firstAbsoluteIndex > -1) {
            // If the fixed row has subItems
            const firstRelativeIndex = absoluteIndexesMap[firstAbsoluteIndex].index;
            // don't add the parent of the row if it's already in the indexes list
            if (!indexes.includes(firstRelativeIndex)) {
              indexes.push(firstRelativeIndex);
              onlyFixed = false;
            }
          }
        }
      }
      return indexes;
    }, []);

    return [relativeIndexes, relativeIndexes.map(index => rows[index])];
  }
  return [null, rows];
};

export const getTreesLength = (trees: ITrees, rows: IRow[]): number => {
  return Object.keys(trees).reduce((currentSum, rowIndex) => currentSum + getTreeLength(trees[rowIndex], rows), 0);
};

export const getTreeLength = (tree: ITree, rows: IRow[]): number => {
  const { rowIndex, columnIndex, subTrees } = tree;
  const row = rows[rowIndex];
  const cell = row && row.cells[columnIndex];
  const subRows = cell ? cell.subItems || [] : [];
  const current = subRows ? subRows.length : 0;
  if (!subTrees || isEmptyObj(subTrees)) {
    return current;
  }
  return getTreesLength(subTrees, subRows) + current;
};

export const getIndexesMap = (trees: ITrees = {}, rowIndex: number, rows: IRow[], root: Nullable<number> = null): IIndexesMap => {
  const result: IIndexesMap = { absolute: {}, relative: {} };
  const treesBeforeIndex = Object.keys(trees).reduce<ITrees>((result, treeRowIndex) => {
    if (parseInt(treeRowIndex) < rowIndex) {
      result[treeRowIndex] = trees[treeRowIndex];
    }
    return result;
  }, {});
  const rowTree = trees[rowIndex];
  const addon = root !== null ? root + 1 : 0;
  let absoluteIndex = rowIndex + addon;
  const absoluteMap: IAbsoluteIndex = { index: rowIndex, parentIndex: root };

  if (!isEmptyObj(treesBeforeIndex)) {
    absoluteIndex = getTreesLength(treesBeforeIndex, rows) + rowIndex + addon;
  }
  const relativeMap: IRelativeIndex = { index: absoluteIndex };
  if (rowTree) {
    const { columnIndex, subTrees } = rowTree;
    const row = rows[rowIndex];
    const cell = row && row.cells[columnIndex];
    const subRows = cell && cell.subItems;
    if (subRows && subRows.length > 0) {
      const subItems = getAllIndexesMap(subTrees, subRows, absoluteIndex);
      result.absolute = subItems.absolute;
      relativeMap.subItems = subItems.relative;
    }
  }
  result.absolute[absoluteIndex] = absoluteMap;
  result.relative[rowIndex] = relativeMap;
  return result;
};

export const getRootIndex = (absoluteIndex: number, root: Nullable<number>, absoluteIndexesMap: IAbsoluteIndexesMap): number => {
  const { parentIndex } = absoluteIndexesMap[absoluteIndex] || defaultAbsoluteIndex;
  if (parentIndex === root) {
    return absoluteIndex;
  }
  if (parentIndex === null || parentIndex === -1) {
    return -1;
  }
  return getRootIndex(parentIndex, root, absoluteIndexesMap);
};

export const getRowTreeLength = (
  rowAbsoluteIndex: number,
  absoluteIndexes: number[],
  absoluteIndexesMap: IAbsoluteIndexesMap
) => {
  return absoluteIndexes.filter(absoluteIndex => getRootIndex(absoluteIndex, rowAbsoluteIndex, absoluteIndexesMap) > -1).length;
};

/**
 * Filter indexes between the start index and the end index.
 * example of use: {1: "v1", 2: "v2", 3: "v3", 4: "v4"}, 2, 5 => {2: "v2", 3: "v3", 4: "v4"}
 * @param {IIndexes} indexes an object that's representing the indexes.
 * @param {number} startIndex the first number.
 * @param {number} endIndex the second number.
 * @return {number} An object that's representing the indexes from the start index to the end index
 */
export const filterIndexes = (indexes: IIndexes, startIndex: number, endIndex: number) => {
  const result = {};
  for (let index = startIndex; index <= endIndex; index += 1) {
    const value = indexes[index];
    if (value) {
      result[index] = value;
    }
  }
  return result;
};
export const getMouseClickButton = (clickCode: number): MouseClickButtons => {
  switch (clickCode) {
    case 0:
      return MouseClickButtons.left;
    case 2:
      return MouseClickButtons.right;
    default:
      return MouseClickButtons.left;
  }
};

/**
 * Calculate the  size of all fixed elements with a custom size and count those elements
 * @param elements
 * @param fixedElements
 */
export const getFixedElementFixedSizeSum = (
  elements: IRow[] | { [index: number]: IColumn } = [],
  fixedElements?: number[],
  hiddenIndexes: number[] = []
) => {
  let fixedElementFixedSizeSum;
  if (fixedElements) {
    fixedElementFixedSizeSum = fixedElements.reduce(
      (currFixedElementFixedSizeSum, index) => {
        const element = elements[index];
        const size = element && element.size;
        return !hiddenIndexes.includes(index) && size
          ? {
              sum: currFixedElementFixedSizeSum.sum + size,
              count: currFixedElementFixedSizeSum.count + 1
            }
          : currFixedElementFixedSizeSum;
      },
      {
        sum: 0,
        count: 0
      }
    );
  }
  return fixedElementFixedSizeSum;
};

/** this method is used to prevent the render of a previously visible index that does not exist in the new data received in props */
export const getVisibleIndexesInsideDatalength = (dataLength: number, visibleIndexes: number[]): number[] => {
  const lastVisibleIndex = visibleIndexes[visibleIndexes.length - 1];
  return lastVisibleIndex < dataLength ? visibleIndexes : visibleIndexes.filter(column => column < dataLength);
};

/**
 * transform relative indexes into absolute indexes
 * @param {number[]} relativeIndexes alist of absolute indexes.
 * @param {IRelativeIndexesMap} relativeMap the relative indexes mapping.
 * @return {number[]} a list of absolute indexes
 */
export const relativeToAbsoluteIndexes = (relativeIndexes: number[] = [], relativeMap: IRelativeIndexesMap): number[] => {
  return relativeIndexes.reduce<number[]>((absoluteIndexes, relativeIndex) => {
    if (relativeMap[relativeIndex]) {
      absoluteIndexes.push(relativeMap[relativeIndex].index);
    }
    return absoluteIndexes;
  }, []);
};

export const getIndexesIdsMapping = (items: INode[]): IIndexesIdsMapping => {
  return items.reduce((result, item, index) => {
    result[item.id] = index;
    return result;
  }, {});
};

const getRootsRowsIndexes = (rowIndex: number, absoluteIndexesMap: IAbsoluteIndexesMap): number[] => {
  const openedRows = [];
  let { parentIndex } = absoluteIndexesMap[rowIndex];
  while (parentIndex) {
    openedRows.unshift(parentIndex);
    parentIndex = absoluteIndexesMap[parentIndex].parentIndex;
  }
  return openedRows;
};

export const getCellPath = (
  cellCoordinates: ICellCoordinates,
  absoluteIndexesMap: IAbsoluteIndexesMap,
  openedTrees: ITrees = {}
): ICellPath => {
  if (!openedTrees || isEmptyObj(openedTrees)) {
    return [cellCoordinates];
  }
  const { rowIndex, cellIndex } = cellCoordinates;
  const cellPath: ICellPath = [];
  const openedRowsIndexes = getRootsRowsIndexes(rowIndex, absoluteIndexesMap);
  let currentOpenedTrees: ITrees | undefined = openedTrees;
  let index = 0;
  while (currentOpenedTrees && index < openedRowsIndexes.length) {
    const openedRowIndex = openedRowsIndexes[index];
    const currentOpenedTree: ITree | undefined = currentOpenedTrees[openedRowIndex];
    if (currentOpenedTree) {
      const rootPathPart: ICellCoordinates = {
        rowIndex: openedRowIndex,
        cellIndex: currentOpenedTree.columnIndex
      };
      cellPath.push(rootPathPart);
      currentOpenedTrees = currentOpenedTree.subTrees;
    } else {
      break;
    }
    index += 1;
  }

  const cellPathPart: ICellCoordinates = { rowIndex, cellIndex };
  cellPath.push(cellPathPart);
  return cellPath;
};

export const getCell = (rows: IRow[], cellPath: ICellPath): ICell => {
  let cell: ICell;
  let currentRows = rows;
  cellPath.forEach(cellPathPart => {
    const row = currentRows[cellPathPart.rowIndex];
    cell = row && row.cells[cellPathPart.cellIndex];
    currentRows = cell ? cell.subItems || [] : [];
  });
  // @ts-ignore Variable 'cell' is used before being assigned.
  return cell;
};

export const setCell = (rows: IRow[], cellPath: ICellPath, newValue: Nullable<ICell>): IRow[] => {
  if (rows.length && cellPath.length) {
    const reversedCellPath = [...cellPath].reverse();
    const query = reversedCellPath.reduce((query, cellPathPart, index) => {
      if (index === 0) {
        const syncRowIndex = cellPathPart.rowIndex;
        query = {
          [syncRowIndex]: {
            cells: { [cellPathPart.cellIndex]: { $set: newValue } }
          }
        };
      } else {
        query = {
          [cellPathPart.rowIndex]: {
            cells: { [cellPathPart.cellIndex]: { subItems: query } }
          }
        };
      }
      return query;
    }, {});
    return update(rows, query);
  }
  return rows;
};

export const generateArray = (startIndex: number, length: number): number[] => {
  const result = [];
  for (let index = startIndex; index < length + startIndex; index++) {
    result.push(index);
  }
  return result;
};

/**
 * example:
 * cells = [{id: "(0)", value: "(0)", colspan: 2, subItems: Array(5)}, {id: "(1)", value: "(1)"}]
 * @param cells
 * return {
 * indexToColspan: {0: [0, 1], 1: [2]}
 * colspanToIndex: {0: 0, 1: 0, 2: 1}
 * }
 */
export const getMappingCellsWithColspan = memoizeFunc(
  (cells: ICell[]): IIndexColspanMapping => {
    let startIndex = 0;
    return cells.reduce(
      (result, cell, index) => {
        const colspan = cell.colspan || 1;
        const colspanIndexes = generateArray(startIndex, colspan);
        let isIdentity = true;
        result.indexToColspan[index] = colspanIndexes;
        colspanIndexes.reduce((colspanToIndex, colspanIndex) => {
          colspanToIndex[colspanIndex] = index;
          isIdentity = isIdentity && colspanIndex === index;
          return colspanToIndex;
        }, result.colspanToIndex);
        startIndex += colspan;
        // @ts-ignore  Type 'boolean' is not assignable to type 'true' (only for tests)
        result.isIdentity = result.isIdentity && isIdentity;
        return result;
      },
      {
        isIdentity: true,
        indexToColspan: {},
        colspanToIndex: {}
      }
    );
  }
);

/**
 * example :
 * indexes = [0,1,2]
 * colspanToIndexMapping = { 0: 0, 1: 0, 2: 1}
 * return { 0: 2, 1: 1}
 * @param indexes
 * @param colspanToIndexMapping
 * @return {IColspanIndexWithValue}
 */
export const getColspanValues = (
  indexes: number[],
  colspanToIndexMapping: IColspanToIndexMapping
): [Nullable<number[]>, Nullable<IColspanIndexWithValue>] => {
  const colspanIndexes = new Set<number>();
  if (indexes) {
    const colspanIndexWithValue = indexes.reduce((result, index) => {
      const currentIndex = colspanToIndexMapping[index];
      if (currentIndex !== undefined) {
        const colspanValue = result[currentIndex] || 0;
        result[currentIndex] = colspanValue + 1;
        colspanIndexes.add(currentIndex);
      }
      return result;
    }, {});

    return [Array.from(colspanIndexes), colspanIndexWithValue];
  }
  return [null, null];
};

// we assume that all table's rows have the same columns length
export const getColumnsLength = (rows: IRow[]) => {
  let length = 0;
  if (rows.length) {
    const header = rows[0];
    for (let cellIndex = 0; cellIndex < header.cells.length; cellIndex += 1) {
      const cell = header.cells[cellIndex];
      // Generally the default value of a colspan is 1
      const colspan = cell.colspan || 1;
      length += colspan;
    }
  }
  return length;
};

export const getDenseColumns = memoizeFunc(
  (tableWidth: number, containerWidth: number, columnsLength: number, columns: IColumns = {}) => {
    const isDense = containerWidth > tableWidth;
    let denseColumns = columns;
    if (isDense) {
      denseColumns = { ...columns };
      const lastColumnIndex = columnsLength - 1;
      const currentColumn = denseColumns[lastColumnIndex] || {};
      const denseWidth = containerWidth - tableWidth;
      denseColumns[lastColumnIndex] = {
        ...currentColumn,
        style: { ...currentColumn.style, paddingRight: denseWidth }
      };
    }
    return denseColumns;
  },
  (args: any, newArgs: any) => shallowEqual(args, newArgs)
);

const scrollDivStyle = "width: 1337px; height: 1337px; position: absolute; left: -9999px; overflow: scroll;";

export const getScrollbarSize = () => {
  const { body } = document;
  const scrollDiv = document.createElement("div");

  // Append element with defined styling
  scrollDiv.setAttribute("style", scrollDivStyle);
  body.appendChild(scrollDiv);

  // Collect width of scrollbar
  const scrollbarSize = scrollDiv.offsetWidth - scrollDiv.clientWidth;

  // Remove element
  body.removeChild(scrollDiv);

  return scrollbarSize;
};
