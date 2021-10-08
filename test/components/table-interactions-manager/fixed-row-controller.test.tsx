/// <reference path="../../typings/tests-entry.d.ts" />

import { createRenderer } from "react-test-renderer/shallow";

import { DumbFixedRowController } from "../../../src/components/table-interactions-manager/fixed-row-controller";

describe("FixedRowController component", () => {
  test("should render the default FixedRowController", () => {
    const props = {
      rowIndex: 2,
      fixedRowsIndexes: [1],
      updateFixedRowsIndexes: jest.fn()
    };
    const shallowRenderer = createRenderer();
    shallowRenderer.render(
      <DumbFixedRowController {...props}>
        {({ toggleFixedRowIndex }) => <span onClick={toggleFixedRowIndex}>Bar</span>}
      </DumbFixedRowController>
    );
    const rendered = shallowRenderer.getRenderOutput();
    expect(rendered).toMatchSnapshot();
  });
});
