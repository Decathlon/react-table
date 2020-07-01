/// <reference path="../typings/tests-entry.d.ts" />

import * as React from "react";
import { fireEvent } from "@testing-library/react";
import { Button } from "@material-ui/core";

import TabeInteractionManager, {
  TableInteractionsContext
} from "../../src/components/table-interactions-manager/table-interactions-manager";
import { customRender } from "../tests-utils/react-testing-library-utils";
import Table from "../../src/components/table/table";
import { getTable } from "../../stories/components/styled-table/tables";
import { ITrees } from "../../src/components/table/elementary-table";
import { tableWithSubItems, subRows, subMiam } from "../../stories/utils/tables";

const defaultProps = getTable();

const table3Levels = tableWithSubItems({
  firstSubRows: subRows({ subsubRows: subMiam })
});

describe("Rows controller", () => {
  test("should open and close the row", () => {
    const trees: ITrees = {
      1: {
        rowIndex: 1,
        columnIndex: 0,
        subTrees: { 0: { rowIndex: 1, columnIndex: 2 } }
      }
    };
    const { container, getByText } = customRender(
      <TabeInteractionManager>
        <TableInteractionsContext.Consumer>
          {({ table, openTrees, closeTrees }) => {
            return (
              <>
                <Button color="primary" variant="contained" onClick={() => openTrees(trees)}>
                  Open the row
                </Button>
                <Button color="primary" variant="contained" onClick={() => closeTrees(trees)}>
                  Close the row
                </Button>
                <Table ref={table} {...defaultProps} isSelectable={false} isSpan rows={table3Levels} />
              </>
            );
          }}
        </TableInteractionsContext.Consumer>
      </TabeInteractionManager>
    );
    const cellSelector = '[data-testid="table-cell-wrapper-pizza"]';
    expect(container.querySelector(cellSelector)).toBeFalsy();
    // open the row
    fireEvent.click(getByText("Open the row"));

    expect(container.querySelector(cellSelector)).toBeTruthy();
    // close the row
    fireEvent.click(getByText("Close the row"));

    expect(container.querySelector(cellSelector)).toBeFalsy();
  });
});
