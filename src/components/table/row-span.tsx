import * as React from "react";
import IconButton from "@material-ui/core/IconButton";
import { Icon } from "@material-ui/core";
import classnames from "classnames";

import { ROW_SPAN_WIDTH } from "../constants";

export interface IRowSpan {
  /** Text being displayed when row-span is opened */
  title?: string;
  /** The width of the cell */
  width?: number;
  /** the background color of the cell */
  color?: string;
}

export interface IRowSpanProps extends IRowSpan {
  /** callback function called when butten is clicked on */
  toggle: () => void;
  /** status of the component */
  opened: boolean;
  /** Size of the rowSpan, determining the number of rows it will cover */
  length: number;
}

const RowSpan = ({ toggle, opened, length, title, width, color }: IRowSpanProps) => {
  return (
    <td
      className="table-column row-span-column"
      rowSpan={length}
      style={{
        minWidth: width,
        maxWidth: width,
        width,
        borderLeft: `solid 10px ${color}`
      }}
    >
      <div className={classnames("row-span-container", { open: opened })}>
        {!opened ? <div className="row-span-text">{title}</div> : null}
        <IconButton data-testid="table-row-span-btn" onClick={toggle}>
          <Icon>{opened ? "keyboard_arrow_down" : "keyboard_arrow_right"}</Icon>
        </IconButton>
        {opened ? <div className="row-span-text vertical">{title}</div> : null}
      </div>
    </td>
  );
};

RowSpan.defaultProps = {
  width: ROW_SPAN_WIDTH,
  color: "initial"
};

export default RowSpan;
