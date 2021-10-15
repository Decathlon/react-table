/// <reference path="../../typings/tests-entry.d.ts" />
import { createRenderer } from "react-test-renderer/shallow";

import Bubble, { BubbleType } from "../../../src/components/styled-table/bubble";

describe("Bubble component", () => {
  test("should render the default bubble", () => {
    const shallowRenderer = createRenderer();
    shallowRenderer.render(<Bubble badge="30" />);
    const rendered = shallowRenderer.getRenderOutput();
    expect(rendered).toMatchSnapshot();
  });

  test("should render a bubble without badge", () => {
    const shallowRenderer = createRenderer();
    shallowRenderer.render(<Bubble className="foo-class-name" />);
    const rendered = shallowRenderer.getRenderOutput();
    expect(rendered).toMatchSnapshot();
  });

  test("should render a bubble with content", () => {
    const shallowRenderer = createRenderer();
    shallowRenderer.render(
      <Bubble badge="30">
        <div>Foo</div>
      </Bubble>
    );
    const rendered = shallowRenderer.getRenderOutput();
    expect(rendered).toMatchSnapshot();
  });

  test("should render a success bubble with content", () => {
    const shallowRenderer = createRenderer();
    shallowRenderer.render(
      <Bubble badge="30" type={BubbleType.success}>
        <div>Foo</div>
      </Bubble>
    );
    const rendered = shallowRenderer.getRenderOutput();
    expect(rendered).toMatchSnapshot();
  });
});
