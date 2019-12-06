/* eslint-disable  import/no-extraneous-dependencies */
import * as React from "react";
import { storiesOf } from "@storybook/react";
import { object } from "@storybook/addon-knobs";

import Table from "../../../src/components/table/table";
import Row from "../../../src/components/table/row";
import { withThemeProvider } from "../../utils/decorators";
import SelectionHandler from "../../../src/components/table-selection/selection-handler";
import { SelectionMenu } from "../../stories-components/selection-menu";
import { getTable } from "../styled-table/tables";

const storyInfoDefault = {
  inline: true,
  propTables: [Row, SelectionHandler, Table]
};

storiesOf("Table/Selection", module)
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
  .add(
    "Default",
    () => (
      <Table
        {...getTable()}
        columns={object("columns", { 1: { isSelectable: false } })}
        isVirtualized
        virtualizerProps={{
          fixedRows: [0],
          fixedColumns: [0],
          height: 500,
          width: 1000,
          rowsCount: 5,
          columnsCount: 6
        }}
      />
    ),
    {
      info: storyInfoDefault
    }
  )
  .add(
    "Horizontal cell selection only",
    () => {
      return (
        <Table
          {...getTable()}
          selectionProps={object("selectionProps", {
            isDisabledVerticalSelection: true,
            isDisabledHorizontalSelection: false
          })}
          isVirtualized
          virtualizerProps={{
            fixedRows: [0],
            fixedColumns: [0],
            height: 500,
            width: 1000,
            rowsCount: 5,
            columnsCount: 6
          }}
        />
      );
    },
    {
      info: storyInfoDefault
    }
  )
  .add(
    "Right click menu",
    () => {
      return (
        <Table
          {...getTable()}
          isSelectable
          selectionProps={{
            menuComponent: SelectionMenu
          }}
          isVirtualized
          virtualizerProps={{
            fixedRows: [0],
            fixedColumns: [0],
            height: 500,
            width: 1000,
            rowsCount: 5,
            columnsCount: 6
          }}
        />
      );
    },
    {
      info: storyInfoDefault
    }
  );
