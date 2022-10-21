// / <reference lib="es2017.string" />
import * as React from "react";
import { isEqual } from "lodash";

import Scroller, { IOnScroll, VERTICAL_SCROLL_DIRECTIONS, HORIZONTAL_SCROLL_DIRECTIONS, SCROLLBAR_SIZE } from "./scroller";
import {
  getVisibleIndexesInsideDatalength,
  IElevateds,
  findFirstNotIncluded,
  CustomSizesElements,
  VirtualizerCache,
  getVirtualizerCache,
  getVisibleItemIndexes,
  getElevatedIndexes,
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
  customCellsHeight: CustomSizesElements;
  /** Sum of the width of fixed columns with a pre-defined width */
  customCellsWidth: CustomSizesElements;
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
    customCellsHeight: {
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
    customCellsWidth: {
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
    scrollableCustomSize: 0,
  };

  private horizontalData: VirtualizerCache = {
    itemsCount: 0,
    itemSize: 0,
    visibleFixedItems: [],
    virtualSize: 0,
    itemIndexesScrollMapping: [],
    visibleItemIndexes: {},
    ignoredIndexes: {},
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
      customCellsWidth,
      customCellsHeight,
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
        prevProps.customCellsWidth !== customCellsWidth ||
        prevProps.customCellsHeight !== customCellsHeight ||
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
      customCellsHeight,
      customCellsWidth,
      horizontalPadding,
      verticalPadding,
      fixedColumns,
      hiddenColumns,
      fixedRows,
      hiddenRows,
    } = this.props;
    const minCellHeight = minRowHeight || DEFAULT_ROW_HEIGHT;
    const minCellWidth = minColumnWidth || MIN_COLUMN_WIDTH;
    const setverticalData = (padding: number) => {
      this.verticalData = getVirtualizerCache({
        minItemSize: minCellHeight,
        fixedItems: fixedRows,
        padding,
        hiddenItems: hiddenRows,
        customSizesElements: customCellsHeight,
        containerSize: height,
        itemsLength: rowsLength,
        itemsCount: rowsCount,
      });
    };

    const sethorizontalData = (padding: number) => {
      this.horizontalData = getVirtualizerCache({
        minItemSize: minCellWidth,
        fixedItems: fixedColumns,
        padding,
        hiddenItems: hiddenColumns,
        customSizesElements: customCellsWidth,
        containerSize: width,
        itemsLength: columnsLength,
        itemsCount: columnsCount,
      });
    };

    setverticalData(horizontalPadding);

    const horizontalScrollBarSize =
      this.verticalData.virtualSize > (this.verticalData.scrollableItemsSize || 0) ? SCROLLBAR_SIZE : 0;
    sethorizontalData(verticalPadding + horizontalScrollBarSize);

    const verticalScrollBarSize =
      this.horizontalData.virtualSize > (this.horizontalData.scrollableItemsSize || 0) ? SCROLLBAR_SIZE : 0;
    setverticalData(verticalScrollBarSize + horizontalPadding);

    // Returns the distance (in pixels) between the different items
    this.verticalData.itemIndexesScrollMapping = getIndexScrollMapping(
      rowsLength,
      customCellsHeight.customSizes,
      this.verticalData.itemSize,
      [...this.verticalData.visibleFixedItems, ...hiddenRows]
    );
    // Returns the distance (in pixels) between the different items
    this.horizontalData.itemIndexesScrollMapping = getIndexScrollMapping(
      columnsLength,
      customCellsWidth.customSizes,
      this.horizontalData.itemSize,
      [...this.horizontalData.visibleFixedItems, ...hiddenColumns]
    );
  };

  private getVisibleRowIndexes = (scrollValue = 0) => {
    const { rowsLength, customCellsHeight } = this.props;
    const currentCache = this.verticalData;
    return getVisibleItemIndexes(scrollValue, rowsLength, customCellsHeight.customSizes, currentCache);
  };

  private getVisibleColumnIndexes = (scrollValue = 0) => {
    const { columnsLength, customCellsWidth } = this.props;
    const currentCache = this.horizontalData;
    return getVisibleItemIndexes(scrollValue, columnsLength, customCellsWidth.customSizes, currentCache);
  };

  private getElevatedColumnIndexes = (visibleColumnIndexes: number[]): IElevateds => {
    const { customCellsWidth } = this.props;
    const { ignoredIndexes, itemSize } = this.horizontalData;
    return getElevatedIndexes(visibleColumnIndexes, ignoredIndexes, customCellsWidth.customSizes, itemSize, true);
  };

  private getElevatedRowIndexes = (visibleRowIndexes: number[]): IElevateds => {
    const { customCellsHeight } = this.props;
    const { ignoredIndexes, itemSize } = this.verticalData;
    return getElevatedIndexes(visibleRowIndexes, ignoredIndexes, customCellsHeight.customSizes, itemSize);
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
    const toLeft = this.horizontalData.itemIndexesScrollMapping[columnIndex] + 1;
    return this.scroller.current && toLeft != null ? this.scroller.current.scrollToLeft(toLeft) : false;
  };

  public scrollToRowIndex = (rowIndex: number): boolean => {
    const toTop = this.verticalData.itemIndexesScrollMapping[rowIndex] + 1;
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
