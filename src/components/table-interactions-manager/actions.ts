import * as actionTypes from "./actions-types";
import { CellValue, CellDimension } from "./reducers";

export interface UpdateCellWidth {
  type: actionTypes.UPDATE_CELL_WIDTH;
  value: CellDimension;
}

export const updateCellWidth = (value: CellDimension): UpdateCellWidth => ({
  type: actionTypes.UPDATE_CELL_WIDTH,
  value
});

export interface UpdateRowHeight {
  type: actionTypes.UPDATE_ROW_HEIGHT;
  value: CellDimension;
}

export const updateRowHeight = (value: CellDimension): UpdateRowHeight => ({
  type: actionTypes.UPDATE_ROW_HEIGHT,
  value
});

export interface UpdateHiddenColumns {
  type: actionTypes.UPDATE_HIDDEN_COLUMNS_INDEXTES;
  hiddenColumnsIds: string[];
}

export const updateHiddenColumns = (hiddenColumnsIds: string[]): UpdateHiddenColumns => ({
  type: actionTypes.UPDATE_HIDDEN_COLUMNS_INDEXTES,
  hiddenColumnsIds
});

export interface UpdateColumnsCursor {
  type: actionTypes.UPDATE_COLUMNS_CURSOR;
  columnsCursor: CellValue;
}

export const updateColumnsCursor = (columnsCursor: CellValue): UpdateColumnsCursor => ({
  type: actionTypes.UPDATE_COLUMNS_CURSOR,
  columnsCursor
});

export type TableInteractionsAction = UpdateCellWidth | UpdateRowHeight | UpdateHiddenColumns | UpdateColumnsCursor;
