import * as React from "react";
import { isEqual } from "lodash";

export default function useStableValue<Value = any>(value: Value): Value {
  // The ref object is a generic container whose current property is mutable ...
  // ... and can hold any value, similar to an instance property on a class
  const ref = React.useRef<Value>(value);
  if (!isEqual(value, ref.current)) {
    ref.current = value;
  }
  // Return previous value (happens before update in useEffect above)
  return ref.current;
}
