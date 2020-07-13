import { TableInteractionsAction } from "./actions";
import * as actionTypes from "./actions-types";
import { ColumnWidth, RowHeight } from "../constants";
import { Nullable } from "../typing";

export enum CellSize {
  small = "small",
  medium = "medium",
  large = "large"
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
  /** The current columns cursor of the table (current scroll). */
  columnsCursor: Nullable<CellValue>;
}

export const initialState: ITableInteractionManagerState = {
  cellWidth: { value: ColumnWidth[CellSize.medium], size: CellSize.medium },
  rowHeight: { value: RowHeight[CellSize.medium], size: CellSize.medium },
  columnsCursor: null,
  hiddenColumnsIds: []
};

const tableManagerReducer = (state: ITableInteractionManagerState = initialState, action: TableInteractionsAction) => {
  switch (action.type) {
    case actionTypes.UPDATE_CELL_WIDTH:
      return {
        ...state,
        cellWidth: action.value
      };
    case actionTypes.UPDATE_ROW_HEIGHT:
      return {
        ...state,
        rowHeight: action.value
      };
    case actionTypes.UPDATE_HIDDEN_COLUMNS_INDEXTES:
      return {
        ...state,
        hiddenColumnsIds: action.hiddenColumnsIds
      };
    case actionTypes.UPDATE_COLUMNS_CURSOR:
      return {
        ...state,
        columnsCursor: action.columnsCursor
      };
    default:
      return state;
  }
};

export default tableManagerReducer;
