/* eslint-disable  import/no-extraneous-dependencies */
import * as React from "react";
import { storiesOf } from "@storybook/react";
import { object, number, text, boolean } from "@storybook/addon-knobs";

import Table from "../../../src/components/table/table";
import { withThemeProvider } from "../../utils/decorators";
import HeaderCell from "../../../src/components/styled-table/header-cell";
import { getTable } from "./tables";

const defaultProps = getTable();

storiesOf("Styled Table/Header cell", module)
  .addDecorator(withThemeProvider)
  .addParameters({ jest: ["header-cell", "bubble"] })
  .add(
    "Default",
    () => (
      <div style={{ width: 200, height: 200, position: "relative" }}>
        <HeaderCell title="Foo" value="Bar" badge="28" isCurrent />
      </div>
    ),
    {
      info: { inline: true }
    }
  )
  .add(
    "Not current (playground)",
    () => (
      <div style={{ width: 200, height: 200 }}>
        <HeaderCell
          title={text("title", "Foo")}
          value={text("value", "Bar")}
          badge={text("badge", "28")}
          isCurrent={boolean("isCurrent", false)}
          className={text("className", "custom")}
        />
      </div>
    ),
    {
      info: { inline: true }
    }
  )
  .add(
    "Integrated",
    () => (
      <Table
        {...defaultProps}
        columns={{ 0: { style: { justifyContent: "left" } } }}
        isVirtualized
        virtualizerProps={{
          fixedRows: object("fixedRows", [0]),
          fixedColumns: object("fixedColumns", [0]),
          height: number("height", 500),
          width: number("width", 1000),
          rowsCount: 5,
          columnsCount: 6
        }}
      />
    ),
    {
      info: { inline: true }
    }
  );
