import * as React from "react";
import classnames from "classnames";

import Row, { IRow, IRowOptions } from "./row";
import { IIndexesMap, filterRowsByIndexes, getRowTreeLength, filterIndexes, IElevateds } from "../utils/table";
import { ISelection } from "../table-selection/selection-handler";
import { Nullable } from "../typing";

export enum Type {
  error = "error",
  success = "success",
  warning = "warning",
  info = "info",
}

export interface ITree {
  rowIndex: number;
  columnIndex: number;
  subTrees?: ITrees;
}

export interface ITrees {
  [rowIndex: number]: ITree;
}

export interface IColumnOptions {
  className?: string;
  size?: number;
  type?: Type;
  style?: React.CSSProperties;
}

export interface IColumn extends IColumnOptions {
  isSelectable?: boolean;
  disableLevelPadding?: boolean;
  /** loading state of the column */
  loading?: boolean;
}

export interface IColumns {
  [index: number]: IColumn;
}

export interface IElementaryTable<IDataCoordinates = any> {
  id: string;
  /** All rows constituting the table */
  rows: IRow<IDataCoordinates>[];
  /** Specifies indexes of the columns to be shown */
  visibleColumnIndexes?: number[];
  /** Specifies indexes of the rows to be shown */
  visibleRowIndexes?: number[];
  /** Index of columns that need to be "elevated" by displaying a shadow on its right side */
  elevatedColumnIndexes?: IElevateds;
  /** Index of rows that need to be "elevated" by displaying a shadow on its bottom side */
  elevatedRowIndexes?: IElevateds;
  /** Options to customize any columns, such as size or align */
  columns?: IColumns;
  /** Options to customize any rows, such as size */
  rowsProps?: Record<number, IRowOptions>;
  /** Options to customize any row, such as size */
  globalRowProps?: IRowOptions;
  /** Options to customize any column, such as size */
  globalColumnProps?: IColumnOptions;
  /** If true, we are using an additional column at the beginning of the rows to open/close the first openable child. */
  isSpan?: boolean;
}

export interface IElementaryTableProps<IDataCoordinates = any> extends IElementaryTable<IDataCoordinates>, ISelection {
  /** List of fixed rows on the top or bottom of your table. Delegated by the virtualizer component */
  fixedRowsIndexes?: number[];
  /** A mapping between relative and absolute rows indexes. Delegated by the Table component for example */
  indexesMapping: IIndexesMap;
  /** The list of the opend rows and sub-rows */
  openedTrees: ITrees;
  /** Called when a cell of the row is opened */
  onRowOpen?: (openedTree: ITree) => void;
  /** Called when a cell of the row is closed */
  onRowClose?: (closedTree: ITree) => void;
}

class ElementaryTable extends React.Component<IElementaryTableProps> {
  static defaultProps = {
    elevatedColumnIndexes: { elevations: {}, absoluteEndPositions: {} },
    elevatedRowIndexes: { elevations: {}, absoluteEndPositions: {} },
    openedTrees: {},
    selectedCells: {},
    rowsProps: {},
  };

  /** An utility of the table that return the length of the visible sub-rows
   * of the specified row by her absolute index. */
  public getRowTreeLength = (absoluteIndex: number): number => {
    const { visibleRowIndexes, indexesMapping } = this.props;
    // @ts-ignore we have a default value for visibleRowIndexes
    return getRowTreeLength(absoluteIndex, visibleRowIndexes || [], indexesMapping.absolute);
  };

  /** An utility of the table that return the visible rows for the specified row by her absolute index. */
  public getVisibleRows = (
    rows: IRow[],
    absoluteIndex: Nullable<number>,
    fixedRowsAbsoluteIndexes: number[] = []
  ): [number[], IRow[]] => {
    const { visibleRowIndexes, indexesMapping } = this.props;
    // @ts-ignore we have a default value for visibleRowIndexes
    return filterRowsByIndexes(rows, visibleRowIndexes || null, indexesMapping.absolute, absoluteIndex, fixedRowsAbsoluteIndexes);
  };

  private renderTableParts = (): {
    header: JSX.Element[];
    body: JSX.Element[];
  } => {
    const {
      id,
      isSpan,
      rows,
      columns,
      rowsProps,
      globalRowProps,
      globalColumnProps,
      visibleColumnIndexes,
      visibleRowIndexes,
      fixedRowsIndexes,
      indexesMapping,
      openedTrees,
      elevatedColumnIndexes,
      elevatedRowIndexes,
      onRowOpen,
      onRowClose,
      onCellMouseDown,
      onCellMouseUp,
      onCellMouseEnter,
      onCellContextMenu,
      selectedCells,
    } = this.props;
    const [relativeIndexes, rowsToRender] = this.getVisibleRows(rows, null, fixedRowsIndexes);

    return rowsToRender.reduce<{ header: JSX.Element[]; body: JSX.Element[] }>(
      (result, row: IRow, index) => {
        if (!row) {
          return result;
        }
        const rowIndex = relativeIndexes ? relativeIndexes[index] : index;
        const rowProps = rowsProps ? rowsProps[rowIndex] : {};
        const { subItems, index: rowAbsoluteIndex } = indexesMapping.relative[rowIndex];
        const isVisible = !visibleRowIndexes || visibleRowIndexes.includes(rowAbsoluteIndex);
        // @ts-ignore we have a default value for openedTrees
        const rowOpenedTree = openedTrees[rowIndex];

        // @ts-ignore we have a default value for openedTrees
        const elevation = elevatedRowIndexes?.elevations[rowAbsoluteIndex];
        let rowSelectedCells = (subItems || selectedCells[rowAbsoluteIndex]) && selectedCells;
        if (rowSelectedCells) {
          const nextRowMap = indexesMapping.relative && indexesMapping.relative[rowIndex + 1];
          const nextRowAbsoluteIndex = nextRowMap && nextRowMap.index;
          rowSelectedCells = nextRowAbsoluteIndex
            ? filterIndexes(rowSelectedCells, rowAbsoluteIndex, nextRowAbsoluteIndex)
            : rowSelectedCells;
        }
        const absolutePosition = elevatedRowIndexes?.absoluteEndPositions[rowAbsoluteIndex];
        const rowStyle = absolutePosition != null ? { bottom: absolutePosition } : undefined;
        const renderedRow = (
          <Row
            key={`row-${id}-${row.id}`}
            {...globalRowProps}
            {...row}
            {...rowProps}
            className={classnames(row.className, {
              [`elevated-${elevation}`]: elevation,
            })}
            style={rowStyle}
            absoluteIndex={rowAbsoluteIndex}
            index={rowIndex}
            isVisible={isVisible}
            isSpan={isSpan}
            columns={columns}
            elevatedColumnIndexes={elevatedColumnIndexes}
            elevatedRowIndexes={elevatedRowIndexes}
            globalColumnProps={globalColumnProps}
            visibleColumnIndexes={visibleColumnIndexes}
            visibleRowIndexes={visibleRowIndexes}
            openedTree={rowOpenedTree}
            relativeSubIndexesMapping={subItems}
            onOpen={onRowOpen}
            onClose={onRowClose}
            onCellMouseDown={onCellMouseDown}
            onCellMouseEnter={onCellMouseEnter}
            onCellMouseUp={onCellMouseUp}
            onCellContextMenu={onCellContextMenu}
            selectedCells={rowSelectedCells}
            // Table utils
            getVisibleRows={this.getVisibleRows}
            getRowTreeLength={this.getRowTreeLength}
          />
        );

        if (row.isHeader) {
          result.header.push(renderedRow);
        } else {
          result.body.push(renderedRow);
        }
        return result;
      },
      { header: [], body: [] }
    );
  };

  public render() {
    const { header, body } = this.renderTableParts();
    return (
      <table className="table-root">
        {header.length > 0 ? <thead>{header}</thead> : null}
        {body.length > 0 ? <tbody>{body}</tbody> : null}
      </table>
    );
  }
}

export default ElementaryTable;
