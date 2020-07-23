import * as React from "react";
import Menu from "@material-ui/core/Menu";
import { List, ListItemText, Icon, MenuItem, ListItemIcon } from "@material-ui/core";

import { TableInteractionsContext } from "./table-interactions-manager";
import { Nullable } from "../typing";

interface Column {
  id: string;
  index: number;
  label: string;
}

interface IColumnVisibilityControllerProps {
  /** toggleable columns to control */
  columns: Column[];
  /** The menu button activator renderer */
  buttonRenderer: (toggleMenu: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void) => JSX.Element;
  /** The column visibility handler, called when the column visibility has changed */
  onColumnVisibilityChange?: (columnIndex: number, isVisible: boolean) => void;
}

interface IDumbColumnVisibilityControllerProps extends IColumnVisibilityControllerProps {
  /** The current hidden columns of the table (indexes). */
  hiddenColumnsIds: string[];
  /** The hidden columns controller. Please see the ColumnVisibilityController. */
  updateHiddenIds: (hiddenIds: string[]) => void;
}

export const DumbColumnVisibilityController: React.FunctionComponent<IDumbColumnVisibilityControllerProps> = React.memo(
  ({ buttonRenderer, columns, hiddenColumnsIds, updateHiddenIds, onColumnVisibilityChange }) => {
    const [anchorEl, setAnchorEl] = React.useState<Nullable<Element>>(null);
    const isOpen = Boolean(anchorEl);

    const columnsIdsMapping: Record<string, number> = React.useMemo(
      () =>
        columns.reduce((mapping, column) => {
          mapping[column.id] = column.index;
          return mapping;
        }, {}),
      [columns]
    );

    const onClose = () => {
      setAnchorEl(null);
    };

    const toggleMenu = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
      setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    const updateHiddenColumnsIds = (columnId: string) => {
      const newColumns = hiddenColumnsIds.filter(hiddenColumnId => hiddenColumnId !== columnId);
      let isVisible = true;
      if (newColumns.length === hiddenColumnsIds.length) {
        newColumns.push(columnId);
        isVisible = false;
      }
      if (onColumnVisibilityChange) {
        onColumnVisibilityChange(columnsIdsMapping[columnId], isVisible);
      }
      updateHiddenIds(newColumns);
    };

    return (
      <>
        {buttonRenderer(toggleMenu)}
        <Menu
          id="wp_table-toolbar_toggle-aggregates-menu"
          data-testid="column-visibility-menu"
          elevation={2}
          open={isOpen}
          anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          onClose={onClose}
          anchorEl={anchorEl}
          className="visibility-controller-button"
        >
          <List classes={{ root: "table-interaction-menu" }}>
            {columns.length > 0
              ? columns.map((col, index) => {
                  return (
                    <MenuItem
                      data-testid={`column-visibility-${col.id}`}
                      key={`${col.index}-${index}`}
                      onClick={() => {
                        updateHiddenColumnsIds(col.id);
                      }}
                    >
                      <ListItemIcon>
                        {hiddenColumnsIds.includes(col.id) ? (
                          <Icon data-testid="visibility-off">visibility_off</Icon>
                        ) : (
                          <Icon data-testid="visibility-on">visibility</Icon>
                        )}
                      </ListItemIcon>
                      <ListItemText id={col.label} primary={col.label} />
                    </MenuItem>
                  );
                })
              : null}
          </List>
        </Menu>
      </>
    );
  }
);

const ColumnVisibilityController: React.FunctionComponent<IColumnVisibilityControllerProps> = props => {
  return (
    <TableInteractionsContext.Consumer>
      {({ hiddenColumnsIds, updateHiddenIds }) => {
        return (
          <DumbColumnVisibilityController hiddenColumnsIds={hiddenColumnsIds} updateHiddenIds={updateHiddenIds} {...props} />
        );
      }}
    </TableInteractionsContext.Consumer>
  );
};

export default React.memo(ColumnVisibilityController);
