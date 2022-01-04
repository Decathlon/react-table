import classNames from "classnames";
import ResizeObserver from "react-resize-detector";

interface IElementSize {
  width: number;
  height: number;
}

export interface IResponsiveContainerOptionalProps {
  className?: string;
}

export interface IResponsiveContainerProps extends IResponsiveContainerOptionalProps {
  children: (size: IElementSize) => JSX.Element;
}

const ResponsiveContainer = ({ className, children }: IResponsiveContainerProps): JSX.Element => {
  return (
    <ResizeObserver>
      {({ width, height }) => {
        return (
          <div className={classNames("responsive-container", className)}>
            {width && height ? children({ width, height }) : null}
          </div>
        );
      }}
    </ResizeObserver>
  );
};

export default ResponsiveContainer;
