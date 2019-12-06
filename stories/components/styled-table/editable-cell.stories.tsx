/* eslint-disable  import/no-extraneous-dependencies */
import * as React from "react";
import { storiesOf } from "@storybook/react";
import { number, object } from "@storybook/addon-knobs";
import { action } from "@storybook/addon-actions";

import { withThemeProvider } from "../../utils/decorators";
import EditableCell, { IMask } from "../../../src/components/styled-table/editable-cell";
import Table from "../../../src/components/table/table";
import { IContentCellProps } from "../../../src/components/table/cell";
import { getTable } from "./tables";

interface IProps extends IContentCellProps {
  defaultValue: number;
  alreadyEdited?: boolean;
  maxValue?: number;
}

const mask: IMask = {
  is_percentage: false,
  is_negative: false,
  decimals: 2
};

const formatValue = (value: number, mask) =>
  value === null
    ? "-"
    : new Intl.NumberFormat("fr-FR", {
        style: mask.is_percentage ? "percent" : undefined,
        maximumFractionDigits: mask.decimals,
        minimumFractionDigits: mask.decimals
      }).format(value);

const EditableCellParent = (props: IProps) => {
  const { defaultValue, alreadyEdited, maxValue } = props;

  const [isEdited, setIsEdited] = React.useState(alreadyEdited);
  const [value, setValue] = React.useState(defaultValue);

  const handleOnConfirmValue = value => {
    action("onConfirmValue")(value);
    setValue(value);
    setIsEdited(defaultValue !== value);
  };

  return (
    <EditableCell
      isEdited={isEdited}
      initial_value={defaultValue}
      value={value}
      mask={mask}
      formatValue={formatValue}
      validateValue={maxValue ? value => value <= maxValue : null}
      onConfirmValue={handleOnConfirmValue}
    />
  );
};

const defaultProps = getTable({
  1: {
    1: {
      cellContent: EditableCellParent,
      cellContentProps: {
        defaultValue: null,
        maxValue: 1000
      }
    }
  }
});

storiesOf("Styled Table/editable cell", module)
  .addDecorator(withThemeProvider)
  .add(
    "Default",
    () => (
      <div style={{ padding: 10 }}>
        <EditableCellParent defaultValue={0} />
      </div>
    ),
    {
      info: { inline: true }
    }
  )
  .add(
    "Edited",
    () => (
      <div style={{ padding: 10 }}>
        <EditableCellParent defaultValue={123.45} alreadyEdited />
      </div>
    ),
    {
      info: { inline: true }
    }
  )
  .add(
    "Error with invalid value",
    () => (
      <div style={{ padding: 10 }}>
        <EditableCellParent defaultValue={10} maxValue={10} />
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
        isSelectable={false}
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
