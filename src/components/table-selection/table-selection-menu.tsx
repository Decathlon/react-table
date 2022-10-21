import * as React from "react";
import { MenuItem, Menu } from "@mui/material";

import { ISelectionContext } from "./context-menu-handler";
import { ISelectedCells } from "./selection-handler";

export interface IMenuProps {
  closeMenu: () => void;
  selectedCells: ISelectedCells;
  selectionContext: ISelectionContext;
  isMenuOpened: boolean;
}

export interface IActionMenuComponent {
  onClose: () => void;
  selectedCells: ISelectedCells;
}

export interface IMenuItemProps {
  onClick: () => void;
  selectedCells: ISelectedCells;
  children: React.ReactNode;
}

export interface IMenuAction {
  id: string;
  title: string;
  component: React.ComponentType<any>;
  menuItem?: React.ComponentType<{ children: React.ReactNode }>;
}

export interface ITableSelectionMenuProps extends IMenuProps {
  actions: IMenuAction[];
}

const DefaultMenuItem: React.FunctionComponent<IMenuItemProps> = ({ onClick, children }) => {
  return <MenuItem onClick={onClick}>{children}</MenuItem>;
};

const TableSelectionMenu: React.FunctionComponent<ITableSelectionMenuProps> = ({
  actions,
  isMenuOpened,
  closeMenu,
  selectedCells,
  selectionContext: { anchorEl },
}) => {
  const [activeActionId, setActiveActionId] = React.useState<string>("");

  const getMenuAction = (menuActionId: string) => () => {
    setActiveActionId(menuActionId);
    closeMenu();
  };

  const closeAction = () => {
    setActiveActionId("");
    closeMenu();
  };
  const activeAction = actions.find((action) => action.id === activeActionId);
  const ActiveActionComponent = activeAction && activeAction.component;

  return (
    <>
      {ActiveActionComponent ? <ActiveActionComponent onClose={closeAction} selectedCells={selectedCells} /> : null}
      <Menu
        open={isMenuOpened}
        elevation={1}
        onClose={closeMenu}
        anchorEl={anchorEl}
        anchorReference="anchorEl"
        anchorOrigin={{ horizontal: "right", vertical: "top" }}
      >
        {actions.map((action) => {
          const MenuItemComponent = action.menuItem || DefaultMenuItem;
          return (
            <MenuItemComponent key={action.id} onClick={getMenuAction(action.id)} selectedCells={selectedCells}>
              {action.title}
            </MenuItemComponent>
          );
        })}
      </Menu>
    </>
  );
};

export default TableSelectionMenu;
