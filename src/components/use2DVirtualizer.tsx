// / <reference lib="es2017.string" />
import useVirtualizer, { IVirtualizerProps } from "./useVirtualizer";

export interface I2DVirtualizerProps {
  /**  The size of the visible window */
  horizontalVirtualizerProps: IVirtualizerProps;
  /** Number of items of the child element */
  verticalVirtualizerProps: IVirtualizerProps;
}

const use2DVirtualizer = (props: I2DVirtualizerProps) => {
  const { horizontalVirtualizerProps, verticalVirtualizerProps } = props;

  const horizontal = useVirtualizer(horizontalVirtualizerProps);

  const vertical = useVirtualizer(verticalVirtualizerProps);
  return {
    horizontal,
    vertical,
  };
};
export default use2DVirtualizer;
