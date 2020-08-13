/// <reference path="../typings/tests-entry.d.ts" />
import * as React from "react";
import { fireEvent, queryByText } from "@testing-library/react";

import FixedRowController from "../../src/components/table-interactions-manager/fixed-row-controller";
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
          {({ onHorizontallyScroll, tableRef, columnsCursor, fixedRowsIndexes }) => {
            return (
              <>
                <FixedRowController rowIndex={15}>
                  {({ toggleFixedRowIndex, isFixed }) => (
                    <div data-testid="pin-column" onClick={toggleFixedRowIndex}>
                      {isFixed ? "Unpin" : "Pin"}
                    </div>
                  )}
                </FixedRowController>
                <Table
                  ref={tableRef}
                  {...defaultProps}
                  isVirtualized
                  virtualizerProps={{
                    fixedRows: [0, ...fixedRowsIndexes],
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

    const pinBtn = getByTestId("pin-column");
    expect(queryByText(container, "CA_TTC_OMNICANALF")).toBeFalsy();
    // Pin the CA_TTC_OMNICANALF row
    fireEvent.click(pinBtn);
    expect(queryByText(container, "CA_TTC_OMNICANALF")).toBeTruthy();
    // Unpin the CA_TTC_OMNICANALF row
    fireEvent.click(pinBtn);
    expect(queryByText(container, "CA_TTC_OMNICANALF")).toBeFalsy();
  });
});
