/// <reference path="../../typings/tests-entry.d.ts" />

import * as React from "react";
import { createRenderer } from "react-test-renderer/shallow";
import { mount } from "enzyme";

import EdiTableCell, { KEYCODE_ENTER, IEdiTableCellProps } from "../../../src/components/styled-table/editable-cell";
import { withThemeProvider } from "../../../stories/utils/decorators";
import { formatValue } from "../../../stories/components/styled-table/editable-cell.stories";

describe("EdiTableCell component", () => {
  const mask = {
    style: "currency",
    currency: "EUR",
    decimals: 2,
    is_percentage: false,
    is_negative: false
  };

  test("should render the default editable cell", () => {
    const props: IEdiTableCellProps = {
      isEdited: false,
      value: 0,
      initial_value: 0,
      onConfirmValue: jest.fn(),
      mask,
      formatValue
    };
    const shallowRenderer = createRenderer();
    shallowRenderer.render(<EdiTableCell {...props} />);
    const rendered = shallowRenderer.getRenderOutput();
    expect(rendered).toMatchSnapshot();
  });

  test("should render editable cell with null value : '-'", () => {
    const props: IEdiTableCellProps = {
      isEdited: false,
      value: null,
      initial_value: null,
      onConfirmValue: jest.fn(),
      mask,
      formatValue
    };
    const shallowRenderer = createRenderer();
    shallowRenderer.render(<EdiTableCell {...props} />);
    const rendered = shallowRenderer.getRenderOutput();
    expect(rendered).toMatchSnapshot();
  });

  test("should render editable cell with percentage value : '100.00 %'", () => {
    const props: IEdiTableCellProps = {
      isEdited: false,
      value: 1,
      initial_value: 1,
      onConfirmValue: jest.fn(),
      mask: { ...mask, is_percentage: true },
      formatValue
    };
    const shallowRenderer = createRenderer();
    shallowRenderer.render(<EdiTableCell {...props} />);
    const rendered = shallowRenderer.getRenderOutput();
    expect(rendered).toMatchSnapshot();
  });

  test("should render edited cell", () => {
    const props: IEdiTableCellProps = {
      isEdited: true,
      value: 50,
      initial_value: null,
      onConfirmValue: jest.fn(),
      mask,
      formatValue
    };
    const shallowRenderer = createRenderer();
    shallowRenderer.render(<EdiTableCell {...props} />);
    const rendered = shallowRenderer.getRenderOutput();
    expect(rendered).toMatchSnapshot();
  });

  test("should set the focus on cell click", () => {
    const props: IEdiTableCellProps = {
      isEdited: true,
      value: 0,
      initial_value: 0,
      onConfirmValue: jest.fn(),
      mask,
      formatValue
    };
    const wrapper = mount(withThemeProvider(() => <EdiTableCell {...props} />));
    const editableCellInstance: EdiTableCell = wrapper.find(EdiTableCell).instance() as EdiTableCell;
    // onClick
    wrapper.find("[data-testid='editable-cell']").simulate("click");
    expect(editableCellInstance.state.isFocused).toBeTruthy();
  });

  test("should call onConfirmValue on blur with simple value", () => {
    const props: IEdiTableCellProps = {
      isEdited: false,
      value: 0,
      initial_value: 0,
      onConfirmValue: jest.fn(),
      mask,
      formatValue
    };
    const wrapper = mount(withThemeProvider(() => <EdiTableCell {...props} />));
    const editableCellInstance: EdiTableCell = wrapper.find(EdiTableCell).instance() as EdiTableCell;
    // @ts-ignore onValueChangeHandle is a private method
    editableCellInstance.onValueChangeHandle({ value: "22" });
    expect(editableCellInstance.state.inputValue).toEqual("22");
    // @ts-ignore onKeyPress is a private method and is not assignable to parameter of type 'KeyBoardEvent'
    editableCellInstance.onKeyPress({ keyCode: KEYCODE_ENTER });
    expect(props.onConfirmValue).toHaveBeenCalledTimes(1);
    expect(props.onConfirmValue).toHaveBeenCalledWith(22);
  });

  test("should call onConfirmValue on blur with percentage value", () => {
    const props: IEdiTableCellProps = {
      isEdited: false,
      value: 0,
      initial_value: 0,
      onConfirmValue: jest.fn(),
      mask: { ...mask, is_percentage: true },
      formatValue
    };
    const wrapper = mount(withThemeProvider(() => <EdiTableCell {...props} />));
    const editableCellInstance: EdiTableCell = wrapper.find(EdiTableCell).instance() as EdiTableCell;
    // @ts-ignore onValueChangeHandle is a private method
    editableCellInstance.onValueChangeHandle({ value: "22" });
    expect(editableCellInstance.state.inputValue).toEqual("22");
    // @ts-ignore onKeyPress is a private method and is not assignable to parameter of type 'KeyBoardEvent'
    editableCellInstance.onKeyPress({ keyCode: KEYCODE_ENTER });
    expect(props.onConfirmValue).toHaveBeenCalledTimes(1);
    expect(props.onConfirmValue).toHaveBeenCalledWith(0.22);
  });

  test("should call onConfirmValue on blur with null", () => {
    const props: IEdiTableCellProps = {
      isEdited: false,
      value: 22,
      initial_value: null,
      onConfirmValue: jest.fn(),
      mask,
      formatValue
    };
    const wrapper = mount(withThemeProvider(() => <EdiTableCell {...props} />));
    const editableCellInstance: EdiTableCell = wrapper.find(EdiTableCell).instance() as EdiTableCell;
    // @ts-ignore onValueChangeHandle is a private method
    editableCellInstance.onValueChangeHandle({ value: "" });
    expect(editableCellInstance.state.inputValue).toEqual("");
    // @ts-ignore onKeyPress is a private method and is not assignable to parameter of type 'KeyBoardEvent'
    editableCellInstance.onKeyPress({ keyCode: KEYCODE_ENTER });
    expect(props.onConfirmValue).toHaveBeenCalledTimes(1);
    expect(props.onConfirmValue).toHaveBeenCalledWith(null);
  });

  test("should call onConfirmValue on blur with 0", () => {
    const props: IEdiTableCellProps = {
      isEdited: false,
      value: 22,
      initial_value: 22,
      onConfirmValue: jest.fn(),
      mask,
      formatValue
    };
    const wrapper = mount(withThemeProvider(() => <EdiTableCell {...props} />));
    const editableCellInstance: EdiTableCell = wrapper.find(EdiTableCell).instance() as EdiTableCell;
    // @ts-ignore onValueChangeHandle is a private method
    editableCellInstance.onValueChangeHandle({ value: "" });
    expect(editableCellInstance.state.inputValue).toEqual("");
    // @ts-ignore onKeyPress is a private method and is not assignable to parameter of type 'KeyBoardEvent'
    editableCellInstance.onKeyPress({ keyCode: KEYCODE_ENTER });
    expect(props.onConfirmValue).toHaveBeenCalledTimes(1);
    expect(props.onConfirmValue).toHaveBeenCalledWith(0);
  });

  test("shouldn't call onConfirmValue on blur when input value has not changed", () => {
    const props: IEdiTableCellProps = {
      isEdited: true,
      value: 22,
      initial_value: 30,
      onConfirmValue: jest.fn(),
      mask,
      formatValue
    };
    const wrapper = mount(withThemeProvider(() => <EdiTableCell {...props} />));
    const editableCellInstance: EdiTableCell = wrapper.find(EdiTableCell).instance() as EdiTableCell;
    // @ts-ignore onValueChangeHandle is a private method
    editableCellInstance.onValueChangeHandle({ value: "22" });
    expect(editableCellInstance.state.inputValue).toEqual("22");
    // @ts-ignore onKeyPress is a private method and is not assignable to parameter of type 'KeyBoardEvent'
    editableCellInstance.onKeyPress({ keyCode: KEYCODE_ENTER });
    expect(props.onConfirmValue).toHaveBeenCalledTimes(0);
  });

  test("shouldn't call onConfirmValue with wrong keyPress", () => {
    const props: IEdiTableCellProps = {
      isEdited: true,
      value: 0,
      initial_value: 0,
      onConfirmValue: jest.fn(),
      mask,
      formatValue
    };
    const wrapper = mount(withThemeProvider(() => <EdiTableCell {...props} />));
    const editableCellInstance: EdiTableCell = wrapper.find(EdiTableCell).instance() as EdiTableCell;
    // @ts-ignore onValueChangeHandle is a private method
    editableCellInstance.onValueChangeHandle({ value: "22" });
    // @ts-ignore onKeyPress is a private method and is not assignable to parameter of type 'KeyBoardEvent'
    editableCellInstance.onKeyPress({ keyCode: 14 });
    expect(props.onConfirmValue).toBeCalledTimes(0);
  });
});
