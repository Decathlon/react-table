/// <reference path="../../typings/tests-entry.d.ts" />
import * as React from "react";
import { createRenderer } from "react-test-renderer/shallow";
import { mount } from "enzyme";

import * as Utils from "../../../src/components/utils/table";
import ElementaryTable from "../../../src/components/table/elementary-table";
import { tableWithSubItems, subRows } from "../../../stories/utils/tables";
import { withThemeProvider } from "../../../stories/utils/decorators";
import { IRow } from "../../../src/components/table/row";

const rows = tableWithSubItems({
  firstSubRows: subRows({ subsubRows: subRows({}) }),
  secondSubRows: subRows({ subsubRows: subRows({}) })
});

const fixedRowsIndexes = [1];

describe("elementary table component", () => {
  test("should render the default table", () => {
    const indexesMap = Utils.getAllIndexesMap([], rows);
    const props = { id: "foo", rows, indexesMapping: indexesMap };
    const shallowRenderer = createRenderer();
    shallowRenderer.render(<ElementaryTable {...props} />);
    const rendered = shallowRenderer.getRenderOutput();
    expect(rendered).toMatchSnapshot();
  });

  test("should render a table with custom cell size", () => {
    const rows = tableWithSubItems({
      firstSubRows: subRows({ subsubRows: subRows({}) }),
      secondSubRows: subRows({ subsubRows: subRows({}) })
    });
    const indexesMap = Utils.getAllIndexesMap([], rows);
    // @ts-ignore
    rows[0].size = 24;
    // @ts-ignore
    rows[2].size = 150;
    const props = {
      id: "foo",
      rows,
      indexesMapping: indexesMap,
      columns: { 0: { size: 320 }, 4: { size: 300 } }
    };
    const shallowRenderer = createRenderer();
    shallowRenderer.render(<ElementaryTable {...props} />);
    const rendered = shallowRenderer.getRenderOutput();
    expect(rendered).toMatchSnapshot();
  });

  test("should return the Tree Length", () => {
    const opendTrees = { 1: { rowIndex: 1, columnIndex: 0 } };
    const indexesMap = Utils.getAllIndexesMap(opendTrees, rows);
    const props = {
      id: "foo",
      rows,
      indexesMapping: indexesMap,
      opendTrees,
      fixedRowsIndexes,
      visibleRowIndexes: [0, 1, 2, 3, 4]
    };
    const wrapper = mount(withThemeProvider(() => <ElementaryTable {...props} />));
    const instance: ElementaryTable = wrapper.find(ElementaryTable).instance() as ElementaryTable;
    expect(instance.getRowTreeLength(0)).toEqual(0);
    expect(instance.getRowTreeLength(1)).toEqual(2);
    expect(instance.getRowTreeLength(2)).toEqual(0);
  });

  test("should return the visible rows", () => {
    const opendTrees = { 1: { rowIndex: 1, columnIndex: 0 } };
    const indexesMap = Utils.getAllIndexesMap(opendTrees, rows);
    const props = {
      id: "foo",
      rows,
      indexesMapping: indexesMap,
      opendTrees,
      fixedRowsIndexes,
      visibleRowIndexes: [0, 1, 2, 3] // the third row is hidden
    };
    const wrapper = mount(withThemeProvider(() => <ElementaryTable {...props} />));
    const instance: ElementaryTable = wrapper.find(ElementaryTable).instance() as ElementaryTable;
    // @ts-ignore subItems is defined
    const secondLevel = props.rows[1].cells[0].subItems;
    // first level
    // the third row is hidden
    expect(instance.getVisibleRows(props.rows, null, fixedRowsIndexes)).toEqual([[0, 1], props.rows.slice(0, 2)]);
    // second level
    expect(instance.getVisibleRows(secondLevel as IRow[], 1)).toEqual([[0, 1], secondLevel]);
  });
});
