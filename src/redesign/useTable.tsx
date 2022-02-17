import * as React from "react";

import { IColumnOptions, ITree, ITrees } from "../components/table/elementary-table";
import { IRow, IRowOptions } from "../components/table/row";
import {
  getTreesLength,
  getAllIndexesMap,
  IIndexesMap,
  relativeToAbsoluteIndexes,
  getIndexesIdsMapping,
  IIndexesIdsMapping,
  getColumnsLength,
  getCellPath,
  getCell as getTableCell,
  IRelativeIndexesMap,
  getRowTreeLength as getTreeLength,
  filterRowsByIndexes,
} from "../components/utils/table";
import { ICell, ICellCoordinates } from "../components/table/cell";
import { Nullable } from "../components/typing";

/**
 * We will be using something as close as possible to the original table,
 * with separated abstractions in this component
 * */
export interface IUseTableProps<IDataCoordinates = any> {
  /** All rows constituting the table */
  rows: IRow<IDataCoordinates>[];
  /** A list of branches to initialize opened rows and sub rows */
  initialOpenedTrees: ITrees;
  /** Options to customize any row, such as size */
  globalRowProps?: IRowOptions;
  fixedRows?: number[];
  visibleRowIndexes?: number[];
  /** Options to customize any column, such as size */
  globalColumnProps?: IColumnOptions;
  onOpenedTreesUpdate?: (openedTrees: ITrees) => void;
  goToColumnIndex?: (columnIndex: number) => boolean;
}

interface IState {
  rowsLength: number;
  fixedRowsIndexes: number[];
  openedTrees: ITrees;
  indexesMapping: IIndexesMap;
  columnsIndexesIdsMapping: IIndexesIdsMapping;
}

export interface ITableController<IDataCoordinates> {
  columnsLength: number;
  rowsLength: number;
  fixedRowsIndexes: number[];
  indexesMapping: IIndexesMap;
  openedTrees: ITrees;
  getVisibleRows: (
    rows: IRow[],
    absoluteIndex: Nullable<number>,
    fixedRowsAbsoluteIndexes?: number[]
  ) => [Nullable<number[]>, IRow[]];
  getRowTreeLength: (absoluteIndex: number) => number;
  getCell: (cellCoordinates: ICellCoordinates) => ICell<IDataCoordinates>;
  getColumnId: (columnIndex: number) => string;
  getColumnIndex: (columnId: string) => number;
  goToColumnId: (columnId: string) => void;
  closeTrees: (trees: ITrees) => void;
  openTrees: (trees: ITrees) => void;
  onRowClose: (closedTree: ITree) => void;
  onRowOpen: (openedTree: ITree) => void;
  getRowsProps: (cellHeight: number) => IRowOptions | undefined;
  getColumnsProps: (cellWidth: number) => IColumnOptions | undefined;
  getFixedRowsIndexes: (openedTrees: ITrees, relativeIndexesMapping: IRelativeIndexesMap) => number[];
}

function useTable<IDataCoordinates = any>(
  props: IUseTableProps<IDataCoordinates>,
  ref?: React.RefObject<ITableController<IDataCoordinates>>
): ITableController<IDataCoordinates> {
  const {
    rows,
    fixedRows,
    globalColumnProps,
    globalRowProps,
    initialOpenedTrees = {},
    visibleRowIndexes,
    onOpenedTreesUpdate,
    goToColumnIndex,
  } = props;

  const [state, setState] = React.useState<IState>({
    indexesMapping: { relative: {}, absolute: {} },
    openedTrees: initialOpenedTrees,
    rowsLength: 0,
    columnsIndexesIdsMapping: {},
    fixedRowsIndexes: [],
  });

  const { openedTrees, indexesMapping, columnsIndexesIdsMapping } = state;

  React.useEffect(() => {
    const currentCache = cache.current;
    currentCache.columnsLength = getColumnsLength(rows);
    const indexesMapping = getAllIndexesMap(openedTrees, rows);
    const newState: IState = {
      ...state,
      indexesMapping,
      rowsLength: getRowslength(openedTrees),
      columnsIndexesIdsMapping: rows[0] ? getIndexesIdsMapping(rows[0].cells) : {},
      fixedRowsIndexes: getFixedRowsIndexes(openedTrees, indexesMapping.relative),
    };
    // if (isVirtualized) {
    //   currentCache.fixedCellsHeight = getFixedElementsWithCustomSize(rows, fixedRows, hiddenRows);
    //   currentCache.fixedCellsWidth = getFixedElementsWithCustomSize(columns, fixedColumns, hiddenColumns);
    // }
    console.log("zzzzz");
    setState((prevState) => ({ ...prevState, ...newState }));
  }, [rows]);

  React.useEffect(() => {
    console.log("reeeows");
    // if (isVirtualized) {
    //   cache.current.fixedCellsHeight = getFixedElementsWithCustomSize(rows, fixedRows, hiddenRows);
    // }
    setState((prevState) => ({ ...prevState, fixedRowsIndexes: getFixedRowsIndexes(openedTrees, indexesMapping.relative) }));
  }, [fixedRows]);

  const cache = React.useRef<{
    globalColumnProps?: IColumnOptions;
    globalRowProps?: IRowOptions;
    columnsLength: number;
    // fixedCellsHeight: FixedCustomSizesElements;
    // fixedCellsWidth: FixedCustomSizesElements;
  }>({
    globalColumnProps,
    globalRowProps,
    columnsLength: 0,
    // fixedCellsHeight: {
    //   sum: 0,
    //   count: 0,
    //   customSizes: {},
    // },
    // fixedCellsWidth: {
    //   sum: 0,
    //   count: 0,
    //   customSizes: {},
    // },
  });

  const getFixedRowsIndexes = (openedTrees: ITrees, relativeIndexesMapping: IRelativeIndexesMap) => {
    if (fixedRows && fixedRows.length) {
      const newfixedRowsIndexes = relativeToAbsoluteIndexes(fixedRows, relativeIndexesMapping) || [];
      return Object.keys(openedTrees).reduce<number[]>((result, rowIndex) => {
        const { fixSubRows } = rows[rowIndex];
        if (fixSubRows) {
          const { subItems } = relativeIndexesMapping[rowIndex];
          const rowSubItems = subItems || {};
          result.push(...Object.keys(rowSubItems).map((subItem) => rowSubItems[subItem].index));
        }
        return result;
      }, newfixedRowsIndexes);
    }
    return [];
  };

  const getColumnsProps = (cellWidth: number) => {
    if (globalColumnProps?.size !== cellWidth) {
      const newGlobalColumnProps = { ...globalColumnProps, size: cellWidth };
      cache.current.globalColumnProps = newGlobalColumnProps;
    }
    return cache.current.globalColumnProps;
  };

  const getRowsProps = (cellHeight: number) => {
    if (globalRowProps?.size !== cellHeight) {
      const newGlobalRowProps = { ...globalRowProps, size: cellHeight };
      cache.current.globalRowProps = newGlobalRowProps;
    }
    return cache.current.globalRowProps;
  };

  const getRowslength = (openedTrees: ITrees): number => {
    let rowsLength = (rows && rows.length) || 0;
    rowsLength += openedTrees ? getTreesLength(openedTrees, rows) : 0;
    return rowsLength;
  };

  const updateState = (openedTrees: ITrees) => {
    const newIndexesMapping = getAllIndexesMap(openedTrees, rows);
    const newRowsLength = getRowslength(openedTrees);

    setState({
      ...state,
      indexesMapping: newIndexesMapping,
      openedTrees,
      rowsLength: newRowsLength,
      fixedRowsIndexes: getFixedRowsIndexes(openedTrees, newIndexesMapping.relative),
    });
    if (onOpenedTreesUpdate) {
      onOpenedTreesUpdate(openedTrees);
    }
  };

  const onRowOpen = (openedTree: ITree) => {
    const currentOpenedTrees = openedTrees || {};
    const newOpenedTrees = { ...currentOpenedTrees };
    // update the sub-tree to open
    newOpenedTrees[openedTree.rowIndex] = openedTree;
    updateState(newOpenedTrees);
  };

  const onRowClose = (closedTree: ITree) => {
    const currentOpenedTrees = openedTrees || {};
    const newOpenedTrees = { ...currentOpenedTrees };
    // remove the sub-tree to close
    delete newOpenedTrees[closedTree.rowIndex];
    if (Object.keys(newOpenedTrees).length !== Object.keys(openedTrees).length) {
      updateState(newOpenedTrees);
    }
  };

  const openTrees = (trees: ITrees) => {
    const currentOpenedTrees = openedTrees || {};
    const newOpenedTrees = { ...currentOpenedTrees, ...trees };
    updateState(newOpenedTrees);
  };

  const closeTrees = (trees: ITrees) => {
    const currentOpenedTrees = openedTrees || {};
    const newOpenedTrees = { ...currentOpenedTrees };
    Object.keys(trees).forEach((rowId) => {
      delete newOpenedTrees[rowId];
    });
    updateState(newOpenedTrees);
  };

  const goToColumnId = (columnId: string) => {
    if (goToColumnIndex) {
      const columnIndex = getColumnIndex(columnId);
      if (columnIndex !== undefined) {
        goToColumnIndex(columnIndex);
      }
    }
  };

  const getColumnIndex = (columnId: string) => {
    return columnsIndexesIdsMapping[columnId];
  };

  const getColumnId = (columnIndex: number) => {
    const header = rows[0] && rows[0].cells;
    const cell = header && header[columnIndex];
    return cell && cell.id;
  };

  const getCell = (cellCoordinates: ICellCoordinates): ICell<IDataCoordinates> => {
    const cellPath = getCellPath(cellCoordinates, indexesMapping.absolute, openedTrees);
    return getTableCell(rows, cellPath);
  };

  /** An utility of the table that return the length of the visible sub-rows
   * of the specified row by her absolute index. */
  const getRowTreeLength = (absoluteIndex: number): number => {
    // @ts-ignore we have a default value for visibleRowIndexes
    return getTreeLength(absoluteIndex, visibleRowIndexes || [], indexesMapping.absolute);
  };

  /** An utility of the table that return the visible rows for the specified row by her absolute index. */
  const getVisibleRows = (
    rows: IRow[],
    absoluteIndex: Nullable<number>,
    fixedRowsAbsoluteIndexes: number[] = []
  ): [Nullable<number[]>, IRow[]] => {
    return filterRowsByIndexes(rows, visibleRowIndexes || null, indexesMapping.absolute, absoluteIndex, fixedRowsAbsoluteIndexes);
  };

  const tableController = {
    columnsLength: cache.current.columnsLength,
    rowsLength: state.rowsLength,
    fixedRowsIndexes: state.fixedRowsIndexes,
    indexesMapping: state.indexesMapping,
    openedTrees: state.openedTrees,
    getVisibleRows,
    getRowTreeLength,
    getCell,
    getColumnId,
    getColumnIndex,
    goToColumnId,
    closeTrees,
    openTrees,
    onRowClose,
    onRowOpen,
    getRowsProps,
    getColumnsProps,
    getFixedRowsIndexes,
  };

  React.useImperativeHandle(ref, () => tableController);

  return tableController;
}

export default useTable;
