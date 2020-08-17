/// <reference path="../../typings/tests-entry.d.ts" />

import * as React from "react";
import { createRenderer } from "react-test-renderer/shallow";

import HeaderCell from "../../../src/components/styled-table/header-cell";

describe("HeaderCell component", () => {
  test("should render the default HeaderCell", () => {
    const shallowRenderer = createRenderer();
    shallowRenderer.render(<HeaderCell title="Foo" value="Bar" badge="30" />);
    const rendered = shallowRenderer.getRenderOutput();
    expect(rendered).toMatchSnapshot();
  });

  test("should render the default HeaderCell (with subtitle)", () => {
    const shallowRenderer = createRenderer();
    shallowRenderer.render(<HeaderCell title="Foo" value="Bar" badge="30" />);
    const rendered = shallowRenderer.getRenderOutput();
    expect(rendered).toMatchSnapshot();
  });

  test("should render the HeaderCell (with custom className)", () => {
    const shallowRenderer = createRenderer();
    shallowRenderer.render(<HeaderCell title="Foo" value="Bar" badge="30" className="custom" />);
    const rendered = shallowRenderer.getRenderOutput();
    expect(rendered).toMatchSnapshot();
  });

  test("should render the current HeaderCell", () => {
    const shallowRenderer = createRenderer();
    shallowRenderer.render(<HeaderCell title="Foo" value="Bar" badge="30" isCurrent />);
    const rendered = shallowRenderer.getRenderOutput();
    expect(rendered).toMatchSnapshot();
  });
});
