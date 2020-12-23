// / <reference lib="es2017.string" />
import * as React from "react";
import * as ReactDOM from "react-dom";

import Scroller, { IOnScroll } from "./scroller";
import useHorizontalVirtualizer, { IHorizontalVirtualizerProps } from "./useHorizontalVirtualizer";
import useVerticalVirtualizer, { IVerticalVirtualizerProps } from "./useVerticalVirtualizer";

interface IChildrenProps {
  /**  The height of the cell of the grid */
  visibleColumnIndexes: number[] | undefined;
  visibleRowIndexes: number[] | undefined;
  /**  The height of the cell of the grid */
  cellHeight: number | undefined;
  /**  The width of the cell of the grid */
  cellWidth: number | undefined;
}

interface IProps {
  horizontalProps: Omit<IHorizontalVirtualizerProps, "scroller">;
  verticalProps: Omit<IVerticalVirtualizerProps, "scroller">;
  /** Children to display inside the virtualizer */
  children: (props: IChildrenProps) => JSX.Element;
}

const Virtualizer: React.FunctionComponent<IProps> = props => {
  const { children, horizontalProps, verticalProps } = props;
  const scroller = React.useRef<Scroller>(null);

  const { scrollToLeft, horizontalVirtualizerProps, visibleHorizontalItemsIndexes } = useHorizontalVirtualizer({
    ...horizontalProps,
    scroller: scroller.current
  });

  const { scrollToTop, verticalVirtualizerProps, visibleVerticalItemsIndexes } = useVerticalVirtualizer({
    ...verticalProps,
    scroller: scroller.current
  });

  const onScroll = React.useCallback(
    (scrollProps: IOnScroll) => {
      ReactDOM.unstable_batchedUpdates(() => {
        scrollToLeft(scrollProps);
        scrollToTop(scrollProps);
      });
    },
    [scrollToLeft]
  );

  return (
    <Scroller
      ref={scroller}
      width={horizontalVirtualizerProps?.size || 0}
      virtualWidth={horizontalVirtualizerProps?.virtualSize || 0}
      horizontalPartWidth={horizontalVirtualizerProps?.itemSize}
      ignoredHorizontalParts={horizontalProps.hiddenItemsIndexes}
      onScroll={onScroll}
      height={verticalVirtualizerProps?.size || 0}
      virtualHeight={verticalVirtualizerProps?.virtualSize || 0}
    >
      {children({
        visibleColumnIndexes: visibleHorizontalItemsIndexes,
        visibleRowIndexes: visibleVerticalItemsIndexes,
        cellHeight: verticalVirtualizerProps?.itemSize,
        cellWidth: horizontalVirtualizerProps?.itemSize
      })}
    </Scroller>
  );
};

export default Virtualizer;
