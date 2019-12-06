/// <reference path="../typings/tests-entry.d.ts" />
import * as React from "react";
import { cleanup, fireEvent, getByTestId } from "@testing-library/react";

import { subRows, subMiam } from "../../stories/utils/tables";
import { customRender } from "../utils/react-testing-library-utils";
import Table from "../../src/components/table/table";

describe("Row component integration tests", () => {
  test("should open and render a child row", () => {
    const props = subRows({ subsubRows: subMiam })[0];
    const { container } = customRender(<Table id="foo" rows={[props]} />);
    fireEvent.click(getByTestId(container, "table-cell-sub-item-toggle"));
    expect(container.getElementsByClassName("table-row")).toHaveLength(2);
    cleanup();
  });

  test("should open and render a child row openable with a rowSpan", () => {
    const props = subRows({ subsubRows: subMiam })[0];
    const { container } = customRender(<Table id="foo" isSpan rows={[props]} />);
    fireEvent.click(getByTestId(container, "table-row-span-btn"));
    expect(container.getElementsByClassName("table-row")).toHaveLength(2);
    cleanup();
  });
});
