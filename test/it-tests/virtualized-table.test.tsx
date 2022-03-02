/// <reference path="../typings/tests-entry.d.ts" />
import * as React from "react";
import { cleanup, fireEvent, getByTestId, getByText } from "@testing-library/react";

import { customRender } from "../tests-utils/react-testing-library-utils";
import { generateTable, generateTableWithCustomColspan, generateRow } from "../../stories/utils/tables";
import Table, { ITableProps } from "../../src/components/table/table";
import { getCellsOfRow, getRows } from "../tests-utils/table";
import { ROW_SPAN_WIDTH } from "../../src/components/constants";
import { IRow } from "../../src/components/table/row";

const tableColumnsRowsControllerGenerator =
  (minColumnWidth = 90) =>
  () => {
    const [hiddenColumns, setHiddenColumn] = React.useState<number[]>([]);
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

    return (
      <div>
        <div data-testid="toggle-column-1" onClick={toggleColumn(1)}>
          Toogle column 1
        </div>
        <div data-testid="toggle-column-2" onClick={toggleColumn(2)}>
          Toogle column 2
        </div>
        <Table
          {...generateTable(50, 50, {}, true)}
          isSelectable={false}
          isVirtualized
          virtualizerProps={{
            hiddenColumns,
            fixedColumns: [0, 1, 2],
            minColumnWidth,
            height: 500,
            width: 1100,
          }}
        />
      </div>
    );
  };

describe("virtualized table component", () => {
  test("should render a table with a limit to the number of rows and column rendered at once", () => {
    customRender(
      <Table
        {...generateTable(20, 20)}
        isVirtualized
        virtualizerProps={{
          height: 500,
          width: 500,
          rowsCount: 8,
          columnsCount: 10,
        }}
      />
    );
    const rows = getRows();
    const header = getRows(true);
    expect(rows).toHaveLength(7);
    expect(header).toHaveLength(1);
    expect(getCellsOfRow(rows[0])).toHaveLength(11);
    cleanup();
  });

  test("should render a table with a limit to the number of rows and column rendered at once (with default cell size)", () => {
    customRender(
      <Table
        {...generateTable(30, 12)}
        isVirtualized
        virtualizerProps={{
          height: 500,
          width: 1000,
          fixedRows: [0, 8],
          fixedColumns: [0, 4],
        }}
      />
    );
    const rows = getRows();
    const header = getRows(true);
    expect(rows).toHaveLength(7);
    expect(header).toHaveLength(1);
    expect(getCellsOfRow(rows[0])).toHaveLength(11);
    cleanup();
  });

  test("should render a table with a limit to the number of rows and column rendered at once (with custom cell size)", () => {
    const table = generateTable(30, 12);
    customRender(
      <Table
        {...table}
        rowsProps={{ 0: { size: 200 }, 8: { size: 150 } }}
        columns={{ 0: { size: 320 }, 4: { size: 300 } }}
        isVirtualized
        virtualizerProps={{
          height: 500,
          width: 1000,
          fixedRows: [0, 8],
          fixedColumns: [0, 4],
        }}
      />
    );
    const rows = getRows();
    const header = getRows(true);
    expect(rows).toHaveLength(4);
    expect(header).toHaveLength(1);
    expect(getCellsOfRow(rows[0])).toHaveLength(5);
    cleanup();
  });

  test("Should display the rights rows after scrolling to the bottom", () => {
    const { container } = customRender(
      <Table
        {...generateTable(20, 20)}
        isVirtualized
        virtualizerProps={{
          height: 500,
          width: 1000,
          rowsCount: 8,
          columnsCount: 10,
        }}
      />
    );
    fireEvent.scroll(getByTestId(container, "scroller-container"), {
      target: { scrollTop: 825 },
    });
    const rows = getRows();
    expect(rows).toHaveLength(8);
    expect(getCellsOfRow(rows[0])[1].textContent).toEqual("(12,1)");
    expect(getCellsOfRow(rows[7])[1].textContent).toEqual("(19,1)");
    cleanup();
  });

  test("Should keep fixed rows after scrolling to the bottom", () => {
    const { container } = customRender(
      <Table
        {...generateTable(20, 20)}
        isVirtualized
        virtualizerProps={{
          height: 500,
          width: 1000,
          rowsCount: 8,
          columnsCount: 10,
          fixedRows: [0, 19],
        }}
      />
    );
    let rows = getRows();
    let header = getRows(true);
    expect(getCellsOfRow(header[0])[0].textContent).toEqual("(0,0)");
    expect(getCellsOfRow(rows[0])[1].textContent).toEqual("(1,1)");
    expect(getCellsOfRow(rows[5])[1].textContent).toEqual("(6,1)");
    expect(getCellsOfRow(rows[6])[1].textContent).toEqual("(19,1)");

    fireEvent.scroll(getByTestId(container, "scroller-container"), {
      target: { scrollTop: 875 },
    });
    rows = getRows();
    header = getRows(true);

    expect(getCellsOfRow(header[0])[0].textContent).toEqual("(0,0)");
    expect(getCellsOfRow(rows[0])[1].textContent).toEqual("(13,1)");
    expect(getCellsOfRow(rows[5])[1].textContent).toEqual("(18,1)");
    expect(getCellsOfRow(rows[6])[1].textContent).toEqual("(19,1)");

    cleanup();
  });

  test("Should display the rights columns after scrolling to the right", () => {
    const { container } = customRender(
      <Table
        {...generateTable(20, 20)}
        isVirtualized
        virtualizerProps={{
          height: 500,
          width: 1000,
          rowsCount: 8,
          columnsCount: 10,
        }}
      />
    );
    fireEvent.scroll(getByTestId(container, "scroller-container"), {
      target: { scrollLeft: 1000 },
    });
    const cellsOfRow = getCellsOfRow(getRows()[0]);
    expect(cellsOfRow).toHaveLength(10);
    expect(cellsOfRow[0].textContent).toEqual("(1,10)");
    expect(cellsOfRow[9].textContent).toEqual("(1,19)");
    cleanup();
  });

  test("Should keep fixed rows after scrolling to the right", () => {
    const { container } = customRender(
      <Table
        {...generateTable(20, 20)}
        isVirtualized
        virtualizerProps={{
          height: 500,
          width: 1000,
          rowsCount: 8,
          columnsCount: 10,
          fixedColumns: [0, 19],
        }}
      />
    );
    let cellsOfRow = getCellsOfRow(getRows()[0]);

    expect(cellsOfRow[0].textContent).toEqual("(1,0)");
    expect(cellsOfRow[1].textContent).toEqual("(1,1)");
    expect(cellsOfRow[8].textContent).toEqual("(1,8)");
    expect(cellsOfRow[10].textContent).toEqual("(1,19)");

    fireEvent.scroll(getByTestId(container, "scroller-container"), {
      target: { scrollLeft: 1100 },
    });
    cellsOfRow = getCellsOfRow(getRows()[0]);
    expect(cellsOfRow[0].textContent).toEqual("(1,0)");
    expect(cellsOfRow[1].textContent).toEqual("(1,11)");
    expect(cellsOfRow[8].textContent).toEqual("(1,18)");
    expect(cellsOfRow[9].textContent).toEqual("(1,19)");

    cleanup();
  });

  test("Should keep fixed rows after scrolling to the bottom (with span)", () => {
    const { container } = customRender(
      <Table
        {...generateTable(20, 20)}
        isSpan
        isVirtualized
        virtualizerProps={{
          height: 500,
          width: 1000,
          rowsCount: 8,
          columnsCount: 10,
          fixedRows: [0, 19],
        }}
      />
    );

    let rows = getRows();
    let header = getRows(true);

    expect(getCellsOfRow(header[0])[0].textContent).toEqual("(0,0)");
    expect(getCellsOfRow(rows[0])[1].textContent).toEqual("(1,1)");
    expect(getCellsOfRow(rows[5])[1].textContent).toEqual("(6,1)");
    expect(getCellsOfRow(rows[6])[1].textContent).toEqual("(19,1)");

    fireEvent.scroll(getByTestId(container, "scroller-container"), {
      target: { scrollTop: 875 },
    });
    rows = getRows();
    header = getRows(true);

    expect(getCellsOfRow(header[0])[0].textContent).toEqual("(0,0)");
    expect(getCellsOfRow(rows[0])[1].textContent).toEqual("(13,1)");
    expect(getCellsOfRow(rows[5])[1].textContent).toEqual("(18,1)");
    expect(getCellsOfRow(rows[6])[1].textContent).toEqual("(19,1)");

    cleanup();
  });

  test("Should display sub-rows (with span)", () => {
    customRender(
      <Table
        {...generateTable(20, 20, {}, true)}
        isSpan
        isVirtualized
        virtualizerProps={{
          height: 500,
          width: 1000,
          rowsCount: 8,
          columnsCount: 10,
          fixedRows: [0, 19],
        }}
      />
    );

    let rows = getRows();
    let header = getRows(true);
    expect(getCellsOfRow(header[0])[0].textContent).toEqual("(0,0)");
    expect(getCellsOfRow(rows[1])[1].textContent).toEqual("(2,1)");
    expect(getCellsOfRow(rows[2])[1].textContent).toEqual("(3,1)");
    expect(getCellsOfRow(rows[5])[1].textContent).toEqual("(6,1)");
    // fixed
    expect(getCellsOfRow(rows[6])[1].textContent).toEqual("(19,1)");

    // Open the first level
    fireEvent.click(getByTestId(rows[1], "table-toggle-row-btn"));
    rows = getRows();
    header = getRows(true);

    expect(getCellsOfRow(rows[1])[1].textContent).toEqual("(2,1)");
    expect(getCellsOfRow(header[1])[0].textContent).toEqual("(0,0)");
    expect(getCellsOfRow(rows[2])[1].textContent).toEqual("(1,1)");
    expect(getCellsOfRow(rows[3])[1].textContent).toEqual("(2,1)");
    // fixed
    expect(getCellsOfRow(rows[5])[1].textContent).toEqual("(19,1)");

    // Open the second
    fireEvent.click(getByTestId(rows[3], "table-cell-sub-item-toggle"));
    rows = getRows();
    header = getRows(true);

    expect(getCellsOfRow(rows[1])[1].textContent).toEqual("(2,1)");
    expect(getCellsOfRow(rows[2])[1].textContent).toEqual("(1,1)");
    expect(getCellsOfRow(rows[3])[1].textContent).toEqual("(2,1)");
    expect(getCellsOfRow(header[2])[0].textContent).toEqual("(0,0)");
    // fixed
    expect(getCellsOfRow(rows[4])[1].textContent).toEqual("(19,1)");
    cleanup();
  });

  test("Should display sub-rows (without span)", () => {
    customRender(
      <Table
        {...generateTable(20, 20, {}, true)}
        isVirtualized
        virtualizerProps={{
          height: 500,
          width: 1000,
          rowsCount: 8,
          columnsCount: 10,
          fixedRows: [0, 19],
        }}
      />
    );

    let rows = getRows();
    let header = getRows(true);
    expect(getCellsOfRow(header[0])[0].textContent).toEqual("(0,0)");
    expect(getCellsOfRow(rows[1])[1].textContent).toEqual("(2,1)");
    expect(getCellsOfRow(rows[2])[1].textContent).toEqual("(3,1)");
    expect(getCellsOfRow(rows[5])[1].textContent).toEqual("(6,1)");
    // fixed
    expect(getCellsOfRow(rows[6])[1].textContent).toEqual("(19,1)");

    // Open the first level
    fireEvent.click(getByTestId(rows[1], "table-cell-sub-item-toggle"));
    rows = getRows();
    header = getRows(true);

    expect(getCellsOfRow(rows[1])[1].textContent).toEqual("(2,1)");
    expect(getCellsOfRow(header[1])[0].textContent).toEqual("(0,0)");
    expect(getCellsOfRow(rows[2])[1].textContent).toEqual("(1,1)");
    expect(getCellsOfRow(rows[3])[1].textContent).toEqual("(2,1)");
    // fixed
    expect(getCellsOfRow(rows[5])[1].textContent).toEqual("(19,1)");

    // Open the second level
    fireEvent.click(getByTestId(rows[3], "table-cell-sub-item-toggle"));
    rows = getRows();
    header = getRows(true);

    expect(getCellsOfRow(rows[1])[1].textContent).toEqual("(2,1)");
    expect(getCellsOfRow(rows[2])[1].textContent).toEqual("(1,1)");
    expect(getCellsOfRow(rows[3])[1].textContent).toEqual("(2,1)");
    expect(getCellsOfRow(header[2])[0].textContent).toEqual("(0,0)");
    // fixed
    expect(getCellsOfRow(rows[4])[1].textContent).toEqual("(19,1)");
    cleanup();
  });

  test("Should display sub-rows (stress scrolling)", () => {
    const { container } = customRender(
      <Table
        {...generateTable(20, 20, {}, true)}
        isVirtualized
        virtualizerProps={{
          height: 500,
          width: 1000,
          rowsCount: 20,
          columnsCount: 10,
          fixedRows: [0, 2, 19],
        }}
      />
    );

    let rows = getRows();
    // Open the first level
    fireEvent.click(getByTestId(rows[1], "table-cell-sub-item-toggle"));
    rows = getRows();
    // Open the second level
    fireEvent.click(getByTestId(rows[3], "table-cell-sub-item-toggle"));
    rows = getRows();
    // Open the therd level
    fireEvent.click(getByTestId(rows[5], "table-cell-sub-item-toggle"));
    rows = getRows();
    // Scroll to buttom 4*20*25px (500/20) - fixed rows = 1550
    fireEvent.scroll(getByTestId(container, "scroller-container"), {
      target: { scrollTop: 1550 },
    });
    rows = getRows();
    let header = getRows(true);

    expect(getCellsOfRow(header[0])[0].textContent).toEqual("(0,0)");
    // fixed with subItems
    expect(getCellsOfRow(rows[0])[1].textContent).toEqual("(2,1)");
    // the therd row of the first level
    expect(getCellsOfRow(rows[5])[1].textContent).toEqual("(6,1)");
    expect(getCellsOfRow(rows[17])[1].textContent).toEqual("(18,1)");
    // fixed
    expect(getCellsOfRow(rows[18])[1].textContent).toEqual("(19,1)");
    // Scroll to top
    fireEvent.scroll(getByTestId(container, "scroller-container"), {
      target: { scrollTop: 0 },
    });
    rows = getRows();
    // Close the first level
    fireEvent.click(getByTestId(rows[1], "table-cell-sub-item-toggle"));
    rows = getRows();
    header = getRows(true);

    expect(getCellsOfRow(header[0])[0].textContent).toEqual("(0,0)");
    expect(getCellsOfRow(rows[0])[1].textContent).toEqual("(1,1)");
    expect(getCellsOfRow(rows[5])[1].textContent).toEqual("(6,1)");
    // fixed
    expect(getCellsOfRow(rows[18])[1].textContent).toEqual("(19,1)");
    cleanup();
  });

  test("Should keep fixed rows after scrolling to the bottom (with custom cell size)", () => {
    const table = generateTable(20, 20);
    table.rows[0].size = 24;
    table.rows[19].size = 150;
    customRender(
      <Table
        {...table}
        isSpan
        isVirtualized
        virtualizerProps={{
          height: 500,
          width: 1000,
          rowsCount: 8,
          columnsCount: 10,
          fixedRows: [0, 19],
        }}
      />
    );
    const rows = getRows();
    const header = getRows(true);
    expect(getCellsOfRow(header[0])[0].textContent).toEqual("(0,0)");
    expect(getCellsOfRow(rows[0])[1].textContent).toEqual("(1,1)");
    expect(getCellsOfRow(rows[5])[1].textContent).toEqual("(6,1)");
    expect(getCellsOfRow(rows[6])[1].textContent).toEqual("(19,1)");
    cleanup();
  });

  test("Should display the rights rows after scrolling to the left", () => {
    const { container } = customRender(
      <Table
        {...generateTable(20, 20, {}, true)}
        isVirtualized
        virtualizerProps={{
          height: 500,
          width: 1000,
          rowsCount: 8,
          columnsCount: 10,
          fixedRows: [0, 19],
        }}
      />
    );
    let rows = getRows();
    let header = getRows(true);
    expect(rows).toHaveLength(7);
    expect(header).toHaveLength(1);
    expect(getCellsOfRow(rows[1])).toHaveLength(11);
    // scroll to the max left
    fireEvent.scroll(getByTestId(container, "scroller-container"), {
      target: { scrollLeft: 1000 },
    });
    rows = getRows();
    header = getRows(true);

    expect(rows).toHaveLength(7);
    expect(header).toHaveLength(1);
    expect(getCellsOfRow(rows[1])).toHaveLength(10);

    expect(getCellsOfRow(rows[0])[9].textContent).toEqual("(1,19)");
    expect(getCellsOfRow(rows[6])[9].textContent).toEqual("(19,19)");
    cleanup();
  });

  test("Should display the rights rows after scrolling to the left (without fixed columns)", () => {
    const { container } = customRender(
      <Table
        {...generateTable(20, 20, {}, true)}
        isVirtualized
        virtualizerProps={{
          height: 500,
          width: 1000,
          rowsCount: 8,
          columnsCount: 10,
        }}
      />
    );
    let rows = getRows();
    let header = getRows(true);
    expect(rows).toHaveLength(7);
    expect(header).toHaveLength(1);
    expect(getCellsOfRow(rows[1])).toHaveLength(11);
    // scroll to the max left
    fireEvent.scroll(getByTestId(container, "scroller-container"), {
      target: { scrollLeft: 1000 },
    });
    rows = getRows();
    header = getRows(true);

    expect(rows).toHaveLength(7);
    expect(getCellsOfRow(rows[1])).toHaveLength(10);

    expect(getCellsOfRow(rows[0])[9].textContent).toEqual("(1,19)");
    expect(getCellsOfRow(rows[6])[9].textContent).toEqual("(7,19)");
    cleanup();
  });

  test("Should display the rights rows after scrolling to the left (with span)", () => {
    const { container } = customRender(
      <Table
        {...generateTable(20, 20, {}, true)}
        isSpan
        isVirtualized
        virtualizerProps={{
          height: 500,
          width: 1000,
          rowsCount: 8,
          columnsCount: 10,
        }}
      />
    );
    let rows = getRows();
    let header = getRows(true);
    expect(rows).toHaveLength(7);
    expect(header).toHaveLength(1);
    expect(getCellsOfRow(rows[1])).toHaveLength(11);
    // scroll to the max left
    fireEvent.scroll(getByTestId(container, "scroller-container"), {
      target: { scrollLeft: 1000 - ROW_SPAN_WIDTH },
    });
    rows = getRows();
    header = getRows(true);

    expect(rows).toHaveLength(7);
    expect(getCellsOfRow(rows[1])).toHaveLength(10);

    expect(getCellsOfRow(rows[0])[9].textContent).toEqual("(1,19)");
    expect(getCellsOfRow(rows[6])[9].textContent).toEqual("(7,19)");
    cleanup();
  });

  test("Should scroll to the third column that is not fixed", () => {
    const { container } = customRender(
      <Table
        {...generateTable(40, 40, {}, true)}
        isVirtualized
        virtualizerProps={{
          height: 500,
          width: 1400,
          columnsCount: 7,
          fixedRows: [0],
          fixedColumns: [0, 1, 2, 3, 4],
          minColumnWidth: 200,
          minRowHeight: 100,
          initialScroll: {
            columnIndex: 30,
          },
        }}
      />
    );

    /** Simulate a scroll action to display the third column that is not fixed */
    fireEvent.scroll(getByTestId(container, "scroller-container"), {
      target: { scrollLeft: 600 },
    });
    const rows = getRows();
    expect(getCellsOfRow(rows[0])[5].textContent).toEqual("(1,8)");
    expect(getCellsOfRow(rows[0])[6].textContent).toEqual("(1,9)");
  });

  test("Should scroll to the third row that is not fixed", () => {
    const { container } = customRender(
      <Table
        {...generateTable(40, 40, {}, true)}
        isVirtualized
        virtualizerProps={{
          height: 500,
          width: 1400,
          rowsCount: 7,
          fixedRows: [0, 1, 2, 3, 4],
          fixedColumns: [0, 1, 2, 3, 4],
          minColumnWidth: 200,
          minRowHeight: 200,
          initialScroll: {
            rowIndex: 30,
          },
        }}
      />
    );

    /** Simulate a scroll action to display the third row that is not fixed */
    fireEvent.scroll(getByTestId(container, "scroller-container"), {
      target: { scrollTop: 375 },
    });
    const rows = getRows();
    expect(getCellsOfRow(rows[4])[0].textContent).toEqual("(10,0)");
    expect(getCellsOfRow(rows[5])[0].textContent).toEqual("(11,0)");
  });

  test("Should display with an initial scroll", () => {
    const { container } = customRender(
      <Table
        {...generateTable(40, 40, {}, true)}
        isSpan
        isVirtualized
        virtualizerProps={{
          height: 500,
          width: 1000,
          rowsCount: 8,
          columnsCount: 10,
          initialScroll: {
            columnIndex: 20,
            rowIndex: 15,
          },
        }}
      />
    );
    fireEvent.scroll(getByTestId(container, "scroller-container"));
    const rows = getRows();
    expect(rows).toHaveLength(8);
    expect(getCellsOfRow(rows[0])).toHaveLength(11);
    expect(getCellsOfRow(rows[0])[1].textContent).toEqual("(15,21)");
    cleanup();
  });

  test("Should display with an initial scroll", () => {
    const { rerender } = customRender(
      <Table
        {...generateTable(40, 40)}
        isVirtualized
        virtualizerProps={{
          height: 500,
          width: 1000,
          rowsCount: 8,
          columnsCount: 10,
        }}
      />
    );
    let rows = getRows();
    let header = getRows(true);
    expect(rows).toHaveLength(7);
    expect(header).toHaveLength(1);
    expect(getCellsOfRow(rows[0])).toHaveLength(11);
    expect(getCellsOfRow(rows[0])[0].textContent).toEqual("(1,0)");

    const updateProps = (props: ITableProps) => rerender(<Table {...props} />);
    updateProps({
      ...generateTable(10, 10),
      responsiveContainerProps: {},
      initialOpenedTrees: {},
      isVirtualized: true,
      virtualizerProps: {
        height: 500,
        width: 1000,
        rowsCount: 8,
        columnsCount: 10,
      },
    });
    rows = getRows();
    header = getRows(true);
    expect(rows).toHaveLength(7);
    expect(header).toHaveLength(1);
    expect(getCellsOfRow(rows[0])).toHaveLength(10);
    expect(getCellsOfRow(rows[6])[9].textContent).toEqual("(7,9)");

    cleanup();
  });

  test("Should display only visible rows and columns", () => {
    const { container } = customRender(
      <Table
        {...generateTable(20, 20, {}, true)}
        isVirtualized
        virtualizerProps={{
          height: 500,
          width: 1000,
          rowsCount: 15,
          columnsCount: 10,
          fixedRows: [0, 2, 19],
          fixedColumns: [1, 3],
          hiddenColumns: [1, 5],
          hiddenRows: [1, 5, 6],
        }}
      />
    );

    let rows = getRows();

    // Open the first level
    fireEvent.click(getByTestId(rows[0], "table-cell-sub-item-toggle"));
    rows = getRows();
    // Open the second level
    fireEvent.click(getByTestId(rows[2], "table-cell-sub-item-toggle"));
    rows = getRows();
    // Open the therd level
    fireEvent.click(getByTestId(rows[4], "table-cell-sub-item-toggle"));
    rows = getRows();
    // Scroll to buttom 4*20*25px (500/20) = 2000
    fireEvent.scroll(getByTestId(container, "scroller-container"), {
      target: { scrollTop: 1550 },
    });
    rows = getRows();
    let header = getRows(true);

    expect(getCellsOfRow(header[0])[0].textContent).toEqual("(0,0)");
    // fixed with subItems
    expect(getCellsOfRow(rows[0])[1].textContent).toEqual("(2,2)");
    // the therd row of the first level
    expect(getCellsOfRow(rows[7])[1].textContent).toEqual("(11,2)");
    expect(getCellsOfRow(rows[12])[1].textContent).toEqual("(16,2)");
    // fixed
    expect(getCellsOfRow(rows[13])[1].textContent).toEqual("(19,2)");
    // Scroll to top
    fireEvent.scroll(getByTestId(container, "scroller-container"), {
      target: { scrollTop: 0 },
    });
    rows = getRows();
    // Close the first level
    fireEvent.click(getByTestId(rows[0], "table-cell-sub-item-toggle"));
    rows = getRows();
    header = getRows(true);

    expect(getCellsOfRow(header[0])[0].textContent).toEqual("(0,0)");
    expect(getCellsOfRow(rows[0])[1].textContent).toEqual("(2,2)");
    expect(getCellsOfRow(rows[5])[1].textContent).toEqual("(9,2)");
    // fixed
    expect(getCellsOfRow(rows[13])[1].textContent).toEqual("(19,2)");
    cleanup();
  });

  test("Should scroll to the first unfixed column if we hide a column (small columns)", () => {
    const TableColumnsRowsController = tableColumnsRowsControllerGenerator(40);
    const { container } = customRender(<TableColumnsRowsController />);
    /** Simulate a scroll action to display the third column that is not fixed */
    fireEvent.scroll(getByTestId(container, "scroller-container"), {
      target: { scrollLeft: 375 },
    });

    let rows = getRows();
    expect(getCellsOfRow(rows[0])[3].textContent).toEqual("(1,12)");
    // toggle the first column (hide)
    fireEvent.click(getByTestId(container, "toggle-column-1"));
    /**
     * we need to fire the scroll event because it's not fired natively
     * with react testing library if we edit the scroll manually
     *  */
    fireEvent.scroll(getByTestId(container, "scroller-container"));
    rows = getRows();
    expect(getCellsOfRow(rows[0])[2].textContent).toEqual("(1,12)");
    // toggle the second column (hide)
    fireEvent.click(getByTestId(container, "toggle-column-2"));
    fireEvent.scroll(getByTestId(container, "scroller-container"));
    rows = getRows();
    expect(getCellsOfRow(rows[0])[1].textContent).toEqual("(1,12)");
    // toggle the first column (display)
    fireEvent.click(getByTestId(container, "toggle-column-1"));
    fireEvent.scroll(getByTestId(container, "scroller-container"));
    rows = getRows();
    expect(getCellsOfRow(rows[0])[2].textContent).toEqual("(1,12)");
    // toggle the second column (display)
    fireEvent.click(getByTestId(container, "toggle-column-2"));
    fireEvent.scroll(getByTestId(container, "scroller-container"));
    rows = getRows();
    expect(getCellsOfRow(rows[0])[3].textContent).toEqual("(1,12)");
  });

  test("Should scroll to the first unfixed column if we hide a column (medium columns)", () => {
    const TableColumnsRowsController = tableColumnsRowsControllerGenerator(90);
    const { container } = customRender(<TableColumnsRowsController />);
    /** Simulate a scroll action to display the third column that is not fixed */
    fireEvent.scroll(getByTestId(container, "scroller-container"), {
      target: { scrollLeft: 400 },
    });

    let rows = getRows();
    expect(getCellsOfRow(rows[0])[3].textContent).toEqual("(1,7)");
    // toggle the first column (hide)
    fireEvent.click(getByTestId(container, "toggle-column-1"));
    /**
     * we need to fire the scroll event because it's not fired natively
     * with react testing library if we edit the scroll manually
     *  */
    fireEvent.scroll(getByTestId(container, "scroller-container"));
    rows = getRows();
    expect(getCellsOfRow(rows[0])[2].textContent).toEqual("(1,7)");
    // toggle the second column (hide)
    fireEvent.click(getByTestId(container, "toggle-column-2"));
    fireEvent.scroll(getByTestId(container, "scroller-container"));
    rows = getRows();
    expect(getCellsOfRow(rows[0])[1].textContent).toEqual("(1,7)");
    // toggle the first column (display)
    fireEvent.click(getByTestId(container, "toggle-column-1"));
    fireEvent.scroll(getByTestId(container, "scroller-container"));
    rows = getRows();
    expect(getCellsOfRow(rows[0])[2].textContent).toEqual("(1,7)");
    // toggle the second column (display)
    fireEvent.click(getByTestId(container, "toggle-column-2"));
    fireEvent.scroll(getByTestId(container, "scroller-container"));
    rows = getRows();
    expect(getCellsOfRow(rows[0])[3].textContent).toEqual("(1,7)");
  });

  test("Should scroll to colmuns by ids", () => {
    const firstColumnId = "(0,26)-0";
    const secondColumnId = "(0,39)-0";
    const TableColumnsRowsController = () => {
      const table = React.useRef<Table>(null);
      const goToColumnId = (columnId: string) => () => {
        table.current && table.current.goToColumnId(columnId);
      };

      return (
        <div>
          <div data-testid="toggle-column-1" onClick={goToColumnId(firstColumnId)}>
            Toogle column 26
          </div>
          <div data-testid="toggle-column-2" onClick={goToColumnId(secondColumnId)}>
            Toogle column 39
          </div>
          <Table
            ref={table}
            {...generateTable(50, 50, {}, true)}
            isSelectable={false}
            isVirtualized
            virtualizerProps={{
              fixedColumns: [0, 1],
              height: 500,
              width: 1000,
            }}
          />
        </div>
      );
    };
    const { container } = customRender(<TableColumnsRowsController />);
    /** Simulate a scroll action to display the third column that is not fixed */
    fireEvent.scroll(getByTestId(container, "scroller-container"), {
      target: { scrollLeft: 450 },
    });

    let rows = getRows();
    expect(getCellsOfRow(rows[0])[2].textContent).toEqual("(1,6)");
    // scroll to the column "(0,26)-0"
    fireEvent.click(getByTestId(container, "toggle-column-1"));
    /**
     * we need to fire the scroll event because it's not fired natively
     * with react testing library if we edit the scroll manually
     *  */
    fireEvent.scroll(getByTestId(container, "scroller-container"));
    rows = getRows();
    expect(getCellsOfRow(rows[0])[2].textContent).toEqual("(1,26)");
    // scroll to the column "(0,39)-0"
    fireEvent.click(getByTestId(container, "toggle-column-2"));
    fireEvent.scroll(getByTestId(container, "scroller-container"));
    rows = getRows();
    expect(getCellsOfRow(rows[0])[2].textContent).toEqual("(1,39)");
  });

  test("Should scroll to the first unfixed column if we hide a column (large columns)", () => {
    const TableColumnsRowsController = tableColumnsRowsControllerGenerator(250);
    const { container } = customRender(<TableColumnsRowsController />);
    /** Simulate a scroll action to display the third column that is not fixed */
    fireEvent.scroll(getByTestId(container, "scroller-container"), {
      target: { scrollLeft: 300 },
    });

    let rows = getRows();
    expect(getCellsOfRow(rows[0])[3].textContent).toEqual("(1,4)");

    // toggle the first column (hide)
    fireEvent.click(getByTestId(container, "toggle-column-1"));
    /**
     * we need to fire the scroll event because it's not fired natively
     * with react testing library if we edit the scroll manually
     *  */
    fireEvent.scroll(getByTestId(container, "scroller-container"));
    rows = getRows();
    expect(getCellsOfRow(rows[0])[2].textContent).toEqual("(1,4)");
    // toggle the second column (hide)
    fireEvent.click(getByTestId(container, "toggle-column-2"));
    fireEvent.scroll(getByTestId(container, "scroller-container"));
    rows = getRows();
    expect(getCellsOfRow(rows[0])[1].textContent).toEqual("(1,4)");
    // toggle the first column (display)
    fireEvent.click(getByTestId(container, "toggle-column-1"));
    fireEvent.scroll(getByTestId(container, "scroller-container"));
    rows = getRows();
    expect(getCellsOfRow(rows[0])[2].textContent).toEqual("(1,4)");
    // toggle the second column (display)
    fireEvent.click(getByTestId(container, "toggle-column-2"));
    fireEvent.scroll(getByTestId(container, "scroller-container"));
    rows = getRows();
    expect(getCellsOfRow(rows[0])[3].textContent).toEqual("(1,4)");
  });

  test("Should display only one cell for the first row", () => {
    const { container } = customRender(
      <Table
        {...generateTableWithCustomColspan(20, 20, true)}
        isVirtualized
        virtualizerProps={{
          height: 500,
          width: 1000,
          rowsCount: 15,
          columnsCount: 10,
          fixedRows: [0, 2, 19],
          fixedColumns: [0],
        }}
      />
    );

    let rows = getRows();

    // Open the first level
    fireEvent.click(getByTestId(rows[0], "table-cell-sub-item-toggle"));
    // Scroll to left
    fireEvent.scroll(getByTestId(container, "scroller-container"), {
      target: { scrollLeft: 900 },
    });
    rows = getRows();
    const header = getRows(true);
    // First level test if we have only one cell
    expect(getByText(getCellsOfRow(rows[0])[0], "Table title")).toBeDefined();
    expect(getCellsOfRow(rows[0])[1]).not.toBeDefined();
    // second level test if we have only one cell
    expect(getByText(getCellsOfRow(header[0])[0], /My chart/)).toBeDefined();
    expect(getCellsOfRow(header[0])[1]).not.toBeDefined();

    // Close the first level
    fireEvent.click(getByTestId(rows[0], "table-cell-sub-item-toggle"));
    rows = getRows();

    expect(getByText(getCellsOfRow(rows[0])[0], "Table title")).toBeDefined();
    expect(getCellsOfRow(rows[0])[1]).not.toBeDefined();
  });

  test("Should display fixed sub row", () => {
    const table = generateTable(100, 100, {}, true);
    const lastRow: IRow = table.rows[99];
    lastRow.fixSubRows = true;
    lastRow.cells[0].subItems = [generateRow(1, 100, false, 2)];

    const { container } = customRender(
      <Table
        {...table}
        isVirtualized
        virtualizerProps={{
          height: 500,
          width: 1000,
          rowsCount: 15,
          columnsCount: 10,
          fixedRows: [0, 2, 99],
        }}
      />
    );

    let rows = getRows();

    // Scroll to buttom
    fireEvent.scroll(getByTestId(container, "scroller-container"), {
      target: { scrollTop: 2500 },
    });
    rows = getRows();
    // fixed
    expect(getCellsOfRow(rows[13])[1].textContent).toEqual("(99,1)");
    // Open the first level
    fireEvent.click(getByTestId(rows[13], "table-cell-sub-item-toggle"));
    rows = getRows();

    expect(getCellsOfRow(rows[12])[1].textContent).toEqual("(99,1)");
    // fixed sub Row
    expect(getCellsOfRow(rows[13])[1].textContent).toEqual("(1,1)");

    // Scroll to top
    fireEvent.scroll(getByTestId(container, "scroller-container"), {
      target: { scrollTop: 0 },
    });
    rows = getRows();
    // fixed row
    expect(getCellsOfRow(rows[12])[1].textContent).toEqual("(99,1)");
    // fixed sub Row
    expect(getCellsOfRow(rows[13])[1].textContent).toEqual("(1,1)");
  });
});
