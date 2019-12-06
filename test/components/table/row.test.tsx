/// <reference path="../../typings/tests-entry.d.ts" />
import * as React from "react";
import { createRenderer } from "react-test-renderer/shallow";

import { mount } from "enzyme";
import Row from "../../../src/components/table/row";
import { subRows, subMiam, tableWithDifferentRowSizes } from "../../../stories/utils/tables";
import { withThemeProvider } from "../../../stories/utils/decorators";
import { ITree } from "../../../src/components/table/elementary-table";

describe("Row component", () => {
  test("should render the default table", () => {
    const props = {
      id: "foo",
      cells: []
    };
    const shallowRenderer = createRenderer();
    shallowRenderer.render(<Row {...props} />);
    const rendered = shallowRenderer.getRenderOutput();
    expect(rendered).toMatchSnapshot();
  });

  test("should render a simple row", () => {
    const props = subRows({})[0];
    const shallowRenderer = createRenderer();
    shallowRenderer.render(<Row {...props} />);
    const rendered = shallowRenderer.getRenderOutput();
    expect(rendered).toMatchSnapshot();
  });

  test("should render a Row with nested children", () => {
    const props = subRows({ subsubRows: subMiam })[0];
    const shallowRenderer = createRenderer();
    shallowRenderer.render(<Row {...props} />);
    const rendered = shallowRenderer.getRenderOutput();
    expect(rendered).toMatchSnapshot();
  });

  test("should render a Row with span", () => {
    const props = subRows({ subsubRows: subMiam })[0];
    const shallowRenderer = createRenderer();
    shallowRenderer.render(<Row {...props} isSpan rowSpanProps={{ title: "foo", color: "gray" }} />);
    const rendered = shallowRenderer.getRenderOutput();
    expect(rendered).toMatchSnapshot();
  });

  test("should render a Row with a small size", () => {
    const props = tableWithDifferentRowSizes[2];
    const shallowRenderer = createRenderer();
    shallowRenderer.render(<Row {...props} />);
    const rendered = shallowRenderer.getRenderOutput();
    expect(rendered).toMatchSnapshot();
  });

  test("should toggle the first cell", () => {
    const rows = subRows({ subsubRows: subMiam });
    const props = {
      index: 0,
      absolutIndex: 0,
      onOpen: jest.fn(),
      onClose: jest.fn(),
      ...rows[0]
    };
    const RowComponent = ({ openedTree }: { openedTree?: ITree }) =>
      withThemeProvider(() => <Row {...props} openedTree={openedTree} />);
    const wrapper = mount(<RowComponent />);
    const instance: Row = wrapper.find(Row).instance() as Row;
    // @ts-ignore private method
    instance.toggleFirstCell();
    expect(props.onOpen).toBeCalledWith({ rowIndex: 0, columnIndex: 2 });
    wrapper.setProps({ openedTree: { rowIndex: 0, columnIndex: 2 } });
    // @ts-ignore private method
    instance.toggleFirstCell();
    expect(props.onClose).toBeCalledWith({ rowIndex: 0, columnIndex: 2 });
  });

  test("should toggle a cell", () => {
    const rows = subRows({ subsubRows: subMiam });
    const props = {
      index: 0,
      absolutIndex: 0,
      onOpen: jest.fn(),
      onClose: jest.fn(),
      ...rows[0]
    };
    const RowComponent = ({ openedTree }: { openedTree?: ITree }) =>
      withThemeProvider(() => <Row {...props} openedTree={openedTree} />);
    const wrapper = mount(<RowComponent />);
    const instance: Row = wrapper.find(Row).instance() as Row;
    // @ts-ignore private method
    instance.toggleCell(2);
    expect(props.onOpen).toBeCalledWith({ rowIndex: 0, columnIndex: 2 });
    wrapper.setProps({ openedTree: { rowIndex: 0, columnIndex: 2 } });
    // @ts-ignore private method
    instance.toggleCell(2);
    expect(props.onClose).toBeCalledWith({ rowIndex: 0, columnIndex: 2 });
  });

  test("should open subRow", () => {
    const rows = subRows({ subsubRows: subMiam });
    const row = rows[0];
    // @ts-ignore
    row.cells[2].subItems[0].cells[2].subItems = subMiam;
    const props = {
      index: 0,
      absolutIndex: 0,
      onOpen: jest.fn(),
      onClose: jest.fn(),
      ...row
    };
    const RowComponent = ({ openedTree }: { openedTree?: ITree }) =>
      withThemeProvider(() => <Row {...props} openedTree={openedTree} />);
    const wrapper = mount(<RowComponent />);
    const instance: Row = wrapper.find(Row).instance() as Row;
    wrapper.setProps({ openedTree: { rowIndex: 0, columnIndex: 2 } });
    // @ts-ignore private method
    instance.onSubRowOpen({ rowIndex: 0, columnIndex: 2 });
    expect(props.onOpen).toBeCalledWith({
      rowIndex: 0,
      columnIndex: 2,
      subTrees: { 0: { rowIndex: 0, columnIndex: 2 } }
    });
  });

  test("should close subRow", () => {
    const rows = subRows({ subsubRows: subMiam });
    const row = rows[0];
    // @ts-ignore
    row.cells[2].subItems[0].cells[2].subItems = subMiam;
    const props = {
      index: 0,
      absolutIndex: 0,
      onOpen: jest.fn(),
      onClose: jest.fn(),
      ...row
    };
    const RowComponent = ({ openedTree }: { openedTree?: ITree }) =>
      withThemeProvider(() => <Row {...props} openedTree={openedTree} />);
    const wrapper = mount(<RowComponent />);
    const instance: Row = wrapper.find(Row).instance() as Row;
    wrapper.setProps({
      openedTree: {
        rowIndex: 0,
        columnIndex: 2,
        subTrees: { 0: { rowIndex: 0, columnIndex: 2 } }
      }
    });
    // @ts-ignore private method
    instance.onSubRowClose({ rowIndex: 0, columnIndex: 2 });
    expect(props.onOpen).toBeCalledWith({
      rowIndex: 0,
      columnIndex: 2,
      subTrees: {}
    });
  });
});
