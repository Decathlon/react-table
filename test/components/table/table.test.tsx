/// <reference path="../../typings/tests-entry.d.ts" />
import { createRenderer } from "react-test-renderer/shallow";

import { mount } from "enzyme";
import Table, { IState } from "../../../src/components/table/table";
import { simpleTable, tableWithSubItems, subRows, subMiam, generateTable } from "../../../stories/utils/tables";
import { withThemeProvider } from "../../../stories/utils/decorators";
import { getIndexesIdsMapping } from "../../../src/components/utils/table";

const defaultProps = {
  id: "table-foo",
  rows: simpleTable({})
};

const table2Levels = tableWithSubItems({ firstSubRows: subRows({}) });

const table3Levels = tableWithSubItems({
  firstSubRows: subRows({ subsubRows: subMiam })
});

const tableWithSpan = tableWithSubItems({
  firstSubRows: subRows({}),
  secondSubRows: subRows({})
});

describe("Table component", () => {
  test("should render the default table", () => {
    const shallowRenderer = createRenderer();
    shallowRenderer.render(<Table {...defaultProps} isSelectable={false} />);
    const rendered = shallowRenderer.getRenderOutput();
    expect(rendered).toMatchSnapshot();
  });

  test("should render a Table with 2 levels", () => {
    const shallowRenderer = createRenderer();
    shallowRenderer.render(<Table {...defaultProps} rows={table2Levels} isSelectable={false} />);
    const rendered = shallowRenderer.getRenderOutput();
    expect(rendered).toMatchSnapshot();
  });

  test("should render a Table with 3 levels", () => {
    const shallowRenderer = createRenderer();
    shallowRenderer.render(<Table {...defaultProps} rows={table3Levels} isSelectable={false} />);
    const rendered = shallowRenderer.getRenderOutput();
    expect(rendered).toMatchSnapshot();
  });

  test("should render a Table with spans", () => {
    const shallowRenderer = createRenderer();
    shallowRenderer.render(<Table {...defaultProps} isSpan rows={tableWithSpan} isSelectable={false} />);
    const rendered = shallowRenderer.getRenderOutput();
    expect(rendered).toMatchSnapshot();
  });

  test("should render a selectable Table", () => {
    const shallowRenderer = createRenderer();
    shallowRenderer.render(<Table {...defaultProps} isSpan rows={tableWithSpan} />);
    const rendered = shallowRenderer.getRenderOutput();
    expect(rendered).toMatchSnapshot();
  });

  test("should render a responsive Table", () => {
    const shallowRenderer = createRenderer();
    shallowRenderer.render(<Table {...defaultProps} isVirtualized rows={tableWithSpan} />);
    const rendered = shallowRenderer.getRenderOutput();
    expect(rendered).toMatchSnapshot();
  });

  test("should render a virtualized Table", () => {
    const shallowRenderer = createRenderer();
    shallowRenderer.render(
      <Table
        {...defaultProps}
        isVirtualized
        virtualizerProps={{
          height: 300,
          width: 400,
          initialScroll: {
            columnIndex: 3,
            rowIndex: 4
          }
        }}
        rows={tableWithSpan}
      />
    );
    const rendered = shallowRenderer.getRenderOutput();
    expect(rendered).toMatchSnapshot();
  });

  test("should open sub rows", () => {
    const props = {
      id: "foo",
      rows: subRows({ subsubRows: subMiam })
    };
    const wrapper = mount(withThemeProvider(() => <Table {...props} />));
    const instance: Table = wrapper.find(Table).instance() as Table;

    let expectedState: IState = {
      rowsLength: 2,
      indexesMapping: {
        absolute: {
          "0": { index: 0, parentIndex: null },
          "1": { index: 1, parentIndex: null }
        },
        relative: { "0": { index: 0 }, "1": { index: 1 } }
      },
      columnsIndexesIdsMapping: getIndexesIdsMapping(props.rows[0].cells),
      openedTrees: {},
      fixedRowsIndexes: []
    };

    expect(instance.state).toEqual(expectedState);
    // @ts-ignore private method
    instance.onRowOpen({ rowIndex: 0, columnIndex: 2 });
    expectedState = {
      indexesMapping: {
        absolute: {
          "0": { index: 0, parentIndex: null },
          "1": { index: 0, parentIndex: 0 },
          "2": { index: 1, parentIndex: null }
        },
        relative: {
          "0": { index: 0, subItems: { "0": { index: 1 } } },
          "1": { index: 2 }
        }
      },
      columnsIndexesIdsMapping: getIndexesIdsMapping(props.rows[0].cells),
      openedTrees: { 0: { columnIndex: 2, rowIndex: 0 } },
      rowsLength: 3,
      fixedRowsIndexes: []
    };
    expect(instance.state).toEqual(expectedState);
    // @ts-ignore private method
    instance.onRowOpen({ rowIndex: 1, columnIndex: 2 });
    expectedState = {
      indexesMapping: {
        absolute: {
          "0": { index: 0, parentIndex: null },
          "1": { index: 0, parentIndex: 0 },
          "2": { index: 1, parentIndex: null },
          "3": { index: 0, parentIndex: 2 }
        },
        relative: {
          "0": { index: 0, subItems: { "0": { index: 1 } } },
          "1": { index: 2, subItems: { "0": { index: 3 } } }
        }
      },
      columnsIndexesIdsMapping: getIndexesIdsMapping(props.rows[0].cells),
      openedTrees: {
        0: { columnIndex: 2, rowIndex: 0 },
        1: { columnIndex: 2, rowIndex: 1 }
      },
      rowsLength: 4,
      fixedRowsIndexes: []
    };
    expect(instance.state).toEqual(expectedState);
  });

  test("should close sub row", () => {
    const props = {
      id: "foo",
      rows: subRows({ subsubRows: subMiam })
    };
    const wrapper = mount(withThemeProvider(() => <Table {...props} />));
    const instance: Table = wrapper.find(Table).instance() as Table;
    // tested
    // @ts-ignore private method
    instance.onRowOpen({ rowIndex: 0, columnIndex: 2 });
    // @ts-ignore private method
    instance.onRowClose({ rowIndex: 0, columnIndex: 2 });
    const expectedState: IState = {
      rowsLength: 2,
      indexesMapping: {
        absolute: {
          "0": { index: 0, parentIndex: null },
          "1": { index: 1, parentIndex: null }
        },
        relative: { "0": { index: 0 }, "1": { index: 1 } }
      },
      columnsIndexesIdsMapping: getIndexesIdsMapping(props.rows[0].cells),
      openedTrees: {},
      fixedRowsIndexes: []
    };
    expect(instance.state).toEqual(expectedState);
  });

  test("should call the scrollToColumnIndex virtualizer method (scroll to column index)", () => {
    const props = generateTable(50, 50);
    const wrapper = mount(
      withThemeProvider(() => <Table {...props} isVirtualized virtualizerProps={{ height: 300, width: 400 }} />)
    );
    const instance: Table = wrapper.find(Table).instance() as Table;

    // @ts-ignore
    instance.virtualizer.current.scrollToColumnIndex = jest.fn();
    instance.goToColumnIndex(25);
    // @ts-ignore
    expect(instance.virtualizer.current.scrollToColumnIndex).toBeCalledWith(25);

    instance.goToColumnIndex(-30);
    // @ts-ignore
    expect(instance.virtualizer.current.scrollToColumnIndex).toBeCalledWith(0);

    instance.goToColumnIndex(100);
    // @ts-ignore
    expect(instance.virtualizer.current.scrollToColumnIndex).toBeCalledWith(49);
  });

  test("should call the scrollToRowIndex virtualizer method(scroll to row index)", () => {
    const props = generateTable(50, 50);
    const wrapper = mount(
      withThemeProvider(() => <Table {...props} isVirtualized virtualizerProps={{ height: 300, width: 400 }} />)
    );
    const instance: Table = wrapper.find(Table).instance() as Table;
    // @ts-ignore
    instance.virtualizer.current.scrollToRowIndex = jest.fn();
    instance.goToRowIndex(25);
    // @ts-ignore
    expect(instance.virtualizer.current.scrollToRowIndex).toBeCalledWith(25);

    instance.goToRowIndex(-10);
    // @ts-ignore
    expect(instance.virtualizer.current.scrollToRowIndex).toBeCalledWith(0);

    instance.goToRowIndex(100);
    // @ts-ignore
    expect(instance.virtualizer.current.scrollToRowIndex).toBeCalledWith(49);
  });

  test("should call the scrollToColumnIndex virtualizer method (scroll to column id)", () => {
    const props = generateTable(50, 50);
    const wrapper = mount(
      withThemeProvider(() => <Table {...props} isVirtualized virtualizerProps={{ height: 300, width: 400 }} />)
    );
    const instance: Table = wrapper.find(Table).instance() as Table;

    // @ts-ignore
    instance.virtualizer.current.scrollToColumnIndex = jest.fn();
    instance.goToColumnId("(0,25)-0");
    // @ts-ignore
    expect(instance.virtualizer.current.scrollToColumnIndex).toBeCalledWith(25);
    // @ts-ignore
    instance.virtualizer.current.scrollToColumnIndex.mockReset();
    instance.goToColumnId("(0,300)-0");
    // @ts-ignore
    expect(instance.virtualizer.current.scrollToColumnIndex).not.toBeCalled();
  });

  test("should call the getColumnIndex method", () => {
    const props = generateTable(50, 50);
    const wrapper = mount(
      withThemeProvider(() => <Table {...props} isVirtualized virtualizerProps={{ height: 300, width: 400 }} />)
    );
    const instance: Table = wrapper.find(Table).instance() as Table;

    expect(instance.getColumnIndex("(0,25)-0")).toEqual(25);
    expect(instance.getColumnIndex("notexist")).toBeFalsy();
  });
});
