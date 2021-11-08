import * as React from "react";

import { SCROLLBAR_SIZE } from "./useScroller";

export interface IVirtualScrollerProps {
  /** The global content width */
  virtualWidth: number;
  /**  The global content height */
  virtualHeight: number;
  /**  The width of the visible window */
  width: number;
  /**  The height of the visible window */
  height: number;
  children?: JSX.Element;
  onScroll: React.UIEventHandler;
}

function VirtualScroller(
  { virtualWidth, virtualHeight, width, height, children, onScroll }: IVirtualScrollerProps,
  ref: React.ForwardedRef<HTMLDivElement>
): JSX.Element {
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
      ref={ref}
      onScroll={onScroll}
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
        {children}
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

export default React.forwardRef<HTMLDivElement, IVirtualScrollerProps>(VirtualScroller);
