import * as React from "react";

import { MouseClickButtons } from "../constants";
import { ICellCoordinates } from "../table/cell";
import ContextMenuHandler, { ISelectionContext } from "./context-menu-handler";
import { Nullable } from "../typing";

export interface ISelection {
  /** callback when we are clicking on the cell */
  onCellMouseDown?: (coordinates: ICellCoordinates, mouseClickButton: MouseClickButtons) => void;
  /** callback when we are hovering into the cell */
  onCellMouseEnter?: (coordinates: ICellCoordinates) => void;
  /** callback when we release the mouse button above the cell */
  onCellMouseUp?: () => void;
  /** on right click handler */
  onCellContextMenu?: (selectionContext: ISelectionContext) => void;
  selectedCells: ISelectedCells;
}

export interface ISelectionHandlerOptionalProps {
  isDisabledVerticalSelection?: boolean;
  isDisabledHorizontalSelection?: boolean;
  menuComponent?: React.ComponentType<any>;
}

export interface ISelectionHandlerProps extends ISelectionHandlerOptionalProps {
  children: (props: ISelection) => JSX.Element;
}

export interface ISelectedCells {
  [rowIndex: string]: number[];
}

interface IState {
  selectedCells: ISelectedCells;
}

class SelectionHandler extends React.Component<ISelectionHandlerProps, IState> {
  private startingCell: Nullable<ICellCoordinates> = null;

  constructor(props: ISelectionHandlerProps) {
    super(props);
    this.state = { selectedCells: {} };
  }

  private onCellMouseDown = (coordinates: ICellCoordinates, mouseClickButton: MouseClickButtons) => {
    const { selectedCells } = this.state;
    let newSelectedCells: ISelectedCells = selectedCells;
    const currentRow = selectedCells[coordinates.rowIndex];
    const isSelected = currentRow && currentRow.includes(coordinates.cellIndex);
    const isRightClick = mouseClickButton === MouseClickButtons.right;
    const isLeftClick = mouseClickButton === MouseClickButtons.left;
    if (isLeftClick || (!isSelected && isRightClick)) {
      this.startingCell = coordinates;
      newSelectedCells = { [coordinates.rowIndex]: [coordinates.cellIndex] };
      this.setState({ selectedCells: newSelectedCells });
    }
  };

  private onCellMouseEnter = (coordinates: ICellCoordinates) => {
    const { isDisabledVerticalSelection, isDisabledHorizontalSelection } = this.props;
    if (this.startingCell) {
      const { rowIndex, cellIndex } = this.startingCell;
      const selectedCells: ISelectedCells = {};
      const rowStart = isDisabledVerticalSelection ? rowIndex : Math.min(rowIndex, coordinates.rowIndex);
      const rowEnd = isDisabledVerticalSelection ? rowIndex : Math.max(rowIndex, coordinates.rowIndex);
      const colStart = isDisabledHorizontalSelection ? cellIndex : Math.min(cellIndex, coordinates.cellIndex);
      const colEnd = isDisabledHorizontalSelection ? cellIndex : Math.max(cellIndex, coordinates.cellIndex);
      for (let rowIndex = rowStart; rowIndex <= rowEnd; rowIndex += 1) {
        selectedCells[rowIndex] = [];
        for (let cellIndex = colStart; cellIndex <= colEnd; cellIndex += 1) {
          selectedCells[rowIndex].push(cellIndex);
        }
      }
      this.setState({ selectedCells });
    }
  };

  private onCellMouseUp = () => {
    this.startingCell = null;
  };

  public render() {
    const { children, menuComponent } = this.props;
    const { selectedCells } = this.state;
    const { onCellMouseDown, onCellMouseEnter, onCellMouseUp } = this;
    return (
      <div className="selection-handler-container">
        <ContextMenuHandler selectedCells={selectedCells} menuComponent={menuComponent}>
          {({ onContextMenu }) => {
            return children({
              onCellMouseDown,
              onCellMouseEnter,
              onCellMouseUp,
              onCellContextMenu: onContextMenu,
              selectedCells,
            });
          }}
        </ContextMenuHandler>
      </div>
    );
  }
}

export default SelectionHandler;
