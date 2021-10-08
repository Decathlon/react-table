import * as React from "react";

import { TableInteractionsContext } from "./table-interactions-manager";

interface IFixedColumnChildrenProps {
  toggleFixedColumnId: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  isFixed: boolean;
}

interface IFixedColumnControllerProps {
  columnId: string;
  children: (props: IFixedColumnChildrenProps) => JSX.Element;
}

interface IDumbFixedColumnControllerProps extends IFixedColumnControllerProps {
  /** The current fixed columns of the table (indexes). */
  fixedColumnsIds: string[];
  /** The fixed columns controller. Please see the FixedColumnController. */
  updateFixedColumnsIds: (fixedIds: string[]) => void;
}

export const DumbFixedColumnController: React.FunctionComponent<IDumbFixedColumnControllerProps> = React.memo(
  ({ children, columnId, updateFixedColumnsIds, fixedColumnsIds }) => {
    const isFixed = React.useMemo(() => {
      return fixedColumnsIds.includes(columnId);
    }, [columnId, fixedColumnsIds]);
    const toggleFixedColumnId = () => {
      const newColumns = fixedColumnsIds.filter((fixedColumnId) => fixedColumnId !== columnId);
      if (newColumns.length === fixedColumnsIds.length) {
        newColumns.push(columnId);
      }
      updateFixedColumnsIds(newColumns);
    };

    return children({ toggleFixedColumnId, isFixed });
  }
);

const FixedColumnController: React.FunctionComponent<IFixedColumnControllerProps> = (props) => {
  const { fixedColumnsIds, updateFixedColumnsIds } = React.useContext(TableInteractionsContext);
  return <DumbFixedColumnController fixedColumnsIds={fixedColumnsIds} updateFixedColumnsIds={updateFixedColumnsIds} {...props} />;
};

export default React.memo(FixedColumnController);
