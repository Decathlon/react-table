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
import { Nullable } from "../../../src/components/typing";
import { SelectionMenu } from "../../stories-components/selection-menu";

interface IProps extends IContentCellProps {
  defaultValue: number;
  alreadyEdited?: boolean;
  maxValue?: number;
  isDisabled?: boolean;
}

const mask: IMask = {
  is_percentage: false,
  is_negative: false,
  decimals: 2
};

export const formatValue = (value: Nullable<number>, mask?: IMask) =>
  mask && value === null
    ? "-"
    : new Intl.NumberFormat("fr-FR", {
        //@ts-ignore mask is defined
        style: mask.is_percentage ? "percent" : undefined,
        //@ts-ignore mask is defined
        maximumFractionDigits: mask.decimals,
        //@ts-ignore mask is defined
        minimumFractionDigits: mask.decimals
        //@ts-ignore value is defined
      }).format(value);

const EditableCellParent = (props: IProps) => {
  const { defaultValue, alreadyEdited, maxValue, isDisabled } = props;

  const [isEdited, setIsEdited] = React.useState(alreadyEdited || false);
  const [value, setValue] = React.useState<Nullable<number>>(defaultValue);

  const handleOnConfirmValue = (value: Nullable<number>) => {
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
      validateValue={maxValue ? (value: Nullable<number>) => (value ? value <= maxValue : false) : undefined}
      onConfirmValue={handleOnConfirmValue}
      isDisabled={isDisabled}
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
    "Disabled",
    () => (
      <div style={{ padding: 10 }}>
        <EditableCellParent defaultValue={123.45} alreadyEdited isDisabled />
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
        isSelectable
        selectionProps={{
          menuComponent: SelectionMenu
        }}
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
