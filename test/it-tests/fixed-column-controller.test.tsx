/// <reference path="../typings/tests-entry.d.ts" />
import * as React from "react";
import { fireEvent, queryByText } from "@testing-library/react";

import FixedColumnController from "../../src/components/table-interactions-manager/fixed-column-controller";
import TabeInteractionManager, {
  TableInteractionsContext
} from "../../src/components/table-interactions-manager/table-interactions-manager";
import { customRender } from "../tests-utils/react-testing-library-utils";
import Table from "../../src/components/table/table";
import { getTable } from "../../stories/components/styled-table/tables";

const defaultProps = getTable();

describe("FixedColumnController component", () => {
  test("should update fixedColumns", () => {
    const { container, getByTestId } = customRender(
      <TabeInteractionManager>
        <TableInteractionsContext.Consumer>
          {({ onHorizontallyScroll, tableRef, columnsCursor, fixedColumnsIndexes }) => {
            return (
              <>
                <FixedColumnController columnId="30">
                  {({ toggleFixedColumnId, isFixed }) => (
                    <div data-testid="pin-column" onClick={toggleFixedColumnId}>
                      {isFixed ? "Unpin" : "Pin"} w30
                    </div>
                  )}
                </FixedColumnController>
                <Table
                  ref={tableRef}
                  {...defaultProps}
                  isVirtualized
                  virtualizerProps={{
                    fixedRows: [0],
                    fixedColumns: [0, ...fixedColumnsIndexes],
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

    const pinBtn = getByTestId("pin-column");
    // The initial scroll (week number 1)
    fireEvent.scroll(getByTestId("scroller-container"));
    expect(queryByText(container, "W30")).toBeFalsy();
    // Pin the w30
    fireEvent.click(pinBtn);
    expect(queryByText(container, "W30")).toBeTruthy();
    // Unpin the w30
    fireEvent.click(pinBtn);
    expect(queryByText(container, "W30")).toBeFalsy();
  });
});
