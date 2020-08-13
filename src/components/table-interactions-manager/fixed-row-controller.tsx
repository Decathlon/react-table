import * as React from "react";

import { TableInteractionsContext } from "./table-interactions-manager";

interface IFixedRowChildrenProps {
  toggleFixedRowIndex: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  isFixed: boolean;
}

interface IFixedRowControllerProps {
  rowIndex: number;
  children: (props: IFixedRowChildrenProps) => JSX.Element;
}

interface IDumbFixedRowControllerProps extends IFixedRowControllerProps {
  /** The current fixed Rows of the table (indexes). */
  fixedRowsIndexes: number[];
  /** The fixed Rows controller. Please see the FixedRowController. */
  updateFixedRowsIndexes: (fixedRowsIndexes: number[]) => void;
}

export const DumbFixedRowController: React.FunctionComponent<IDumbFixedRowControllerProps> = React.memo(
  ({ children, rowIndex, updateFixedRowsIndexes, fixedRowsIndexes }) => {
    const isFixed = React.useMemo(() => {
      return fixedRowsIndexes.includes(rowIndex);
    }, [rowIndex, fixedRowsIndexes]);
    const toggleFixedRowIndex = () => {
      const newRows = fixedRowsIndexes.filter(fixedRowIndex => fixedRowIndex !== rowIndex);
      if (newRows.length === fixedRowsIndexes.length) {
        newRows.push(rowIndex);
      }
      updateFixedRowsIndexes(newRows);
    };

    return children({ toggleFixedRowIndex, isFixed });
  }
);

const FixedRowController: React.FunctionComponent<IFixedRowControllerProps> = props => {
  const { fixedRowsIndexes, updateFixedRowsIndexes } = React.useContext(TableInteractionsContext);
  return (
    <DumbFixedRowController fixedRowsIndexes={fixedRowsIndexes} updateFixedRowsIndexes={updateFixedRowsIndexes} {...props} />
  );
};

export default React.memo(FixedRowController);
