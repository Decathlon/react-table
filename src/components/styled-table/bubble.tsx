import * as React from "react";

import classNames from "classnames";

export enum BubbleType {
  info = "info",
  success = "success",
  warning = "warning",
  error = "error"
}

export interface IBubbleProps {
  className?: string;
  badge?: string;
  type?: BubbleType;
  children?: JSX.Element;
}

const Bubble = ({ className, badge, type, children }: IBubbleProps) => (
  <div className="bubble-container">
    {children}
    <svg className={classNames("bubble-circle", className, type || "")} height="100%" width="100%" viewBox="0 0 100 100">
      <circle className="bubble-circle-main" cx="50" cy="50" r="45" />
      {badge ? (
        <>
          <circle className="bubble-circle-content" cx="80" cy="20" r="10" />
          <text className="bubble-circle-text-content" x={80} y={24}>
            {badge}
          </text>
        </>
      ) : null}
    </svg>
  </div>
);

Bubble.defaultProps = {
  type: BubbleType.info
};

export default React.memo(Bubble);
