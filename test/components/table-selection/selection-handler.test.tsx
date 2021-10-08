/// <reference path="../../typings/tests-entry.d.ts" />
import { createRenderer } from "react-test-renderer/shallow";
import { mount } from "enzyme";

import SelectionHandler from "../../../src/components/table-selection/selection-handler";
import { MouseClickButtons } from "../../../src/components/constants";

describe("SelectionHandler component", () => {
  test("should render children", () => {
    const children = () => <div>Foo</div>;
    const props = {
      children,
    };
    const shallowRenderer = createRenderer();
    shallowRenderer.render(<SelectionHandler {...props} />);
    const rendered = shallowRenderer.getRenderOutput();
    expect(rendered).toMatchSnapshot();
  });

  test("should select cells", () => {
    const source = { rowIndex: 1, cellIndex: 1 };
    const target = { rowIndex: 2, cellIndex: 2 };
    const props = {
      children: jest.fn(),
    };
    const wrapper = mount(<SelectionHandler {...props} />);
    const instance: SelectionHandler = wrapper.instance() as SelectionHandler;
    // @ts-ignore private functions
    instance.onCellMouseDown(source, MouseClickButtons.right);
    expect(instance.state.selectedCells).toEqual({ 1: [1] });
    // @ts-ignore private prop
    expect(instance.startingCell).toEqual(source);
    // @ts-ignore private functions
    instance.onCellMouseEnter(target);
    expect(instance.state.selectedCells).toEqual({ 1: [1, 2], 2: [1, 2] });
  });

  test("should select cells (isDisabledVerticalSelection)", () => {
    const source = { rowIndex: 1, cellIndex: 1 };
    const target = { rowIndex: 2, cellIndex: 2 };
    const props = {
      children: jest.fn(),
      isDisabledVerticalSelection: true,
    };
    const wrapper = mount(<SelectionHandler {...props} />);
    const instance: SelectionHandler = wrapper.instance() as SelectionHandler;
    // @ts-ignore private functions
    instance.onCellMouseDown(source, MouseClickButtons.right);
    expect(instance.state.selectedCells).toEqual({ 1: [1] });
    // @ts-ignore private functions
    instance.onCellMouseEnter(target);
    expect(instance.state.selectedCells).toEqual({ 1: [1, 2] });
  });

  test("should select cells (isDisabledHorizontalSelection)", () => {
    const source = { rowIndex: 1, cellIndex: 1 };
    const target = { rowIndex: 2, cellIndex: 2 };
    const props = {
      children: jest.fn(),
      isDisabledHorizontalSelection: true,
    };
    const wrapper = mount(<SelectionHandler {...props} />);
    const instance: SelectionHandler = wrapper.instance() as SelectionHandler;
    // @ts-ignore private functions
    instance.onCellMouseDown(source, MouseClickButtons.right);
    expect(instance.state.selectedCells).toEqual({ 1: [1] });
    // @ts-ignore private functions
    instance.onCellMouseEnter(target);
    expect(instance.state.selectedCells).toEqual({ 1: [1], 2: [1] });
  });

  test("on cell mouse up", () => {
    const source = { rowIndex: 1, cellIndex: 1 };
    const target = { rowIndex: 2, cellIndex: 2 };
    const props = {
      children: jest.fn(),
      onContextMenu: jest.fn(),
    };
    const wrapper = mount(<SelectionHandler {...props} />);
    const instance: SelectionHandler = wrapper.instance() as SelectionHandler;
    // @ts-ignore private functions
    instance.onCellMouseDown(source, MouseClickButtons.right);
    // @ts-ignore private functions
    instance.onCellMouseEnter(target);
    // @ts-ignore mocked event
    instance.onCellMouseUp();
    // @ts-ignore private prop
    expect(instance.startingCell).toEqual(null);
  });
});
