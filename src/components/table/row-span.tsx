import IconButton from "@mui/material/IconButton";
import { Icon } from "@mui/material";

import { ROW_SPAN_WIDTH } from "../constants";

export interface IRowSpan {
  /** Text being displayed when row-span is opened */
  title?: string;
  /** The width of the cell */
  width?: number;
  /** The width of the cell */
  height?: number;
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

const RowSpan = ({ toggle, opened, length, title, width, height, color }: IRowSpanProps) => {
  return (
    <td
      className="table-column row-span-column"
      rowSpan={length}
      style={{
        minWidth: width,
        maxWidth: width,
        width,
        borderLeft: `solid 15px ${color}`,
      }}
    >
      <div style={height ? { height } : undefined} className="row-span-container">
        <div className="row-span-text">{title}</div>
        <IconButton data-testid="table-toggle-row-btn" onClick={toggle} size="large">
          <Icon>{opened ? "keyboard_arrow_down" : "keyboard_arrow_right"}</Icon>
        </IconButton>
      </div>
    </td>
  );
};

RowSpan.defaultProps = {
  width: ROW_SPAN_WIDTH,
  color: "initial",
};

export default RowSpan;
