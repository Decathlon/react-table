// / <reference lib="es2017.string" />
import * as React from "react";

import { getFixedElementsWithCustomSize, IColumns, IRow } from "../components";
import useScroller, { ScrollValues, SCROLLBAR_SIZE, IScrollerController } from "./useScroller";
import useVirtualizer, { IVirtualizerProps, IVirtualizerController } from "./useVirtualizer";

export interface VirtualizerProps {
  /**  The size of the visible window */
  columnsVirtualizerProps: IVirtualizerProps;
  /** Number of items of the child element */
  rowsVirtualizerProps: IVirtualizerProps;
  /** All rows constituting the grid */
  rows: IRow[];
  /** Options to customize any columns, such as size or align */
  columns?: IColumns;
}

export interface IVirtualizedGridController {
  scroller: IScrollerController;
  rowsVirtualizer: IVirtualizerController;
  columnsVirtualizer: IVirtualizerController;
  virtualScroller: React.RefObject<HTMLDivElement>;
}

function useVirtializedGrid(
  { rows, columns, columnsVirtualizerProps, rowsVirtualizerProps }: VirtualizerProps,
  ref?: React.RefObject<IVirtualizedGridController>
): IVirtualizedGridController {
  const [hasScrollBar, setHasScrollBar] = React.useState({ horizontal: true, vertical: true });
  const virtualScroller = React.useRef<HTMLDivElement>(null);
  const scrollController = React.useRef<IScrollerController>(null);
  const columnsController = React.useRef<IVirtualizerController>(null);
  const { containerSize: width, fixedItems: fixedColumns, hiddenItems: hiddenColumns } = columnsVirtualizerProps;
  const { fixedItems: fixedRows, hiddenItems: hiddenRows, containerSize: height } = rowsVirtualizerProps;

  const horizontalPadding = (columnsVirtualizerProps.padding || 0) + (hasScrollBar.horizontal ? SCROLLBAR_SIZE : 0);
  const verticalPadding = (rowsVirtualizerProps.padding || 0) + (hasScrollBar.vertical ? SCROLLBAR_SIZE : 0);

  const initialFixedCellsWidth = React.useMemo(() => getFixedElementsWithCustomSize(columns, fixedColumns, hiddenColumns), []);
  const initialFixedCellsHeight = React.useMemo(() => getFixedElementsWithCustomSize(rows, fixedRows, hiddenRows), []);
  const cache = React.useRef({ fixedCellsWidth: initialFixedCellsWidth, fixedCellsHeight: initialFixedCellsHeight });

  React.useEffect(() => {
    cache.current.fixedCellsWidth = getFixedElementsWithCustomSize(columns, fixedColumns, hiddenColumns);
  }, [columns, fixedColumns, hiddenColumns]);

  React.useEffect(() => {
    cache.current.fixedCellsHeight = getFixedElementsWithCustomSize(rows, fixedRows, hiddenRows);
  }, [fixedRows, hiddenRows, rows]);

  const getLeftScrollValue = React.useCallback(() => {
    if (scrollController.current) {
      const { scrollValue } = scrollController.current.getHorizontalScrollValues() as ScrollValues;
      return scrollValue;
    }
    return null;
  }, []);

  const getTopScrollValue = React.useCallback(() => {
    if (scrollController.current) {
      const { scrollValue } = scrollController.current.getVerticalScrollValues() as ScrollValues;
      return scrollValue;
    }
    return null;
  }, []);

  const scrollToLeftRef = React.useCallback((newScrollValue: number) => {
    if (scrollController.current) {
      return scrollController.current.scrollToLeft(newScrollValue);
    }
    return false;
  }, []);

  const scrollToTopRef = React.useCallback((newScrollValue: number) => {
    if (scrollController.current) {
      return scrollController.current.scrollToTop(newScrollValue);
    }
    return false;
  }, []);

  const columnsVirtualizer = useVirtualizer(
    {
      ...columnsVirtualizerProps,
      fixedItemsSize: cache.current.fixedCellsWidth,
      getScrollValue: getLeftScrollValue,
      scrollTo: scrollToLeftRef,
      padding: horizontalPadding,
    },
    columnsController
  );

  const rowsVirtualizer = useVirtualizer({
    ...rowsVirtualizerProps,
    fixedItemsSize: cache.current.fixedCellsHeight,
    getScrollValue: getTopScrollValue,
    scrollTo: scrollToTopRef,
    padding: verticalPadding,
  });

  const scroller = useScroller(
    {
      containerScrollRef: virtualScroller,
      width,
      height,
      virtualWidth: columnsVirtualizer.virtualSize,
      virtualHeight: rowsVirtualizer.virtualSize,
      horizontalPartWidth: columnsVirtualizer.itemSize,
      ignoredHorizontalParts: hiddenColumns,
      onHorizontalScroll: columnsVirtualizer.updateVisibleItems,
      onVerticalScroll: rowsVirtualizer.updateVisibleItems,
    },
    scrollController
  );

  React.useEffect(() => {
    const newHasHorizontalScrollBar = columnsVirtualizer.virtualSize > columnsVirtualizerProps.containerSize;
    const newHasVerticalScrollBar = rowsVirtualizer.virtualSize > rowsVirtualizerProps.containerSize;
    if (newHasHorizontalScrollBar !== hasScrollBar.horizontal || newHasVerticalScrollBar !== hasScrollBar.vertical) {
      setHasScrollBar({ horizontal: newHasHorizontalScrollBar, vertical: newHasVerticalScrollBar });
    }
  }, [
    hasScrollBar,
    rowsVirtualizer.virtualSize,
    columnsVirtualizer.virtualSize,
    columnsVirtualizerProps.containerSize,
    rowsVirtualizerProps.containerSize,
  ]);

  const virtualizedGridController: IVirtualizedGridController = {
    scroller,
    rowsVirtualizer,
    columnsVirtualizer,
    virtualScroller,
  };

  React.useImperativeHandle(ref, () => virtualizedGridController);

  return virtualizedGridController;
}

export default useVirtializedGrid;
