import * as React from "react";
import classNames from "classnames";

import { isEqual } from "lodash";
import { MouseClickButtons, MAX_ROW_LEVEL } from "../constants";
import Cell, { ICell, ICellCoordinates } from "./cell";
import RowSpan, { IRowSpan } from "./row-span";
import { IColumn, IColumnOptions, ITree } from "./elementary-table";
import {
  computeCellStyle,
  computeRowStyle,
  IRelativeIndexesMap,
  getTreesLength,
  filterIndexes,
  getMappingCellsWithColspan,
  getColspanValues,
  IIndexColspanMapping,
  IElevateds,
  IRelativeIndex,
} from "../utils/table";
import { ISelectedCells } from "../table-selection/selection-handler";
import { ISelectionContext } from "../table-selection/context-menu-handler";
import shallowEqual from "../utils/shallowEqual";

export interface IRowOptions {
  size?: number;
}

export interface IRow<IDataCoordinates = any> extends IRowOptions {
  id: string;
  /** The CSS class name of the cell. */
  className?: string;
  /** The list of cells of the row */
  cells: ICell<IDataCoordinates>[];
  /** Defines if the line is a header, using a different column element for the cell */
  isHeader?: boolean;
  /** Defines if the line is selectable. If true, user can select the row's cells */
  isSelectable?: boolean;
  /** The row span propos used only if isSpan is true */
  rowSpanProps?: IRowSpan;
  /** Defines if the sub rows are fixed. to use only if the table is virtualized */
  fixSubRows?: boolean;
  /** loading state of the row */
  loading?: boolean;
}

export interface IRowProps extends IRow {
  /** The absolute index in the table */
  absoluteIndex: number;
  /** The relative index in a level of the table */
  index: number;
  /** The level of the row in the tree */
  level: number;
  relativeSubIndexesMapping: IRelativeIndexesMap;
  /** An object with the absolute rows indexes and their selected cells indexes */
  selectedCells: ISelectedCells;
  /** Specifies indexes of the rows to be shown */
  visibleRowIndexes?: number[];
  /** Index of the columns that must be displayed */
  visibleColumnIndexes?: number[];
  /** Index of columns that need to be "elevated" by displaying a shadow on its right side */
  elevatedColumnIndexes?: IElevateds;
  /** Index of rows that need to be "elevated" by displaying a shadow on its bottom side */
  elevatedRowIndexes?: IElevateds;
  /** TODO with tree update */
  openedTree?: ITree;
  /**
   * If true, we are using an additional column at the beginning of the row to open/close the first openable child.
   * */
  isSpan?: boolean;
  /** The delegated span to the first visible sub-row if the row is not visible */
  delegatedSpan?: JSX.Element;
  /** Determine if the row needs to be displayed */
  isVisible?: boolean;
  style?: React.CSSProperties;
  /** Column options to apply to the right cells of the row */
  columns?: { [index: number]: IColumn };
  /** Properties shared between cells belonging to the same columns */
  globalColumnProps: IColumnOptions;
  /** A table utility for optimization. Please see the ElementaryTable.getVisibleRows */
  getVisibleRows: (rows: IRow[], absoluteIndex: number) => [number[], IRow[]];
  /** A table utility for optimization. Please see the ElementaryTable.getRowTreeLength */
  getRowTreeLength?: (absoluteIndex: number) => number;
  /** Callback when we are clicking on the cell */
  onCellMouseDown?: (coordinates: ICellCoordinates, mouseClickButton: MouseClickButtons) => void;
  /** Callback when we are hovering into the cell */
  onCellMouseEnter?: (coordinates: ICellCoordinates) => void;
  /** Callback when we release the mouse button above the cell */
  onCellMouseUp?: () => void;
  /** Callback when we try to open the context menu */
  onCellContextMenu?: (selectionContext: ISelectionContext) => void;
  /** Callback when we are displaying the subItems of the row */
  onOpen?: (openedTree: ITree) => void;
  /** Callback when we are closing the subItems of the row */
  onClose?: (closedTree: ITree) => void;
}

interface IState {
  mappingCellsWithColspan: IIndexColspanMapping;
}

const defaultRelativeIndex: Partial<IRelativeIndex> = {
  subItems: undefined,
  index: undefined,
};

export default class Row extends React.Component<IRowProps, IState> {
  public static defaultProps = {
    index: 0,
    absoluteIndex: 0,
    level: 0,
    isVisible: true,
    isSelectable: true,
    columns: {},
    elevatedColumnIndexes: { elevations: {}, absoluteEndPositions: {} },
    elevatedRowIndexes: { elevations: {}, absoluteEndPositions: {} },
    selectedCells: [],
    getVisibleRows: (rows: IRow[]) => [null, rows],
    relativeSubIndexesMapping: {},
    globalColumnProps: {},
  };

  constructor(props: IRowProps) {
    super(props);
    const { cells } = this.props;
    this.state = {
      // getMappingCellsWithColspan is memoized (and must remain memorized)
      // TODO we must have a global cache system
      mappingCellsWithColspan: getMappingCellsWithColspan(cells),
    };
  }

  public componentDidUpdate(prevProps: IRowProps) {
    const { cells } = this.props;
    if (prevProps.cells !== cells) {
      this.setState({
        mappingCellsWithColspan: getMappingCellsWithColspan(cells),
      });
    }
  }

  public shouldComponentUpdate(nextProps: IRowProps) {
    const nextRowProps = { ...nextProps };
    const rowProps = { ...this.props };
    // not used if no opened cell
    if (!nextProps.openedTree) {
      delete nextRowProps.visibleRowIndexes;
      delete rowProps.visibleRowIndexes;
    }
    const {
      selectedCells: nextSelectCells,
      elevatedRowIndexes: nextElevatedRowIndexes,
      elevatedColumnIndexes: nextElevatedColumnIndexes,
      ...otherNextProps
    } = nextRowProps;
    const { selectedCells, elevatedRowIndexes, elevatedColumnIndexes, ...otherProps } = rowProps;

    return (
      !shallowEqual(otherNextProps, otherProps) ||
      !isEqual(nextSelectCells, selectedCells) ||
      !isEqual(nextElevatedRowIndexes, elevatedRowIndexes) ||
      !isEqual(nextElevatedColumnIndexes, elevatedColumnIndexes)
    );
  }

  private updateOpenedCell = (cellIndex: number) => {
    const { onOpen, onClose, index, openedTree } = this.props;
    const openedCellIndex = openedTree ? openedTree.columnIndex : null;
    const newOpenedCellIndexe = openedCellIndex === cellIndex ? null : cellIndex;
    if (newOpenedCellIndexe !== openedCellIndex) {
      const isToOpen = newOpenedCellIndexe != null;
      if (isToOpen && onOpen) {
        onOpen({ rowIndex: index, columnIndex: newOpenedCellIndexe as number });
      } else if (!isToOpen && onClose) {
        onClose({ rowIndex: index, columnIndex: cellIndex });
      }
    }
  };

  private onSubRowOpen = (newOpenedTree: ITree) => {
    const { onOpen, openedTree } = this.props;
    if (onOpen) {
      const subTrees = (openedTree && openedTree.subTrees) || {};
      const newSubTrees = { ...subTrees };
      // update the sub-tree to update
      newSubTrees[newOpenedTree.rowIndex] = newOpenedTree;
      // if onSubRowOpen is called means that openedTree is not null
      onOpen({ ...(openedTree as ITree), subTrees: newSubTrees });
    }
  };

  private onSubRowClose = (treeToClose: ITree) => {
    const { onOpen, openedTree } = this.props;
    if (onOpen) {
      const subTrees = (openedTree && openedTree.subTrees) || {};
      const newSubTrees = { ...subTrees };
      // remove the sub-tree to close
      delete newSubTrees[treeToClose.rowIndex];
      // if onSubRowClose is called means that openedTree is not null
      onOpen({ ...(openedTree as ITree), subTrees: newSubTrees });
    }
  };

  private toggleCell = (cellIndex: number) => {
    const { cells } = this.props;
    if (cells[cellIndex]) {
      this.updateOpenedCell(cellIndex);
    }
  };

  private toggleFirstCell = () => {
    const { openedTree } = this.props;
    const openedCellIndex = openedTree ? openedTree.columnIndex : null;
    if (openedCellIndex !== null) {
      this.updateOpenedCell(openedCellIndex);
    } else {
      const firstCellWithSubItems = this.getFirstCellIndexWithSubItems();
      if (firstCellWithSubItems >= 0) {
        this.updateOpenedCell(firstCellWithSubItems);
      }
    }
  };

  private getFirstCellIndexWithSubItems = (): number => {
    const { cells } = this.props;
    return cells.findIndex((cell) => (cell.subItems ? cell.subItems.length > 0 : false));
  };

  /** Only used for the first level */
  private renderRowSpan = (hasSubItems: boolean) => {
    if (!hasSubItems) {
      return <td className="table-column row-span-column" rowSpan={1} />;
    }
    const { isVisible, cells, openedTree, absoluteIndex, getRowTreeLength, visibleRowIndexes, rowSpanProps, size } = this.props;
    const openedCellIndex = openedTree ? openedTree.columnIndex : null;
    const openedCell = openedCellIndex !== null ? cells[openedCellIndex] : null;
    const subItems = openedCell ? openedCell.subItems || [] : [];
    const subTrees = openedTree ? openedTree.subTrees || [] : [];
    const length =
      visibleRowIndexes && getRowTreeLength
        ? getRowTreeLength(absoluteIndex) + (isVisible ? 1 : 0)
        : getTreesLength(subTrees, subItems) + subItems.length + 1;
    return (
      <RowSpan
        opened={!!openedCell}
        length={openedCell ? length : 1}
        toggle={this.toggleFirstCell}
        {...rowSpanProps}
        height={size}
      />
    );
  };

  private getDelegatedSpan = (firstCellIndexWithSubItems: number) => {
    const { level, isSpan, delegatedSpan } = this.props;
    return (level === 0 && isSpan && this.renderRowSpan(firstCellIndexWithSubItems >= 0)) || delegatedSpan;
  };

  private renderSubRows = (firstCellIndexWithSubItems: number) => {
    const {
      id,
      cells,
      isVisible: parentIsVisible,
      absoluteIndex,
      level,
      size,
      columns,
      visibleRowIndexes,
      openedTree,
      getVisibleRows,
      visibleColumnIndexes,
      relativeSubIndexesMapping,
      elevatedColumnIndexes,
      elevatedRowIndexes,
      globalColumnProps,
      onCellMouseUp,
      onCellContextMenu,
      onCellMouseDown,
      onCellMouseEnter,
      selectedCells,
    } = this.props;
    const openedCellIndex = openedTree ? openedTree.columnIndex : null;
    const openedCell = openedCellIndex !== null ? cells[openedCellIndex] : null;
    const subRows = openedCell ? openedCell.subItems || [] : [];
    const [relativeIndexes, rowsToRender] = getVisibleRows(subRows, absoluteIndex);
    if (!rowsToRender.length) {
      return null;
    }

    const globalProps: IRowOptions = { size };
    const subOpenedTrees = (openedTree && openedTree.subTrees) || [];
    const rowSpan = !parentIsVisible ? this.getDelegatedSpan(firstCellIndexWithSubItems) : undefined;
    const subLevel = level + 1;
    const minLevel = Math.min(subLevel, MAX_ROW_LEVEL);
    return rowsToRender.map((subRow, index) => {
      const subRowIndex = relativeIndexes ? relativeIndexes[index] : index;
      const { subItems, index: rowAbsoluteIndex } = relativeSubIndexesMapping[subRowIndex] || defaultRelativeIndex;
      const isVisible = !visibleRowIndexes || (rowAbsoluteIndex !== undefined && visibleRowIndexes.includes(rowAbsoluteIndex));
      const openedSubTree = subOpenedTrees[subRowIndex];
      const elevation = elevatedRowIndexes?.elevations[rowAbsoluteIndex];
      const absolutePosition = elevatedRowIndexes?.absoluteEndPositions[rowAbsoluteIndex];
      const rowStyle = absolutePosition != null ? { bottom: absolutePosition } : undefined;
      // get selected cells
      let rowSelectedCells = (subItems || selectedCells[rowAbsoluteIndex]) && selectedCells;
      const nextRowMap = relativeSubIndexesMapping && relativeSubIndexesMapping[subRowIndex + 1];
      const nextRowAbsoluteIndex = nextRowMap?.index;
      rowSelectedCells =
        rowSelectedCells &&
        (nextRowAbsoluteIndex ? filterIndexes(rowSelectedCells, rowAbsoluteIndex, nextRowAbsoluteIndex) : rowSelectedCells);
      // span delegated only for the first visible row (index === 0)
      const subDelegatedSpan = index === 0 ? rowSpan : undefined;
      const subrowId = `${id}-${subRow.id}`;
      return (
        <Row
          key={`row-${subrowId}`}
          {...globalProps}
          {...subRow}
          id={subrowId}
          className={classNames(subRow.className, `sub-row sub-row__${minLevel}`, {
            "last-sub-row": subRows.length === subRowIndex + 1,
            [`elevated-${elevation}`]: elevation,
          })}
          style={rowStyle}
          absoluteIndex={rowAbsoluteIndex}
          index={subRowIndex}
          level={subLevel}
          isVisible={isVisible}
          columns={columns}
          globalColumnProps={globalColumnProps}
          visibleColumnIndexes={visibleColumnIndexes}
          visibleRowIndexes={visibleRowIndexes}
          openedTree={openedSubTree}
          elevatedColumnIndexes={elevatedColumnIndexes}
          elevatedRowIndexes={elevatedRowIndexes}
          relativeSubIndexesMapping={subItems}
          delegatedSpan={subDelegatedSpan}
          getVisibleRows={getVisibleRows}
          onCellMouseDown={onCellMouseDown}
          onCellMouseEnter={onCellMouseEnter}
          onCellMouseUp={onCellMouseUp}
          onCellContextMenu={onCellContextMenu}
          onOpen={this.onSubRowOpen}
          onClose={this.onSubRowClose}
          selectedCells={rowSelectedCells}
        />
      );
    });
  };

  public render() {
    const {
      id,
      loading,
      className,
      absoluteIndex,
      index: relativeRowIndex,
      isVisible,
      isSpan,
      isHeader,
      cells,
      columns,
      openedTree,
      globalColumnProps,
      visibleColumnIndexes,
      elevatedColumnIndexes,
      delegatedSpan,
      size,
      onCellMouseDown,
      onCellMouseEnter,
      onCellMouseUp,
      onCellContextMenu,
      selectedCells,
      isSelectable,
      style,
    } = this.props;

    const openedCellIndex = openedTree ? openedTree.columnIndex : null;
    const openedCell = openedCellIndex !== null ? cells[openedCellIndex] : null;
    const firstCellIndexWithSubItems: number = isSpan ? this.getFirstCellIndexWithSubItems() : -1;
    const subRows = openedCell ? this.renderSubRows(firstCellIndexWithSubItems) : null;
    if (!isVisible) {
      return subRows;
    }

    const { mappingCellsWithColspan } = this.state;
    const options: IRowOptions = { size };
    const selectedRowCells = selectedCells && selectedCells[absoluteIndex];

    const [visibleColumnIndexesAfterMapping, mappingColspanToIndex] =
      visibleColumnIndexes && !mappingCellsWithColspan.isIdentity
        ? getColspanValues(visibleColumnIndexes, mappingCellsWithColspan.colspanToIndex)
        : [visibleColumnIndexes, null];
    const cellsToRender = visibleColumnIndexesAfterMapping
      ? visibleColumnIndexesAfterMapping.map((index: number) => cells[index])
      : cells;
    return (
      <>
        <tr
          data-testid={`table-${isHeader ? "header" : "row"}-${id}`}
          className={classNames("table-row", className, {
            head: isHeader,
            opened: openedCellIndex !== null,
          })}
          // @ts-ignore
          style={computeRowStyle(options, style)}
        >
          {delegatedSpan}
          {isSpan && !delegatedSpan ? this.renderRowSpan(firstCellIndexWithSubItems >= 0) : null}
          {cellsToRender.map((cell: ICell, index: number) => {
            if (!cell) {
              return null;
            }
            const cellIndex = (visibleColumnIndexesAfterMapping && visibleColumnIndexesAfterMapping[index]) || index;
            const cellColumn = columns ? columns[cellIndex] || {} : {};

            const elevationIndex = mappingCellsWithColspan.indexToColspan[cellIndex].find(
              (index) => !!(elevatedColumnIndexes && elevatedColumnIndexes.elevations[index])
            );
            // @ts-ignore elevationIndex !== undefined => elevatedColumnIndexes !== undefined
            const elevation = elevatedColumnIndexes?.elevations[elevationIndex];
            // @ts-ignore elevationIndex !== undefined => elevatedColumnIndexes !== undefined
            const absolutePosition = elevatedColumnIndexes?.absoluteEndPositions[elevationIndex] || 0;

            const column = {
              isSelectable: true,
              ...globalColumnProps,
              ...cellColumn,
              style: {
                ...globalColumnProps.style,
                ...cellColumn.style,
                //@ts-ignore
                right: absolutePosition,
              },
            };

            const isSelected = (selectedRowCells && selectedRowCells.includes(cellIndex)) || false;
            // By default, columns, rows and cells are selectable
            const cellIsSelectable =
              isSelectable && column.isSelectable && (cell.isSelectable === undefined || cell.isSelectable === true);
            const cellLoading = column.loading || cell.loading || loading;
            return (
              <Cell
                key={`cell-${id}-${cell.id}`}
                component={isHeader ? "th" : "td"}
                {...cell}
                loading={cellLoading}
                colspan={mappingColspanToIndex ? mappingColspanToIndex[cellIndex] : 1}
                className={classNames(cell.className, column.className, {
                  [`elevated-${elevation}`]: elevation,
                })}
                index={cellIndex}
                rowIndex={absoluteIndex}
                relativeRowIndex={relativeRowIndex}
                isSelectable={cellIsSelectable}
                isSelected={isSelected}
                opened={openedCellIndex === cellIndex}
                hideSubItemsOpener={isSpan && firstCellIndexWithSubItems === cellIndex}
                onCallOpen={this.toggleCell}
                // TODO: MEMOIZE
                style={computeCellStyle(column, options)}
                onMouseDown={onCellMouseDown}
                onMouseEnter={onCellMouseEnter}
                onMouseUp={onCellMouseUp}
                onContextMenu={onCellContextMenu}
              />
            );
          })}
        </tr>
        {subRows}
      </>
    );
  }
}
