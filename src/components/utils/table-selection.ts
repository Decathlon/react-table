import { ISelectedCells } from "../table-selection/selection-handler";
import { ICellCoordinates, ICell } from "../table/cell";

export const isVerticalSelection = (selectedCells: ISelectedCells) => {
  const rowIds = Object.keys(selectedCells);
  return rowIds.length >= 1 && rowIds.some(rowId => selectedCells[rowId].length === 1);
};

export const isHorizontalSelection = (selectedCells: ISelectedCells) => {
  const rowIds = Object.keys(selectedCells);
  return rowIds.length === 1 && rowIds.some(rowId => selectedCells[rowId].length === 1);
};

export const isMultiDimensionSelection = (selectedCells: ISelectedCells) => {
  const rowIds = Object.keys(selectedCells);
  return rowIds.length > 1 && rowIds.some(rowId => selectedCells[rowId].length > 1);
};

export function getSelectedCellsProps<IDataCoordinates = any>(
  selectedCells: ISelectedCells,
  getCell: (cellCoordinates: ICellCoordinates) => ICell<IDataCoordinates>
) {
  return Object.keys(selectedCells).reduce<ICell<IDataCoordinates>[]>((result, rowIndex) => {
    result.push(...selectedCells[rowIndex].map(cellIndex => getCell({ rowIndex: parseInt(rowIndex), cellIndex })));
    return result;
  }, []);
}
