import * as React from "react";
import classNames from "classnames";

import Bubble from "./bubble";

export interface IHeaderCellProps {
  title: string;
  value: string;
  badge?: string;
  isCurrent?: boolean;
}

const HeaderCell = ({ title, value, badge, isCurrent }: IHeaderCellProps) => {
  const cellContent = (
    <div className="header-cell-data">
      <div className="header-cell-title">{title}</div>
      <div className="header-cell-value">{value}</div>
    </div>
  );

  return (
    <div
      className={classNames("header-cell", {
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
