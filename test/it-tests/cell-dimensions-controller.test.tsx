/// <reference path="../typings/tests-entry.d.ts" />

import * as React from "react";
import { fireEvent, getByTestId as globalGetByTestId, getByText as globalGetByText } from "@testing-library/react";

import CellDimensionController from "../../src/components/table-interactions-manager/cell-dimensions-controller";
import TabeInteractionManager, {
  TableInteractionsContext
} from "../../src/components/table-interactions-manager/table-interactions-manager";
import { customRender } from "../tests-utils/react-testing-library-utils";
import Table from "../../src/components/table/table";
import { getTable } from "../../stories/components/styled-table/tables";
import { getCellsOfRow, getRows } from "../tests-utils/table";

const defaultProps = getTable();

jest.useFakeTimers();

describe("CellDimensionController component", () => {
  test("should render the default CellDimensionController", () => {
    const { getByTestId, getByText } = customRender(
      <TabeInteractionManager>
        <CellDimensionController buttonRenderer={toggleMenu => <div onClick={toggleMenu}>Dimension Controller</div>} />
      </TabeInteractionManager>
    );
    fireEvent.click(getByText("Dimension Controller"));

    const columnWidthSamll = getByTestId("column-width-dimension-small");
    const columnWidthMedium = getByTestId("column-width-dimension-medium");
    const columnWidthLarge = getByTestId("column-width-dimension-large");
    const rowHeightSamll = getByTestId("row-height-dimension-small");
    const rowHeightMedium = getByTestId("row-height-dimension-medium");
    const rowHeightLarge = getByTestId("row-height-dimension-large");
    // medium values are checked
    expect(globalGetByTestId(columnWidthMedium, "column-width-dimension-checked")).toBeTruthy();
    expect(globalGetByTestId(rowHeightMedium, "row-height-dimension-checked")).toBeTruthy();

    fireEvent.click(columnWidthSamll);
    // cell width small
    expect(globalGetByTestId(columnWidthSamll, "column-width-dimension-checked")).toBeTruthy();
    expect(globalGetByTestId(rowHeightMedium, "row-height-dimension-checked")).toBeTruthy();

    fireEvent.click(rowHeightSamll);
    // row height small
    expect(globalGetByTestId(columnWidthSamll, "column-width-dimension-checked")).toBeTruthy();
    expect(globalGetByTestId(rowHeightSamll, "row-height-dimension-checked")).toBeTruthy();

    fireEvent.click(columnWidthLarge);
    fireEvent.click(rowHeightLarge);
    // cell width and row height large
    expect(globalGetByTestId(columnWidthLarge, "column-width-dimension-checked")).toBeTruthy();
    expect(globalGetByTestId(rowHeightLarge, "row-height-dimension-checked")).toBeTruthy();
  });

  test("should scroll to the current column", () => {
    const { container, getByTestId, getByText } = customRender(
      // init scroll to the week number 12
      <TabeInteractionManager initialConfig={{ hiddenColumnsIds: [], columnsCursor: { id: "12", index: 12 } }}>
        <TableInteractionsContext.Consumer>
          {({ onHorizontallyScroll, tableRef, columnsCursor, cellWidth, rowHeight }) => {
            return (
              <>
                <CellDimensionController buttonRenderer={toggleMenu => <div onClick={toggleMenu}>Dimension Controller</div>} />
                <Table
                  ref={tableRef}
                  {...defaultProps}
                  isVirtualized
                  virtualizerProps={{
                    minColumnWidth: cellWidth.value,
                    minRowHeight: rowHeight.value,
                    fixedRows: [0],
                    fixedColumns: [0],
                    height: 500,
                    width: 1100,
                    initialScroll: {
                      columnIndex: columnsCursor ? columnsCursor.index : undefined
                    },
                    onHorizontallyScroll
                  }}
                />
              </>
            );
          }}
        </TableInteractionsContext.Consumer>
      </TabeInteractionManager>
    );

    // The initial scroll (week number 12)
    fireEvent.scroll(getByTestId("scroller-container"));
    let header = getRows(container, true);
    expect(globalGetByText(getCellsOfRow(header[0])[1], "W12")).toBeTruthy();

    fireEvent.click(getByText("Dimension Controller"));
    const columnWidthSamll = getByTestId("column-width-dimension-small");

    // small cell width
    fireEvent.click(columnWidthSamll);
    jest.runAllImmediates();
    fireEvent.scroll(getByTestId("scroller-container"));
    header = getRows(container, true);
    expect(globalGetByText(getCellsOfRow(header[0])[1], "W12")).toBeTruthy();
  });
});
