/// <reference path="../../typings/tests-entry.d.ts" />
import * as React from "react";
import { createRenderer } from "react-test-renderer/shallow";
import { cleanup, fireEvent } from "@testing-library/react";

import RowSpan from "../../../src/components/table/row-span";
import { customRender } from "../../tests-utils/react-testing-library-utils";

describe("RowSpan component", () => {
  test("should render a closed span", () => {
    const props = {
      opened: false,
      length: 2,
      title: "Foo",
      color: "red",
      toggle: () => null
    };
    const shallowRenderer = createRenderer();
    shallowRenderer.render(<RowSpan {...props} />);
    const rendered = shallowRenderer.getRenderOutput();
    expect(rendered).toMatchSnapshot();
  });

  test("should render an opened span", () => {
    const props = {
      opened: true,
      length: 2,
      title: "Foo",
      toggle: () => null
    };
    const shallowRenderer = createRenderer();
    shallowRenderer.render(<RowSpan {...props} />);
    const rendered = shallowRenderer.getRenderOutput();
    expect(rendered).toMatchSnapshot();
  });

  test("should call the span toggle callback", () => {
    const props = {
      opened: true,
      length: 2,
      title: "Foo",
      toggle: jest.fn()
    };
    const { container } = customRender(<RowSpan {...props} />);
    fireEvent.click(container.getElementsByTagName("button")[0]);
    expect(props.toggle).toBeCalledTimes(1);
    cleanup();
  });
});
