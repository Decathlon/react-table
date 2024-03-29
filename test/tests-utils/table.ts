// eslint-disable-next-line import/no-extraneous-dependencies
import { screen, fireEvent, getAllByTestId } from "@testing-library/react";

export const getRows = (isHeader = false, rowId?: string) => {
  const textMatch = `table-${isHeader ? "header" : "row"}${rowId !== undefined ? `-${rowId}` : ""}`;
  return screen.getAllByTestId(textMatch, { exact: rowId !== undefined });
};

export const getCellsOfRow = (row: HTMLElement) => getAllByTestId(row, "table-column");

export const fireMouseEvent = (element: Document | Element | Window, eventName: string) =>
  fireEvent(
    element,
    new MouseEvent(eventName, {
      bubbles: true,
      cancelable: true,
    })
  );
