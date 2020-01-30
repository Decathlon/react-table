/// <reference path="../typings/tests-entry.d.ts" />
import * as React from "react";
import { fireEvent, getByTestId as globalGetByTestId, getByText as globalGetByText } from "@testing-library/react";

import ColumnVisisbilityController from "../../src/components/table-interactions-manager/column-visibility-controller";
import TabeInteractionManager, {
  TableInteractionsContext
} from "../../src/components/table-interactions-manager/table-interactions-manager";
import { customRender } from "../tests-utils/react-testing-library-utils";
import Table from "../../src/components/table/table";
import { getTable } from "../../stories/components/styled-table/tables";
import { getCellsOfRow, getRows } from "../tests-utils/table";

const defaultProps = getTable();

describe("ColumnVisisbilityController component", () => {
  test("should render the default ColumnVisisbilityController", () => {
    const { getByTestId, getByText } = customRender(
      <TabeInteractionManager>
        <ColumnVisisbilityController
          columns={[
            { id: "foo", index: 0, label: "Foo" },
            { id: "bar", index: 1, label: "Bar" }
          ]}
          buttonRenderer={toggleMenu => <div onClick={toggleMenu}>Visisbility Controller</div>}
        />
      </TabeInteractionManager>
    );
    fireEvent.click(getByText("Visisbility Controller"));
    const fooItem = getByTestId("column-visibility-foo");
    const barItem = getByTestId("column-visibility-bar");
    // Foo and Bar are visible
    expect(globalGetByTestId(fooItem, "visibility-on")).toBeTruthy();
    expect(globalGetByTestId(barItem, "visibility-on")).toBeTruthy();
    // hide Foo
    fireEvent.click(fooItem);
    expect(globalGetByTestId(fooItem, "visibility-off")).toBeTruthy();
    expect(globalGetByTestId(barItem, "visibility-on")).toBeTruthy();
    // hide Bar
    fireEvent.click(barItem);
    expect(globalGetByTestId(fooItem, "visibility-off")).toBeTruthy();
    expect(globalGetByTestId(barItem, "visibility-off")).toBeTruthy();
  });

  test("should update hiddencolumns", () => {
    const toggleableColumns = [
      { id: "foo", index: 1, label: "FOO" },
      { id: "bar", index: 2, label: "BAR" }
    ];
    const { container, getByText, getByTestId } = customRender(
      <TabeInteractionManager initialConfig={{ hiddenColumnsIds: [] }} toggleableColumns={toggleableColumns}>
        <TableInteractionsContext.Consumer>
          {({ onHorizontallyScroll, table, columnsCursor, hiddenColumnsIndexes }) => {
            return (
              <>
                <ColumnVisisbilityController
                  columns={toggleableColumns}
                  buttonRenderer={toggleMenu => <div onClick={toggleMenu}>Visisbility Controller</div>}
                />
                <Table
                  ref={table}
                  {...defaultProps}
                  isVirtualized
                  virtualizerProps={{
                    hiddenColumns: hiddenColumnsIndexes,
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
    // The initial scroll (week number 1)
    fireEvent.scroll(getByTestId("scroller-container"));
    let header = getRows(container, true);
    expect(globalGetByText(getCellsOfRow(header[0])[1], "W1")).toBeTruthy();

    // hide the FOO column
    fireEvent.click(getByText("Visisbility Controller"));
    fireEvent.click(getByText("FOO"));
    fireEvent.scroll(getByTestId("scroller-container"));
    header = getRows(container, true);
    expect(globalGetByText(getCellsOfRow(header[0])[1], "W2")).toBeTruthy();

    // hide the BAR column
    fireEvent.click(getByText("BAR"));
    fireEvent.scroll(getByTestId("scroller-container"));
    header = getRows(container, true);
    expect(globalGetByText(getCellsOfRow(header[0])[1], "W3")).toBeTruthy();

    // display the FOO column
    fireEvent.click(getByText("FOO"));
    fireEvent.scroll(getByTestId("scroller-container"));
    header = getRows(container, true);
    expect(globalGetByText(getCellsOfRow(header[0])[1], "W1")).toBeTruthy();

    // display the BAR column
    fireEvent.click(getByText("BAR"));
    fireEvent.scroll(getByTestId("scroller-container"));
    header = getRows(container, true);
    expect(globalGetByText(getCellsOfRow(header[0])[1], "W1")).toBeTruthy();
  });
});
