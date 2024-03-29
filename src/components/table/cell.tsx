import * as React from "react";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import classNames from "classnames";
import { isEqual } from "lodash";

import { Icon } from "@mui/material";
import { DEFAULT_ROW_HEIGHT, DEFAULT_COLUMN_WIDTH, DEFAULT_COLSPAN, MouseClickButtons } from "../constants";
import { IRow } from "./row";
import { getMouseClickButton } from "../utils/table";
import { ISelectionContext } from "../table-selection/context-menu-handler";
import shallowEqual from "../utils/shallowEqual";

export interface ICellCoordinates {
  rowIndex: number;
  cellIndex: number;
}

export interface IContentCellProps<IDataCoordinates = any> {
  id?: string;
  /** index of the cell in its row */
  index?: number;
  /** index of the row of the cell */
  rowIndex?: number;
  /** relative index of the row of the cell */
  relativeRowIndex?: number;
  /** determine if we should show a selected cell */
  isSelected?: boolean;
  /** The coordinates of the data in the data structure */
  dataCoordinates?: IDataCoordinates;
}

type CellTag = "td" | "th";

export interface ICell<IDataCoordinates = any> {
  id: string;
  /** The CSS class name of the cell. */
  className?: string;
  /** The CSS class name getter of the cell. */
  getClassName?: (props: ICell) => string;
  /** value of the cell */
  value?: string;
  /** value of colspan */
  colspan?: number;
  /** cell content replacing the display of value */
  cellContent?: React.ComponentType<any>;
  /** props to pass to cellContent */
  cellContentProps?: object;
  /** The coordinates of the data in the data structure */
  dataCoordinates?: IDataCoordinates;
  /** subItem of the cell, constituting a new row */
  subItems?: IRow[];
  /** subItem of the cell, constituting a new row */
  isSelectable?: boolean;
  /** style given to the cell */
  style?: React.CSSProperties;
  /** tag name of the cell */
  component?: CellTag;
  /** loading state of the cell */
  loading?: boolean;
}

export interface ICellProps extends ICell {
  /** index of the cell in its row */
  index: number;
  /** index of the row of the cell */
  rowIndex: number;
  /** relative index of the row of the cell */
  relativeRowIndex: number;
  /** determine if we should show a selected cell */
  isSelected?: boolean;
  /** determine if this cell is opened or not */
  opened?: boolean;
  /** determine if we should show an arrow to open/close the cell subitems */
  hideSubItemsOpener?: boolean;
  /** callback when we are clicking on the cell opener */
  onCallOpen?: (num: number) => void;
  /** callback when we are clicking on the cell */
  onMouseDown?: (coordinates: ICellCoordinates, mouseClickButton: MouseClickButtons) => void;
  /** callback when we are hovering into the cell */
  onMouseEnter?: (coordinates: ICellCoordinates) => void;
  /** callback when we release the mouse button above the cell */
  onMouseUp?: () => void;
  /** Callback when we try to open the context menu */
  onContextMenu?: (selectionContext: ISelectionContext) => void;
}

const defaultCellComponent = "td";

export default class Cell extends React.Component<ICellProps> {
  static defaultProps = {
    index: 0,
    // relativeLevel: 0,
    style: { height: DEFAULT_ROW_HEIGHT, width: DEFAULT_COLUMN_WIDTH },
    isSelectable: true,
    component: defaultCellComponent,
    colspan: DEFAULT_COLSPAN,
  };

  private container = React.createRef<HTMLDivElement>();

  public shouldComponentUpdate(nextProps: ICellProps) {
    const nextCellProps = { ...nextProps };
    const cellProps = { ...this.props };
    const nextStyle = nextCellProps.style;
    delete nextCellProps.style;
    const { style } = cellProps;
    delete cellProps.style;
    return !shallowEqual(nextCellProps, cellProps) || !isEqual(nextStyle, style);
  }

  private open = () => {
    const { index, onCallOpen } = this.props;
    if (onCallOpen) {
      onCallOpen(index);
    }
  };

  private getStyles = () => {
    const { cellContent, style, colspan } = this.props;
    // @ts-ignore we have default values for height and width
    const { height, width, ...others } = style;
    const cellHeight = height || DEFAULT_ROW_HEIGHT;
    let cellWidth = Number(width);
    // @ts-ignore we have a default value for colspan
    cellWidth = cellWidth ? cellWidth * colspan : width || DEFAULT_COLUMN_WIDTH;
    const wrapperStyle = { width: cellWidth, height: cellHeight };
    const textStyle = !cellContent ? { lineHeight: `${cellHeight}px`, height: cellHeight } : undefined;
    const columnStyle = {
      padding: 0,
      ...others,
      height: cellHeight,
      width: cellWidth,
    };
    return {
      wrapper: wrapperStyle,
      text: textStyle,
      column: columnStyle,
    };
  };

  private onMouseDown = (event: React.MouseEvent<HTMLElement>) => {
    const { onMouseDown, index, rowIndex } = this.props;
    if (onMouseDown) {
      const mouseClickButtonId = getMouseClickButton(event.nativeEvent.button);
      onMouseDown({ rowIndex, cellIndex: index }, mouseClickButtonId);
    }
  };

  private onMouseEnter = () => {
    const { onMouseEnter, index, rowIndex } = this.props;
    if (onMouseEnter) {
      onMouseEnter({ rowIndex, cellIndex: index });
    }
  };

  private onMouseUp = () => {
    const { onMouseUp } = this.props;
    if (onMouseUp) {
      onMouseUp();
    }
  };

  private onContextMenu = (event: React.MouseEvent<HTMLElement>) => {
    const { onContextMenu, index, rowIndex } = this.props;
    if (onContextMenu) {
      event.preventDefault();
      const contextCell = { rowIndex, cellIndex: index };
      const selectionContext: ISelectionContext = {
        anchorEl: this.container.current,
        contextCell,
      };
      onContextMenu(selectionContext);
    }
  };

  public render() {
    const {
      id,
      index,
      relativeRowIndex,
      rowIndex,
      loading,
      getClassName,
      className,
      component,
      value,
      opened,
      subItems,
      hideSubItemsOpener,
      cellContent: CellContent,
      cellContentProps,
      dataCoordinates,
      style,
      colspan,
      isSelectable,
      isSelected,
    } = this.props;
    const canToggleSubItems = !hideSubItemsOpener && subItems && subItems.length > 0;
    const justifyContent = style && style.justifyContent;
    const styles = this.getStyles();
    const Component = component || defaultCellComponent;
    const dynamicClassName = getClassName ? getClassName(this.props) : className;
    return (
      <Component
        key={`cell-${id}`}
        colSpan={colspan}
        data-testid="table-column"
        className={classNames("table-column", dynamicClassName, {
          selected: isSelected && isSelectable,
        })}
        onMouseDown={this.onMouseDown}
        onMouseEnter={this.onMouseEnter}
        onMouseUp={this.onMouseUp}
        onContextMenu={this.onContextMenu}
        style={styles.column}
      >
        {/* Cannot force fixed size on td so need a wrapper */}
        <div
          data-testid={`table-cell-wrapper-${id}`}
          ref={this.container}
          className="table-overflow-wrapper"
          style={styles.wrapper}
        >
          <div className="table-cell-container" style={{ justifyContent }}>
            {canToggleSubItems ? (
              <IconButton
                className="table-cell-sub-item-toggle"
                data-testid="table-cell-sub-item-toggle"
                onClick={this.open}
                size="large"
              >
                <Icon>{opened ? "keyboard_arrow_down" : "keyboard_arrow_right"}</Icon>
              </IconButton>
            ) : null}
            {CellContent ? (
              <CellContent
                key={`cell-${id}-cellContent`}
                value={value}
                {...cellContentProps}
                id={id}
                index={index}
                rowIndex={rowIndex}
                relativeRowIndex={relativeRowIndex}
                isSelected={isSelected}
                dataCoordinates={dataCoordinates}
                loading={loading}
              />
            ) : (
              <div style={styles.text} className="cell-value" title={value || ""}>
                {loading ? (
                  <div className="cell-skeleton-container" style={styles.text}>
                    <Skeleton variant="rectangular" width={30} height={15} />
                  </div>
                ) : (
                  value
                )}
              </div>
            )}
          </div>
        </div>
      </Component>
    );
  }
}
