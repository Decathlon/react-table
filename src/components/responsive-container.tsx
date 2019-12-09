import * as React from "react";
import classNames from "classnames";

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

const ResponsiveContainer = ({ className, children }: IResponsiveContainerProps) => {
  const wrapper = React.useRef<HTMLDivElement>(null);
  const [{ height, width }, setSize] = React.useState<IElementSize>({
    height: 0,
    width: 0
  });

  const updateSize = () => {
    if (wrapper && wrapper.current) {
      const { clientWidth, clientHeight } = wrapper.current;
      if (clientWidth !== width || clientHeight !== height) {
        setSize({
          width: clientWidth,
          height: clientHeight
        });
      }
    }
  };

  React.useEffect(() => {
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => {
      window.removeEventListener("resize", updateSize);
    };
  }, [width, height]);

  return (
    <div className={classNames("responsive-container", className)} ref={wrapper}>
      {width && height ? children({ width, height }) : null}
    </div>
  );
};

export default ResponsiveContainer;
