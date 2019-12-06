/// <reference path="../typings/tests-entry.d.ts" />
import * as React from "react";
import { createRenderer } from "react-test-renderer/shallow";

import ResponsiveContainer from "../../src/components/responsive-container";

describe("Cell component", () => {
  test("should render the default responsive", () => {
    const props = {
      className: "foo-class-name",
      children: () => <div>Foo</div>
    };
    const shallowRenderer = createRenderer();
    shallowRenderer.render(<ResponsiveContainer {...props} />);
    const rendered = shallowRenderer.getRenderOutput();
    expect(rendered).toMatchSnapshot();
  });
  // "behaviours dependent on rendered element sizes cannot be tested with jest/enzyme/jsdom"
  // "jsdom doesn't support layout. This means measurements like this will always return 0 as it does here"
});
