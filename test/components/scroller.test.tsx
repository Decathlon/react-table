/// <reference path="../typings/tests-entry.d.ts" />
import * as React from "react";
import { createRenderer } from "react-test-renderer/shallow";
import { mount } from "enzyme";

import Scroller, { SCROLLBAR_SIZE } from "../../src/components/scroller";

const scrollerProps = {
  width: 300,
  height: 300,
  virtualWidth: 4000,
  virtualHeight: 4000,
  onScroll: jest.fn()
};

describe("Scroller component", () => {
  test("should render the default scroller", () => {
    const shallowRenderer = createRenderer();
    shallowRenderer.render(<Scroller {...scrollerProps} />);
    const rendered = shallowRenderer.getRenderOutput();
    expect(rendered).toMatchSnapshot();
  });

  test("should render an horizontal scroller", () => {
    const shallowRenderer = createRenderer();
    shallowRenderer.render(<Scroller {...scrollerProps} virtualHeight={scrollerProps.height} />);
    const rendered = shallowRenderer.getRenderOutput();
    expect(rendered).toMatchSnapshot();
  });

  test("should render a vertical scroller", () => {
    const shallowRenderer = createRenderer();
    shallowRenderer.render(<Scroller {...scrollerProps} virtualWidth={scrollerProps.width} />);
    const rendered = shallowRenderer.getRenderOutput();
    expect(rendered).toMatchSnapshot();
  });

  it("should scroll to the expected scrollTop value (native scrolling)", () => {
    const onScroll = jest.fn();
    const wrapper = mount(<Scroller {...scrollerProps} onScroll={onScroll} />);
    const scrollerInstance: Scroller = wrapper.instance() as Scroller;
    // @ts-ignore scrollerContainer is prevate
    scrollerInstance.scrollerContainer.current.scrollTop = 1500;
    // simulate the scroll event
    wrapper.find("[data-testid='scroller-container']").simulate("scroll");
    expect(onScroll).toBeCalledTimes(1);
    expect(onScroll).toBeCalledWith({
      directions: ["down"],
      scrollOrigin: "native",
      maxBottomReached: false,
      maxLeftReached: true,
      maxRightReached: false,
      maxTopReached: false,
      scrollLeft: 0,
      scrollTop: 1500
    });
  });

  it("should scroll to the expected scrollTop value", () => {
    const onScroll = jest.fn();
    const wrapper = mount(<Scroller {...scrollerProps} onScroll={onScroll} />);
    const scrollerInstance: Scroller = wrapper.instance() as Scroller;
    const scrollTop = 1500;
    scrollerInstance.scrollToTop(scrollTop);
    // @ts-ignore scrollOrigin is prevate
    expect(scrollerInstance.scrollOrigin).toBe("external");
    // @ts-ignore scrollerContainer is prevate
    expect(scrollerInstance.scrollerContainer.current.scrollTop).toBe(scrollTop);
    // simulate the scroll event
    wrapper.find("[data-testid='scroller-container']").simulate("scroll");
    expect(onScroll).toBeCalledTimes(1);
    expect(onScroll).toBeCalledWith({
      directions: ["down"],
      scrollOrigin: "external",
      maxBottomReached: false,
      maxLeftReached: true,
      maxRightReached: false,
      maxTopReached: false,
      scrollLeft: 0,
      scrollTop: 1500
    });
  });

  it("should reach the bottom", () => {
    const onScroll = jest.fn();
    const wrapper = mount(<Scroller {...scrollerProps} onScroll={onScroll} />);
    const scrollerInstance: Scroller = wrapper.instance() as Scroller;
    const maxScrollTop = scrollerProps.virtualHeight - scrollerProps.height - 5 + SCROLLBAR_SIZE;
    scrollerInstance.scrollToTop(maxScrollTop);
    // @ts-ignore scrollOrigin is private
    expect(scrollerInstance.scrollOrigin).toBe("external");
    // @ts-ignore scrollerContainer is private
    expect(scrollerInstance.scrollerContainer.current.scrollTop).toBe(maxScrollTop);
    // simulate the scroll event
    wrapper.find("[data-testid='scroller-container']").simulate("scroll");
    expect(onScroll).toBeCalledTimes(1);
    expect(onScroll).toBeCalledWith({
      directions: ["down"],
      scrollOrigin: "external",
      maxBottomReached: true,
      maxLeftReached: true,
      maxRightReached: false,
      maxTopReached: false,
      scrollLeft: 0,
      scrollTop: maxScrollTop
    });
  });

  it("should scroll to the expected scrollLeft value (native scrolling)", () => {
    const onScroll = jest.fn();
    const wrapper = mount(<Scroller {...scrollerProps} onScroll={onScroll} />);
    const scrollerInstance: Scroller = wrapper.instance() as Scroller;
    // @ts-ignore scrollerContainer is private
    scrollerInstance.scrollerContainer.current.scrollLeft = 1500;
    // simulate the scroll event
    wrapper.find("[data-testid='scroller-container']").simulate("scroll");
    expect(onScroll).toBeCalledTimes(1);
    expect(onScroll).toBeCalledWith({
      directions: ["right"],
      scrollOrigin: "native",
      maxBottomReached: false,
      maxLeftReached: false,
      maxRightReached: false,
      maxTopReached: true,
      scrollLeft: 1500,
      scrollTop: 0
    });
  });

  it("should scroll to the expected scrollLeft value", () => {
    const onScroll = jest.fn();
    const wrapper = mount(<Scroller {...scrollerProps} onScroll={onScroll} />);
    const scrollerInstance: Scroller = wrapper.instance() as Scroller;
    const scrollLeft = 1500;
    scrollerInstance.scrollToLeft(scrollLeft);
    // @ts-ignore scrollOrigin is private
    expect(scrollerInstance.scrollOrigin).toBe("external");
    // @ts-ignore scrollerContainer is private
    expect(scrollerInstance.scrollerContainer.current.scrollLeft).toBe(scrollLeft);
    // simulate the scroll event
    wrapper.find("[data-testid='scroller-container']").simulate("scroll");
    expect(onScroll).toBeCalledTimes(1);
    expect(onScroll).toBeCalledWith({
      directions: ["right"],
      scrollOrigin: "external",
      maxBottomReached: false,
      maxLeftReached: false,
      maxRightReached: false,
      maxTopReached: true,
      scrollLeft: 1500,
      scrollTop: 0
    });
  });

  it("should reach the right", () => {
    const onScroll = jest.fn();
    const wrapper = mount(<Scroller {...scrollerProps} onScroll={onScroll} />);
    const scrollerInstance: Scroller = wrapper.instance() as Scroller;
    const maxScrollLeft = scrollerProps.virtualWidth - scrollerProps.width - 5 + SCROLLBAR_SIZE;
    scrollerInstance.scrollToLeft(maxScrollLeft);
    // @ts-ignore scrollOrigin is private
    expect(scrollerInstance.scrollOrigin).toBe("external");
    // @ts-ignore scrollerContainer is private
    expect(scrollerInstance.scrollerContainer.current.scrollLeft).toBe(maxScrollLeft);
    // simulate the scroll event
    wrapper.find("[data-testid='scroller-container']").simulate("scroll");
    expect(onScroll).toBeCalledTimes(1);
    expect(onScroll).toBeCalledWith({
      directions: ["right"],
      scrollOrigin: "external",
      maxBottomReached: false,
      maxLeftReached: false,
      maxRightReached: true,
      maxTopReached: true,
      scrollLeft: maxScrollLeft,
      scrollTop: 0
    });
  });
});
