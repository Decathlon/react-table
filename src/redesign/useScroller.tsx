import * as React from "react";
import { getScrollbarSize } from "../components/utils/table";
import usePrevValue from "../hooks/usePrevValue";

export const SCROLLBAR_SIZE = getScrollbarSize();

export enum ScrollDirection {
  up = "up",
  down = "down",
  right = "right",
  left = "left",
}

export const VERTICAL_SCROLL_DIRECTIONS = [ScrollDirection.up, ScrollDirection.down];

export const HORIZONTAL_SCROLL_DIRECTIONS = [ScrollDirection.left, ScrollDirection.right];

export enum ScrollOrigin {
  /**  Scrolling is native if it is enabled by the scroll bar */
  native = "native",
  /**  External otherwise */
  external = "external",
}

interface ScrollMetaBase {
  /**  The scroll direction */
  directions: ScrollDirection[];
  /**  The origin of scrolling (native: scroll bar, external: scrollTo functions) */
  scrollOrigin: ScrollOrigin;
}

export interface VerticalScrollMeta extends ScrollMetaBase {
  /**  True if the top of the scroll bar is reached */
  maxTopReached: boolean;
  /**  True if the bottom of the scroll bar is reached */
  maxBottomReached: boolean;
}

export interface HorizontalScrollMeta extends ScrollMetaBase {
  /**  True if the left of the scroll bar is reached */
  maxLeftReached: boolean;
  /**  True if the right of the scroll bar is reached */
  maxRightReached: boolean;
}

export interface VerticalScrollValues extends VerticalScrollMeta {
  /** The scroll value */
  scrollValue: number;
}

export interface HorizontalScrollValues extends HorizontalScrollMeta {
  /** The scroll value */
  scrollValue: number;
}

export type ScrollValues = HorizontalScrollValues & VerticalScrollValues;

export interface IOnScroll {
  /** The scroll value */
  scrollValue: number;
  meta: HorizontalScrollMeta | VerticalScrollMeta;
}

export interface IScrollerProps {
  containerScrollRef: React.MutableRefObject<{ scrollLeft: number; scrollTop: number } | null>;
  /**  The width of the visible window */
  width: number;
  /**  The height of the visible window */
  height: number;
  /** The global content width */
  virtualWidth: number;
  /**  The global content height */
  virtualHeight: number;
  /**  The horizontal part width of the scroll bar */
  horizontalPartWidth?: number;
  /** Ignored parts indexes */
  ignoredHorizontalParts?: number[];
  children?: JSX.Element;
  /**  Called when the scroll container has been scrolled */
  onVerticalScroll: (scrollValues: IOnScroll) => void;
  onHorizontalScroll: (scrollValues: IOnScroll) => void;
}

export interface IScrollerController {
  scrollToTop: (value: number) => boolean;
  scrollToLeft: (value: number) => boolean;
  handleContainerScroll: () => void;
  getScrollDirections: () => ScrollDirection[];
  getHorizontalScrollValues: () => HorizontalScrollValues;
  getVerticalScrollValues: () => VerticalScrollValues;
}

const defaultScroll = { scrollLeft: 0, scrollTop: 0 };

function useScroller(
  {
    containerScrollRef,
    width,
    height,
    virtualWidth,
    virtualHeight,
    horizontalPartWidth,
    ignoredHorizontalParts = [],
    onHorizontalScroll,
    onVerticalScroll,
  }: IScrollerProps,
  ref?: React.RefObject<IScrollerController>
): IScrollerController {
  // Initialize the current scroll's values
  const currentScrollTop = React.useRef<number>(0);
  const currentScrollLeft = React.useRef<number>(0);
  // Initialize the scroll's origine to native
  const scrollOrigin = React.useRef<ScrollOrigin>(ScrollOrigin.native);
  const prevIgnoredHorizontalParts = usePrevValue(ignoredHorizontalParts);

  // TODO useMemo
  const hasHorizontalScrollBar = virtualWidth > width;
  const hasVerticalScrollBar = virtualHeight > height;
  const verticalScrollBar = hasVerticalScrollBar ? SCROLLBAR_SIZE : 0;
  const horizontalScrollBar = hasHorizontalScrollBar ? SCROLLBAR_SIZE : 0;
  // We calculate the maximum value of the scroll
  const scrollTopMax = virtualHeight - height - 5 + horizontalScrollBar;
  // We calculate the maximum value of the scroll left
  const scrollLeftMax = virtualWidth - width - 5 + verticalScrollBar;

  /*
    keep the relative scrollLeft value when the virtualWidth has been changed
  */
  const keepHorizontalScrollLeft = () => {
    const scrollLeft = containerScrollRef.current?.scrollLeft;
    if (scrollLeft != null && horizontalPartWidth) {
      const nbIgnoredHorizontalParts = ignoredHorizontalParts.length;
      const nbPrevIgnoredHorizontalParts = prevIgnoredHorizontalParts?.length || 0;
      const nbRemovedParts = nbPrevIgnoredHorizontalParts - nbIgnoredHorizontalParts;
      const scrollablePartsAreChanged = prevIgnoredHorizontalParts && ignoredHorizontalParts !== prevIgnoredHorizontalParts;
      // 1 if added or 0 if scrollable parts are changed ;
      const changeKind = scrollablePartsAreChanged ? 1 : 0;
      const oldPartScrollIndex = Math.floor(scrollLeft / horizontalPartWidth);
      // 1 nb changed parts
      const newLeft = (oldPartScrollIndex + changeKind * nbRemovedParts) * horizontalPartWidth;
      scrollToLeft(newLeft);
    }
  };

  React.useEffect(() => {
    keepHorizontalScrollLeft();
  }, [virtualWidth]);

  const getScrollDirections = (): ScrollDirection[] => {
    if (containerScrollRef.current != null) {
      const { scrollTop, scrollLeft } = containerScrollRef.current || {};
      // Return the scroll direction value
      const directions = [];

      if (currentScrollTop.current > scrollTop) {
        directions.push(ScrollDirection.up);
      } else if (currentScrollTop.current < scrollTop) {
        directions.push(ScrollDirection.down);
      }

      if (currentScrollLeft.current > scrollLeft) {
        directions.push(ScrollDirection.left);
      } else if (currentScrollLeft.current < scrollLeft) {
        directions.push(ScrollDirection.right);
      }
      return directions;
    }
    return [];
  };

  const getVerticalScrollValues = (): VerticalScrollValues => {
    const { scrollTop } = containerScrollRef.current || defaultScroll;
    return {
      directions: getScrollDirections(),
      scrollOrigin: scrollOrigin.current,
      maxTopReached: scrollTop <= 0,
      maxBottomReached: scrollTop >= scrollTopMax,
      scrollValue: scrollTop,
    };
  };

  const getHorizontalScrollValues = (): HorizontalScrollValues => {
    const { scrollLeft } = containerScrollRef.current || defaultScroll;
    return {
      directions: getScrollDirections(),
      scrollOrigin: scrollOrigin.current,
      maxLeftReached: scrollLeft <= 0,
      maxRightReached: scrollLeft >= scrollLeftMax,
      scrollValue: scrollLeft,
    };
  };

  const handleContainerScroll = (): void => {
    const { scrollTop, scrollLeft } = containerScrollRef.current || defaultScroll;
    if (onVerticalScroll && currentScrollTop.current !== scrollTop) {
      const scrollValues = getVerticalScrollValues();
      onVerticalScroll({
        scrollValue: scrollValues.scrollValue,
        meta: {
          directions: scrollValues.directions,
          scrollOrigin: scrollValues.scrollOrigin,
          maxTopReached: scrollValues.maxTopReached,
          maxBottomReached: scrollValues.maxBottomReached,
        },
      });
    }

    if (onHorizontalScroll && currentScrollLeft.current !== scrollLeft) {
      const scrollValues = getHorizontalScrollValues();
      onHorizontalScroll({
        scrollValue: scrollValues.scrollValue,
        meta: {
          directions: scrollValues.directions,
          scrollOrigin: scrollValues.scrollOrigin,
          maxLeftReached: scrollValues.maxLeftReached,
          maxRightReached: scrollValues.maxRightReached,
        },
      });
    }
    // Initialize the current scroll's values
    currentScrollTop.current = scrollTop;
    currentScrollLeft.current = scrollLeft;
    // Initialize the scroll's origine to native
    scrollOrigin.current = ScrollOrigin.native;
  };

  const scrollToLeft = (value: number) => {
    // We can scroll to left only if the virtualWidth is greater than the width
    if (virtualWidth > width && containerScrollRef.current != null) {
      const { scrollLeft } = containerScrollRef.current;
      let newScrollLeft = value;
      if (newScrollLeft < 0) {
        newScrollLeft = 0;
      } else if (newScrollLeft > scrollLeftMax) {
        newScrollLeft = scrollLeftMax;
      }

      if (scrollLeft !== newScrollLeft) {
        containerScrollRef.current.scrollLeft = newScrollLeft;
        scrollOrigin.current = ScrollOrigin.external;
        return true;
      }
    }
    return false;
  };

  const scrollToTop = (value: number) => {
    // We can scroll to top only if the virtualHeight is greater than the height
    if (virtualHeight > height && containerScrollRef.current != null) {
      const { scrollTop } = containerScrollRef.current;
      let newScrollTop = value;
      if (newScrollTop < 0) {
        newScrollTop = 0;
      } else if (newScrollTop > scrollTopMax) {
        newScrollTop = scrollTopMax;
      }
      if (scrollTop !== newScrollTop) {
        containerScrollRef.current.scrollTop = newScrollTop;
        scrollOrigin.current = ScrollOrigin.external;
        return true;
      }
    }
    return false;
  };

  const scrollerController: IScrollerController = {
    scrollToTop,
    scrollToLeft,
    handleContainerScroll,
    getScrollDirections,
    getHorizontalScrollValues,
    getVerticalScrollValues,
  };

  React.useImperativeHandle(ref, () => scrollerController);

  return scrollerController;
}

export default useScroller;
