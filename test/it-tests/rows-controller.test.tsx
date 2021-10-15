/// <reference path="../typings/tests-entry.d.ts" />

import { fireEvent } from "@testing-library/react";
import { Button } from "@mui/material";

import TabeInteractionManager, {
  TableInteractionsContext,
} from "../../src/components/table-interactions-manager/table-interactions-manager";
import { customRender } from "../tests-utils/react-testing-library-utils";
import Table from "../../src/components/table/table";
import { getTable } from "../../stories/components/styled-table/tables";
import { ITrees } from "../../src/components/table/elementary-table";
import { tableWithSubItems, subRows, subMiam } from "../../stories/utils/tables";

const defaultProps = getTable();

const table3Levels = tableWithSubItems({
  firstSubRows: subRows({ subsubRows: subMiam }),
});

describe("Rows controller", () => {
  test("should open and close the row", () => {
    const trees: ITrees = {
      1: {
        rowIndex: 1,
        columnIndex: 0,
        subTrees: { 0: { rowIndex: 1, columnIndex: 2 } },
      },
    };
    const { container, getByText } = customRender(
      <TabeInteractionManager>
        <TableInteractionsContext.Consumer>
          {({ tableRef, openTrees, closeTrees }) => {
            return (
              <>
                <Button color="primary" variant="contained" onClick={() => openTrees(trees)}>
                  Open the row
                </Button>
                <Button color="primary" variant="contained" onClick={() => closeTrees(trees)}>
                  Close the row
                </Button>
                <Table ref={tableRef} {...defaultProps} isSelectable={false} isSpan rows={table3Levels} />
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

  test("should open and close the row with toggle btn", () => {
    const trees: ITrees = {
      1: {
        rowIndex: 1,
        columnIndex: 0,
        subTrees: { 0: { rowIndex: 1, columnIndex: 2 } },
      },
    };
    const { container, getByText } = customRender(
      <TabeInteractionManager>
        <TableInteractionsContext.Consumer>
          {({ tableRef, openTrees, closeTrees, onTableUpdate, table }) => {
            const openedTrees = table?.current ? table.current.state.openedTrees : {};
            const hasTableOpenedTrees = !!Object.keys(openedTrees).length;
            return (
              <>
                {hasTableOpenedTrees ? (
                  <Button data-testid="close" color="primary" variant="contained" onClick={() => closeTrees(trees)}>
                    Close the row
                  </Button>
                ) : (
                  <Button data-testid="open" color="primary" variant="contained" onClick={() => openTrees(trees)}>
                    Open the row
                  </Button>
                )}
                <Table
                  ref={tableRef}
                  {...defaultProps}
                  isSelectable={false}
                  isSpan
                  rows={table3Levels}
                  onOpenedTreesUpdate={onTableUpdate}
                />
              </>
            );
          }}
        </TableInteractionsContext.Consumer>
      </TabeInteractionManager>
    );
    const closeBtnSelector = '[data-testid="close"]';
    const openBtnSelector = '[data-testid="open"]';
    const cellSelector = '[data-testid="table-cell-wrapper-pizza"]';
    expect(container.querySelector(cellSelector)).toBeFalsy();
    expect(container.querySelector(closeBtnSelector)).toBeFalsy();
    // open the row
    fireEvent.click(getByText("Open the row"));

    expect(container.querySelector(cellSelector)).toBeTruthy();
    expect(container.querySelector(closeBtnSelector)).toBeTruthy();
    expect(container.querySelector(openBtnSelector)).toBeFalsy();
    // close the row
    fireEvent.click(getByText("Close the row"));

    expect(container.querySelector(cellSelector)).toBeFalsy();
    expect(container.querySelector(openBtnSelector)).toBeTruthy();
  });
});
