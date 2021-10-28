// / <reference lib="es2017.string" />
import * as React from "react";
import { isEqual } from "lodash";

import Scroller, { IOnScroll, VERTICAL_SCROLL_DIRECTIONS, HORIZONTAL_SCROLL_DIRECTIONS, SCROLLBAR_SIZE } from "./scroller";
import {
  addSequentialIndexesToFixedIndexList,
  getElevatedIndexes,
  getVisibleIndexesInsideDatalength,
  IElevateds,
  scrollIndexToGridIndex,
  findFirstNotIncluded,
  getFixedItemsCountBeforeSelectedItemIndex,
  FixedCustomSizesElements,
  getIndexScrollMapping,
} from "./utils/table";
import { DEFAULT_ROW_HEIGHT, MIN_COLUMN_WIDTH } from "./constants";
import { Nullable } from "./typing";

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

export interface OnVerticallyScrollProps {
  scrollValues: IOnScroll;
  newRowsState: Nullable<IRowsState>;
  rowsCursor: number;
}

export interface OnHorizontallyScrollProps {
  scrollValues: IOnScroll;
  newColumnsState: Nullable<IColumnState>;
  columnsCursor: number;
}

export interface OnScrollProps extends OnVerticallyScrollProps, OnHorizontallyScrollProps {}

interface IChildrenProps extends IRowsState, IColumnState {
  /**  The height of the cell of the grid */
  cellHeight: number;
  /**  The width of the cell of the grid */
  cellWidth: number;
}

export interface IVirtualizerOptionalProps {
  /** List of fixed columns on the left or right of your table */
  fixedColumns: number[];
  /** List of fixed rows on the top or bottom of your table */
  fixedRows: number[];
  /** Number of rows that should be visible on screen */
  rowsCount?: number;
  /** Number of columns that should be visible on screen */
  columnsCount?: number;
  /** Minimal width of a column */
  minColumnWidth?: number;
  /** Minimal height of a row */
  minRowHeight?: number;
  /** Sum of the height of fixed rows with a pre-defined height */
  fixedCellsHeight: FixedCustomSizesElements;
  /** Sum of the width of fixed columns with a pre-defined width */
  fixedCellsWidth: FixedCustomSizesElements;
  /** A pre-defined vertical padding of the grid */
  verticalPadding: number;
  /** A pre-defined horizontal padding of the grid */
  horizontalPadding: number;
  /** The scroll handler */
  onScroll?: (props: OnScrollProps) => void;
  /** The vertically scroll handler */
  onVerticallyScroll?: (props: OnVerticallyScrollProps) => void;
  /** The horizontally scroll handler */
  onHorizontallyScroll?: (props: OnHorizontallyScrollProps) => void;
  /** Initial scroll postions */
  initialScroll: {
    columnIndex?: number;
    rowIndex?: number;
  };
  /** Specifies indexes of the columns to be shown */
  hiddenColumns: number[];
  /** Specifies indexes of the rows to be shown */
  hiddenRows: number[];
}

export interface IVirtualizerProps extends IVirtualizerOptionalProps {
  /**  The width of the visible window */
  width: number;
  /**  The height of the visible window */
  height: number;
  /** Number of columns of the child element */
  columnsLength: number;
  /** Number of rows of the child element */
  rowsLength: number;
  /** Children to display inside the virtualizer */
  children: (props: IChildrenProps) => JSX.Element;
}

interface VirtualizerCache {
  rowIndexesScrollMapping: number[];
  columnIndexesScrollMapping: number[];
  visibleColumnIndexes: Record<number, number[]>;
  visibleRowIndexes: Record<number, number[]>;
}

interface IState extends IRowsState, IColumnState {}

class Virtualizer extends React.Component<IVirtualizerProps, IState> {
  public static defaultProps = {
    fixedColumns: [],
    fixedRows: [],
    fixedCellsHeight: {
      sum: 0,
      count: 0,
    },
    fixedCellsWidth: {
      sum: 0,
      count: 0,
    },
    horizontalPadding: 0,
    verticalPadding: 0,
    initialScroll: {},
    hiddenRows: [],
    hiddenColumns: [],
  };

  private rowsCount = 0;

  private columnsCount = 0;

  private cellHeight = 0;

  private cellWidth = 0;

  private virtualWidth = 0;

  private virtualHeight = 0;

  private visibleFixedColumns: number[] = [];

  private visibleFixedRows: number[] = [];

  private scroller: React.RefObject<Scroller> = React.createRef<Scroller>();

  private cache: VirtualizerCache = {
    rowIndexesScrollMapping: [],
    columnIndexesScrollMapping: [],
    visibleColumnIndexes: {},
    visibleRowIndexes: {},
  };

  public constructor(props: IVirtualizerProps) {
    super(props);
    this.initializeGridProps();
    this.initCache();
    const visibleColumnIndexes = this.getVisibleColumnIndexes();
    const visibleRowIndexes = this.getVisibleRowIndexes();
    this.state = {
      visibleRowIndexes,
      visibleColumnIndexes,
      elevatedColumnIndexes: this.getElevatedColumnIndexes(visibleColumnIndexes),
      elevatedRowIndexes: this.getElevatedRowIndexes(visibleRowIndexes),
    };
  }

  public componentDidMount() {
    const {
      initialScroll: { columnIndex, rowIndex },
    } = this.props;
    if (columnIndex && columnIndex >= 0) {
      this.scrollToColumnIndex(columnIndex);
    }
    if (rowIndex && rowIndex >= 0) {
      this.scrollToRowIndex(rowIndex);
    }
  }

  public componentDidUpdate(prevProps: IVirtualizerProps) {
    const {
      height,
      width,
      rowsCount,
      columnsCount,
      fixedRows,
      fixedColumns,
      columnsLength,
      rowsLength,
      hiddenColumns,
      hiddenRows,
      minColumnWidth,
      minRowHeight,
    } = this.props;

    if (
      this.scroller.current &&
      // TODO shallowEqual
      (prevProps.rowsLength !== rowsLength ||
        prevProps.columnsLength !== columnsLength ||
        prevProps.height !== height ||
        prevProps.width !== width ||
        prevProps.minColumnWidth !== minColumnWidth ||
        prevProps.minRowHeight !== minRowHeight ||
        prevProps.rowsCount !== rowsCount ||
        prevProps.columnsCount !== columnsCount ||
        !isEqual(prevProps.fixedRows, fixedRows) ||
        !isEqual(prevProps.fixedColumns, fixedColumns) ||
        !isEqual(prevProps.hiddenColumns, hiddenColumns) ||
        // TODO we need to scroll to keep the first unfixed row visible
        !isEqual(prevProps.hiddenRows, hiddenRows))
    ) {
      const { scrollTop, scrollLeft } = this.scroller.current.getScrollValues();
      this.initializeGridProps();
      this.initCache();
      const newColumnsState = this.getVisibleColumnsState(scrollLeft) || {};
      const newRowsState = this.getVisibleRowsState(scrollTop) || {};
      this.setState({ ...newRowsState, ...newColumnsState });
    }
  }

  private initCache = () => {
    const { columnsLength, rowsLength, fixedCellsHeight, fixedCellsWidth, hiddenColumns, hiddenRows } = this.props;
    this.cache.rowIndexesScrollMapping = getIndexScrollMapping(
      rowsLength,
      fixedCellsHeight.customSizes,
      this.cellHeight,
      hiddenRows
    );
    this.cache.columnIndexesScrollMapping = getIndexScrollMapping(
      columnsLength,
      fixedCellsWidth.customSizes,
      this.cellWidth,
      hiddenColumns
    );
    this.cache.visibleColumnIndexes = {};
    this.cache.visibleRowIndexes = {};
  };

  private initializeGridProps = () => {
    const {
      height,
      width,
      rowsCount,
      columnsCount,
      columnsLength,
      rowsLength,
      minRowHeight,
      minColumnWidth,
      fixedCellsHeight,
      fixedCellsWidth,
      horizontalPadding,
      verticalPadding,
      fixedColumns,
      hiddenColumns,
      fixedRows,
      hiddenRows,
    } = this.props;
    const minCellHeight = minRowHeight || DEFAULT_ROW_HEIGHT;
    const minCellWidth = minColumnWidth || MIN_COLUMN_WIDTH;

    /** Height allocated to the horizontalPadding and the fixed rows that have a custom height specified by the user */
    let extraCellsHeight = fixedCellsHeight.sum + horizontalPadding;
    /** Width allocated to the verticalPadding and the fixed columns that have a custom width specified by the user */
    let extraCellsWidth = fixedCellsWidth.sum + verticalPadding;

    /** Available height on the table container displayable height */
    let scrollableRowsHeight = height - extraCellsHeight;
    /** Available width on the table container displayable width */
    let scrollableColumnsWidth = width - extraCellsWidth;

    this.visibleFixedRows = fixedRows.filter((fixedRow) => !hiddenRows.includes(fixedRow));
    this.visibleFixedColumns = fixedColumns.filter((fixedColumn) => !hiddenColumns.includes(fixedColumn));

    /**
     * contains every columns that are not hidden
     */
    const scrollableColumnsCount = columnsLength - hiddenColumns.length;
    /**
     * contains every rows that are not hidden
     */
    const scrollableRowsCount = rowsLength - hiddenRows.length;

    /** the total number of rows we have to display inside the table height */
    this.rowsCount =
      rowsCount !== undefined ? rowsCount : Math.floor(scrollableRowsHeight / minCellHeight + fixedCellsHeight.count);
    /** the total number of columns we have to display inside the table width */
    this.columnsCount =
      columnsCount !== undefined ? columnsCount : Math.floor(scrollableColumnsWidth / minCellWidth + fixedCellsWidth.count);

    if (this.rowsCount < rowsLength) {
      scrollableRowsHeight = scrollableRowsHeight - SCROLLBAR_SIZE;
      extraCellsHeight = extraCellsHeight + SCROLLBAR_SIZE;
      /** the total number of rows we have to display inside the table height */
      this.rowsCount =
        rowsCount !== undefined ? rowsCount : Math.floor(scrollableRowsHeight / minCellHeight + fixedCellsHeight.count);
    }
    if (this.columnsCount < columnsLength) {
      scrollableColumnsWidth = scrollableColumnsWidth - SCROLLBAR_SIZE;
      extraCellsWidth = extraCellsWidth + SCROLLBAR_SIZE;
      /** the total number of columns we have to display inside the table width */
      this.columnsCount =
        columnsCount !== undefined ? columnsCount : Math.floor(scrollableColumnsWidth / minCellWidth + fixedCellsWidth.count);
    }

    /** Cells heights for the rows without manual specified height */
    this.cellHeight = this.rowsCount > 0 ? Math.ceil(scrollableRowsHeight / (this.rowsCount - fixedCellsHeight.count)) : 0;
    /** Cells width for the columns without manual specified width */
    this.cellWidth = this.columnsCount > 0 ? Math.ceil(scrollableColumnsWidth / (this.columnsCount - fixedCellsWidth.count)) : 0;

    /** The width of the table if all columns are displayed */
    this.virtualWidth = (scrollableColumnsCount - fixedCellsWidth.count) * this.cellWidth + extraCellsWidth;
    /** The height of the table if all rows are displayed */
    this.virtualHeight = (scrollableRowsCount - fixedCellsHeight.count) * this.cellHeight + extraCellsHeight;
  };

  private getVisibleRowIndexes = (scrollTop = 0) => {
    const { rowsLength, hiddenRows, fixedRows } = this.props;
    let fixedRowsCount = fixedRows.findIndex((r) => this.cache.rowIndexesScrollMapping[r] >= scrollTop);
    fixedRowsCount = fixedRowsCount === -1 ? fixedRows.length : fixedRowsCount;
    const scrollIndex = Math.round(scrollTop / this.cellHeight) + fixedRowsCount;
    const rowIndexStart = scrollIndexToGridIndex(scrollIndex, hiddenRows);

    if (!this.cache.visibleRowIndexes[rowIndexStart]) {
      this.cache.visibleRowIndexes[rowIndexStart] = addSequentialIndexesToFixedIndexList(
        this.visibleFixedRows,
        rowIndexStart,
        rowsLength,
        this.rowsCount,
        hiddenRows
      );
      return this.cache.visibleRowIndexes[rowIndexStart];
    }

    return this.cache.visibleRowIndexes[rowIndexStart];
  };

  private getVisibleColumnIndexes = (scrollLeft = 0) => {
    const { columnsLength, hiddenColumns, fixedColumns } = this.props;
    let fixedColumnsCount = fixedColumns.findIndex((r) => this.cache.columnIndexesScrollMapping[r] >= scrollLeft);
    fixedColumnsCount = fixedColumnsCount === -1 ? fixedColumns.length : fixedColumnsCount;
    const scrollIndex = Math.round(scrollLeft / this.cellWidth) + fixedColumnsCount;
    const columnIndexStart = scrollIndexToGridIndex(scrollIndex, hiddenColumns);

    if (!this.cache.visibleColumnIndexes[columnIndexStart]) {
      this.cache.visibleColumnIndexes[columnIndexStart] = addSequentialIndexesToFixedIndexList(
        this.visibleFixedColumns,
        columnIndexStart,
        columnsLength,
        this.columnsCount,
        hiddenColumns
      );
      return this.cache.visibleColumnIndexes[columnIndexStart];
    }

    return this.cache.visibleColumnIndexes[columnIndexStart];
  };

  private getElevatedColumnIndexes = (visibleColumnIndexes: number[]): IElevateds => {
    const { fixedColumns } = this.props;
    const { elevatedColumnIndexes } = this.state || {
      elevatedColumnIndexes: {},
    };
    const newElevatedColumnIndexes = getElevatedIndexes(visibleColumnIndexes, fixedColumns, true);
    if (!isEqual(elevatedColumnIndexes, newElevatedColumnIndexes)) {
      return newElevatedColumnIndexes;
    }
    return elevatedColumnIndexes;
  };

  private getElevatedRowIndexes = (visibleRowIndexes: number[]): IElevateds => {
    const { fixedRows } = this.props;
    const { elevatedRowIndexes } = this.state || { elevatedRowIndexes: {} };
    const newElevatedRowIndexes = getElevatedIndexes(visibleRowIndexes, fixedRows);
    // We are only returning newElevatedRowIndexes if not equal to elevatedRowIndexes to
    // keep the table reference in the other case in order to avoid useless re-renders
    if (!isEqual(elevatedRowIndexes, newElevatedRowIndexes)) {
      return newElevatedRowIndexes;
    }
    return elevatedRowIndexes;
  };

  private getVisibleRowsState = (scrollTop = 0): IRowsState | null => {
    const { visibleRowIndexes } = this.state;
    const newVisibleRowIndexes = this.getVisibleRowIndexes(scrollTop);
    let rowState = null;
    if (!isEqual(newVisibleRowIndexes, visibleRowIndexes)) {
      rowState = {
        visibleRowIndexes: newVisibleRowIndexes,
        elevatedRowIndexes: this.getElevatedRowIndexes(newVisibleRowIndexes),
      };
    }
    return rowState;
  };

  private getVisibleColumnsState = (scrollLeft = 0): IColumnState | null => {
    const { visibleColumnIndexes } = this.state;
    const newVisibleColumnIndexes = this.getVisibleColumnIndexes(scrollLeft);
    let columnState = null;
    if (!isEqual(newVisibleColumnIndexes, visibleColumnIndexes)) {
      columnState = {
        visibleColumnIndexes: newVisibleColumnIndexes,
        elevatedColumnIndexes: this.getElevatedColumnIndexes(newVisibleColumnIndexes),
      };
    }
    return columnState;
  };

  private onScroll = (scrollValues: IOnScroll) => {
    const { scrollTop, scrollLeft, directions } = scrollValues;
    const { onScroll, onHorizontallyScroll, onVerticallyScroll } = this.props;

    /**
     * If it is a vertical scroll, we only update the visible rows,
     * otherwise we update the visible columns
     * */
    const hasVerticallyScrolled = VERTICAL_SCROLL_DIRECTIONS.some((direction) => directions.includes(direction));
    const hasHorizontalyScrolled = HORIZONTAL_SCROLL_DIRECTIONS.some((direction) => directions.includes(direction));

    const newRowsState = hasVerticallyScrolled ? this.getVisibleRowsState(scrollTop) : null;
    const newColumnsState = hasHorizontalyScrolled ? this.getVisibleColumnsState(scrollLeft) : null;

    const handleOnScroll = (): void => {
      if (onScroll || onHorizontallyScroll || onVerticallyScroll) {
        const { visibleColumnIndexes, visibleRowIndexes } = this.state;
        const columnsCursor = findFirstNotIncluded(visibleColumnIndexes, this.visibleFixedColumns);
        const rowsCursor = findFirstNotIncluded(visibleRowIndexes, this.visibleFixedRows);

        if (onScroll) {
          onScroll({
            scrollValues,
            newColumnsState,
            newRowsState,
            columnsCursor,
            rowsCursor,
          });
        }
        if (onHorizontallyScroll) {
          onHorizontallyScroll({
            scrollValues,
            newColumnsState,
            columnsCursor,
          });
        }
        if (onVerticallyScroll) {
          onVerticallyScroll({ scrollValues, newRowsState, rowsCursor });
        }
      }
    };

    if (newRowsState || newColumnsState) {
      // @ts-ignore
      this.setState({ ...newRowsState, ...newColumnsState }, handleOnScroll);
    } else {
      handleOnScroll();
    }
  };

  private scrollToItemIndex = (
    itemIndex: number,
    hiddenItems: number[],
    fixedItems: number[],
    cellSize: number,
    sizes: FixedCustomSizesElements["customSizes"]
  ): number | null => {
    if (this.scroller.current) {
      const nbOfHiddenIndexesBeforeStartIndex = hiddenItems.filter((hiddenIndex) => hiddenIndex <= itemIndex).length;
      const beforeFixedItemsCount = getFixedItemsCountBeforeSelectedItemIndex(fixedItems, itemIndex);
      const selectedItemSize = sizes[itemIndex] ?? cellSize;
      /** Total size of scrollable items that are placed before the itemIndex we want to scroll on */
      const scrollableItemsTotalSize = (itemIndex - 1 - beforeFixedItemsCount - nbOfHiddenIndexesBeforeStartIndex) * cellSize;
      const toTopOrLeft = selectedItemSize + scrollableItemsTotalSize;
      return toTopOrLeft;
    }
    return null;
  };

  public scrollToColumnIndex = (columnIndex: number): boolean => {
    const { hiddenColumns, fixedColumns, fixedCellsWidth } = this.props;
    const toLeft = this.scrollToItemIndex(
      columnIndex,
      hiddenColumns,
      fixedColumns,
      this.cellWidth,
      fixedCellsWidth?.customSizes ?? {}
    );
    return this.scroller.current && toLeft != null ? this.scroller.current.scrollToLeft(toLeft) : false;
  };

  public scrollToRowIndex = (rowIndex: number): boolean => {
    const { hiddenRows, fixedRows, fixedCellsHeight } = this.props;
    const toTop = this.scrollToItemIndex(rowIndex, hiddenRows, fixedRows, this.cellHeight, fixedCellsHeight?.customSizes ?? {});
    return this.scroller.current && toTop != null ? this.scroller.current.scrollToTop(toTop) : false;
  };

  public render() {
    const { children, columnsLength, rowsLength, hiddenColumns, width, height } = this.props;
    const { elevatedColumnIndexes, elevatedRowIndexes, visibleColumnIndexes, visibleRowIndexes } = this.state;
    return (
      <Scroller
        ref={this.scroller}
        width={width}
        height={height}
        virtualWidth={this.virtualWidth}
        virtualHeight={this.virtualHeight}
        onScroll={this.onScroll}
        horizontalPartWidth={this.cellWidth}
        ignoredHorizontalParts={hiddenColumns}
      >
        {children({
          visibleColumnIndexes: getVisibleIndexesInsideDatalength(columnsLength, visibleColumnIndexes),
          visibleRowIndexes: getVisibleIndexesInsideDatalength(rowsLength, visibleRowIndexes),
          elevatedColumnIndexes,
          elevatedRowIndexes,
          cellHeight: this.cellHeight,
          cellWidth: this.cellWidth,
        })}
      </Scroller>
    );
  }
}

export default Virtualizer;
