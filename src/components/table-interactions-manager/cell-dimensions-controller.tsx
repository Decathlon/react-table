import * as React from "react";
import Menu from "@mui/material/Menu";
import Divider from "@mui/material/Divider";
import ListSubheader from "@mui/material/ListSubheader";
import { Icon, ListItemText, List, MenuItem, ListItemIcon } from "@mui/material";

import { TableInteractionsContext } from "./table-interactions-manager";
import { CellDimension } from "./reducers";
import { Nullable } from "../typing";
import { RowHeight, ColumnWidth } from "../constants";

export interface ICellDimensionControllerProps {
  /** Keys / values for row height */
  rowHeightOptions?: Record<string, number>;
  /** Keys / values for column width */
  cellWidthOptions?: Record<string, number>;
  /** The current cell width of the table. */
  cellWidth: CellDimension;
  /** The current row Height of the table. */
  rowHeight: CellDimension;
  /** The menu button activator renderer */
  buttonRenderer: (toggleMenu: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void) => JSX.Element;
  /** The row height controler. Please see the CellDimensionController */
  updateRowHeight: (size: CellDimension) => void;
  /** The cell width controler. Please see the CellDimensionController */
  updateCellWidth: (size: CellDimension) => void;
}

export const DumbCellDimensionController: React.FunctionComponent<ICellDimensionControllerProps> = React.memo(
  ({
    updateCellWidth,
    updateRowHeight,
    buttonRenderer,
    rowHeight,
    cellWidth,
    rowHeightOptions = RowHeight,
    cellWidthOptions = ColumnWidth,
  }) => {
    const [anchorEl, setAnchorEl] = React.useState<Nullable<Element>>(null);
    const isOpen = Boolean(anchorEl);

    const onClose = () => {
      setAnchorEl(null);
    };

    const toggleMenu = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
      setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    const getColumnWidthUpdater = (size: string) => () => {
      updateCellWidth({ size, value: cellWidthOptions[size] });
    };

    const getRowHeightUpdater = (size: string) => () => {
      updateRowHeight({ size, value: rowHeightOptions[size] });
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
            {Object.keys(cellWidthOptions).map((size) => (
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
            {Object.keys(rowHeightOptions).map((size) => (
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

const CellDimensionController: React.FunctionComponent<
  Pick<ICellDimensionControllerProps, "buttonRenderer" | "cellWidthOptions" | "rowHeightOptions">
> = (props) => {
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
