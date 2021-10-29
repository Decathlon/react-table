// / <reference lib="es2017.string" />
import * as React from "react";

import { IElevateds, IOnScroll, Scroller } from ".";
import use2DVirtualizer, { I2DVirtualizerProps } from "./use2DVirtualizer";

export interface IRowsState {
  /** Indexes of the rows to be always displayed */
  visibleRowIndexes: number[];
  /** Indexes of the rows that need to appear "elevated" thanks to a shadow */
  elevatedRowIndexes: IElevateds;
}

export interface IColumnState {
  /** Indexes of the columns to be always displayed */
  visibleColumnIndexes: number[];
  /** Indexes of the columns that need to appear "elevated" thanks to a shadow */
  elevatedColumnIndexes: IElevateds;
}

interface IChildrenProps extends IRowsState, IColumnState {
  /**  The height of the cell of the grid */
  cellHeight: number;
  /**  The width of the cell of the grid */
  cellWidth: number;
}

export interface VirtualizerProps extends I2DVirtualizerProps {
  /** Children to display inside the virtualizer */
  children: (props: IChildrenProps) => JSX.Element;
}

const Virtualizer = (props: VirtualizerProps) => {
  const scroller = React.useRef<Scroller>();

  const getLeftScrollValue = scroller.current
    ? () => {
        const { scrollLeft } = scroller.current?.getScrollValues() as IOnScroll;
        return scrollLeft;
      }
    : undefined;

  const getTopScrollValue = scroller.current
    ? () => {
        const { scrollTop } = scroller.current?.getScrollValues() as IOnScroll;
        return scrollTop;
      }
    : undefined;

  const { horizontal, vertical } = use2DVirtualizer({
    horizontalVirtualizerProps: {
      ...props.horizontalVirtualizerProps,
      getScrollValue: getLeftScrollValue,
      scrollTo: scroller.current?.scrollToLeft,
    },
    verticalVirtualizerProps: {
      ...props.verticalVirtualizerProps,
      getScrollValue: getTopScrollValue,
      scrollTo: scroller.current?.scrollToTop,
    },
  });
  const onScroll = () => {
    // @TODO
  };
  const {
    children,
    horizontalVirtualizerProps: { containerSize: width, hiddenItems: hiddenColumns },
    verticalVirtualizerProps: { containerSize: height },
  } = props;
  return (
    <Scroller
      // @ts-ignore
      ref={scroller}
      width={width}
      height={height}
      virtualWidth={horizontal.virtualSize}
      virtualHeight={vertical.virtualSize}
      onScroll={onScroll}
      horizontalPartWidth={horizontal.itemSize}
      ignoredHorizontalParts={hiddenColumns}
    >
      {children({
        visibleColumnIndexes: horizontal.visibleItemIndexes,
        visibleRowIndexes: vertical.visibleItemIndexes,
        elevatedColumnIndexes: horizontal.elevatedItemIndexes,
        elevatedRowIndexes: vertical.elevatedItemIndexes,
        cellHeight: vertical.itemSize,
        cellWidth: horizontal.itemSize,
      })}
    </Scroller>
  );
};

export default Virtualizer;
