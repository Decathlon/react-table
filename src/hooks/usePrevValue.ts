import * as React from "react";
import { isEqual } from "lodash";

export default function usePrevValue<Value = any>(value: Value): Value | undefined {
  // The ref object is a generic container whose current property is mutable ...
  // ... and can hold any value, similar to an instance property on a class
  const ref = React.useRef<Value>();
  React.useEffect(() => {
    if (!isEqual(value, ref.current)) {
      ref.current = value;
    }
  }, [value]);
  // Return previous value (happens before update in useEffect above)
  return ref.current;
}
