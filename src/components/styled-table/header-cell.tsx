import * as React from "react";
import classNames from "classnames";

import Bubble from "./bubble";

export interface IHeaderCellProps {
  title: string;
  value: string;
  className?: string;
  badge?: string;
  isCurrent?: boolean;
}

const HeaderCell = ({ title, value, className = "", badge, isCurrent }: IHeaderCellProps) => {
  const cellContent = (
    <div className="header-cell-data">
      <div className="header-cell-title">{title}</div>
      <div className="header-cell-value" title={value}>
        {value}
      </div>
    </div>
  );

  return (
    <div
      className={classNames("header-cell", className, {
        "header-cell-current": isCurrent
      })}
    >
      {isCurrent ? (
        <>
          <div className="header-cell-line" />
          <Bubble className="header-cell-bubble" badge={badge}>
            {cellContent}
          </Bubble>
        </>
      ) : (
        cellContent
      )}
    </div>
  );
};

export default React.memo(HeaderCell);
