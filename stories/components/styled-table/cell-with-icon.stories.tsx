/* eslint-disable  import/no-extraneous-dependencies */
import { storiesOf } from "@storybook/react";
import { number, object } from "@storybook/addon-knobs";
import { action } from "@storybook/addon-actions";

import { withThemeProvider } from "../../utils/decorators";
import CellWithIcon from "../../../src/components/styled-table/cell-with-icon";
import Table from "../../../src/components/table/table";
import { getTable } from "./tables";

const defaultProps = getTable({
  1: {
    0: {
      value: "CA TTC OMNI",
      cellContent: CellWithIcon,
      cellContentProps: {
        iconName: "edit",
      },
    },
  },
  2: {
    0: {
      value: "PROG CA TTC",
      cellContent: CellWithIcon,
      cellContentProps: {
        iconName: "edit",
      },
    },
  },
});

storiesOf("Styled Table/Cell with icon", module)
  .addDecorator(withThemeProvider)
  .add(
    "Default",
    () => (
      <div style={{ padding: 10, width: 200 }}>
        <CellWithIcon value="CA TTC OMNI" iconName="edit" />
      </div>
    ),
    {
      info: { inline: true },
    }
  )
  .add(
    "With action",
    () => (
      <div style={{ padding: 10, width: 200 }}>
        <CellWithIcon value="CA TTC OMNI" iconName="edit" onClick={() => action("onClick icon")("Click")} />
      </div>
    ),
    {
      info: { inline: true },
    }
  )
  .add(
    "With tooltip",
    () => (
      <div style={{ padding: 10, width: 200 }}>
        <CellWithIcon
          value="CA TTC OMNI"
          iconName="edit"
          onClick={() => action("onClick icon")("Click")}
          tooltipTitle="Hello Foo"
        />
      </div>
    ),
    {
      info: { inline: true },
    }
  )
  .add("Integrated", () => (
    <Table
      {...defaultProps}
      columns={{ 0: { style: { justifyContent: "left" } } }}
      isVirtualized
      isSelectable={false}
      virtualizerProps={{
        fixedRows: object("fixedRows", [0]),
        fixedColumns: object("fixedColumns", [0]),
        height: number("height", 500),
        width: number("width", 1000),
        rowsCount: 5,
        columnsCount: 6,
      }}
    />
  ));
