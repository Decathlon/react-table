// / <reference lib="es2017.string" />
import * as React from "react";
import { isEqual } from "lodash";

import Scroller, { IOnScroll, VERTICAL_SCROLL_DIRECTIONS, SCROLLBAR_SIZE, HORIZONTAL_SCROLL_DIRECTIONS } from "./scroller";
import {
  addSequentialIndexesToFixedIndexList,
  getElevatedIndexes,
  getVisibleIndexesInsideDatalength,
  IElevateds,
  scrollIndexToGridIndex
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
  fixedCellsHeight: {
    sum: number;
    count: number;
  };
  /** Sum of the width of fixed columns with a pre-defined width */
  fixedCellsWidth: {
    sum: number;
    count: number;
  };
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

interface IState extends IRowsState, IColumnState {}

class Virtualizer extends React.Component<IVirtualizerProps, IState> {
  public static defaultProps = {
    fixedColumns: [],
    fixedRows: [],
    fixedCellsHeight: {
      sum: 0,
      count: 0
    },
    fixedCellsWidth: {
      sum: 0,
      count: 0
    },
    horizontalPadding: 0,
    verticalPadding: 0,
    initialScroll: {},
    hiddenRows: [],
    hiddenColumns: []
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

  public constructor(props: IVirtualizerProps) {
    super(props);
    this.initializeGridProps();
    const visibleColumnIndexes = this.getVisibleColumnIndexes();
    const visibleRowIndexes = this.getVisibleRowIndexes();
    this.state = {
      visibleRowIndexes,
      visibleColumnIndexes,
      elevatedColumnIndexes: this.getElevatedColumnIndexes(visibleColumnIndexes),
      elevatedRowIndexes: this.getElevatedRowIndexes(visibleRowIndexes)
    };
  }

  public componentDidMount() {
    const {
      initialScroll: { columnIndex, rowIndex }
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
      minRowHeight
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
      const newColumnsState = this.getVisibleColumnsState(scrollLeft) || {};
      const newRowsState = this.getVisibleRowsState(scrollTop) || {};
      this.setState({ ...newRowsState, ...newColumnsState });
    }
  }

  private initializeGridProps = () => {
    const {
      rowsCount,
      height,
      width,
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
      hiddenRows
    } = this.props;
    const minCellHeight = minRowHeight || DEFAULT_ROW_HEIGHT;
    const minCellWidth = minColumnWidth || MIN_COLUMN_WIDTH;
    const extraCellsHeight = fixedCellsHeight.sum + horizontalPadding;
    const extraCellsWidth = fixedCellsWidth.sum + verticalPadding;
    const scrollableRowsHeight = height - extraCellsHeight;
    const scrollableColumnsWidth = width - extraCellsWidth;

    this.visibleFixedRows = fixedRows.filter(fixedRow => !hiddenRows.includes(fixedRow));
    this.visibleFixedColumns = fixedColumns.filter(fixedColumn => !hiddenColumns.includes(fixedColumn));
    const scrollableColumnsCount = columnsLength - fixedCellsWidth.count - hiddenColumns.length + this.visibleFixedColumns.length;
    const scrollableRowsCount = rowsLength - fixedCellsHeight.count - hiddenRows.length + this.visibleFixedRows.length;

    this.rowsCount =
      rowsCount !== undefined ? rowsCount : Math.floor(scrollableRowsHeight / minCellHeight + fixedCellsHeight.count);
    this.columnsCount =
      columnsCount !== undefined ? columnsCount : Math.floor(scrollableColumnsWidth / minCellWidth + fixedCellsWidth.count);
    // if has Horizontal ScrollBar
    const horizontalScrollbarSize = columnsLength && this.columnsCount < columnsLength ? SCROLLBAR_SIZE : 0;
    // if has Vertical ScrollBar
    const verticalScrollbarSize = rowsLength && this.rowsCount < rowsLength ? SCROLLBAR_SIZE : 0;

    this.cellHeight = this.rowsCount
      ? Math.ceil((scrollableRowsHeight - horizontalScrollbarSize) / (this.rowsCount - fixedCellsHeight.count))
      : 0;
    this.cellWidth = this.columnsCount
      ? Math.ceil((scrollableColumnsWidth - verticalScrollbarSize) / (this.columnsCount - fixedCellsWidth.count))
      : 0;

    this.virtualWidth = scrollableColumnsCount * this.cellWidth + extraCellsWidth;
    this.virtualHeight = scrollableRowsCount * this.cellHeight + extraCellsHeight;
  };

  private getVisibleRowIndexes = (scrollTop = 0) => {
    const { rowsLength, hiddenRows } = this.props;
    const scrollIndex = Math.floor(scrollTop / this.cellHeight);
    const rowIndexStart = scrollIndexToGridIndex(scrollIndex, hiddenRows);
    return addSequentialIndexesToFixedIndexList(this.visibleFixedRows, rowIndexStart, rowsLength, this.rowsCount, hiddenRows);
  };

  private getVisibleColumnIndexes = (scrollLeft = 0) => {
    const { columnsLength, hiddenColumns } = this.props;
    const scrollIndex = Math.floor(scrollLeft / this.cellWidth);
    const columnIndexStart = scrollIndexToGridIndex(scrollIndex, hiddenColumns);
    return addSequentialIndexesToFixedIndexList(
      this.visibleFixedColumns,
      columnIndexStart,
      columnsLength,
      this.columnsCount,
      hiddenColumns
    );
  };

  private getElevatedColumnIndexes = (visibleColumnIndexes: number[]): IElevateds => {
    const { fixedColumns } = this.props;
    const { elevatedColumnIndexes } = this.state || {
      elevatedColumnIndexes: {}
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
        elevatedRowIndexes: this.getElevatedRowIndexes(newVisibleRowIndexes)
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
        elevatedColumnIndexes: this.getElevatedColumnIndexes(newVisibleColumnIndexes)
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
    const hasVerticallyScrolled = VERTICAL_SCROLL_DIRECTIONS.some(direction => directions.includes(direction));
    const hasHorizontalyScrolled = HORIZONTAL_SCROLL_DIRECTIONS.some(direction => directions.includes(direction));

    const newRowsState = hasVerticallyScrolled ? this.getVisibleRowsState(scrollTop) : null;
    const newColumnsState = hasHorizontalyScrolled ? this.getVisibleColumnsState(scrollLeft) : null;

    if (newRowsState || newColumnsState) {
      // @ts-ignore
      this.setState({ ...newRowsState, ...newColumnsState }, () => {
        const { visibleColumnIndexes, visibleRowIndexes } = this.state;
        const columnsCursor = visibleColumnIndexes[this.visibleFixedColumns.length];
        const rowsCursor = visibleRowIndexes[this.visibleFixedRows.length];
        onScroll &&
          onScroll({
            scrollValues,
            newColumnsState,
            newRowsState,
            columnsCursor,
            rowsCursor
          });
        onHorizontallyScroll &&
          onHorizontallyScroll({
            scrollValues,
            newColumnsState,
            columnsCursor
          });
        onVerticallyScroll && onVerticallyScroll({ scrollValues, newRowsState, rowsCursor });
      });
    }
  };

  public scrollToColumnIndex = (columnIndex: number) => {
    if (this.scroller.current) {
      const toleft = this.cellWidth * columnIndex + this.cellWidth / 2;
      return this.scroller.current.scrollToLeft(toleft);
    }
    return false;
  };

  public scrollToRowIndex = (rowIndex: number) => {
    if (this.scroller.current) {
      const toTop = this.cellHeight * rowIndex + this.cellHeight / 2;
      return this.scroller.current.scrollToTop(toTop);
    }
    return false;
  };

  public render() {
    const { children, height, width, columnsLength, rowsLength, hiddenColumns } = this.props;
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
          cellWidth: this.cellWidth
        })}
      </Scroller>
    );
  }
}

export default Virtualizer;
