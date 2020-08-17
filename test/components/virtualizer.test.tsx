/// <reference path="../typings/tests-entry.d.ts" />
import * as React from "react";
import { createRenderer } from "react-test-renderer/shallow";
import { mount } from "enzyme";

import Virtualizer from "../../src/components/virtualizer";
import { DEFAULT_ROW_HEIGHT, MIN_COLUMN_WIDTH } from "../../src/components/constants";
import { SCROLLBAR_SIZE, ScrollDirection, ScrollOrigin } from "../../src/components/scroller";

describe("Virtualizer", () => {
  test("should render children", () => {
    const children = () => <div>Foo</div>;
    const props = {
      width: 100,
      height: 100,
      columnsLength: 50,
      rowsLength: 50,
      children
    };
    const shallowRenderer = createRenderer();
    shallowRenderer.render(<Virtualizer {...props} />);
    const rendered = shallowRenderer.getRenderOutput();
    expect(rendered).toMatchSnapshot();
  });

  test("should call the children function with the virtualizer values", () => {
    const props = {
      width: 400,
      height: 400,
      columnsLength: 50,
      rowsLength: 50,
      children: jest.fn()
    };
    mount(<Virtualizer {...props} />);
    const rowsCount = Math.floor(props.height / DEFAULT_ROW_HEIGHT);
    const columnsCount = Math.floor(props.width / MIN_COLUMN_WIDTH);
    const cellHeight = Math.ceil((props.height - SCROLLBAR_SIZE) / rowsCount);
    const cellWidth = Math.ceil((props.width - SCROLLBAR_SIZE) / columnsCount);

    const values = {
      visibleColumnIndexes: [0, 1, 2, 3],
      visibleRowIndexes: [0, 1, 2, 3, 4, 5, 6],
      elevatedColumnIndexes: {},
      elevatedRowIndexes: {},
      cellHeight,
      cellWidth
    };
    expect(props.children).toBeCalledWith(values);
  });

  test("should call the children function with the virtualizer values (cell dimensions === 0)", () => {
    const props = {
      width: 0,
      height: 0,
      columnsLength: 50,
      rowsLength: 50,
      children: jest.fn()
    };
    mount(<Virtualizer {...props} />);
    const values = {
      visibleColumnIndexes: [],
      visibleRowIndexes: [],
      elevatedColumnIndexes: {},
      elevatedRowIndexes: {},
      cellHeight: 0,
      cellWidth: 0
    };
    expect(props.children).toBeCalledWith(values);
  });

  test("should call the children function with the virtualizer values (fixed columns and fixed rows, at the end)", () => {
    const props = {
      width: 400,
      height: 400,
      columnsLength: 50,
      rowsLength: 50,
      fixedColumns: [30],
      fixedRows: [15],
      children: jest.fn()
    };
    mount(<Virtualizer {...props} />);
    const rowsCount = Math.floor(props.height / DEFAULT_ROW_HEIGHT);
    const columnsCount = Math.floor(props.width / MIN_COLUMN_WIDTH);
    const cellHeight = Math.ceil((props.height - SCROLLBAR_SIZE) / rowsCount);
    const cellWidth = Math.ceil((props.width - SCROLLBAR_SIZE) / columnsCount);

    const values = {
      visibleColumnIndexes: [0, 1, 2, 30],
      visibleRowIndexes: [0, 1, 2, 3, 4, 5, 15],
      // we use the prev visible index please see getElevatedIndexes table utils
      elevatedColumnIndexes: { 2: "end" },
      elevatedRowIndexes: { 15: "end" },
      cellHeight,
      cellWidth
    };
    expect(props.children).toBeCalledWith(values);
  });

  test("should call the children function with the virtualizer values (fixed columns and fixed rows and hidden columns and rows)", () => {
    const props = {
      width: 400,
      height: 400,
      columnsLength: 50,
      rowsLength: 50,
      fixedColumns: [0, 14],
      hiddenColumns: [0, 2],
      fixedRows: [0, 3, 15],
      hiddenRows: [0, 2, 6],
      children: jest.fn()
    };
    mount(<Virtualizer {...props} />);
    const rowsCount = Math.floor(props.height / DEFAULT_ROW_HEIGHT);
    const columnsCount = Math.floor(props.width / MIN_COLUMN_WIDTH);
    const cellHeight = Math.ceil((props.height - SCROLLBAR_SIZE) / rowsCount);
    const cellWidth = Math.ceil((props.width - SCROLLBAR_SIZE) / columnsCount);

    const values = {
      visibleColumnIndexes: [1, 3, 4, 14],
      visibleRowIndexes: [1, 3, 4, 5, 7, 8, 15],
      // we use the prev visible index getElevatedIndexes table utils
      elevatedColumnIndexes: { 4: "end" },
      elevatedRowIndexes: { 15: "end" },
      cellHeight,
      cellWidth
    };
    expect(props.children).toBeCalledWith(values);
  });

  test("should call the children function with the virtualizer values (fixed columns and fixed rows, in the beginning)", () => {
    const props = {
      width: 400,
      height: 400,
      columnsLength: 50,
      rowsLength: 50,
      fixedColumns: [0],
      fixedRows: [0],
      children: jest.fn()
    };
    mount(<Virtualizer {...props} />);
    const rowsCount = Math.floor(props.height / DEFAULT_ROW_HEIGHT);
    const columnsCount = Math.floor(props.width / MIN_COLUMN_WIDTH);
    const cellHeight = Math.ceil((props.height - SCROLLBAR_SIZE) / rowsCount);
    const cellWidth = Math.ceil((props.width - SCROLLBAR_SIZE) / columnsCount);

    const values = {
      visibleColumnIndexes: [0, 1, 2, 3],
      visibleRowIndexes: [0, 1, 2, 3, 4, 5, 6],
      elevatedColumnIndexes: { 0: "start" },
      elevatedRowIndexes: { 0: "start" },
      cellHeight,
      cellWidth
    };
    expect(props.children).toBeCalledWith(values);
  });

  test("should call the children function with the virtualizer values (with cutom ros count and columns count)", () => {
    const props = {
      width: 400,
      height: 400,
      columnsLength: 50,
      rowsLength: 50,
      rowsCount: 3,
      columnsCount: 3,
      children: jest.fn()
    };
    mount(<Virtualizer {...props} />);
    const cellHeight = Math.ceil((props.height - SCROLLBAR_SIZE) / props.rowsCount);
    const cellWidth = Math.ceil((props.width - SCROLLBAR_SIZE) / props.columnsCount);

    const values = {
      visibleColumnIndexes: [0, 1, 2],
      visibleRowIndexes: [0, 1, 2],
      elevatedColumnIndexes: {},
      elevatedRowIndexes: {},
      cellHeight,
      cellWidth
    };
    expect(props.children).toBeCalledWith(values);
  });

  test("should call the children function with the virtualizer values (with cutom minColumnWidth and minRowHeight)", () => {
    const props = {
      width: 400,
      height: 400,
      columnsLength: 50,
      rowsLength: 50,
      minColumnWidth: 100,
      minRowHeight: 100,
      children: jest.fn()
    };
    mount(<Virtualizer {...props} />);
    const rowsCount = Math.floor(props.height / props.minRowHeight);
    const columnsCount = Math.floor(props.width / props.minColumnWidth);
    const cellHeight = Math.ceil((props.height - SCROLLBAR_SIZE) / rowsCount);
    const cellWidth = Math.ceil((props.width - SCROLLBAR_SIZE) / columnsCount);

    const values = {
      visibleColumnIndexes: [0, 1, 2, 3], // 400/100 === 4 columns
      visibleRowIndexes: [0, 1, 2, 3], // 400/100 === 4 rows
      elevatedColumnIndexes: {},
      elevatedRowIndexes: {},
      cellHeight,
      cellWidth
    };
    expect(props.children).toBeCalledWith(values);
  });

  test("should call the children function with the virtualizer values (scroll to top)", () => {
    const props = {
      width: 400,
      height: 400,
      columnsLength: 100,
      rowsLength: 100,
      rowsCount: 4,
      columnsCount: 4,
      children: jest.fn()
    };
    const wrapper = mount(<Virtualizer {...props} />);
    const cellHeight = Math.ceil((props.height - SCROLLBAR_SIZE) / props.rowsCount);
    const cellWidth = Math.ceil((props.width - SCROLLBAR_SIZE) / props.columnsCount);

    const values = {
      visibleColumnIndexes: [0, 1, 2, 3],
      visibleRowIndexes: [0, 1, 2, 3],
      elevatedColumnIndexes: {},
      elevatedRowIndexes: {},
      cellHeight,
      cellWidth
    };
    expect(props.children).toBeCalledWith(values);
    const instance: Virtualizer = wrapper.instance() as Virtualizer;
    // scroll to the first row
    let scroll = {
      scrollTop: 100,
      scrollLeft: 0,
      directions: [ScrollDirection.down],
      scrollOrigin: ScrollOrigin.external,
      maxTopReached: false,
      maxBottomReached: false,
      maxLeftReached: true,
      maxRightReached: false
    };
    // @ts-ignore private fnction
    instance.onScroll(scroll);
    let expectedState = {
      visibleColumnIndexes: [0, 1, 2, 3],
      visibleRowIndexes: [1, 2, 3, 4],
      elevatedColumnIndexes: {},
      elevatedRowIndexes: {}
    };
    expect(instance.state).toEqual(expectedState);
    // scroll to the last row
    scroll = {
      scrollTop: 9350,
      scrollLeft: 0,
      directions: [ScrollDirection.down],
      scrollOrigin: ScrollOrigin.external,
      maxTopReached: false,
      maxBottomReached: true,
      maxLeftReached: true,
      maxRightReached: false
    };
    // @ts-ignore private fnction
    instance.onScroll(scroll);
    expectedState = {
      visibleColumnIndexes: [0, 1, 2, 3],
      visibleRowIndexes: [96, 97, 98, 99],
      elevatedColumnIndexes: {},
      elevatedRowIndexes: {}
    };
    expect(instance.state).toEqual(expectedState);
    // scroll to the second row
    scroll = {
      scrollTop: 200,
      scrollLeft: 0,
      directions: [ScrollDirection.down],
      scrollOrigin: ScrollOrigin.external,
      maxTopReached: false,
      maxBottomReached: false,
      maxLeftReached: true,
      maxRightReached: false
    };
    // @ts-ignore private fnction
    instance.onScroll(scroll);
    expectedState = {
      visibleColumnIndexes: [0, 1, 2, 3],
      visibleRowIndexes: [2, 3, 4, 5],
      elevatedColumnIndexes: {},
      elevatedRowIndexes: {}
    };
    expect(instance.state).toEqual(expectedState);
  });

  test("should call the children function with the virtualizer values (scroll to top)", () => {
    const props = {
      width: 400,
      height: 400,
      columnsLength: 100,
      rowsLength: 100,
      rowsCount: 4,
      columnsCount: 4,
      children: jest.fn()
    };
    const wrapper = mount(<Virtualizer {...props} />);
    const cellHeight = Math.ceil((props.height - SCROLLBAR_SIZE) / props.rowsCount);
    const cellWidth = Math.ceil((props.width - SCROLLBAR_SIZE) / props.columnsCount);

    const values = {
      visibleColumnIndexes: [0, 1, 2, 3],
      visibleRowIndexes: [0, 1, 2, 3],
      elevatedColumnIndexes: {},
      elevatedRowIndexes: {},
      cellHeight,
      cellWidth
    };
    expect(props.children).toBeCalledWith(values);
    const instance: Virtualizer = wrapper.instance() as Virtualizer;

    // scroll to the first column
    let scroll = {
      scrollTop: 0,
      scrollLeft: 100,
      directions: [ScrollDirection.right],
      scrollOrigin: ScrollOrigin.external,
      maxTopReached: true,
      maxBottomReached: false,
      maxLeftReached: false,
      maxRightReached: false
    };
    // @ts-ignore private fnction
    instance.onScroll(scroll);
    let expectedState = {
      visibleColumnIndexes: [1, 2, 3, 4],
      visibleRowIndexes: [0, 1, 2, 3],
      elevatedColumnIndexes: {},
      elevatedRowIndexes: {}
    };
    expect(instance.state).toEqual(expectedState);
    // scroll to the last column

    scroll = {
      scrollTop: 0,
      scrollLeft: cellWidth * 100 - props.width + SCROLLBAR_SIZE,
      directions: [ScrollDirection.right],
      scrollOrigin: ScrollOrigin.external,
      maxTopReached: true,
      maxBottomReached: false,
      maxLeftReached: false,
      maxRightReached: true
    };
    // @ts-ignore private fnction
    instance.onScroll(scroll);
    expectedState = {
      visibleColumnIndexes: [96, 97, 98, 99],
      visibleRowIndexes: [0, 1, 2, 3],
      elevatedColumnIndexes: {},
      elevatedRowIndexes: {}
    };
    expect(instance.state).toEqual(expectedState);
    // scroll to the second column
    scroll = {
      scrollTop: 0,
      scrollLeft: 200,
      directions: [ScrollDirection.right],
      scrollOrigin: ScrollOrigin.external,
      maxTopReached: true,
      maxBottomReached: false,
      maxLeftReached: false,
      maxRightReached: false
    };
    // @ts-ignore private fnction
    instance.onScroll(scroll);
    expectedState = {
      visibleColumnIndexes: [2, 3, 4, 5],
      visibleRowIndexes: [0, 1, 2, 3],
      elevatedColumnIndexes: {},
      elevatedRowIndexes: {}
    };
    expect(instance.state).toEqual(expectedState);
  });

  test("should call the children function with the virtualizer values and new columns and rows state", () => {
    const props = {
      width: 400,
      height: 400,
      columnsLength: 100,
      rowsLength: 100,
      rowsCount: 4,
      columnsCount: 4,
      children: jest.fn(),
      onScroll: jest.fn()
    };
    const wrapper = mount(<Virtualizer {...props} />);
    const instance: Virtualizer = wrapper.instance() as Virtualizer;

    const scroll = {
      scrollOrigin: ScrollOrigin.external,
      maxBottomReached: false,
      maxRightReached: false
    };
    // scroll to the first column
    const leftScroll = {
      scrollTop: 0,
      scrollLeft: 100,
      directions: [ScrollDirection.right],
      maxTopReached: true,
      maxLeftReached: false,
      ...scroll
    };

    // scroll to the first row
    const topScroll = {
      scrollTop: 100,
      scrollLeft: 0,
      directions: [ScrollDirection.down],
      maxTopReached: false,
      maxLeftReached: true,
      ...scroll
    };

    const newColumnsState = {
      visibleColumnIndexes: [1, 2, 3, 4],
      elevatedColumnIndexes: {}
    };
    const newRowsState = {
      visibleRowIndexes: [1, 2, 3, 4],
      elevatedRowIndexes: {}
    };

    // @ts-ignore private function
    instance.onScroll(leftScroll);
    expect(props.onScroll).toHaveBeenCalledWith({
      scrollValues: leftScroll,
      newColumnsState,
      newRowsState: null,
      columnsCursor: 1,
      rowsCursor: 0
    });

    // @ts-ignore private function
    instance.onScroll(topScroll);
    expect(props.onScroll).toHaveBeenCalledWith({
      scrollValues: topScroll,
      newColumnsState: null,
      newRowsState,
      columnsCursor: 1,
      rowsCursor: 1
    });
  });

  test("should call onHorizontallyScroll and onVerticallyScroll", () => {
    const props = {
      width: 400,
      height: 400,
      columnsLength: 100,
      rowsLength: 100,
      rowsCount: 4,
      columnsCount: 4,
      children: jest.fn(),
      onHorizontallyScroll: jest.fn(),
      onVerticallyScroll: jest.fn()
    };
    const wrapper = mount(<Virtualizer {...props} />);
    const instance: Virtualizer = wrapper.instance() as Virtualizer;

    const scroll = {
      scrollOrigin: ScrollOrigin.external,
      maxBottomReached: false,
      maxRightReached: false
    };
    // scroll to the first column
    const leftScroll = {
      scrollTop: 0,
      scrollLeft: 100,
      directions: [ScrollDirection.right],
      maxTopReached: true,
      maxLeftReached: false,
      ...scroll
    };

    // scroll to the first row
    const topScroll = {
      scrollTop: 100,
      scrollLeft: 0,
      directions: [ScrollDirection.down],
      maxTopReached: false,
      maxLeftReached: true,
      ...scroll
    };

    const newColumnsState = {
      visibleColumnIndexes: [1, 2, 3, 4],
      elevatedColumnIndexes: {}
    };
    const newRowsState = {
      visibleRowIndexes: [1, 2, 3, 4],
      elevatedRowIndexes: {}
    };

    // @ts-ignore private function
    instance.onScroll(leftScroll);
    expect(props.onHorizontallyScroll).toHaveBeenCalledWith({
      scrollValues: leftScroll,
      newColumnsState,
      columnsCursor: 1
    });

    // @ts-ignore private function
    instance.onScroll(topScroll);
    expect(props.onVerticallyScroll).toHaveBeenCalledWith({
      scrollValues: topScroll,
      newRowsState,
      rowsCursor: 1
    });
  });

  test("should call the children function with the virtualizer values (some fixed rows have a custom size)", () => {
    const props = {
      width: 400,
      height: 400,
      columnsLength: 50,
      rowsLength: 50,
      fixedRows: [0, 2],
      fixedCellsHeight: {
        sum: 200,
        count: 2
      },
      children: jest.fn()
    };
    mount(<Virtualizer {...props} />);
    const rowsCount = Math.floor((props.height - props.fixedCellsHeight.sum) / DEFAULT_ROW_HEIGHT) + props.fixedCellsHeight.count;
    const columnsCount = Math.floor(props.width / MIN_COLUMN_WIDTH);
    const cellHeight = Math.ceil(
      (props.height - SCROLLBAR_SIZE - props.fixedCellsHeight.sum) / (rowsCount - props.fixedCellsHeight.count)
    );
    const cellWidth = Math.ceil((props.width - SCROLLBAR_SIZE) / columnsCount);

    const values = {
      visibleColumnIndexes: [0, 1, 2, 3],
      visibleRowIndexes: [0, 1, 2, 3, 4],
      elevatedColumnIndexes: {},
      elevatedRowIndexes: { 0: "start" },
      cellHeight,
      cellWidth
    };
    expect(props.children).toBeCalledWith(values);
  });

  test("should call the children function with the virtualizer values (some fixed columns have a custom size)", () => {
    const props = {
      width: 400,
      height: 400,
      columnsLength: 50,
      rowsLength: 50,
      fixedColumns: [0, 2],
      fixedCellsWidth: {
        sum: 200,
        count: 2
      },
      children: jest.fn()
    };
    mount(<Virtualizer {...props} />);
    const rowsCount = Math.floor(props.height / DEFAULT_ROW_HEIGHT);
    const columnsCount = Math.floor((props.width - props.fixedCellsWidth.sum) / MIN_COLUMN_WIDTH) + props.fixedCellsWidth.count;

    const cellHeight = Math.ceil((props.height - SCROLLBAR_SIZE) / rowsCount);
    const cellWidth = Math.ceil(
      (props.width - SCROLLBAR_SIZE - props.fixedCellsWidth.sum) / (columnsCount - props.fixedCellsWidth.count)
    );

    const values = {
      visibleColumnIndexes: [0, 1, 2, 3],
      visibleRowIndexes: [0, 1, 2, 3, 4, 5, 6],
      elevatedColumnIndexes: { 0: "start" },
      elevatedRowIndexes: {},
      cellHeight,
      cellWidth
    };
    expect(props.children).toBeCalledWith(values);
  });

  test("should call the scrollToLeft scroller method (scroll to column index)", () => {
    const props = {
      width: 400,
      height: 400,
      columnsLength: 50,
      rowsLength: 50,
      fixedColumns: [0, 2],
      fixedCellsWidth: {
        sum: 200,
        count: 2
      },
      children: jest.fn()
    };
    const wrapper = mount(<Virtualizer {...props} />);
    const instance: Virtualizer = wrapper.instance() as Virtualizer;
    // @ts-ignore
    instance.scroller.current.scrollToLeft = jest.fn();
    instance.scrollToColumnIndex(25);
    // @ts-ignore
    expect(instance.scroller.current.scrollToLeft).toBeCalledWith(2371.5);
  });

  test("should call the scrollToTop scroller method (scroll to row index)", () => {
    const props = {
      width: 400,
      height: 400,
      columnsLength: 50,
      rowsLength: 50,
      fixedColumns: [0, 2],
      fixedCellsWidth: {
        sum: 200,
        count: 2
      },
      children: jest.fn()
    };
    const wrapper = mount(<Virtualizer {...props} />);
    const instance: Virtualizer = wrapper.instance() as Virtualizer;
    // @ts-ignore
    instance.scroller.current.scrollToTop = jest.fn();
    instance.scrollToRowIndex(30);
    // @ts-ignore private props
    const expected = instance.cellHeight * 30 + instance.cellHeight / 2;
    // @ts-ignore
    expect(instance.scroller.current.scrollToTop).toBeCalledWith(expected);
  });
});
