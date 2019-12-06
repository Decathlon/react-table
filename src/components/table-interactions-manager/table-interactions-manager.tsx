import * as React from "react";

import Table from "../table/table";
import { OnHorizontallyScrollProps } from "../virtualizer";
import { TableInteractionsAction, updateHiddenColumns, updateRowHeight, updateCellWidth, updateColumnsCursor } from "./actions";
import TableInteractionsManagerReducer, { IState, CellSize, CellValue, initialState } from "./reducers";
import { ICellCoordinates, ICell } from "../table/cell";
import { Nullable } from "../typing";

export interface OnScrollCallbackProps {
  /** The current column id. */
  columnsCursorId: string;
}

interface Column {
  id: string;
  index: number;
}

interface IProvider extends IState {
  /** The table ref. */
  table: Nullable<React.MutableRefObject<Nullable<Table>>>;
  /** The current hidden columns of the table (indexes). */
  hiddenColumnsIndexes: number[];
  /** The hidden columns controller. Please see the ColumnVisibilityController. */
  updateHiddenIds: (hiddenIds: string[]) => void;
  /** The row height controler. Please see the CellDimensionController */
  updateRowHeight: (size: CellSize) => void;
  /** The cell width controler. Please see the CellDimensionController */
  updateCellWidth: (size: CellSize) => void;
  /** The scroll controler (scrolling by column id). Please see the WeekScrollerController. */
  goToColumnId: (columnId: string) => void;
  /** The scroll controler (scrolling by column index). Please see the WeekScrollerController. */
  goToColumnIndex: (columnIndex: number) => void;
  /** return the cell props of the table */
  getCell: (cellCoordinates: ICellCoordinates) => Nullable<ICell>;
  /** Callback fired when a "scroll" (Horizontally) event is detected. */
  onHorizontallyScroll: (
    props: OnHorizontallyScrollProps,
    callback?: (onScrollCallbackProps: OnScrollCallbackProps) => void
  ) => void;
}

interface IProps {
  children: JSX.Element | JSX.Element[];
  toggleableColumns: Column[];
  /** The initial table interaction config. */
  initialConfig?: Partial<IState>;
  /** Callback fired when the interaction context state hase changed. */
  onStateUpdate?: (state: IState) => void;
}

const nullFunction = (): any => null;

const initialContentxt: IProvider = {
  ...initialState,
  table: null,
  hiddenColumnsIndexes: [],
  updateHiddenIds: nullFunction,
  updateRowHeight: nullFunction,
  updateCellWidth: nullFunction,
  goToColumnId: nullFunction,
  goToColumnIndex: nullFunction,
  getCell: nullFunction,
  onHorizontallyScroll: nullFunction
};

export const TableInteractionsContext: React.Context<IProvider> = React.createContext<IProvider>({
  ...initialContentxt
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
  const table = React.useRef<Table>(null);
  const { columnsCursor, hiddenColumnsIds } = state;
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
    (size: CellSize) => {
      actions.updateCellWidth(size);
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

  return (
    <TableInteractionsContext.Provider
      value={{
        ...actions,
        ...state,
        hiddenColumnsIndexes,
        updateCellWidth,
        onHorizontallyScroll,
        goToColumnIndex,
        goToColumnId,
        getCell,
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
  updateRowHeight: (size: CellSize) => dispatch(updateRowHeight(size)),
  updateCellWidth: (size: CellSize) => dispatch(updateCellWidth(size)),
  updateColumnsCursor: (columnsCursor: CellValue) => dispatch(updateColumnsCursor(columnsCursor))
});

export default TableInteractionsManager;
