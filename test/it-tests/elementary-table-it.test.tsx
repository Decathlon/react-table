/// <reference path="../typings/tests-entry.d.ts" />
import { cleanup, fireEvent, getByTestId } from "@testing-library/react";

import { customRender } from "../tests-utils/react-testing-library-utils";
import { generateTable } from "../../stories/utils/tables";
import Table from "../../src/components/table/table";
import { getCellsOfRow, getRows } from "../tests-utils/table";

describe("elementary table component", () => {
  test("should render a table with all of rows and all of columns", () => {
    const { container } = customRender(<Table {...generateTable(20, 20)} />);
    const rows = getRows(container);
    const header = getRows(container, true);
    expect(rows).toHaveLength(19);
    expect(header).toHaveLength(1);
    expect(getCellsOfRow(rows[1])).toHaveLength(20);
    expect(getCellsOfRow(header[0])[1].textContent).toEqual("(0,1)");
    expect(getCellsOfRow(rows[6])[1].textContent).toEqual("(7,1)");
    expect(getCellsOfRow(rows[18])[1].textContent).toEqual("(19,1)");

    cleanup();
  });

  test("Should display sub-rows", () => {
    const { container } = customRender(<Table {...generateTable(20, 20, {}, true)} />);
    // Open the first level
    fireEvent.click(getByTestId(getRows(container)[1], "table-cell-sub-item-toggle"));
    let rows = getRows(container);
    let header = getRows(container, true);
    expect(getCellsOfRow(header[0])[0].textContent).toEqual("(0,0)");
    expect(getCellsOfRow(rows[0])[1].textContent).toEqual("(1,1)");
    expect(getCellsOfRow(rows[1])[1].textContent).toEqual("(2,1)");
    // first level
    expect(getCellsOfRow(header[1])[1].textContent).toEqual("(0,1)");
    // Open the second level
    fireEvent.click(getByTestId(rows[3], "table-cell-sub-item-toggle"));
    rows = getRows(container);
    header = getRows(container, true);
    expect(getCellsOfRow(header[1])[1].textContent).toEqual("(0,1)");
    // second level
    expect(getCellsOfRow(header[2])[1].textContent).toEqual("(0,1)");
    // Open the therd level
    fireEvent.click(getByTestId(rows[5], "table-cell-sub-item-toggle"));
    rows = getRows(container);
    header = getRows(container, true);
    // therd level
    expect(getCellsOfRow(header[3])[1].textContent).toEqual("(0,1)");
    // Close the first level
    fireEvent.click(getByTestId(rows[1], "table-cell-sub-item-toggle"));
    rows = getRows(container);
    header = getRows(container, true);

    expect(getCellsOfRow(header[0])[1].textContent).toEqual("(0,1)");
    expect(getCellsOfRow(rows[2])[1].textContent).toEqual("(3,1)");
    expect(getCellsOfRow(rows[5])[1].textContent).toEqual("(6,1)");
    expect(getCellsOfRow(rows[8])[1].textContent).toEqual("(9,1)");
    cleanup();
  });
});
