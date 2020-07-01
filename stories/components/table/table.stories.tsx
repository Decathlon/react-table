/* eslint-disable  import/no-extraneous-dependencies */
/// <reference path="../../typings.d.ts"/>
import * as React from "react";
import { storiesOf } from "@storybook/react";
import { object } from "@storybook/addon-knobs";

import Readme from "./table.md";
import Table from "../../../src/components/table/table";
import Row from "../../../src/components/table/row";
import { withThemeProvider } from "../../utils/decorators";
import { simpleTable, tableWithSubItems, subRows, subMiam, tableWithDifferentRowSizes } from "../../utils/tables";
import { CustomCellContent } from "../../stories-components/selection-menu";

const defaultProps = {
  id: "table-foo",
  rows: simpleTable({})
};

const table2Levels = tableWithSubItems({ firstSubRows: subRows({}) });

export const table3Levels = tableWithSubItems({
  firstSubRows: subRows({ subsubRows: subMiam })
});

const storyInfoDefault = {
  inline: true,
  propTables: [Row, Table]
};

storiesOf("Table/Default", module)
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
      "utils"
    ]
  })
  .add("Default", () => <Table {...defaultProps} />, {
    notes: { markdown: Readme },
    info: storyInfoDefault
  })
  .add(
    "With cell custom content",
    () => (
      <Table
        id="custom-cell"
        isSelectable={false}
        rows={simpleTable({
          customCell: CustomCellContent,
          customCellProps: { defaultValue: "Click to edit!" }
        })}
      />
    ),
    {
      info: storyInfoDefault
    }
  )
  .add(
    "With custom row heights",
    () => (
      <Table
        {...defaultProps}
        isSelectable={false}
        globalRowProps={object("globalRowProps", { size: 50 })}
        rows={object("rows", tableWithDifferentRowSizes)}
      />
    ),
    {
      info: storyInfoDefault
    }
  )
  .add(
    "With columns props",
    () => (
      <Table
        {...defaultProps}
        isSelectable={false}
        rows={table2Levels}
        columns={object("columns", {
          0: { style: { justifyContent: "left" }, size: 150 },
          2: { size: 400 }
        })}
      />
    ),
    {
      info: storyInfoDefault
    }
  )
  .add(
    "With sub-row",
    () => (
      <Table
        {...defaultProps}
        isSelectable={false}
        rows={object("rows", table2Levels)}
        columns={{ 0: { disableLevelPadding: true } }}
      />
    ),
    {
      info: storyInfoDefault
    }
  )
  .add("With imbricated sub-rows", () => <Table {...defaultProps} isSelectable={false} rows={object("rows", table3Levels)} />, {
    info: storyInfoDefault
  })

  .add(
    "With span",
    () => {
      const rows = tableWithSubItems({
        firstSubRows: subRows({}),
        secondSubRows: subRows({})
      });
      rows[1].rowSpanProps = { title: "foo", color: "#0082c3" };
      rows[2].rowSpanProps = { title: "bar", color: "#e86430" };
      return <Table {...defaultProps} isSelectable={false} isSpan rows={rows} />;
    },
    {
      info: storyInfoDefault
    }
  )
  .add(
    "With opened sub-rows",
    () => (
      <Table
        {...defaultProps}
        isSelectable={false}
        isSpan
        rows={object("rows", table3Levels)}
        initialOpenedTrees={object("openedTrees", {
          1: {
            rowIndex: 1,
            columnIndex: 0,
            subTrees: { 0: { rowIndex: 0, columnIndex: 2 } }
          }
        })}
      />
    ),
    {
      info: storyInfoDefault
    }
  )
  .add(
    "With visibleRows and visibleColumns",
    () => (
      <Table
        {...defaultProps}
        isSelectable={false}
        visibleColumnIndexes={object("visibleColumnIndexes", [0, 1])}
        visibleRowIndexes={object("visibleRowsIndexes", [0, 1])}
      />
    ),
    {
      notes: { markdown: Readme },
      info: storyInfoDefault
    }
  );
