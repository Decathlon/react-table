import * as actionTypes from "./actions-types";
import { CellSize, CellValue } from "./reducers";

export interface UpdateCellWidth {
  type: actionTypes.UPDATE_CELL_WIDTH;
  size: CellSize;
}

export const updateCellWidth = (size: CellSize): UpdateCellWidth => ({
  type: actionTypes.UPDATE_CELL_WIDTH,
  size
});

export interface UpdateRowHeight {
  type: actionTypes.UPDATE_ROW_HEIGHT;
  size: CellSize;
}

export const updateRowHeight = (size: CellSize): UpdateRowHeight => ({
  type: actionTypes.UPDATE_ROW_HEIGHT,
  size
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
