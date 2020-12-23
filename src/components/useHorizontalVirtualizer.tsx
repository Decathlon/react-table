// / <reference lib="es2017.string" />
import * as React from "react";

import { Nullable } from ".";
import Scroller, { HORIZONTAL_SCROLL_DIRECTIONS, IOnScroll } from "./scroller";
import useVirtualizer, { IComputedVirtualizerProps, IVirtualizerProps } from "./useVirtualizer";

export interface IHorizontalVirtualizerProps extends IVirtualizerProps {
  scroller: Nullable<Scroller>;
  /** Initial scroll postions */
  initialScrollItemIndex?: number;
}

export interface IUseHorizontalVirtualizer {
  scrollToLeft: (scrollProps: IOnScroll) => void;
  visibleHorizontalItemsIndexes?: number[];
  horizontalVirtualizerProps?: IComputedVirtualizerProps;
}

const useHorizontalVirtualizer = (props: IHorizontalVirtualizerProps): IUseHorizontalVirtualizer => {
  const { initialScrollItemIndex, scroller, ...others } = props;
  const isScrollInitialized = React.useRef(false);
  const { scrollTo, itemIndexToScrollCursor, visibleItemsIndexes, virtualizerProps } = useVirtualizer(others);

  React.useEffect(() => {
    if (!isScrollInitialized.current && scroller && initialScrollItemIndex && initialScrollItemIndex >= 0) {
      const scrollCursor = itemIndexToScrollCursor(initialScrollItemIndex);
      scroller.scrollToLeft(scrollCursor);
      isScrollInitialized.current = true;
    }
  }, [scroller]);

  const scrollToLeft = React.useCallback(
    ({ scrollLeft, directions }: IOnScroll) => {
      const hasHorizontalyScrolled = HORIZONTAL_SCROLL_DIRECTIONS.some(direction => directions.includes(direction));
      if (hasHorizontalyScrolled) {
        scrollTo(scrollLeft);
      }
    },
    [scrollTo]
  );

  return {
    scrollToLeft,
    horizontalVirtualizerProps: virtualizerProps,
    visibleHorizontalItemsIndexes: visibleItemsIndexes
  };
};

export default useHorizontalVirtualizer;
