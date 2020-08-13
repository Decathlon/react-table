/// <reference path="../../typings/tests-entry.d.ts" />

import * as React from "react";
import { createRenderer } from "react-test-renderer/shallow";

import { DumbFixedColumnController } from "../../../src/components/table-interactions-manager/fixed-column-controller";

describe("FixedColumnController component", () => {
  test("should render the default FixedColumnController", () => {
    const props = {
      columnId: "bar",
      fixedColumnsIndexes: [1],
      fixedColumnsIds: ["foo"],
      updateFixedColumnsIds: jest.fn()
    };
    const shallowRenderer = createRenderer();
    shallowRenderer.render(
      <DumbFixedColumnController {...props}>
        {({ toggleFixedColumnId }) => <span onClick={toggleFixedColumnId}>Bar</span>}
      </DumbFixedColumnController>
    );
    const rendered = shallowRenderer.getRenderOutput();
    expect(rendered).toMatchSnapshot();
  });
});
