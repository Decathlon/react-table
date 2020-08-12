/* eslint-disable  import/no-extraneous-dependencies */
import * as React from "react";
import { storiesOf } from "@storybook/react";
import { IconButton, Icon, Button } from "@material-ui/core";

import { ColumnWidth } from "../../../src/components/constants";
import { withThemeProvider } from "../../utils/decorators";
import CellDimensionController from "../../../src/components/table-interactions-manager/cell-dimensions-controller";
import ColumnVisibilityController from "../../../src/components/table-interactions-manager/column-visibility-controller";
import ColumnIdScrollController from "../../../src/components/table-interactions-manager/column-id-scroll-controller";
import FixedColumnController from "../../../src/components/table-interactions-manager/fixed-column-controller";
import TabeInteractionManager, {
  TableInteractionsContext
} from "../../../src/components/table-interactions-manager/table-interactions-manager";
import { CellSize } from "../../../src/components/table-interactions-manager/reducers";
import { getTable } from "../styled-table/tables";
import Table from "../../../src/components/table/table";
import { table3Levels } from "../table/table.stories";
import { ITrees } from "../../../src/components/table/elementary-table";

const defaultProps = getTable();

const toggleableColumns = [
  { id: "W01", index: 1, label: "W01" },
  { id: "W02", index: 2, label: "W02" },
  { id: "W03", index: 3, label: "W03" },
  { id: "W04", index: 4, label: "W04" }
];

const fixedRows = [0];
const fixedColumns = [0];

const storyInfoDefault = {
  inline: true,
  propTables: [CellDimensionController, ColumnVisibilityController, TabeInteractionManager]
};

const toolBarStyle = {
  display: "flex",
  justifyContent: "center"
};

const defaultColumnIdScrollControllerProps = {
  columns: Array.from({ length: 50 }).map((_, i: number) => ({ id: i.toString(), label: `Label_${i}` })),
  defaultValue: "0"
};

const trees: ITrees = {
  1: {
    rowIndex: 1,
    columnIndex: 0,
    subTrees: { 0: { rowIndex: 1, columnIndex: 2 } }
  }
};

const customCellWidthOptions = {
  s: 150,
  m: 200,
  l: 300
};

const customRowHeightOptions = {
  s: 50,
  m: 100,
  l: 150
};

storiesOf("Table interactions manager", module)
  .addDecorator(withThemeProvider)
  .addParameters({
    jest: ["cell-dimensions-controller", "column-visibility-controller", "week-scroll-controller", "table-interactions"]
  })
  .add(
    "Cell dimension controller",
    () => (
      <TabeInteractionManager>
        <CellDimensionController
          buttonRenderer={toggleMenu => (
            <IconButton onClick={toggleMenu}>
              <Icon>line_weight</Icon>
            </IconButton>
          )}
        />
      </TabeInteractionManager>
    ),
    {
      info: storyInfoDefault
    }
  )
  .add(
    "Cell dimension controller with default value",
    () => (
      <TabeInteractionManager
        initialConfig={{
          cellWidth: {
            value: ColumnWidth[CellSize.small],
            size: CellSize.small
          }
        }}
      >
        <CellDimensionController
          buttonRenderer={toggleMenu => (
            <IconButton onClick={toggleMenu}>
              <Icon>line_weight</Icon>
            </IconButton>
          )}
        />
      </TabeInteractionManager>
    ),
    {
      info: storyInfoDefault
    }
  )
  .add(
    "Cell visibility controller",
    () => (
      <TabeInteractionManager toggleableColumns={toggleableColumns}>
        <ColumnVisibilityController
          columns={toggleableColumns}
          buttonRenderer={toggleMenu => (
            <IconButton onClick={toggleMenu}>
              <Icon>view_week</Icon>
            </IconButton>
          )}
        />
      </TabeInteractionManager>
    ),
    {
      info: storyInfoDefault
    }
  )
  .add(
    "Cell visibility controller with default value",
    () => (
      <TabeInteractionManager initialConfig={{ hiddenColumnsIds: ["W01"] }} toggleableColumns={toggleableColumns}>
        <ColumnVisibilityController
          columns={toggleableColumns}
          buttonRenderer={toggleMenu => (
            <IconButton onClick={toggleMenu}>
              <Icon>view_week</Icon>
            </IconButton>
          )}
        />
      </TabeInteractionManager>
    ),
    {
      info: storyInfoDefault
    }
  )
  .add("Column id scroll controller", () => <ColumnIdScrollController {...defaultColumnIdScrollControllerProps} />, {
    info: storyInfoDefault
  })
  .add("Integrated", () => (
    <TabeInteractionManager
      initialConfig={{
        columnsCursor: { id: "03", index: 3 }
      }}
      toggleableColumns={toggleableColumns}
    >
      <TableInteractionsContext.Consumer>
        {({ onHorizontallyScroll, hiddenColumnsIndexes, cellWidth, rowHeight, tableRef, columnsCursor }) => {
          return (
            <>
              <div style={toolBarStyle}>
                <CellDimensionController
                  buttonRenderer={toggleMenu => (
                    <IconButton onClick={toggleMenu}>
                      <Icon>line_weight</Icon>
                    </IconButton>
                  )}
                />
                <ColumnVisibilityController
                  columns={toggleableColumns}
                  buttonRenderer={toggleMenu => (
                    <IconButton onClick={toggleMenu}>
                      <Icon>view_week</Icon>
                    </IconButton>
                  )}
                />
              </div>
              <div
                style={{ height: "calc(100vh - 55px)", width: "100%" }}
                className={cellWidth.size === CellSize.small && "small-table"}
              >
                <Table
                  ref={tableRef}
                  {...defaultProps}
                  columns={{ 0: { style: { justifyContent: "left" }, size: 200 } }}
                  isVirtualized
                  isSelectable={false}
                  virtualizerProps={{
                    hiddenColumns: hiddenColumnsIndexes,
                    minColumnWidth: cellWidth.value,
                    minRowHeight: rowHeight.value,
                    initialScroll: {
                      columnIndex: columnsCursor ? columnsCursor.index : undefined
                    },
                    fixedRows,
                    fixedColumns,
                    onHorizontallyScroll
                  }}
                />
              </div>
            </>
          );
        }}
      </TableInteractionsContext.Consumer>
    </TabeInteractionManager>
  ))
  .add("Integrated with custom cell sizes", () => (
    <TabeInteractionManager
      initialConfig={{
        columnsCursor: { id: "03", index: 3 },
        cellWidth: { size: "m", value: customCellWidthOptions.m },
        rowHeight: { size: "m", value: customRowHeightOptions.m }
      }}
      toggleableColumns={toggleableColumns}
    >
      <TableInteractionsContext.Consumer>
        {({ onHorizontallyScroll, hiddenColumnsIndexes, cellWidth, rowHeight, tableRef, columnsCursor }) => {
          return (
            <>
              <div style={toolBarStyle}>
                <CellDimensionController
                  buttonRenderer={toggleMenu => (
                    <IconButton onClick={toggleMenu}>
                      <Icon>line_weight</Icon>
                    </IconButton>
                  )}
                  cellWidthOptions={customCellWidthOptions}
                  rowHeightOptions={customRowHeightOptions}
                />
                <ColumnVisibilityController
                  columns={toggleableColumns}
                  buttonRenderer={toggleMenu => (
                    <IconButton onClick={toggleMenu}>
                      <Icon>view_week</Icon>
                    </IconButton>
                  )}
                />
              </div>
              <div
                style={{ height: "calc(100vh - 55px)", width: "100%" }}
                className={cellWidth.size === CellSize.small && "small-table"}
              >
                <Table
                  ref={tableRef}
                  {...defaultProps}
                  columns={{ 0: { style: { justifyContent: "left" }, size: 200 } }}
                  isVirtualized
                  isSelectable={false}
                  virtualizerProps={{
                    hiddenColumns: hiddenColumnsIndexes,
                    minColumnWidth: cellWidth.value,
                    minRowHeight: rowHeight.value,
                    initialScroll: {
                      columnIndex: columnsCursor ? columnsCursor.index : undefined
                    },
                    fixedRows,
                    fixedColumns,
                    onHorizontallyScroll
                  }}
                />
              </div>
            </>
          );
        }}
      </TableInteractionsContext.Consumer>
    </TabeInteractionManager>
  ))
  .add(
    "With rows control",
    () => (
      <TabeInteractionManager>
        <TableInteractionsContext.Consumer>
          {({ onTableUpdate, tableRef, openTrees, closeTrees }) => {
            return (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: 10,
                    width: "100%"
                  }}
                >
                  <Button color="primary" variant="contained" onClick={() => openTrees(trees)}>
                    Open the row
                  </Button>
                  <Button color="primary" variant="contained" onClick={() => closeTrees(trees)}>
                    Close the row
                  </Button>
                </div>
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
    ),
    {
      info: {
        inline: true,
        propTables: [TabeInteractionManager]
      }
    }
  )
  .add("With pinned control", () => (
    <TabeInteractionManager>
      <TableInteractionsContext.Consumer>
        {({ onHorizontallyScroll, fixedColumnsIndexes, cellWidth, rowHeight, tableRef, columnsCursor }) => {
          return (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-evenly",
                  marginBottom: 10,
                  width: "100%"
                }}
              >
                <FixedColumnController columnId="12">
                  {({ toggleFixedColumnId, isFixed }) => (
                    <Button color="primary" variant="contained" onClick={toggleFixedColumnId}>
                      {isFixed ? "Unpin" : "Pin"} w12
                    </Button>
                  )}
                </FixedColumnController>
                <FixedColumnController columnId="30">
                  {({ toggleFixedColumnId, isFixed }) => (
                    <Button color="primary" variant="contained" onClick={toggleFixedColumnId}>
                      {isFixed ? "Unpin" : "Pin"} w30
                    </Button>
                  )}
                </FixedColumnController>
              </div>
              <div
                style={{ height: "calc(100vh - 55px)", width: "100%" }}
                className={cellWidth.size === CellSize.small && "small-table"}
              >
                <Table
                  ref={tableRef}
                  {...defaultProps}
                  columns={{ 0: { style: { justifyContent: "left" }, size: 200 } }}
                  isVirtualized
                  isSelectable={false}
                  virtualizerProps={{
                    minColumnWidth: cellWidth.value,
                    minRowHeight: rowHeight.value,
                    initialScroll: {
                      columnIndex: columnsCursor ? columnsCursor.index : undefined
                    },
                    fixedRows,
                    fixedColumns: [...fixedColumns, ...fixedColumnsIndexes],
                    onHorizontallyScroll
                  }}
                />
              </div>
            </>
          );
        }}
      </TableInteractionsContext.Consumer>
    </TabeInteractionManager>
  ));
