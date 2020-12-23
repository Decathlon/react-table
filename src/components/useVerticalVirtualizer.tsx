// / <reference lib="es2017.string" />
import * as React from "react";

import { Nullable } from ".";
import Scroller, { IOnScroll, VERTICAL_SCROLL_DIRECTIONS } from "./scroller";
import useVirtualizer, { IComputedVirtualizerProps, IVirtualizerProps } from "./useVirtualizer";

export interface IVerticalVirtualizerProps extends IVirtualizerProps {
  scroller: Nullable<Scroller>;
  /** Initial scroll postions */
  initialScrollItemIndex?: number;
}

export interface IUseHorizontalVirtualizer {
  scrollToTop: (scrollProps: IOnScroll) => void;
  visibleVerticalItemsIndexes?: number[];
  verticalVirtualizerProps?: IComputedVirtualizerProps;
}

const useVerticalVirtualizer = (props: IVerticalVirtualizerProps): IUseHorizontalVirtualizer => {
  const { initialScrollItemIndex, scroller, ...others } = props;
  const isScrollInitialized = React.useRef(false);
  const { scrollTo, itemIndexToScrollCursor, visibleItemsIndexes, virtualizerProps } = useVirtualizer(others);

  React.useEffect(() => {
    if (!isScrollInitialized.current && scroller && initialScrollItemIndex && initialScrollItemIndex >= 0) {
      const scrollCursor = itemIndexToScrollCursor(initialScrollItemIndex);
      scroller.scrollToTop(scrollCursor);
      isScrollInitialized.current = true;
    }
  }, [scroller]);

  const scrollToTop = React.useCallback(
    ({ scrollTop, directions }: IOnScroll) => {
      const hasVerticalScrolled = VERTICAL_SCROLL_DIRECTIONS.some(direction => directions.includes(direction));
      if (hasVerticalScrolled) {
        scrollTo(scrollTop);
      }
    },
    [scrollTo]
  );

  return {
    scrollToTop,
    verticalVirtualizerProps: virtualizerProps,
    visibleVerticalItemsIndexes: visibleItemsIndexes
  };
};

export default useVerticalVirtualizer;
