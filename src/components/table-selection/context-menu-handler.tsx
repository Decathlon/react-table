import * as React from "react";

import { ISelectedCells } from "./selection-handler";
import { ICellCoordinates } from "../table/cell";
import { Nullable } from "../typing";

export interface ISelectionContext {
  anchorEl: Nullable<Element>;
  contextCell: Nullable<ICellCoordinates>;
}

interface IChildrenProps {
  onContextMenu: (selectionContext: ISelectionContext) => void;
  /** Function to close the context menu */
  closeMenu?: () => void;
}

export interface IContextMenuHandlerProps {
  selectedCells: ISelectedCells;
  children: (props: IChildrenProps) => JSX.Element;
  menuComponent?: React.ComponentType<any>;
}

const defaultSelectionContext = { anchorEl: null, contextCell: null };

const ContextMenuHandler: React.FunctionComponent<IContextMenuHandlerProps> = ({
  children,
  selectedCells,
  menuComponent: MenuComponent
}) => {
  const [context, setContext] = React.useState<ISelectionContext>(defaultSelectionContext);
  const { anchorEl } = context;
  const isMenuOpened = !!anchorEl;

  const closeMenu = () => {
    setContext(defaultSelectionContext);
  };

  const menuProps = {
    isMenuOpened,
    selectedCells,
    selectionContext: context,
    closeMenu
  };
  return (
    <>
      {children({ onContextMenu: setContext, closeMenu })}
      {MenuComponent ? <MenuComponent {...menuProps} /> : null}
    </>
  );
};

export default ContextMenuHandler;
