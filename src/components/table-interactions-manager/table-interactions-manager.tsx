import * as React from "react";

import Table from "../table/table";
import { OnHorizontallyScrollProps } from "../virtualizer";
import {
  TableInteractionsAction,
  updateHiddenColumns,
  updateRowHeight,
  updateCellWidth,
  updateColumnsCursor,
  updateFixedColumns,
  updateFixedRows
} from "./actions";
import TableInteractionsManagerReducer, {
  ITableInteractionManagerState,
  CellValue,
  initialState,
  CellDimension
} from "./reducers";
import { ICellCoordinates, ICell } from "../table/cell";
import { Nullable } from "../typing";
import { ITrees } from "../table/elementary-table";
import useComponent, { ComponentRef } from "../../hooks/useComponent";

export interface OnScrollCallbackProps {
  /** The current column id. */
  columnsCursorId: string;
}

interface Column {
  id: string;
  index: number;
}

interface ITableInteractionsManagerProps extends ITableInteractionManagerState {
  tableRef: Nullable<(table: Table) => void>;
  /** The table ref. */
  table: Nullable<ComponentRef<Table>>;
  /** The current hidden columns of the table (indexes). */
  hiddenColumnsIndexes: number[];
  /** The current fixed columns of the table (indexes). */
  fixedColumnsIndexes: number[];
  /** The current fixed rows of the table (indexes). */
  fixedRowsIndexes: number[];
  /** The hidden columns controller. Please see the ColumnVisibilityController. */
  updateHiddenIds: (hiddenIds: string[]) => void;
  /** The fixed columns controller. */
  updateFixedColumnsIds: (fixedIds: string[]) => void;
  /** The fixed rows controller. */
  updateFixedRowsIndexes: (fixedIndexes: number[]) => void;
  /** The row height controler. Please see the CellDimensionController */
  updateRowHeight: (value: CellDimension) => void;
  /** The cell width controler. Please see the CellDimensionController */
  updateCellWidth: (value: CellDimension) => void;
  /** The scroll controler (scrolling by column id). Please see the WeekScrollerController. */
  goToColumnId: (columnId: string) => void;
  /** The scroll controler (scrolling by column index). Please see the WeekScrollerController. */
  goToColumnIndex: (columnIndex: number) => void;
  /** return the cell props of the table */
  getCell: (cellCoordinates: ICellCoordinates) => Nullable<ICell>;
  /** Control opened rows */
  openTrees: (trees: ITrees) => void;
  /** Control closed rows */
  closeTrees: (trees: ITrees) => void;
  /** Callback fired when a "scroll" (Horizontally) event is detected. */
  onHorizontallyScroll: (
    props: OnHorizontallyScrollProps,
    callback?: (onScrollCallbackProps: OnScrollCallbackProps) => void
  ) => void;
  onTableUpdate: () => void;
}

interface IProps {
  children: JSX.Element | JSX.Element[];
  toggleableColumns: Column[];
  /** The initial table interaction config. */
  initialConfig?: Partial<ITableInteractionManagerState>;
  /** Callback fired when the interaction context state has changed. */
  onStateUpdate?: (state: ITableInteractionManagerState) => void;
}

const nullFunction = (): any => null;

const initialContext: ITableInteractionsManagerProps = {
  ...initialState,
  tableRef: nullFunction,
  table: null,
  hiddenColumnsIndexes: [],
  fixedColumnsIndexes: [],
  fixedRowsIndexes: [],
  updateHiddenIds: nullFunction,
  updateFixedColumnsIds: nullFunction,
  updateFixedRowsIndexes: nullFunction,
  updateRowHeight: nullFunction,
  updateCellWidth: nullFunction,
  goToColumnId: nullFunction,
  goToColumnIndex: nullFunction,
  getCell: nullFunction,
  openTrees: nullFunction,
  closeTrees: nullFunction,
  onHorizontallyScroll: nullFunction,
  onTableUpdate: nullFunction
};

export const TableInteractionsContext: React.Context<ITableInteractionsManagerProps> = React.createContext<
  ITableInteractionsManagerProps
>({
  ...initialContext
});

const TableInteractionsManager = ({ children, initialConfig, onStateUpdate, toggleableColumns = [] }: IProps) => {
  const initalHiddenColumnsIds = React.useMemo(() => (toggleableColumns ? toggleableColumns.map(column => column.id) : []), [
    toggleableColumns
  ]);
  const [state, dispatch] = React.useReducer(TableInteractionsManagerReducer, {
    ...initialState,
    hiddenColumnsIds: initalHiddenColumnsIds,
    ...initialConfig
  });

  const [tableRef, table, onTableUpdate] = useComponent<Table>();

  const { columnsCursor, hiddenColumnsIds, fixedColumnsIds, fixedRowsIndexes } = state;
  const { id: currentColumnsCursorId, index: currentColumnsCursorIndex } = columnsCursor || {
    id: null,
    index: null
  };
  const hiddenColumnsIdsMapping = React.useMemo(
    () =>
      toggleableColumns.reduce((mapping, column) => {
        mapping[column.id] = column.index;
        return mapping;
      }, {}),
    [toggleableColumns]
  );
  const actions = React.useMemo(() => mapDispatchToProps(dispatch), [dispatch]);

  React.useEffect(() => {
    if (onStateUpdate) {
      onStateUpdate(state);
    }
  }, [state]);

  const goToColumnId = React.useCallback(
    (columnId: string) => {
      if (table.current) {
        const columnIndex = table.current.getColumnIndex(columnId);
        actions.updateColumnsCursor({ index: columnIndex, id: columnId });
        table.current.goToColumnId(columnId);
      }
    },
    [actions, table]
  );

  const goToColumnIndex = React.useCallback(
    (columnIndex: number) => {
      if (table.current) {
        const columnId = table.current.getColumnId(columnIndex);
        actions.updateColumnsCursor({ index: columnIndex, id: columnId });
        table.current.goToColumnIndex(columnIndex);
      }
    },
    [actions, table]
  );

  const getCell = React.useCallback(
    (cellCoordinates: ICellCoordinates) => {
      if (table.current) {
        return table.current.getCell(cellCoordinates);
      }
      return null;
    },
    [actions, table]
  );

  const openTrees = React.useCallback(
    (trees: ITrees) => {
      if (table.current) {
        return table.current.openTrees(trees);
      }
      return null;
    },
    [table]
  );

  const closeTrees = React.useCallback(
    (trees: ITrees) => {
      if (table.current) {
        return table.current.closeTrees(trees);
      }
      return null;
    },
    [table]
  );

  const onHorizontallyScroll = React.useCallback(
    (onScrollProps: OnHorizontallyScrollProps, callback?: (onScrollCallbackProps: OnScrollCallbackProps) => void) => {
      const { columnsCursor } = onScrollProps;
      if (table.current) {
        const columnId = table.current.getColumnId(columnsCursor);
        if (table.current && (!currentColumnsCursorIndex || currentColumnsCursorIndex !== columnsCursor)) {
          actions.updateColumnsCursor({ index: columnsCursor, id: columnId });
        }
        if (callback) {
          callback({ columnsCursorId: columnId });
        }
      }
    },
    [actions, table, currentColumnsCursorIndex]
  );

  const updateCellWidth = React.useCallback(
    (value: CellDimension) => {
      actions.updateCellWidth(value);
      /** We need an async scrolling. Waiting for cell width update. */
      if (currentColumnsCursorId) {
        setImmediate(() => {
          goToColumnId(currentColumnsCursorId);
        });
      }
    },
    [actions, currentColumnsCursorId, goToColumnId]
  );

  const hiddenColumnsIndexes = React.useMemo(
    () =>
      hiddenColumnsIds.reduce<number[]>((result, columnId) => {
        const columnIndex = hiddenColumnsIdsMapping[columnId];
        if (columnIndex >= 0) {
          result.push(columnIndex);
        }
        return result;
      }, []),
    [hiddenColumnsIds, hiddenColumnsIdsMapping]
  );

  const fixedColumnsIndexes = React.useMemo(
    () =>
      fixedColumnsIds.reduce<number[]>((result, columnId) => {
        const columnIndex = table.current?.getColumnIndex(columnId);
        if (columnIndex && columnIndex >= 0) {
          result.push(columnIndex);
        }
        return result;
      }, []),
    [fixedColumnsIds, table]
  );
  return (
    <TableInteractionsContext.Provider
      value={{
        ...actions,
        ...state,
        hiddenColumnsIndexes,
        fixedColumnsIndexes,
        fixedRowsIndexes,
        updateCellWidth,
        onHorizontallyScroll,
        goToColumnIndex,
        goToColumnId,
        getCell,
        openTrees,
        closeTrees,
        tableRef,
        onTableUpdate,
        table
      }}
    >
      {children}
    </TableInteractionsContext.Provider>
  );
};

TableInteractionsManager.defaultProps = {
  toggleableColumns: []
};

const mapDispatchToProps = (dispatch: React.Dispatch<TableInteractionsAction>) => ({
  updateHiddenIds: (hiddenIds: string[]) => dispatch(updateHiddenColumns(hiddenIds)),
  updateFixedColumnsIds: (fixedIds: string[]) => dispatch(updateFixedColumns(fixedIds)),
  updateFixedRowsIndexes: (fixedIndexes: number[]) => dispatch(updateFixedRows(fixedIndexes)),
  updateRowHeight: (value: CellDimension) => dispatch(updateRowHeight(value)),
  updateCellWidth: (value: CellDimension) => dispatch(updateCellWidth(value)),
  updateColumnsCursor: (columnsCursor: CellValue) => dispatch(updateColumnsCursor(columnsCursor))
});

export default TableInteractionsManager;
