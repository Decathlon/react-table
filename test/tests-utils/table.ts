// eslint-disable-next-line import/no-extraneous-dependencies
import { fireEvent, getAllByTestId } from "@testing-library/react";

export const getRows = (container: HTMLElement, isHeader = false, rowId?: string) => {
  const textMatch = `table-${isHeader ? "header" : "row"}${rowId !== undefined ? `-${rowId}` : ""}`;
  return getAllByTestId(container, textMatch, { exact: rowId !== undefined });
};

export const getCellsOfRow = (row: HTMLElement) => getAllByTestId(row, "table-column");

export const fireMouseEvent = (element: Document | Element | Window, eventName: string) =>
  fireEvent(
    element,
    new MouseEvent(eventName, {
      bubbles: true,
      cancelable: true
    })
  );
