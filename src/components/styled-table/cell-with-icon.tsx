import * as React from "react";
import { Tooltip, IconButton, Icon } from "@mui/material";
import classnames from "classnames";

import { IContentCellProps } from "../table/cell";

export interface ICellWithIconProps extends IContentCellProps {
  /** The material icon name for the icon button component. */
  iconName: string;
  /** value of the cell */
  value: string;
  /** The CSS class name of the button. */
  className?: string;
  /** The Tooltip title */
  tooltipTitle?: string;
  /** Callback fired when a "click" event is detected. */
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

export const CellWithIcon: React.FunctionComponent<ICellWithIconProps> = ({
  id,
  value,
  tooltipTitle,
  iconName,
  className,
  onClick,
}) => {
  const icon = <Icon className="cell-with-icon__icon">{iconName}</Icon>;
  const action = onClick ? (
    <IconButton
      data-testid={`toolbar-action-btn${id ? `-${id}` : ""}`}
      id={id}
      className="cell-with-icon__btn"
      onClick={onClick}
      size="medium"
    >
      {icon}
    </IconButton>
  ) : (
    icon
  );

  return (
    <div className={classnames("cell-with-icon", className)}>
      <div className="cell-with-icon__value" title={value}>
        {value}
      </div>
      {tooltipTitle ? <Tooltip title={tooltipTitle}>{action}</Tooltip> : action}
    </div>
  );
};

export default CellWithIcon;
