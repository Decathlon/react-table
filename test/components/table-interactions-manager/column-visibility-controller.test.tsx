/// <reference path="../../typings/tests-entry.d.ts" />

import { createRenderer } from "react-test-renderer/shallow";

import { DumbColumnVisibilityController } from "../../../src/components/table-interactions-manager/column-visibility-controller";

describe("ColumnVisisbilityController component", () => {
  test("should render the default ColumnVisisbilityController", () => {
    const props = {
      columns: [
        { id: "foo", index: 1, label: "FOO" },
        { id: "bar", index: 2, label: "BAR" },
      ],
      hiddenColumnsIndexes: [1],
      hiddenColumnsIds: ["foo"],
      updateHiddenIds: jest.fn(),
    };
    const shallowRenderer = createRenderer();
    shallowRenderer.render(
      <DumbColumnVisibilityController {...props} buttonRenderer={(toggleMenu) => <span onClick={toggleMenu}>Foo</span>} />
    );
    const rendered = shallowRenderer.getRenderOutput();
    expect(rendered).toMatchSnapshot();
  });
});
