/* eslint-disable  import/no-extraneous-dependencies */
import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { MenuItem, ListItemIcon, Icon, TextField } from "@mui/material";
import { number, object } from "@storybook/addon-knobs";

import TableSelectionMenu, {
  IMenuAction,
  IMenuProps,
  IMenuItemProps,
  IActionMenuComponent,
} from "../../src/components/table-selection/table-selection-menu";
import Table from "../../src/components/table/table";
import { generateTable } from "../utils/tables";
import { Nullable } from "../../src/components/typing";

interface ICustomCellContentProps {
  defaultValue: string;
}

const AlertDialog: React.FunctionComponent<IActionMenuComponent> = ({ onClose }) => {
  return (
    <Dialog open onClose={onClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
      <DialogTitle id="alert-dialog-title">Action title</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Le Lorem Ipsum est simplement du faux texte employé dans la composition et la mise en page avant impression. Le Lorem
          Ipsum est le faux texte standard de imprimerie depuis les années 1500, quand un imprimeur anonyme assembla ensemble des
          morceaux de texte pour réaliser un livre spécimen de polices de texte.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Disagree
        </Button>
        <Button onClick={onClose} color="primary" autoFocus>
          Agree
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const ActionMenuItem: React.FunctionComponent<IMenuItemProps> = React.memo(({ onClick, children }) => {
  return (
    <MenuItem onClick={onClick} disabled>
      <ListItemIcon className="selection-menu-icon">
        <Icon>edit</Icon>
      </ListItemIcon>
      {children}
    </MenuItem>
  );
});

export const ActionMenuItem2: React.FunctionComponent<IMenuItemProps> = React.memo(({ onClick, children }) => {
  return (
    <MenuItem onClick={onClick}>
      <ListItemIcon className="selection-menu-icon">
        <Icon>account_tree</Icon>
      </ListItemIcon>
      {children}
    </MenuItem>
  );
});

const getActions = (): IMenuAction[] => [
  {
    id: "action1",
    title: "Action 1",
    component: AlertDialog,
    menuItem: ActionMenuItem,
  },
  {
    id: "action2",
    title: "Action 2",
    component: AlertDialog,
    menuItem: ActionMenuItem2,
  },
];

export const SelectionMenu: React.FunctionComponent<IMenuProps> = (props) => {
  const actions = getActions();
  return <TableSelectionMenu {...props} actions={actions} />;
};

export const TableScrollController = () => {
  const table = React.useRef<Table>(null);
  const goToColumnIndex = number("goToColumn", 20);
  const goToRowIndex = number("goToRow", 32);
  const columnId = "(0,39)-0";
  const goToColumn = () => {
    table.current?.goToColumnIndex(goToColumnIndex);
  };

  const goToColumnId = () => {
    table.current?.goToColumnId(columnId);
  };

  const goToRow = () => {
    table.current?.goToRowIndex(goToRowIndex);
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          marginBottom: 10,
          width: 1000,
        }}
      >
        <Button color="primary" onClick={goToColumn}>{`Go to Column ${goToColumnIndex}`}</Button>
        <Button color="primary" onClick={goToColumnId}>{`Go to Column by id ${columnId}`}</Button>
        <Button color="primary" onClick={goToRow}>
          {`Go to Row ${goToRowIndex}`}{" "}
        </Button>
      </div>
      <Table
        ref={table}
        {...generateTable(50, 50, {}, true)}
        isSelectable={false}
        isVirtualized
        virtualizerProps={{
          fixedRows: object("fixedRows", [0, 2, 8]),
          fixedColumns: [0, 4, 49],
          height: number("height", 500),
          width: number("width", 1000),
        }}
      />
    </div>
  );
};

export const TableColumnsRowsController = () => {
  const [hiddenColumns, setHiddenColumn] = React.useState<number[]>([]);
  const [hiddenRow, setHiddenRow] = React.useState<Nullable<number>>();
  const toggleColumn = (columnIndex: number) => () => {
    const newHiddenColumns = [...hiddenColumns];
    const indexOfColumn = newHiddenColumns.indexOf(columnIndex);
    if (indexOfColumn >= 0) {
      newHiddenColumns.splice(indexOfColumn, 1);
    } else {
      newHiddenColumns.push(columnIndex);
    }
    setHiddenColumn(newHiddenColumns.sort());
  };

  const toggleRow = () => {
    setHiddenRow(hiddenRow ? null : 1);
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          marginBottom: 10,
          width: 1000,
        }}
      >
        <Button color="primary" onClick={toggleColumn(1)} variant={hiddenColumns.includes(1) ? "text" : "contained"}>
          Toogle column 1
        </Button>
        <Button color="primary" onClick={toggleColumn(2)} variant={hiddenColumns.includes(2) ? "text" : "contained"}>
          Toogle column 2
        </Button>
        <Button color="primary" onClick={toggleColumn(3)} variant={hiddenColumns.includes(3) ? "text" : "contained"}>
          Toogle column 3
        </Button>
        <Button color="primary" onClick={toggleColumn(4)} variant={hiddenColumns.includes(4) ? "text" : "contained"}>
          Toogle column 4
        </Button>
        <Button color="primary" onClick={toggleRow} variant={hiddenRow === 1 ? "text" : "contained"}>
          toggle row 1
        </Button>
      </div>
      <Table
        {...generateTable(50, 50, {}, true)}
        isSelectable={false}
        isVirtualized
        virtualizerProps={{
          hiddenColumns,
          hiddenRows: hiddenRow ? [hiddenRow] : [],
          fixedRows: object("fixedRows", [0, 1, 2, 8]),
          fixedColumns: [0, 1, 2, 3, 4, 49],
          height: number("height", 500),
          width: number("width", 1000),
        }}
      />
    </div>
  );
};

export const CustomCellContent = ({
  defaultValue,
}: ICustomCellContentProps): React.FunctionComponentElement<ICustomCellContentProps> => {
  const [editable, setEditable] = React.useState<boolean>(false);
  const [value, setValue] = React.useState<string>(defaultValue);

  const toggleEditable = (): void => {
    setEditable(!editable);
  };

  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setValue(event.target.value);
  };

  return (
    <div role="cell" onClick={!editable ? toggleEditable : undefined} style={{ color: "green" }}>
      {editable ? (
        <div>
          <TextField id="cell-id-foo" value={value} onChange={onChange} style={{ width: "auto" }} variant="standard" />
          <Button color="primary" variant="contained" onClick={toggleEditable}>
            ok
          </Button>
        </div>
      ) : (
        <div>{value}</div>
      )}
    </div>
  );
};
