// / <reference lib="es2017.string" />
import * as React from "react";

import { IElevateds } from "../components";
import VirtualScroller from "./VirtualScroller";
import useVirtializedGrid, { IVirtualizedGridController, VirtualizerProps as UseVirtualizerProps } from "./useVirtializedGrid";

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

export interface VirtualizerProps extends UseVirtualizerProps {
  /** Children to display inside the virtualizer */
  children: (props: IChildrenProps) => JSX.Element;
}

function VirtializedGrid({
  children,
  rows,
  columns,
  columnsVirtualizerProps,
  rowsVirtualizerProps,
}: VirtualizerProps): JSX.Element {
  const virtualizedGridController = React.useRef<IVirtualizedGridController>(null);

  const { virtualScroller, columnsVirtualizer, rowsVirtualizer, scroller } = useVirtializedGrid(
    {
      rows,
      columns,
      columnsVirtualizerProps,
      rowsVirtualizerProps,
    },
    virtualizedGridController
  );

  const { containerSize: width } = columnsVirtualizerProps;
  const { containerSize: height } = rowsVirtualizerProps;

  return (
    <VirtualScroller
      ref={virtualScroller}
      width={width}
      height={height}
      virtualWidth={columnsVirtualizer.virtualSize}
      virtualHeight={rowsVirtualizer.virtualSize}
      onScroll={scroller.handleContainerScroll}
    >
      {children({
        visibleColumnIndexes: columnsVirtualizer.visibleItemIndexes,
        visibleRowIndexes: rowsVirtualizer.visibleItemIndexes,
        elevatedColumnIndexes: columnsVirtualizer.elevatedItemIndexes,
        elevatedRowIndexes: rowsVirtualizer.elevatedItemIndexes,
        cellHeight: rowsVirtualizer.itemSize,
        cellWidth: columnsVirtualizer.itemSize,
      })}
    </VirtualScroller>
  );
}

export default VirtializedGrid;
