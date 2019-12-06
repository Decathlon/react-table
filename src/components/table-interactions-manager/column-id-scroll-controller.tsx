import * as React from "react";
import { IconButton, Icon } from "@material-ui/core";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";

import { TableInteractionsContext } from "./table-interactions-manager";

export interface IColumn {
  id: string;
  label: string;
}

export interface IProps {
  /** Scrollable columns to control */
  columns: IColumn[];
}

export interface IDumbProps extends IProps {
  /** The current columns cursor of the table (current scroll). */
  columnsCursorId?: string;
  /** The scroll controler (scrolling by column id). Please see the WeekScrollerController. */
  goToColumnId: (columnId: string) => void;
}

export const DumbColumnIdScrollController: React.FunctionComponent<IDumbProps> = ({ columns, columnsCursorId, goToColumnId }) => {
  const selectedColumnIndex = React.useMemo(() => columns.findIndex(column => column.id === columnsCursorId), [columnsCursorId]);

  const gotToColumn = (columnIndex: number) => {
    const column = columns[columnIndex];
    if (column) {
      goToColumnId(column.id);
    }
  };

  const onChange = (event: React.ChangeEvent<{ name?: string; value: number }>) => {
    gotToColumn(event.target.value);
  };

  return (
    <div className="scroll-controlller">
      <IconButton id="table-toolbar_prev-columns" className="scroll-controlller__button" onClick={() => gotToColumn(0)}>
        <Icon>first_page</Icon>
      </IconButton>

      <IconButton
        id="table-toolbar_prev-column"
        className="scroll-controlller__button"
        onClick={() => gotToColumn(selectedColumnIndex - 1)}
      >
        <Icon>chevron_left</Icon>
      </IconButton>

      <Select
        autoWidth
        id="table-toolbar_current-column"
        className="scroll-controlller__field"
        value={selectedColumnIndex}
        // @ts-ignore value is a number
        onChange={onChange}
      >
        {columns.map((column, index) => (
          <MenuItem key={`column_${column.id}`} id={`column-scroll-item_${column.id}`} value={index}>
            {column.label}
          </MenuItem>
        ))}
      </Select>

      <IconButton
        id="table-toolbar_next-column"
        className="scroll-controlller__button"
        onClick={() => gotToColumn(selectedColumnIndex + 1)}
      >
        <Icon>chevron_right</Icon>
      </IconButton>

      <IconButton
        id="table-toolbar_next-columns"
        className="scroll-controlller__button"
        onClick={() => gotToColumn(columns.length - 1)}
      >
        <Icon>last_page</Icon>
      </IconButton>
    </div>
  );
};

const ColumnIdScrollController: React.FunctionComponent<IProps> = props => {
  return (
    <TableInteractionsContext.Consumer>
      {({ columnsCursor, goToColumnId }) => {
        return (
          <DumbColumnIdScrollController
            goToColumnId={goToColumnId}
            columnsCursorId={columnsCursor ? columnsCursor.id : undefined}
            {...props}
          />
        );
      }}
    </TableInteractionsContext.Consumer>
  );
};

export default React.memo(ColumnIdScrollController);
