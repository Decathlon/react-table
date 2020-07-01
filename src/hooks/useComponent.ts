import * as React from "react";

export interface ComponentRef<Component = any> {
  current?: Component;
}

export type MutableRefComponent<Component = any> = (element: Component) => void;

const useComponent = <Component = any>(): [MutableRefComponent<Component>, ComponentRef<Component>, () => void] => {
  const [component, setComponent] = React.useState<ComponentRef>({ current: undefined });
  const componentRef: MutableRefComponent = React.useCallback((element: Component) => {
    setComponent({ current: element });
  }, []);

  const [componentUpdated, setComponentUpdated] = React.useState<Date>();

  const onComponentUpdate = React.useCallback(() => {
    setComponentUpdated(new Date());
  }, [componentUpdated]);

  return [componentRef, component, onComponentUpdate];
};

export default useComponent;
