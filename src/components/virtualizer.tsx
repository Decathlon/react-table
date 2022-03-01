// / <reference lib="es2017.string" />
import * as React from "react";
import { isEqual } from "lodash";

import Scroller, { IOnScroll, VERTICAL_SCROLL_DIRECTIONS, HORIZONTAL_SCROLL_DIRECTIONS } from "./scroller";
import {
  getVisibleIndexesInsideDatalength,
  IElevateds,
  findFirstNotIncluded,
  CustomSizesElements,
  VirtualizerCache,
  getVirtualizerCache,
  getVisibleItemIndexes,
  getElevatedItemIndexes,
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
  fixedCellsHeight: CustomSizesElements;
  /** Sum of the width of fixed columns with a pre-defined width */
  fixedCellsWidth: CustomSizesElements;
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
      fixed: {
        sum: 0,
        count: 0,
      },
      scrollable: {
        sum: 0,
        count: 0,
      },
      customSizes: {},
    },
    fixedCellsWidth: {
      fixed: {
        sum: 0,
        count: 0,
      },
      scrollable: {
        sum: 0,
        count: 0,
      },
      customSizes: {},
    },
    horizontalPadding: 0,
    verticalPadding: 0,
    initialScroll: {},
    hiddenRows: [],
    hiddenColumns: [],
  };

  private scroller: React.RefObject<Scroller> = React.createRef<Scroller>();

  private verticalData: VirtualizerCache = {
    itemsCount: 0,
    itemSize: 0,
    visibleFixedItems: [],
    virtualSize: 0,
    itemIndexesScrollMapping: [],
    visibleItemIndexes: {},
    ignoredIndexes: {},
    elevatedItemIndexes: new Map(),
  };

  private horizontalData: VirtualizerCache = {
    itemsCount: 0,
    itemSize: 0,
    visibleFixedItems: [],
    virtualSize: 0,
    itemIndexesScrollMapping: [],
    visibleItemIndexes: {},
    ignoredIndexes: {},
    elevatedItemIndexes: new Map(),
    scrollableCustomSize: 0,
  };

  public constructor(props: IVirtualizerProps) {
    super(props);
    this.initializeGridProps();
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
      const newColumnsState = this.getVisibleColumnsState(scrollLeft) || {};
      const newRowsState = this.getVisibleRowsState(scrollTop) || {};
      this.setState({ ...newRowsState, ...newColumnsState });
    }
  }

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
    this.verticalData = getVirtualizerCache({
      minItemSize: minCellHeight,
      fixedItems: fixedRows,
      padding: horizontalPadding,
      hiddenItems: hiddenRows,
      customSizesElements: fixedCellsHeight,
      containerSize: height,
      itemsLength: rowsLength,
      itemsCount: rowsCount,
    });
    this.horizontalData = getVirtualizerCache({
      minItemSize: minCellWidth,
      fixedItems: fixedColumns,
      padding: verticalPadding,
      hiddenItems: hiddenColumns,
      customSizesElements: fixedCellsWidth,
      containerSize: width,
      itemsLength: columnsLength,
      itemsCount: columnsCount,
    });
  };

  private getVisibleRowIndexes = (scrollValue = 0) => {
    const { rowsLength, fixedCellsHeight } = this.props;
    const currentCache = this.verticalData;
    return getVisibleItemIndexes(scrollValue, currentCache, rowsLength, fixedCellsHeight);
  };

  private getVisibleColumnIndexes = (scrollValue = 0) => {
    const { columnsLength, fixedCellsWidth } = this.props;
    const currentCache = this.horizontalData;
    return getVisibleItemIndexes(scrollValue, currentCache, columnsLength, fixedCellsWidth);
  };

  private getElevatedColumnIndexes = (visibleColumnIndexes: number[]): IElevateds => {
    const { fixedCellsWidth } = this.props;
    const currentCache = this.horizontalData;
    return getElevatedItemIndexes(visibleColumnIndexes, currentCache, fixedCellsWidth.customSizes, true);
  };

  private getElevatedRowIndexes = (visibleRowIndexes: number[]): IElevateds => {
    const { fixedCellsHeight } = this.props;
    const currentCache = this.verticalData;
    return getElevatedItemIndexes(visibleRowIndexes, currentCache, fixedCellsHeight.customSizes);
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
        const columnsCursor = findFirstNotIncluded(visibleColumnIndexes, this.horizontalData.visibleFixedItems);
        const rowsCursor = findFirstNotIncluded(visibleRowIndexes, this.verticalData.visibleFixedItems);

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

  public scrollToColumnIndex = (columnIndex: number): boolean => {
    const toLeft = this.horizontalData.itemIndexesScrollMapping[columnIndex] + 5;
    return this.scroller.current && toLeft != null ? this.scroller.current.scrollToLeft(toLeft) : false;
  };

  public scrollToRowIndex = (rowIndex: number): boolean => {
    const toTop = this.verticalData.itemIndexesScrollMapping[rowIndex] + 5;
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
        virtualWidth={this.horizontalData.virtualSize + (this.horizontalData.scrollableCustomSize || 0)}
        virtualHeight={this.verticalData.virtualSize + (this.verticalData.scrollableCustomSize || 0)}
        onScroll={this.onScroll}
        horizontalPartWidth={this.horizontalData.itemSize}
        ignoredHorizontalParts={hiddenColumns}
      >
        {children({
          visibleColumnIndexes: getVisibleIndexesInsideDatalength(columnsLength, visibleColumnIndexes),
          visibleRowIndexes: getVisibleIndexesInsideDatalength(rowsLength, visibleRowIndexes),
          elevatedColumnIndexes,
          elevatedRowIndexes,
          cellHeight: this.verticalData.itemSize,
          cellWidth: this.horizontalData.itemSize,
        })}
      </Scroller>
    );
  }
}

export default Virtualizer;
