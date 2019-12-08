import * as React from "react";
import Menu from "@material-ui/core/Menu";
import Divider from "@material-ui/core/Divider";
import ListSubheader from "@material-ui/core/ListSubheader";
import { Icon, ListItemText, List, MenuItem, ListItemIcon } from "@material-ui/core";

import { TableInteractionsContext } from "./table-interactions-manager";
import { CellSize, CELL_SIZES, CellDimention } from "./reducers";
import { Nullable } from "../typing";

export interface ICellDimensionControllerProps {
  /** The current cell width of the table. */
  cellWidth: CellDimention;
  /** The current row Height of the table. */
  rowHeight: CellDimention;
  /** The menu button activator renderer */
  buttonRenderer: (toggleMenu: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void) => JSX.Element;
  /** The row height controler. Please see the CellDimensionController */
  updateRowHeight: (size: CellSize) => void;
  /** The cell width controler. Please see the CellDimensionController */
  updateCellWidth: (size: CellSize) => void;
}

export const DumbCellDimensionController: React.FunctionComponent<ICellDimensionControllerProps> = React.memo(
  ({ updateCellWidth, updateRowHeight, buttonRenderer, rowHeight, cellWidth }) => {
    const [anchorEl, setAnchorEl] = React.useState<Nullable<Element>>(null);
    const isOpen = Boolean(anchorEl);

    const onClose = () => {
      setAnchorEl(null);
    };

    const toggleMenu = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
      setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    const getColumnWidthUpdater = (size: CellSize) => () => {
      updateCellWidth(size);
    };

    const getRowHeightUpdater = (size: CellSize) => () => {
      updateRowHeight(size);
    };
    return (
      <>
        {buttonRenderer(toggleMenu)}
        <Menu
          data-testid="cell-dimensions-menu"
          elevation={2}
          open={isOpen}
          anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorEl={anchorEl}
          onClose={onClose}
        >
          <List classes={{ root: "table-interaction-menu" }}>
            <ListSubheader>Columns</ListSubheader>
            {CELL_SIZES.map(size => (
              <MenuItem
                key={`column-${size}`}
                data-testid={`column-width-dimension-${size}`}
                onClick={getColumnWidthUpdater(size)}
              >
                <ListItemIcon>
                  {cellWidth.size === size ? (
                    <Icon data-testid="column-width-dimension-checked">radio_button_checked</Icon>
                  ) : (
                    <Icon data-testid="column-width-dimension-unchecked">radio_button_unchecked</Icon>
                  )}
                </ListItemIcon>

                <ListItemText id={size} primary={size} />
              </MenuItem>
            ))}
            <Divider />
            <ListSubheader>Rows</ListSubheader>
            {CELL_SIZES.map(size => (
              <MenuItem key={`row-${size}`} data-testid={`row-height-dimension-${size}`} onClick={getRowHeightUpdater(size)}>
                <ListItemIcon>
                  {rowHeight.size === size ? (
                    <Icon data-testid="row-height-dimension-checked">radio_button_checked</Icon>
                  ) : (
                    <Icon data-testid="row-height-dimension-unchecked">radio_button_unchecked</Icon>
                  )}
                </ListItemIcon>
                <ListItemText id={size} primary={size} />
              </MenuItem>
            ))}
          </List>
        </Menu>
      </>
    );
  }
);

const CellDimensionController: React.FunctionComponent<Pick<ICellDimensionControllerProps, "buttonRenderer">> = props => {
  return (
    <TableInteractionsContext.Consumer>
      {({ cellWidth, rowHeight, updateCellWidth, updateRowHeight }) => {
        return (
          <DumbCellDimensionController
            cellWidth={cellWidth}
            rowHeight={rowHeight}
            updateCellWidth={updateCellWidth}
            updateRowHeight={updateRowHeight}
            {...props}
          />
        );
      }}
    </TableInteractionsContext.Consumer>
  );
};

export default React.memo(CellDimensionController);
