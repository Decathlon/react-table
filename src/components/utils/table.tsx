import * as React from "react";
import { merge } from "lodash";
import * as memoize from "memoize-one";
import update from "immutability-helper";

import { DEFAULT_ROW_HEIGHT, MouseClickButtons } from "../constants";
import { IColumn, ITree, IColumns, ITrees } from "../table/elementary-table";
import { IRowOptions, IRow, IRowProps } from "../table/row";
import { ICell, ICellCoordinates } from "../table/cell";
import { Nullable } from "../typing";
import { isEmptyObj } from "./common";
import shallowEqual from "./shallowEqual";

const ERROR_MARGIN = 10;

// @ts-ignore https://github.com/s-yadav/react-number-format/issues/180
const memoizeFunc = memoize.default || memoize;

export enum ElevationType {
  start = "start",
  end = "end",
  absolute = "absolute",
}

export interface IElevateds {
  elevations: Record<number, ElevationType>;
  absoluteEndPositions: Record<number, number>;
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

export interface VirtualizerCache {
  itemsCount: number;
  itemSize: number;
  visibleFixedItems: number[];
  virtualSize: number;
  itemIndexesScrollMapping: number[];
  visibleItemIndexes: Record<number, number[]>;
  ignoredIndexes: Record<number, true>;
  scrollableItemsSize?: number;
  scrollableCustomSize?: number;
}

interface CacheProps {
  /** List of fixed items on the left or right of your table */
  fixedItems: number[];
  /** Specifies indexes of the items to be hidden */
  hiddenItems: number[];
  /** Number of items that should be visible on screen */
  itemsCount?: number;
  /** Minimal size of a item */
  minItemSize: number;
  /** Sum of the custom items sizes */
  customSizesElements: CustomSizesElements;
  /** A pre-defined padding of the grid */
  padding: number;
  /** Table container displayable size */
  containerSize: number;
  /** Total number of items */
  itemsLength: number;
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

export const findFirstNotIncluded = (source: number[], items: number[]): number => {
  let index = 0;
  while (index < source.length) {
    if (!items.includes(source[index])) {
      return source[index];
    }
    index += 1;
  }
  return -1;
};

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

export const computeRowStyle = (options: Nullable<IRowOptions>, style: React.CSSProperties = {}): React.CSSProperties => {
  const rowStyle: React.CSSProperties = { ...style };
  rowStyle.height = options && options.size ? options.size : DEFAULT_ROW_HEIGHT;
  return rowStyle;
};

interface AddSequentialIndexesToFixedIndexList {
  indexStart: number;
  fixedIndexes: number[];
  maxLength: number;
  maxSize: number;
  defaultItemSize: number;
  ignoredIndexes: Record<number, true>;
  customSizes: Record<number, number>;
}

/**
 * @param {number[]} fixedIndexes a list of number
 * @param {number} indexStart is a number corresponding to the index from which we want to add index to the fixedIndex list.
 * IndexStart is not using the same index scale than fixedIndex list
 * @param {number} maxLength is a number corresponding to the length of the array we work on
 * @param {number} totalCount is a number corresponding to the total length of the returned concatened array
 * @return {number[]} a list of number corresponding to the concatenation between
 * fixed indexes inferior of indexStart and unfixed indexes
 */
export const addSequentialIndexesToFixedIndexList = ({
  indexStart,
  fixedIndexes,
  maxLength,
  maxSize,
  defaultItemSize,
  ignoredIndexes = {},
  customSizes = {},
}: AddSequentialIndexesToFixedIndexList): number[] => {
  if (!maxSize) {
    return [];
  }
  const localIgnoredIndexes = { ...ignoredIndexes };
  let currentSize = 0;
  const result = [];

  let itemIndex = indexStart;
  // forward
  while (itemIndex < maxLength && currentSize <= maxSize) {
    const itemSize = customSizes[itemIndex] || defaultItemSize;
    if (!localIgnoredIndexes[itemIndex]) {
      currentSize += itemSize;
      result.push(itemIndex);
      localIgnoredIndexes[itemIndex] = true;
    }
    itemIndex += 1;
  }
  // backward if not enough items
  if (currentSize < maxSize) {
    while (itemIndex > 0 && currentSize <= maxSize) {
      const itemSize = customSizes[itemIndex] || defaultItemSize;
      const newSize = currentSize + itemSize - ERROR_MARGIN;
      if (!localIgnoredIndexes[itemIndex] && itemIndex < maxLength && newSize <= maxSize) {
        result.push(itemIndex);
        currentSize += itemSize;
        localIgnoredIndexes[itemIndex] = true;
      } else if (!localIgnoredIndexes[itemIndex] && itemIndex < maxLength) {
        break;
      }
      itemIndex -= 1;
    }
  }

  return result.concat(fixedIndexes).sort(compareNumbers);
};

/**
 *
 * @param visibleItemIndexes an ordered list of number
 * @param ignoredIndexes the ignored indexes (fixed indexes)
 * @param itemSizes custom sizes
 * @param defaultSize default size if no custom sizes
 * @param usePrevIndexForLastElevation used for elevation computation
 * @returns elevations and absolute positions of fixed columns
 */
export const getElevatedIndexes = (
  visibleItemIndexes: number[],
  ignoredIndexes: Record<number, true> = {},
  itemSizes: Record<number, number> = {},
  defaultSize: number,
  usePrevIndexForLastElevation?: boolean
): IElevateds => {
  const isLimit = (item1: number, item2: number) => {
    return item1 !== undefined && !ignoredIndexes[item1] && (item2 === undefined || ignoredIndexes[item2]);
  };
  const absoluteFixed: number[] = [];
  const elevations = visibleItemIndexes.reduce((result, itemIndex, index) => {
    const isFixed = ignoredIndexes[itemIndex];
    if (isFixed) {
      const nextItem = visibleItemIndexes[index + 1];
      const prevItem = visibleItemIndexes[index - 1];
      const isFixedStart = isLimit(nextItem, prevItem);
      const isEnd = isLimit(prevItem, nextItem);
      const isFixedEnd = !isFixedStart && isEnd;
      const isAbsoluteEnd = isEnd || result[prevItem] === ElevationType.absolute;

      if (isFixedStart || isFixedEnd) {
        const elevationIndex = usePrevIndexForLastElevation && !isFixedStart ? prevItem : itemIndex;
        result[elevationIndex] = isFixedStart ? ElevationType.start : ElevationType.end;
      }
      if (isAbsoluteEnd) {
        result[itemIndex] = ElevationType.absolute;
        absoluteFixed.unshift(itemIndex);
      }
    }
    return result;
  }, {});

  const absoluteEndPositions: Record<number, number> = {};
  if (absoluteFixed.length) {
    absoluteEndPositions[absoluteFixed[0]] = 0;
    for (let i = 1; i < absoluteFixed.length; i++) {
      const itemIndex = absoluteFixed[i];
      const prevItemIndex = absoluteFixed[i - 1];
      const itemSize = itemSizes[prevItemIndex] || defaultSize;
      absoluteEndPositions[itemIndex] = itemSize + absoluteEndPositions[prevItemIndex];
    }
  }
  return {
    elevations,
    absoluteEndPositions,
  };
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

    return [relativeIndexes, relativeIndexes.map((index) => rows[index])];
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
): number => {
  return absoluteIndexes.filter((absoluteIndex) => getRootIndex(absoluteIndex, rowAbsoluteIndex, absoluteIndexesMap) > -1).length;
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

interface CustomSizesData {
  sum: number;
  count: number;
}

export interface CustomSizesElements {
  fixed: CustomSizesData;
  scrollable: CustomSizesData;
  // key === item index and value item width
  customSizes: Record<number, number>;
}

/**
 * Calculate the  size of all fixed elements with a custom size and count those elements
 * @param elements
 * @param fixedElements
 */
export const getItemsCustomSizes = (
  elements: Record<number, IColumn | IRowProps> = {},
  fixedElements?: number[],
  hiddenIndexes: number[] = []
): CustomSizesElements => {
  const keys = Object.keys(elements);
  const customSizesElements: CustomSizesElements = {
    fixed: {
      sum: 0,
      count: 0,
    },
    scrollable: {
      sum: 0,
      count: 0,
    },
    customSizes: {},
  };
  keys.forEach((key) => {
    const element = elements[key];
    const size = element && element.size;
    if (!hiddenIndexes.includes(Number(key)) && size) {
      const isFixed = fixedElements?.includes(Number(key));
      const items = isFixed ? customSizesElements.fixed : customSizesElements.scrollable;
      customSizesElements.customSizes[key] = size;
      items.sum += size;
      items.count += 1;
    }
  });

  return customSizesElements;
};

/** this method is used to prevent the render of a previously visible index that does not exist in the new data received in props */
export const getVisibleIndexesInsideDatalength = (dataLength: number, visibleIndexes: number[]): number[] => {
  const lastVisibleIndex = visibleIndexes[visibleIndexes.length - 1];
  return lastVisibleIndex < dataLength ? visibleIndexes : visibleIndexes.filter((column) => column < dataLength);
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

/**
 * transform relative indexes into absolute indexes
 * @param {Record<string, number>} relativeObject object with absolute keys.
 * @param {IRelativeIndexesMap} relativeMap the relative indexes mapping.
 * @return {Record<string, number>} a list of absolute indexes
 */
export const relativeToAbsoluteObject = (
  relativeObject: Record<string, number> = {},
  relativeMap: IRelativeIndexesMap
): Record<string, number> => {
  return Object.keys(relativeObject).reduce<Record<string, number>>((absoluteIndexes, relativeIndex) => {
    if (relativeMap[relativeIndex]) {
      absoluteIndexes[relativeMap[relativeIndex].index] = relativeObject[relativeIndex];
    }
    return absoluteIndexes;
  }, {});
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
        cellIndex: currentOpenedTree.columnIndex,
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
  cellPath.forEach((cellPathPart) => {
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
            cells: { [cellPathPart.cellIndex]: { $set: newValue } },
          },
        };
      } else {
        query = {
          [cellPathPart.rowIndex]: {
            cells: { [cellPathPart.cellIndex]: { subItems: query } },
          },
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
export const getMappingCellsWithColspan = memoizeFunc((cells: ICell[]): IIndexColspanMapping => {
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
      colspanToIndex: {},
    }
  );
});

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
        style: { ...currentColumn.style, paddingRight: denseWidth },
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

/**
 * ex itemsLength=4; itemsSizes={ 0:40 }; defaultCellSize=10; hiddenItems=[1] =>
 *  [0, 40, 40, 50]
 * @param itemsLength number of total items
 * @param itemsSizes custom item sizes
 * @param defaultCellSize default item size if no custom item size
 * @param hiddenItems hidden items (size == 0)
 * @returns
 */
export const getIndexScrollMapping = (
  itemsLength: number,
  itemsSizes: Record<number, number> = {},
  defaultItemSize: number,
  hiddenItems: number[]
): number[] => {
  const result: number[] = [0];
  for (let i = 1; i < itemsLength; i++) {
    const prevItemSize = hiddenItems.includes(i - 1) ? 0 : itemsSizes[i - 1] || defaultItemSize;
    result[i] = (result[i - 1] || 0) + prevItemSize;
  }
  return result;
};

/**
 *
 * @param props The grid props
 * @returns The cache associated with the virtualized grid
 */
export const getVirtualizerCache = ({
  customSizesElements,
  padding,
  containerSize,
  itemsLength,
  hiddenItems,
  fixedItems,
  itemsCount,
  minItemSize,
}: CacheProps): VirtualizerCache => {
  const cache: VirtualizerCache = {
    itemsCount: 0,
    itemSize: 0,
    visibleFixedItems: [],
    virtualSize: 0,
    itemIndexesScrollMapping: [],
    visibleItemIndexes: {},
    ignoredIndexes: {},
  };
  const { fixed: fixedCustomSizesItems, scrollable: scrollableCustomSizesItems } = customSizesElements;
  /**
   * Size allocated to the padding and the fixed items that have a custom size specified by the user.
   * We only take into account visible fixed items  with a custom size.
   */
  const extraItemsSize = fixedCustomSizesItems.sum + padding;
  /** Available size on the table container displayable size */
  const scrollableItemsSize = containerSize - extraItemsSize;
  /**
   * contains every items that are not hidden
   */
  const scrollableItemsCount = itemsLength - hiddenItems.length - fixedCustomSizesItems.count;

  cache.visibleFixedItems = fixedItems.filter((fixedItem) => !hiddenItems.includes(fixedItem));
  /** the total number of items we have to display inside the table size */
  cache.itemsCount =
    itemsCount !== undefined ? itemsCount : Math.floor(scrollableItemsSize / minItemSize + fixedCustomSizesItems.count);

  /** Items size for the items without manual specified size */
  cache.itemSize = cache.itemsCount > 0 ? Math.ceil(scrollableItemsSize / (cache.itemsCount - fixedCustomSizesItems.count)) : 0;

  /** The size of the table if all items are displayed */
  cache.virtualSize =
    (scrollableItemsCount - scrollableCustomSizesItems.count) * cache.itemSize + extraItemsSize + scrollableCustomSizesItems.sum;
  // The visible fixed items and hidden items must be ignored by the scroller
  const ignoredIndexes = [...cache.visibleFixedItems, ...hiddenItems];

  ignoredIndexes.forEach((ignoredIndex) => {
    cache.ignoredIndexes[ignoredIndex] = true;
  });
  // The size of the scrollable element area
  cache.scrollableItemsSize =
    scrollableItemsSize - (cache.visibleFixedItems.length - fixedCustomSizesItems.count) * cache.itemSize;
  // The sum of the sizes of custom scrollable items
  cache.scrollableCustomSize = scrollableCustomSizesItems.sum;
  cache.visibleItemIndexes = {};
  return cache;
};

function interpolationSearch(arr: number[], value: number) {
  let low = 0;
  let high = arr.length - 1;
  let mid = 0;

  while (high > low + 1) {
    mid = Math.ceil((high - low) / 2) + low;
    if (arr[low] >= value) return low;
    if (value >= arr[mid]) low = mid;
    else high = mid;
  }

  if (value >= arr[low]) return low;
  else return arr.length - 1;
}

/**
 *
 * @param scrollValue the scroll value of the virtualized scroller
 * @param maxLength the max number of items
 * @param customSizes custom item sizes
 * @param cache the virtualizer cache
 * @returns visible items
 */
export const getVisibleItemIndexes = (
  scrollValue = 0,
  maxLength: number,
  customSizes: Record<number, number>,
  {
    visibleFixedItems,
    visibleItemIndexes,
    itemIndexesScrollMapping,
    ignoredIndexes,
    scrollableItemsSize = 0,
    itemSize,
  }: VirtualizerCache
): number[] => {
  const scrollIndex = interpolationSearch(itemIndexesScrollMapping, scrollValue);

  if (!visibleItemIndexes[scrollIndex]) {
    visibleItemIndexes[scrollIndex] = addSequentialIndexesToFixedIndexList({
      indexStart: scrollIndex,
      fixedIndexes: visibleFixedItems,
      ignoredIndexes,
      maxLength,
      maxSize: scrollableItemsSize,
      defaultItemSize: itemSize,
      customSizes,
    });
    return visibleItemIndexes[scrollIndex];
  }

  return visibleItemIndexes[scrollIndex];
};
