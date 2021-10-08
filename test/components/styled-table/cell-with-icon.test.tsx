/// <reference path="../../typings/tests-entry.d.ts" />

import { createRenderer } from "react-test-renderer/shallow";
import { mount } from "enzyme";

import CellWithIcon from "../../../src/components/styled-table/cell-with-icon";
import { withThemeProvider } from "../../../stories/utils/decorators";

describe("CellWithIcon component", () => {
  test("should render the default CellWithIcon", () => {
    const shallowRenderer = createRenderer();
    shallowRenderer.render(<CellWithIcon value="TUNING" iconName="edit" />);
    const rendered = shallowRenderer.getRenderOutput();
    expect(rendered).toMatchSnapshot();
  });

  test("should render the CellWithIcon with an action", () => {
    const shallowRenderer = createRenderer();
    shallowRenderer.render(<CellWithIcon value="TUNING" iconName="edit" onClick={jest.fn()} />);
    const rendered = shallowRenderer.getRenderOutput();
    expect(rendered).toMatchSnapshot();
  });

  test("should render the CellWithIcon with a tooltip", () => {
    const shallowRenderer = createRenderer();
    shallowRenderer.render(<CellWithIcon value="TUNING" iconName="edit" tooltipTitle="Hello Foo" />);
    const rendered = shallowRenderer.getRenderOutput();
    expect(rendered).toMatchSnapshot();
  });

  test("should render the CellWithIcon with a tooltip and an action", () => {
    const shallowRenderer = createRenderer();
    shallowRenderer.render(<CellWithIcon value="TUNING" iconName="edit" tooltipTitle="Hello Foo" onClick={jest.fn()} />);
    const rendered = shallowRenderer.getRenderOutput();
    expect(rendered).toMatchSnapshot();
  });

  test("should call onclick", () => {
    const props = {
      iconName: "edit",
      value: "Foo",
      onClick: jest.fn()
    };
    const wrapper = mount(withThemeProvider(() => <CellWithIcon {...props} />));
    // onClick
    wrapper
      .find("[data-testid='toolbar-action-btn']")
      .last()
      .simulate("click");
    expect(props.onClick).toBeCalledTimes(1);
  });
});
