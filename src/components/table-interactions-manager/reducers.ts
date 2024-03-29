import { TableInteractionsAction } from "./actions";
import * as actionTypes from "./actions-types";
import { ColumnWidth, RowHeight } from "../constants";
import { Nullable } from "../typing";

export enum CellSize {
  small = "small",
  medium = "medium",
  large = "large",
}

export interface CellValue {
  id: string;
  index: number;
}

export interface CellDimension {
  value: number;
  size: string;
}

export interface ITableInteractionManagerState {
  /** The current cell width of the table. */
  cellWidth: CellDimension;
  /** The current row Height of the table. */
  rowHeight: CellDimension;
  /** The current hidden columns of the table (indexes). */
  hiddenColumnsIds: string[];
  /** The current hidden rows of the table (indexes). */
  hiddenRowIndexes: number[];
  /** The current fixed columns of the table (indexes). */
  fixedColumnsIds: string[];
  /** The current fixed rows of the table (indexes). */
  fixedRowsIndexes: number[];
  /** The current columns cursor of the table (current scroll). */
  columnsCursor: Nullable<CellValue>;
}

export const initialState: ITableInteractionManagerState = {
  cellWidth: { value: ColumnWidth[CellSize.medium], size: CellSize.medium },
  rowHeight: { value: RowHeight[CellSize.medium], size: CellSize.medium },
  columnsCursor: null,
  hiddenColumnsIds: [],
  fixedColumnsIds: [],
  fixedRowsIndexes: [],
  hiddenRowIndexes: [],
};

const tableManagerReducer = (state: ITableInteractionManagerState = initialState, action: TableInteractionsAction) => {
  switch (action.type) {
    case actionTypes.UPDATE_CELL_WIDTH:
      return {
        ...state,
        cellWidth: action.value,
      };
    case actionTypes.UPDATE_ROW_HEIGHT:
      return {
        ...state,
        rowHeight: action.value,
      };
    case actionTypes.UPDATE_HIDDEN_COLUMNS_INDEXES:
      return {
        ...state,
        hiddenColumnsIds: action.hiddenColumnsIds,
      };
    case actionTypes.UPDATE_HIDDEN_ROW_INDEXES:
      return {
        ...state,
        hiddenRowIndexes: action.hiddenRowIndexes,
      };
    case actionTypes.UPDATE_FIXED_COLUMNS_INDEXES:
      return {
        ...state,
        fixedColumnsIds: action.fixedColumnsIds,
      };
    case actionTypes.UPDATE_FIXED_ROWS_INDEXES:
      return {
        ...state,
        fixedRowsIndexes: action.fixedRowsIndexes,
      };
    case actionTypes.UPDATE_COLUMNS_CURSOR:
      return {
        ...state,
        columnsCursor: action.columnsCursor,
      };
    default:
      return state;
  }
};

export default tableManagerReducer;
