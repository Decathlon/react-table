/// <reference path="../../typings/tests-entry.d.ts" />
import { createRenderer } from "react-test-renderer/shallow";
import { mount } from "enzyme";

import Cell from "../../../src/components/table/cell";
import { subRows } from "../../../stories/utils/tables";
import { withThemeProvider } from "../../../stories/utils/decorators";
import { MouseClickButtons } from "../../../src/components/constants";

const rows = subRows({});

describe("Cell component", () => {
  test("should render the default cell", () => {
    const props = { id: "foo", rowIndex: 0, relativeRowIndex: 0, value: "bar", subItems: [] };
    const shallowRenderer = createRenderer();
    shallowRenderer.render(<Cell {...props} />);
    const rendered = shallowRenderer.getRenderOutput();
    expect(rendered).toMatchSnapshot();
  });

  test("should render the loading cell", () => {
    const props = { id: "foo", loading: true, rowIndex: 0, relativeRowIndex: 0, subItems: [] };
    const shallowRenderer = createRenderer();
    shallowRenderer.render(<Cell {...props} />);
    const rendered = shallowRenderer.getRenderOutput();
    expect(rendered).toMatchSnapshot();
  });

  test("should render the cell with a custom class Name", () => {
    const props = {
      id: "foo",
      loading: true,
      rowIndex: 0,
      relativeRowIndex: 0,
      subItems: [],
      getClassName: () => "custom-className",
    };
    const shallowRenderer = createRenderer();
    shallowRenderer.render(<Cell {...props} />);
    const rendered = shallowRenderer.getRenderOutput();
    expect(rendered).toMatchSnapshot();
  });

  test("should render a cell with custom style", () => {
    const props = {
      id: "foo",
      rowIndex: 0,
      relativeRowIndex: 0,
      value: "bar",
      subItems: [],
      style: {
        width: "50px",
        height: "25px",
      },
    };
    const shallowRenderer = createRenderer();
    shallowRenderer.render(<Cell {...props} />);
    const rendered = shallowRenderer.getRenderOutput();
    expect(rendered).toMatchSnapshot();
  });

  test("should render a cell with custom style with colspan", () => {
    const props = {
      id: "foo",
      rowIndex: 0,
      relativeRowIndex: 0,
      value: "bar",
      subItems: [],
      colspan: 2,
      style: {
        width: 50,
        height: "25px",
      },
    };
    const shallowRenderer = createRenderer();
    shallowRenderer.render(<Cell {...props} />);
    const rendered = shallowRenderer.getRenderOutput();
    expect(rendered).toMatchSnapshot();
  });

  test("should render a header cell", () => {
    const props = {
      id: "foo",
      rowIndex: 0,
      relativeRowIndex: 0,
      value: "bar",
      subItems: [],
    };
    const shallowRenderer = createRenderer();
    shallowRenderer.render(<Cell {...props} component="th" />);
    const rendered = shallowRenderer.getRenderOutput();
    expect(rendered).toMatchSnapshot();
  });

  test("should render a cell with closed subItems", () => {
    const props = {
      id: "foo",
      rowIndex: 0,
      relativeRowIndex: 0,
      value: "bar",
      subItems: rows,
    };
    const shallowRenderer = createRenderer();
    shallowRenderer.render(<Cell {...props} component="th" />);
    const rendered = shallowRenderer.getRenderOutput();
    expect(rendered).toMatchSnapshot();
  });

  test("should render a cell with subItems (hideSubItemsOpener)", () => {
    const props = {
      id: "foo",
      rowIndex: 0,
      relativeRowIndex: 0,
      value: "bar",
      subItems: rows,
      hideSubItemsOpener: true,
    };
    const shallowRenderer = createRenderer();
    shallowRenderer.render(<Cell {...props} />);
    const rendered = shallowRenderer.getRenderOutput();
    expect(rendered).toMatchSnapshot();
  });

  test("should render a cell with opened subItems", () => {
    const props = {
      id: "foo",
      rowIndex: 0,
      relativeRowIndex: 0,
      value: "bar",
      subItems: rows,
      opened: true,
    };
    const shallowRenderer = createRenderer();
    shallowRenderer.render(<Cell {...props} />);
    const rendered = shallowRenderer.getRenderOutput();
    expect(rendered).toMatchSnapshot();
  });

  test("should render a selected cell", () => {
    const props = {
      id: "foo",
      rowIndex: 0,
      relativeRowIndex: 0,
      value: "bar",
      isSelected: true,
    };
    const shallowRenderer = createRenderer();
    shallowRenderer.render(<Cell {...props} />);
    const rendered = shallowRenderer.getRenderOutput();
    expect(rendered).toMatchSnapshot();
  });

  test("should render a cell with custom cell content", () => {
    const props = {
      id: "foo",
      rowIndex: 0,
      relativeRowIndex: 0,
      cellContent: ({ name }: { name: string }) => <div>{name}</div>,
      cellContentProps: { name: "Foo" },
    };
    const shallowRenderer = createRenderer();
    shallowRenderer.render(<Cell {...props} />);
    const rendered = shallowRenderer.getRenderOutput();
    expect(rendered).toMatchSnapshot();
  });

  test("should call mouse event callback", () => {
    const props = {
      id: "foo",
      index: 2,
      rowIndex: 0,
      relativeRowIndex: 0,
      value: "bar",
      subItems: rows,
      onMouseEnter: jest.fn(),
      onMouseDown: jest.fn(),
      onMouseUp: jest.fn(),
      onContextMenu: jest.fn(),
    };
    const wrapper = mount(withThemeProvider(() => <Cell {...props} />));
    // onMouseEnter
    wrapper.find("td").last().simulate("mouseenter");
    expect(props.onMouseEnter).toBeCalledWith({ rowIndex: 0, cellIndex: 2 });
    // onMouseDown
    wrapper
      .find("td")
      .last()
      .simulate("mousedown", { nativeEvent: { button: 0 } });
    expect(props.onMouseDown).toBeCalledWith({ rowIndex: 0, cellIndex: 2 }, MouseClickButtons.left);
    // onMouseUp
    wrapper.find("td").last().simulate("mouseup");
    expect(props.onMouseUp).toBeCalled();
    // onContextMenu
    const eventTarget = wrapper.find("[data-testid='table-cell-wrapper-foo']").last().getDOMNode();
    wrapper.find("td").last().simulate("contextmenu");
    expect(props.onContextMenu).toBeCalledWith({
      anchorEl: eventTarget,
      contextCell: { rowIndex: 0, cellIndex: 2 },
    });
  });

  test("should call onCallOpen callback", () => {
    const props = {
      id: "foo",
      index: 2,
      rowIndex: 0,
      relativeRowIndex: 0,
      value: "bar",
      subItems: rows,
      onCallOpen: jest.fn(),
    };
    const wrapper = mount(withThemeProvider(() => <Cell {...props} />));
    // onOpen
    wrapper.find("[data-testid='table-cell-sub-item-toggle']").last().simulate("click");
    expect(props.onCallOpen).toBeCalledWith(2);
  });
});
