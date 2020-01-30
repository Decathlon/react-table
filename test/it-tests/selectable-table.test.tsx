/// <reference path="../typings/tests-entry.d.ts" />
import * as React from "react";
import { cleanup, fireEvent } from "@testing-library/react";

import { customRender } from "../tests-utils/react-testing-library-utils";
import { generateTable } from "../../stories/utils/tables";
import Table from "../../src/components/table/table";
import { fireMouseEvent, getCellsOfRow, getRows } from "../tests-utils/table";
import TableSelectionMenu, { IMenuProps, IMenuAction } from "../../src/components/table-selection/table-selection-menu";

const selectionClassName = "selected";

const actions: IMenuAction[] = [
  {
    id: "foo",
    title: "Foo item",
    component: () => <div>Foo</div>
  },
  {
    id: "bar",
    title: "Bar item",
    component: () => <div>Foo</div>
  }
];

const MyTableSelectionMenu: React.FunctionComponent<IMenuProps> = props => {
  return <TableSelectionMenu {...props} actions={actions} />;
};

describe("Selection behaviour", () => {
  test("should start selecting cells on mousedown", () => {
    const { container } = customRender(<Table {...generateTable(10, 10)} />);
    const rows = getRows(container);
    const firstCell = getCellsOfRow(rows[0])[4];
    fireMouseEvent(firstCell, "mousedown");
    expect(firstCell.className.includes(selectionClassName)).toBeTruthy();
    expect(container.getElementsByClassName(selectionClassName)).toHaveLength(1);
    cleanup();
  });

  test("should select cells between the mousedown and the last mouseover", () => {
    const { container } = customRender(<Table {...generateTable(10, 10)} />);
    const rows = getRows(container);
    const firstCell = getCellsOfRow(rows[0])[4];
    const secondCell = getCellsOfRow(rows[0])[5];
    const lastCell = getCellsOfRow(rows[1])[6];
    fireMouseEvent(firstCell, "mousedown");
    fireMouseEvent(lastCell, "mouseover");
    expect(secondCell.className.includes(selectionClassName)).toBeTruthy();
    expect(lastCell.className.includes(selectionClassName)).toBeTruthy();
    expect(container.getElementsByClassName(selectionClassName)).toHaveLength(6);
    cleanup();
  });

  test("should stop selecting cells after mouseup", () => {
    const { container } = customRender(<Table {...generateTable(10, 10)} />);
    const rows = getRows(container);
    const firstCell = getCellsOfRow(rows[0])[4];
    const secondCell = getCellsOfRow(rows[1])[6];
    const lastCell = getCellsOfRow(rows[2])[6];
    fireMouseEvent(firstCell, "mousedown");
    fireMouseEvent(secondCell, "mouseover");
    fireMouseEvent(secondCell, "mouseup");
    fireMouseEvent(lastCell, "mouseover");
    expect(lastCell.className.includes(selectionClassName)).toBeFalsy();
    expect(container.getElementsByClassName(selectionClassName)).toHaveLength(6);
    cleanup();
  });

  test("should only select a row of cells", () => {
    const { container } = customRender(
      <Table
        {...generateTable(10, 10)}
        selectionProps={{
          isDisabledVerticalSelection: true,
          isDisabledHorizontalSelection: false
        }}
      />
    );
    const rows = getRows(container);
    const firstCell = getCellsOfRow(rows[0])[4];
    const lastCell = getCellsOfRow(rows[1])[6];
    fireMouseEvent(firstCell, "mousedown");
    fireMouseEvent(lastCell, "mouseover");
    fireMouseEvent(lastCell, "mouseup");
    expect(lastCell.className.includes(selectionClassName)).toBeFalsy();
    expect(container.getElementsByClassName(selectionClassName)).toHaveLength(3);
    cleanup();
  });

  test("should only select a column of cells", () => {
    const { container } = customRender(
      <Table
        {...generateTable(10, 10)}
        selectionProps={{
          isDisabledVerticalSelection: false,
          isDisabledHorizontalSelection: true
        }}
      />
    );
    const rows = getRows(container);
    const firstCell = getCellsOfRow(rows[0])[4];
    const lastCell = getCellsOfRow(rows[1])[6];
    fireMouseEvent(firstCell, "mousedown");
    fireMouseEvent(lastCell, "mouseover");
    fireMouseEvent(lastCell, "mouseup");
    expect(lastCell.className.includes(selectionClassName)).toBeFalsy();
    expect(container.getElementsByClassName(selectionClassName)).toHaveLength(2);
    cleanup();
  });

  test("should display menu", () => {
    const { container, getByText } = customRender(
      <Table
        {...generateTable(10, 10)}
        selectionProps={{
          menuComponent: MyTableSelectionMenu
        }}
      />
    );
    const rows = getRows(container);
    const firstCell = getCellsOfRow(rows[0])[4];
    const lastCell = getCellsOfRow(rows[1])[6];
    fireMouseEvent(firstCell, "mousedown");
    fireMouseEvent(lastCell, "mouseover");
    fireMouseEvent(lastCell, "mouseup");
    // open the menu
    fireEvent.contextMenu(lastCell);
    // select Foo item menu
    fireEvent.click(getByText("Foo item"));
    // menu closed => open the menu
    fireEvent.contextMenu(lastCell);
    // select Bar item menu
    fireEvent.click(getByText("Bar item"));
  });
});
