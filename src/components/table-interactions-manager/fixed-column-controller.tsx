import * as React from "react";

import { TableInteractionsContext } from "./table-interactions-manager";

interface IFixedColumnControllerProps {
  columnId: string;
  children: (toggleFixedColumnId: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void) => JSX.Element;
}

interface IDumbFixedColumnControllerProps extends IFixedColumnControllerProps {
  /** The current hidden columns of the table (indexes). */
  fixedColumnsIds: string[];
  /** The hidden columns controller. Please see the FixedColumnController. */
  updateFixedColumnsIds: (hiddenIds: string[]) => void;
}

export const DumbFixedColumnController: React.FunctionComponent<IDumbFixedColumnControllerProps> = React.memo(
  ({ children, columnId, updateFixedColumnsIds, fixedColumnsIds }) => {
    const toggleFixedColumnId = () => {
      const newColumns = fixedColumnsIds.filter(hiddenColumnId => hiddenColumnId !== columnId);
      if (newColumns.length === fixedColumnsIds.length) {
        newColumns.push(columnId);
      }
      updateFixedColumnsIds(newColumns);
    };

    return children(toggleFixedColumnId);
  }
);

const FixedColumnController: React.FunctionComponent<IFixedColumnControllerProps> = props => {
  const { fixedColumnsIds, updateFixedColumnsIds } = React.useContext(TableInteractionsContext);
  return <DumbFixedColumnController fixedColumnsIds={fixedColumnsIds} updateFixedColumnsIds={updateFixedColumnsIds} {...props} />;
};

export default React.memo(FixedColumnController);
