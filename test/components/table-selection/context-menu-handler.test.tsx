/// <reference path="../../typings/tests-entry.d.ts" />
import * as React from "react";
import { createRenderer } from "react-test-renderer/shallow";

import ContextMenuHandler from "../../../src/components/table-selection/context-menu-handler";

describe("ContextMenuHandler component", () => {
  test("should render children", () => {
    const children = () => <div>Foo</div>;
    const props = {
      children,
      selectedCells: {}
    };
    const shallowRenderer = createRenderer();
    shallowRenderer.render(<ContextMenuHandler {...props} />);
    const rendered = shallowRenderer.getRenderOutput();
    expect(rendered).toMatchSnapshot();
  });
});
