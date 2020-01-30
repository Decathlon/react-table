/// <reference path="../typings/tests-entry.d.ts" />

import { getStringNumberWithoutTrailingZeros } from "../../src/components/utils";

describe("getStringNumberWithoutTrailingZeros", () => {
  test("should return 100 without its 1 trailing zero", () => {
    const decimals = 1;
    const value = 100.01;
    const result = getStringNumberWithoutTrailingZeros(value, decimals);
    expect(result).toEqual("100");
  });
  test("should return 100 without its 2 trailing zeros", () => {
    const decimals = 2;
    const value = 100.001;
    const result = getStringNumberWithoutTrailingZeros(value, decimals);
    expect(result).toEqual("100");
  });
  test("should round decimals and return 100.11", () => {
    const decimals = 2;
    const value = 100.105;
    const result = getStringNumberWithoutTrailingZeros(value, decimals);
    expect(result).toEqual("100.11");
  });
  test("should return 100 without its 1 trailing zero", () => {
    const decimals = 2;
    const value = 100.10001;
    const result = getStringNumberWithoutTrailingZeros(value, decimals);
    expect(result).toEqual("100.1");
  });
  test("should return number with its whole decimals", () => {
    const decimals = 4;
    const value = 100.0001;
    const result = getStringNumberWithoutTrailingZeros(value, decimals);
    expect(result).toEqual("100.0001");
  });
});
