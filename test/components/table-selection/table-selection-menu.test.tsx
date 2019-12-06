/// <reference path="../../typings/tests-entry.d.ts" />
import * as React from "react";
import { createRenderer } from "react-test-renderer/shallow";

import TableSelectionMenu, { IMenuAction } from "../../../src/components/table-selection/table-selection-menu";

const selectedCells = { 1: [0, 1, 2], 2: [0, 1, 2] };

const selectionCell = {
  anchorEl: null,
  contextCell: { rowIndex: 0, cellIndex: 2 }
};

describe("TableSelectionMenu component", () => {
  test("should render TableSelectionMenu closed menu", () => {
    const props = {
      closeMenu: jest.fn(),
      selectedCells,
      selectionContext: selectionCell,
      isMenuOpened: false,
      actions: []
    };
    const shallowRenderer = createRenderer();
    shallowRenderer.render(<TableSelectionMenu {...props} />);
    const rendered = shallowRenderer.getRenderOutput();
    expect(rendered).toMatchSnapshot();
  });

  test("should render TableSelectionMenu opened menu", () => {
    const props = {
      closeMenu: jest.fn(),
      selectedCells,
      selectionContext: selectionCell,
      isMenuOpened: true,
      actions: []
    };
    const shallowRenderer = createRenderer();
    shallowRenderer.render(<TableSelectionMenu {...props} />);
    const rendered = shallowRenderer.getRenderOutput();
    expect(rendered).toMatchSnapshot();
  });

  test("should render TableSelectionMenu opened menu with actions", () => {
    const actions: IMenuAction[] = [
      {
        id: "foo",
        title: "Foo item",
        component: () => <div>Foo</div>,
        menuItem: ({ children }) => <div>{children}</div>
      },
      {
        id: "bar",
        title: "Bar item",
        component: () => <div>Foo</div>
      }
    ];
    const props = {
      closeMenu: jest.fn(),
      selectedCells,
      selectionContext: selectionCell,
      isMenuOpened: true,
      actions
    };
    const shallowRenderer = createRenderer();
    shallowRenderer.render(<TableSelectionMenu {...props} />);
    const rendered = shallowRenderer.getRenderOutput();
    expect(rendered).toMatchSnapshot();
  });
});
