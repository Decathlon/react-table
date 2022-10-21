import * as React from "react";
import { isEqual } from "lodash";
import { getScrollbarSize } from "./utils/table";

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

export interface IOnScroll {
  /**  The scroll direction */
  directions: ScrollDirection[];
  /**  The origin of scrolling (native: scroll bar, external: scrollTo functions) */
  scrollOrigin: ScrollOrigin;
  /**  True if the top of the scroll bar is reached */
  maxTopReached: boolean;
  /**  True if the bottom of the scroll bar is reached */
  maxBottomReached: boolean;
  /**  True if the left of the scroll bar is reached */
  maxLeftReached: boolean;
  /**  True if the right of the scroll bar is reached */
  maxRightReached: boolean;
  /** The vertical scroll value */
  scrollTop: number;
  /** The horizontal scroll value */
  scrollLeft: number;
}

export interface IScrollerProps {
  /** The global content width */
  virtualWidth: number;
  /**  The global content height */
  virtualHeight: number;
  /**  The width of the visible window */
  width: number;
  /**  The height of the visible window */
  height: number;
  /**  The horizontal part width of the scroll bar */
  horizontalPartWidth?: number;
  /** Ignored parts indexes */
  ignoredHorizontalParts?: number[];
  children?: JSX.Element;
  /**  Called when the scroll container has been scrolled */
  onScroll: (scrollValues: IOnScroll) => void;
}

const defaultScroll = { scrollLeft: 0, scrollTop: 0 };

class Scroller extends React.Component<IScrollerProps> {
  private scrollerContainer: React.RefObject<HTMLDivElement> = React.createRef();

  private scrollOrigin: ScrollOrigin = ScrollOrigin.native;

  private scrollTopMax = 0;

  private scrollLeftMax = 0;

  private currentScrollTop = 0;

  private currentScrollLeft = 0;

  private prevIgnoredHorizontalParts?: number[];

  public componentDidMount() {
    this.initializeMaxScrollValues();
  }

  /*
    We update the Scroll component only if his props are modified.
  */
  public shouldComponentUpdate(nextProps: IScrollerProps) {
    return !isEqual(nextProps, this.props);
  }

  public componentDidUpdate(prevProps: IScrollerProps) {
    this.initializeMaxScrollValues();
    const { ignoredHorizontalParts } = this.props;
    if (ignoredHorizontalParts !== prevProps.ignoredHorizontalParts) {
      this.prevIgnoredHorizontalParts = prevProps.ignoredHorizontalParts;
    }
    this.keepHorizontalScrollLeft(prevProps);
  }

  /*
    keep the relative scrollLeft value when the virtualWidth has been changed
  */
  private keepHorizontalScrollLeft = (prevProps: IScrollerProps) => {
    const { virtualWidth, horizontalPartWidth, ignoredHorizontalParts } = this.props;
    if (this.scrollerContainer.current && horizontalPartWidth) {
      const { scrollLeft } = this.scrollerContainer.current;
      if (prevProps.virtualWidth !== virtualWidth && scrollLeft) {
        const diff = prevProps.virtualWidth - virtualWidth;
        const percentageDiff = (100 * diff) / prevProps.virtualWidth;
        const newRelativeDiff = (virtualWidth * percentageDiff) / 100;
        const nbIgnoredHorizontalParts = ignoredHorizontalParts?.length || 0;
        const nbPrevIgnoredHorizontalParts = this.prevIgnoredHorizontalParts?.length || 0;
        const nbRemovedParts = nbPrevIgnoredHorizontalParts - nbIgnoredHorizontalParts;
        // 1 if added or -1 if scrollable parts are removed ;
        const changeDirection = diff >= 0 ? -1 : 1;
        if (nbRemovedParts !== 0) {
          const newLeft = scrollLeft - newRelativeDiff + (changeDirection * newRelativeDiff) / nbRemovedParts;
          this.scrollToLeft(newLeft);
        }
      }
    }
  };

  private initializeMaxScrollValues = () => {
    const { virtualHeight, virtualWidth, width, height } = this.props;
    const hasHorizontalScrollBar = virtualWidth > width;
    const hasVerticalScrollBar = virtualHeight > height;
    const verticalScrollBar = hasVerticalScrollBar ? SCROLLBAR_SIZE : 0;
    const horizontalScrollBar = hasHorizontalScrollBar ? SCROLLBAR_SIZE : 0;
    // We calculate the maximum value of the scroll
    this.scrollTopMax = virtualHeight - height - 5 + horizontalScrollBar;
    // We calculate the maximum value of the scroll left
    this.scrollLeftMax = virtualWidth - width - 5 + verticalScrollBar;
  };

  public getScrollDirections = (): ScrollDirection[] => {
    if (this.scrollerContainer.current) {
      const { scrollTop, scrollLeft } = this.scrollerContainer.current;
      // Return the scroll direction value
      const directions = [];

      if (this.currentScrollTop > scrollTop) {
        directions.push(ScrollDirection.up);
      } else if (this.currentScrollTop < scrollTop) {
        directions.push(ScrollDirection.down);
      }

      if (this.currentScrollLeft > scrollLeft) {
        directions.push(ScrollDirection.left);
      } else if (this.currentScrollLeft < scrollLeft) {
        directions.push(ScrollDirection.right);
      }
      return directions;
    }
    return [];
  };

  public getScrollValues = (): IOnScroll => {
    const currentScrollContainer = this.scrollerContainer.current;
    const { scrollTop, scrollLeft } = currentScrollContainer ? this.scrollerContainer.current || defaultScroll : defaultScroll;
    return {
      directions: this.getScrollDirections(),
      scrollOrigin: this.scrollOrigin,
      maxTopReached: scrollTop <= 0,
      maxBottomReached: scrollTop >= this.scrollTopMax,
      maxLeftReached: scrollLeft <= 0,
      maxRightReached: scrollLeft >= this.scrollLeftMax,
      scrollTop,
      scrollLeft,
    };
  };

  private onContainerScroll = (): void => {
    const { onScroll } = this.props;
    const currentScrollContainer = this.scrollerContainer.current;
    const { scrollTop, scrollLeft } = currentScrollContainer ? this.scrollerContainer.current || defaultScroll : defaultScroll;
    onScroll(this.getScrollValues());
    // Initialize the current scroll's values
    this.currentScrollTop = scrollTop;
    this.currentScrollLeft = scrollLeft;
    // Initialize the scroll's origine to native
    this.scrollOrigin = ScrollOrigin.native;
  };

  public scrollToLeft = (scrollLeft: number) => {
    const { virtualWidth, width } = this.props;
    // We can scroll to left only if the virtualWidth is greater than the width
    if (virtualWidth > width && this.scrollerContainer.current) {
      let newScrollLeft = scrollLeft;
      if (newScrollLeft < 0) {
        newScrollLeft = 0;
      } else if (newScrollLeft > this.scrollLeftMax) {
        newScrollLeft = this.scrollLeftMax;
      }
      if (this.scrollerContainer.current.scrollLeft !== newScrollLeft) {
        this.scrollerContainer.current.scrollLeft = newScrollLeft;
        this.scrollOrigin = ScrollOrigin.external;
        return true;
      }
    }
    return false;
  };

  public scrollToTop = (scrollTop: number) => {
    const { virtualHeight, height } = this.props;
    // We can scroll to top only if the virtualHeight is greater than the height
    if (virtualHeight > height && this.scrollerContainer.current) {
      let newScrollTop = scrollTop;
      if (newScrollTop < 0) {
        newScrollTop = 0;
      } else if (newScrollTop > this.scrollTopMax) {
        newScrollTop = this.scrollTopMax;
      }
      if (this.scrollerContainer.current.scrollTop !== newScrollTop) {
        this.scrollerContainer.current.scrollTop = newScrollTop;
        this.scrollOrigin = ScrollOrigin.external;
        return true;
      }
    }
    return false;
  };

  public render() {
    const { virtualWidth, virtualHeight, width, height, children } = this.props;
    const newChildren = React.Children.map(children, (child) =>
      React.cloneElement(child as React.ReactElement<any>, {
        scrollToLeft: this.scrollToLeft,
        scrollToTop: this.scrollToTop,
      })
    );
    const hasHorizontalScrollBar = virtualWidth > width;
    const hasVerticalScrollBar = virtualHeight > height;
    // We still need a minimum dimension equal to SCROLLBAR_SIZE
    const minHeight = height || SCROLLBAR_SIZE;
    const minWidth = width || SCROLLBAR_SIZE;

    const verticalScrollBar = hasVerticalScrollBar ? SCROLLBAR_SIZE : 0;
    const horizontalScrollBar = hasHorizontalScrollBar ? SCROLLBAR_SIZE : 0;

    return (
      <div
        data-testid="scroller-container"
        className="scroller-container"
        ref={this.scrollerContainer}
        onScroll={this.onContainerScroll}
        style={{
          overflowX: hasHorizontalScrollBar ? "scroll" : "hidden",
          overflowY: hasVerticalScrollBar ? "scroll" : "hidden",
          maxHeight: minHeight,
          maxWidth: minWidth,
        }}
      >
        <div
          className="scroller-content"
          style={{
            minWidth: minWidth - verticalScrollBar,
            minHeight: minHeight - horizontalScrollBar,
          }}
        >
          {newChildren}
        </div>
        <div
          className="scroller-scrollbar"
          style={{
            minWidth: virtualWidth + verticalScrollBar,
            minHeight: virtualHeight + horizontalScrollBar - (hasVerticalScrollBar ? height : 0),
          }}
        />
      </div>
    );
  }
}

export default Scroller;
