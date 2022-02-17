// / <reference lib="es2017.string" />
import * as React from "react";

import { ElementaryTable, getDenseColumns, IColumnOptions, IElevateds, IRowOptions, ITrees } from "../components";
import VirtualScroller from "./VirtualScroller";
import useVirtializedGrid, { IVirtualizedGridController, VirtualizerProps as UseVirtualizerProps } from "./useVirtializedGrid";
import useTable from "./useTable";

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
  id: string;
  /** A list of branches to initialize opened rows and sub rows */
  initialOpenedTrees: ITrees;
  globalRowProps?: IRowOptions;
  /** Options to customize any column, such as size */
  globalColumnProps?: IColumnOptions;
  /** Children to display inside the virtualizer */
  children: (props: IChildrenProps) => JSX.Element;
}

function VirtializedTable<IDataCoordinates = any>({
  id,
  rows,
  columns,
  initialOpenedTrees,
  columnsVirtualizerProps,
  rowsVirtualizerProps,
  globalRowProps,
  globalColumnProps,
}: VirtualizerProps): JSX.Element {
  const virtualizedGridController = React.useRef<IVirtualizedGridController>(null);

  const goToColumnIndex = React.useCallback((itemIndex: number) => {
    if (virtualizedGridController.current?.columnsVirtualizer) {
      return virtualizedGridController.current.columnsVirtualizer.goToItemIndex(itemIndex);
    }
    return false;
  }, []);

  const table = useTable<IDataCoordinates>({
    rows,
    initialOpenedTrees,
    globalRowProps,
    fixedRows: rowsVirtualizerProps.fixedItems,
    goToColumnIndex,
  });

  const { virtualScroller, columnsVirtualizer, rowsVirtualizer, scroller } = useVirtializedGrid(
    {
      rows,
      columns,
      columnsVirtualizerProps: { ...columnsVirtualizerProps, itemsLength: table.columnsLength },
      rowsVirtualizerProps: { ...rowsVirtualizerProps, itemsLength: table.rowsLength },
    },
    virtualizedGridController
  );

  const {
    containerSize: width,
    fixedItemsSize: fixedCellsWidth = {
      sum: 0,
      count: 0,
      customSizes: {},
    },
  } = columnsVirtualizerProps;
  const { containerSize: height } = rowsVirtualizerProps;

  const rowsProps = React.useMemo(
    () => (rowsVirtualizer.itemSize ? table.getRowsProps(rowsVirtualizer.itemSize) : globalRowProps),
    [rowsVirtualizer.itemSize, globalRowProps]
  );

  const columnsProps = React.useMemo(
    () => (columnsVirtualizer.itemSize ? table.getColumnsProps(columnsVirtualizer.itemSize) : globalColumnProps),
    [columnsVirtualizer.itemSize, globalColumnProps]
  );

  const tableWidth =
    fixedCellsWidth.sum + (columnsVirtualizer.visibleItemIndexes.length - fixedCellsWidth.count) * columnsVirtualizer.itemSize;
  const denseColumns = getDenseColumns(tableWidth, width, table.columnsLength, columns);
  console.log(columnsVirtualizer.visibleItemIndexes);

  return (
    <VirtualScroller
      ref={virtualScroller}
      width={width}
      height={height}
      virtualWidth={columnsVirtualizer.virtualSize}
      virtualHeight={rowsVirtualizer.virtualSize}
      onScroll={scroller.handleContainerScroll}
    >
      <ElementaryTable
        id={id}
        rows={rows}
        columns={denseColumns}
        visibleColumnIndexes={columnsVirtualizer.visibleItemIndexes}
        visibleRowIndexes={rowsVirtualizer.visibleItemIndexes}
        fixedRowsIndexes={table.fixedRowsIndexes}
        globalRowProps={rowsProps}
        globalColumnProps={columnsProps}
        elevatedColumnIndexes={columnsVirtualizer.elevatedItemIndexes}
        elevatedRowIndexes={rowsVirtualizer.elevatedItemIndexes}
        onRowOpen={table.onRowOpen}
        onRowClose={table.onRowClose}
        indexesMapping={table.indexesMapping}
        openedTrees={table.openedTrees}
      />
    </VirtualScroller>
  );
}

export default VirtializedTable;
