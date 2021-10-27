/* eslint-disable  import/no-extraneous-dependencies */
/// <reference path="../../typings.d.ts"/>
import { storiesOf } from "@storybook/react";
import { object, number, boolean } from "@storybook/addon-knobs";

import Readme from "./table.md";
import Table from "../../../src/components/table/table";
import Row, { IRow } from "../../../src/components/table/row";
import { withThemeProvider } from "../../utils/decorators";
import { generateTable, generateTableWithCustomColspan, generateRow } from "../../utils/tables";
import { TableColumnsRowsController, TableScrollController } from "../../stories-components/selection-menu";

const storyInfoDefault = {
  inline: true,
  propTables: [Row, Table],
};

storiesOf("Table/Virtualized", module)
  .addDecorator(withThemeProvider)
  .addParameters({
    jest: [
      "row",
      "row-span",
      "row-it",
      "cell",
      "selection-handler",
      "elementary-table",
      "elementary-table-it",
      "selectable-table",
      "virtualized-table",
      "utils",
    ],
  })
  .add(
    "Default",
    () => {
      const table = generateTable(30, 100, {}, true);
      return (
        <Table
          {...table}
          isSelectable={false}
          isVirtualized
          virtualizerProps={{
            fixedRows: object("fixedRows", [0, 1]),
            fixedColumns: object("fixedColumns", [0, 1]),
            height: number("height", 500),
            width: number("width", 1000),
          }}
        />
      );
    },
    {
      notes: { markdown: Readme },
      info: storyInfoDefault,
    }
  )
  .add(
    "Responsive",
    () => {
      const props = generateTable(371, 351, {}, true);
      props.rows[0].size = 30;
      return (
        <div style={{ height: "calc(100vh - 50px)", width: "100%" }}>
          <Table
            {...props}
            columns={{ 0: { style: { justifyContent: "left" } } }}
            isSelectable={false}
            isVirtualized
            isSpan={boolean("isSpan", false)}
            virtualizerProps={{
              // rowsCount: 10,
              // columnsCount: 10,
              fixedRows: object("fixedRows", [0]),
              fixedColumns: object("fixedColumns", [0, 1, 2, 3, 4]),
            }}
          />
        </div>
      );
    },
    { notes: { markdown: Readme } }
  )
  .add(
    "With initial scroll positions",
    () => {
      const table = generateTable(30, 100, {}, true);
      return (
        <Table
          {...table}
          isSelectable={false}
          isVirtualized
          virtualizerProps={{
            fixedRows: object("fixedRows", [0, 1]),
            fixedColumns: object("fixedColumns", [0, 1]),
            height: number("height", 500),
            width: number("width", 1000),
            initialScroll: {
              columnIndex: 13,
              rowIndex: 15,
            },
          }}
        />
      );
    },
    {
      notes: { markdown: Readme },
      info: storyInfoDefault,
    }
  )
  .add(
    "With dense columns",
    () => (
      <div style={{ height: "100vh", width: "100%" }}>
        <Table
          {...generateTable(100, 7, {}, true)}
          globalColumnProps={{ style: { justifyContent: "left" } }}
          isSelectable={false}
          isVirtualized
          isSpan={boolean("isSpan", false)}
          virtualizerProps={{
            rowsCount: 10,
            columnsCount: 10,
            fixedRows: object("fixedRows", [0, 1]),
            fixedColumns: object("fixedColumns", [0, 1]),
          }}
        />
      </div>
    ),
    { notes: { markdown: Readme } }
  )
  .add(
    "With fixed sub rows",
    () => {
      const table = generateTable(100, 100, {}, true);
      const lastRow: IRow = table.rows[99];
      lastRow.fixSubRows = true;
      lastRow.cells[0].subItems = [generateRow(1, 100, false, 2)];
      return (
        <div style={{ height: "100vh", width: "100%" }}>
          <Table
            {...table}
            globalColumnProps={{ style: { justifyContent: "left" } }}
            columns={{ 0: { size: 180 } }}
            isSelectable={false}
            isVirtualized
            isSpan={boolean("isSpan", false)}
            virtualizerProps={{
              rowsCount: 10,
              columnsCount: 10,
              fixedRows: object("fixedRows", [0, 1, 99]),
              fixedColumns: object("fixedColumns", [0, 1, 49, 50]),
            }}
          />
        </div>
      );
    },
    { notes: { markdown: Readme } }
  )
  .add("With custom colspan", () => {
    const table = generateTableWithCustomColspan(100, 100, true);

    return (
      <div style={{ height: "100vh", width: "100%" }}>
        <Table
          {...table}
          globalColumnProps={{ style: { justifyContent: "center" } }}
          isSelectable={false}
          isVirtualized
          isSpan
          virtualizerProps={{
            rowsCount: 10,
            columnsCount: 10,
            fixedRows: [0, 2, 19],
            fixedColumns: [0],
          }}
        />
      </div>
    );
  })
  .add(
    "With custom row height for some fixed rows",
    () => {
      const table = generateTable(30, 20, {}, true);
      table.rows[0].size = 24;
      table.rows[8].size = 150;
      return (
        <Table
          {...table}
          isSelectable={false}
          isVirtualized
          virtualizerProps={{
            fixedRows: object("fixedRows", [0, 8]),
            height: number("height", 500),
            width: number("width", 1000),
          }}
        />
      );
    },
    {
      notes: { markdown: Readme },
      info: storyInfoDefault,
    }
  )
  .add(
    "With custom column width for some fixed columns",
    () => {
      const table = generateTable(10, 30, {}, true);
      return (
        <Table
          {...table}
          isSelectable={false}
          isVirtualized
          columns={object("columns", { 0: { size: 320 }, 4: { size: 300 } })}
          virtualizerProps={{
            fixedColumns: object("fixedColumns", [0, 4]),
            height: number("height", 500),
            width: number("width", 1000),
          }}
        />
      );
    },
    {
      notes: { markdown: Readme },
      info: storyInfoDefault,
    }
  )
  .add(
    "With custom cell size",
    () => {
      const table = generateTable(30, 12, {}, true);
      table.rows[0].size = 24;
      table.rows[8].size = 150;
      return (
        <Table
          {...table}
          isSpan
          isSelectable={false}
          columns={{ 0: { size: 320 }, 4: { size: 300 } }}
          isVirtualized
          virtualizerProps={{
            fixedRows: object("fixedRows", [0, 2, 8]),
            fixedColumns: [0, 4],
            height: number("height", 500),
            width: number("width", 1000),
          }}
        />
      );
    },
    {
      notes: { markdown: Readme },
      info: storyInfoDefault,
    }
  )
  .add(
    "With hidden rows and columns",
    () => {
      const table = generateTable(30, 20, {}, true);
      table.rows[0].size = 24;
      table.rows[8].size = 150;
      return (
        <Table
          {...table}
          isSelectable={false}
          isVirtualized
          virtualizerProps={{
            height: 500,
            width: 1000,
            rowsCount: 7,
            columnsCount: 10,
            fixedRows: [0, 8],
            fixedColumns: [1, 3],
            hiddenColumns: [1, 5],
            hiddenRows: [1, 5, 6],
          }}
        />
      );
    },
    {
      notes: { markdown: Readme },
      info: storyInfoDefault,
    }
  )
  .add(
    "With columns and rows visibility controllers",
    () => {
      return <TableColumnsRowsController />;
    },
    {
      notes: { markdown: Readme },
      info: storyInfoDefault,
    }
  )
  .add(
    "With go to controllers",
    () => {
      return <TableScrollController />;
    },
    {
      notes: { markdown: Readme },
      info: storyInfoDefault,
    }
  )
  .add(
    "With fixed footer rows custom height",
    () => {
      const table = generateTable(30, 10, {}, true);
      table.rows[table.rows.length - 1].size = 105;
      table.rows[table.rows.length - 2].size = 65;
      return (
        <div style={{ height: "100vh", width: "100%" }}>
          <div
            style={{
              height: `calc(50% - 60px)`,
            }}
          >
            <Table
              {...table}
              isSelectable={false}
              isVirtualized
              columns={{ 0: { size: 200 } }}
              virtualizerProps={{
                fixedColumns: [0],
                fixedRows: [0, table.rows.length - 1, table.rows.length - 2],
                rowsCount: 10,
                minColumnWidth: 130,
              }}
            />
          </div>
        </div>
      );
    },
    {
      notes: { markdown: Readme },
      info: storyInfoDefault,
    }
  );
