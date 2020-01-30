import * as React from "react";
import TextField from "@material-ui/core/TextField";
import * as NumberFormat from "react-number-format";
import classnames from "classnames";

import { IContentCellProps } from "../table/cell";
import { Nullable } from "../typing";
import { getStringNumberWithoutTrailingZeros } from "../utils";

// @ts-ignore https://github.com/s-yadav/react-number-format/issues/180
const NumberFormatComponent = NumberFormat.default || NumberFormat;

export const EDITED_CELL_CLASSNAME = "edited-cell";
export const KEYCODE_ENTER = 13;
const minInputWidth = 20; // Equal to the minimum editable cell underline width

export interface IMask {
  decimals: number;
  is_percentage: boolean;
  is_negative: boolean;
}

/**
 * initial_value is required to differentiate
 * the case when input is set to value "0"
 * and the case when input isn't setted yet and the value is "null"
 *
 * If input is cleared, value is set to initial_value
 */
export interface IEdiTableCellProps extends IContentCellProps {
  isEdited: boolean;
  initial_value: Nullable<number>;
  value: Nullable<number>;
  mask: IMask;
  formatValue: (value: Nullable<number>, mask?: IMask) => string;
  onConfirmValue: (value: Nullable<number>) => void;
  validateValue?: (value: Nullable<number>) => boolean;
}

interface IState {
  inputValue: string;
  /** determine if the cell is focused */
  isFocused: boolean;
  /** determine if new input value is valid (check with validateValue method) and can be apply */
  isValidValue: boolean;
}

export default class EdiTableCell extends React.PureComponent<IEdiTableCellProps, IState> {
  constructor(props: IEdiTableCellProps) {
    super(props);
    const { value } = this.props;
    const newInputValue = this.getInputValue();
    this.state = {
      inputValue: newInputValue,
      isFocused: false,
      isValidValue: this.isValidValue(value)
    };
  }

  public componentWillUnmount() {
    const { isFocused } = this.state;
    if (isFocused) {
      const { onConfirmValue } = this.props;
      const [hasChanged, newValue] = this.getNewValue();
      if (hasChanged) {
        onConfirmValue(newValue);
      }
    }
  }

  private getNewValue = (): [boolean, Nullable<number>] => {
    const { inputValue } = this.state;
    const { initial_value, value, mask } = this.props;
    let newValue: Nullable<number> = parseFloat(inputValue);
    newValue = isNaN(newValue) ? null : newValue;
    /**
     * Change percentage value format because :
     * Edited value has the following format : 100 is equal to 100%
     * Data we worked on has the following format : 1 is equal to 100
     */
    if (mask.is_percentage) {
      newValue = newValue ? newValue / 100 : newValue;
    }
    /** if the edited value is different than the value before edition */
    if (newValue !== value) {
      const isCleared = inputValue === "";
      if (isCleared) {
        newValue = initial_value === null ? null : 0;
      }
      return [true, newValue];
    }
    return [false, newValue];
  };

  private focus = () => {
    const { value } = this.props;
    const newInputValue = this.getInputValue();
    this.setState({
      isFocused: true,
      inputValue: newInputValue,
      isValidValue: this.isValidValue(value)
    });
  };

  private getInputValue = () => {
    const { value, mask } = this.props;
    let newInputValue = value;
    const isNumber = value !== null && !isNaN(value);
    if (isNumber && mask.is_percentage) {
      // @ts-ignore value !== null
      newInputValue = value * 100;
    }
    // @ts-ignore value !== null
    return isNumber ? getStringNumberWithoutTrailingZeros(newInputValue, mask.decimals) : "";
  };

  protected clearFocus = () => {
    this.setState({
      isFocused: false
    });
  };

  private isValidValue = (value: Nullable<number>) => {
    const { validateValue } = this.props;
    const isNumber = value !== null && !isNaN(value);
    return validateValue && isNumber ? validateValue(value) : true;
  };

  private isAllowed = (values: NumberFormat.NumberFormatValues) => {
    const { isValidValue: currentIsValidValue } = this.state;
    const isValidValue = this.isValidValue(values.floatValue);

    if (currentIsValidValue !== isValidValue) {
      this.setState({
        isValidValue
      });
    }
    return isValidValue;
  };

  private onValueChangeHandle = (values: NumberFormat.NumberFormatValues) => {
    this.setState({
      inputValue: values.value
    });
  };

  private onKeyPress = (event: React.KeyboardEvent): void => {
    if (event.which === KEYCODE_ENTER || event.keyCode === KEYCODE_ENTER) {
      this.onBlur();
    }
  };

  private onBlur = (): void => {
    const { onConfirmValue } = this.props;
    const [hasChanged, newValue] = this.getNewValue();
    if (hasChanged) {
      this.setState({ inputValue: "" }, () => {
        onConfirmValue(newValue);
      });
    }
    this.clearFocus();
  };

  public render() {
    const { inputValue, isFocused, isValidValue } = this.state;
    const { isEdited, value, mask, formatValue } = this.props;
    let inputValueWidth = inputValue !== "" ? inputValue.trim().length * 10 : minInputWidth;
    inputValueWidth = inputValueWidth < minInputWidth ? minInputWidth : inputValueWidth;
    return (
      <div
        className={classnames("editable-cell", {
          empty: !isFocused && value === null,
          error: !isValidValue
        })}
        data-testid="editable-cell"
        onClick={!isFocused ? this.focus : undefined}
      >
        {isFocused ? (
          // @ts-ignore https://github.com/s-yadav/react-number-format/issues/180
          <NumberFormatComponent
            autoFocus
            data-testid="editable-cell-text-field"
            customInput={TextField}
            defaultValue={inputValue}
            onValueChange={this.onValueChangeHandle}
            onBlur={this.onBlur}
            onKeyPress={this.onKeyPress}
            thousandSeparator=" "
            decimalSeparator=","
            style={{ width: inputValueWidth }}
            InputProps={{ classes: { underline: "editable-cell__underline" } }}
            isNumericString
            decimalScale={mask.decimals}
            allowNegative={mask.is_negative}
            isAllowed={this.isAllowed}
          />
        ) : (
          <div
            className={classnames("editable-cell__value", {
              [EDITED_CELL_CLASSNAME]: isEdited
            })}
          >
            <span className="text">{formatValue(value, mask)}</span>
          </div>
        )}
      </div>
    );
  }
}
