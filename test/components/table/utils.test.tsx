/// <reference path="../../typings/tests-entry.d.ts" />
import * as Utils from "../../../src/components/utils/table";
import { DEFAULT_ROW_HEIGHT } from "../../../src/components/constants";
import { IColumn, IColumns, ITrees } from "../../../src/components/table/elementary-table";
import { IRowOptions, IRow } from "../../../src/components/table/row";
import { tableWithSubItems, subRows, generateTable } from "../../../stories/utils/tables";
import { ICell, ICellCoordinates } from "../../../src/components/table/cell";

const rows = tableWithSubItems({
  firstSubRows: subRows({ subsubRows: subRows({}) }),
  secondSubRows: subRows({ subsubRows: subRows({}) }),
});

describe("computeRowStyle", () => {
  test("should return a height property at a value corresponding to size input", () => {
    const rowStyle = Utils.computeRowStyle({ size: 10 });
    expect(rowStyle).toEqual({ height: 10 });
  });
  test("should return empty object when given no input", () => {
    const rowStyle = Utils.computeRowStyle(null);
    expect(rowStyle).toEqual({ height: 56 });
  });
});

describe("computeCellStyle", () => {
  test("should compute the cell style", () => {
    const column: IColumn = { style: { color: "red" }, size: 20 };
    const options: IRowOptions = { size: 30 };
    const cellStyle = Utils.computeCellStyle(column, options);
    expect(cellStyle).toEqual({
      color: "red",
      width: 20,
      height: 30,
    });
  });

  test("should compute the most basic cell style", () => {
    const cellStyle = Utils.computeCellStyle();
    expect(cellStyle).toEqual({
      height: DEFAULT_ROW_HEIGHT,
    });
  });
});

describe("findFirstNotIncluded method", () => {
  test("should return -1", () => {
    let item = Utils.findFirstNotIncluded([], []);
    expect(item).toEqual(-1);
    item = Utils.findFirstNotIncluded([], [1, 2]);
    expect(item).toEqual(-1);
    item = Utils.findFirstNotIncluded([1, 2], [1, 2]);
    expect(item).toEqual(-1);
  });

  test("should return the first not included item", () => {
    let item = Utils.findFirstNotIncluded([2, 3], []);
    expect(item).toEqual(2);
    item = Utils.findFirstNotIncluded([2, 3], [1, 2, 4]);
    expect(item).toEqual(3);
  });
});

describe("addSequentialIndexesToFixedIndexList method", () => {
  test("should return a list of sequential ids, starting at (index start: 1), of length 4", () => {
    const newList = Utils.addSequentialIndexesToFixedIndexList({
      fixedIndexes: [],
      indexStart: 1,
      maxLength: 6,
      maxSize: 200,
      defaultItemSize: 10,
      customSizes: {},
      ignoredIndexes: [],
    });
    expect(newList).toEqual([1, 2, 3, 4, 5]);
  });

  test("should return a list of sequential ids, starting at (index start: 1) + (fixed index before start: 1), concat to fixed index input", () => {
    const newList = Utils.addSequentialIndexesToFixedIndexList({
      fixedIndexes: [0, 2],
      indexStart: 1,
      maxLength: 6,
      maxSize: 200,
      defaultItemSize: 40,
      customSizes: {},
      ignoredIndexes: { 0: true, 2: true },
    });
    expect(newList).toEqual([0, 1, 2, 3, 4, 5]);
  });

  test("should return a list of sequential ids, starting at (index start: 1) + (fixed indexes before start: 0,1,2,3,4), concat to fixed index input", () => {
    const newList = Utils.addSequentialIndexesToFixedIndexList({
      fixedIndexes: [0, 1, 2, 3, 4],
      indexStart: 1,
      maxLength: 57,
      maxSize: 200,
      defaultItemSize: 40,
      customSizes: {},
      ignoredIndexes: { 0: true, 1: true, 2: true, 3: true, 4: true },
    });
    expect(newList).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  test("should return a list with only fixed indexes", () => {
    const newList = Utils.addSequentialIndexesToFixedIndexList({
      fixedIndexes: [0, 2, 4, 5],
      indexStart: 2,
      maxLength: 0,
      maxSize: 200,
      defaultItemSize: 50,
      customSizes: {},
      ignoredIndexes: { 0: true, 2: true, 4: true, 5: true },
    });
    expect(newList).toEqual([0, 2, 4, 5]);
  });
});

describe("getElevatedIndexes method", () => {
  const itemIndexes = [0, 1, 2, 3, 4, 5, 6];

  test("should return a list with fixed indexes where the item in itemIndexesList isn't in the fixed indexes list", () => {
    const newList = Utils.getElevatedIndexes(itemIndexes, { 0: true, 1: true, 2: true, 5: true, 6: true }, {}, 30);
    const expectedIntersection = {
      absoluteEndPositions: {
        "5": 30,
        "6": 0,
      },
      elevations: {
        "2": "start",
        "5": "absolute",
        "6": "absolute",
      },
    };

    expect(newList).toEqual(expectedIntersection);
  });

  test("should return a list with fixed indexes where the item in itemIndexesList isn't in the fixed indexes list (usePrevIndexForLastElevation)", () => {
    const newList = Utils.getElevatedIndexes(itemIndexes, { 0: true, 1: true, 2: true, 5: true, 6: true }, {}, 30, true);
    const expectedIntersection = {
      absoluteEndPositions: {
        "5": 30,
        "6": 0,
      },
      elevations: {
        "2": "start",
        "4": "end",
        "5": "absolute",
        "6": "absolute",
      },
    };
    expect(newList).toEqual(expectedIntersection);
  });

  test("should return an empty list if there are no fixed indexes", () => {
    const newList = Utils.getElevatedIndexes(itemIndexes, {}, {}, 30);
    expect(newList).toEqual({ absoluteEndPositions: {}, elevations: {} });
  });

  test("should return an empty list if all itemIndexes are fixedIndexes", () => {
    const newList = Utils.getElevatedIndexes(
      itemIndexes,
      { 0: true, 1: true, 2: true, 3: true, 4: true, 5: true, 6: true },
      {},
      30
    );
    expect(newList).toEqual({ absoluteEndPositions: {}, elevations: {} });
  });
});

describe("getAllIndexesMap method", () => {
  test("should return an object with the global indexes where all of the sub-items are opened", () => {
    const trees = {
      1: {
        rowIndex: 1,
        columnIndex: 0,
        subTrees: { 0: { rowIndex: 0, columnIndex: 2 } },
      },
      2: {
        rowIndex: 2,
        columnIndex: 1,
        subTrees: { 0: { rowIndex: 0, columnIndex: 2 } },
      },
    };
    const indexesMap = Utils.getAllIndexesMap(trees, rows);
    const expected = {
      absolute: {
        "0": { index: 0, parentIndex: null },
        "1": { index: 1, parentIndex: null },
        "2": { index: 0, parentIndex: 1 },
        "3": { index: 0, parentIndex: 2 },
        "4": { index: 1, parentIndex: 2 },
        "5": { index: 1, parentIndex: 1 },
        "6": { index: 2, parentIndex: null },
        "7": { index: 0, parentIndex: 6 },
        "8": { index: 0, parentIndex: 7 },
        "9": { index: 1, parentIndex: 7 },
        "10": { index: 1, parentIndex: 6 },
      },
      relative: {
        "0": { index: 0 },
        "1": {
          index: 1,
          subItems: {
            "0": {
              index: 2,
              subItems: {
                "0": { index: 3 },
                "1": { index: 4 },
              },
            },
            "1": { index: 5 },
          },
        },
        "2": {
          index: 6,
          subItems: {
            "0": {
              index: 7,
              subItems: {
                "0": { index: 8 },
                "1": { index: 9 },
              },
            },
            "1": { index: 10 },
          },
        },
      },
    };
    expect(indexesMap).toEqual(expected);
  });

  test("should return an object with the global indexes where the first level of the second row is opened and all of the sub-items of the second row are opened", () => {
    const trees = {
      1: { rowIndex: 1, columnIndex: 0 },
      2: {
        rowIndex: 2,
        columnIndex: 1,
        subTrees: { 0: { rowIndex: 0, columnIndex: 2 } },
      },
    };
    const indexesMap = Utils.getAllIndexesMap(trees, rows);
    const expected = {
      absolute: {
        "0": { index: 0, parentIndex: null },
        "1": { index: 1, parentIndex: null },
        "2": { index: 0, parentIndex: 1 },
        "3": { index: 1, parentIndex: 1 },
        "4": { index: 2, parentIndex: null },
        "5": { index: 0, parentIndex: 4 },
        "6": { index: 0, parentIndex: 5 },
        "7": { index: 1, parentIndex: 5 },
        "8": { index: 1, parentIndex: 4 },
      },
      relative: {
        "0": { index: 0 },
        "1": {
          index: 1,
          subItems: {
            "0": { index: 2 },
            "1": { index: 3 },
          },
        },
        "2": {
          index: 4,
          subItems: {
            "0": {
              index: 5,
              subItems: {
                "0": { index: 6 },
                "1": { index: 7 },
              },
            },
            "1": { index: 8 },
          },
        },
      },
    };

    expect(indexesMap).toEqual(expected);
  });

  test("should return an object with the global indexes where all of the sub-items of the first level are opened", () => {
    const trees = {
      1: { rowIndex: 1, columnIndex: 0 },
      2: { rowIndex: 2, columnIndex: 1 },
    };
    const indexesMap = Utils.getAllIndexesMap(trees, rows);
    const expected = {
      absolute: {
        "0": { index: 0, parentIndex: null },
        "1": { index: 1, parentIndex: null },
        "2": { index: 0, parentIndex: 1 },
        "3": { index: 1, parentIndex: 1 },
        "4": { index: 2, parentIndex: null },
        "5": { index: 0, parentIndex: 4 },
        "6": { index: 1, parentIndex: 4 },
      },
      relative: {
        "0": { index: 0 },
        "1": {
          index: 1,
          subItems: {
            "0": { index: 2 },
            "1": { index: 3 },
          },
        },
        "2": {
          index: 4,
          subItems: {
            "0": { index: 5 },
            "1": { index: 6 },
          },
        },
      },
    };

    expect(indexesMap).toEqual(expected);
  });

  test("should return an object with the global indexes where the first level of the first row is opened", () => {
    const trees = { 1: { rowIndex: 1, columnIndex: 0 } };
    const indexesMap = Utils.getAllIndexesMap(trees, rows);
    const expected = {
      absolute: {
        "0": { index: 0, parentIndex: null },
        "1": { index: 1, parentIndex: null },
        "2": { index: 0, parentIndex: 1 },
        "3": { index: 1, parentIndex: 1 },
        "4": { index: 2, parentIndex: null },
      },
      relative: {
        "0": { index: 0 },
        "1": {
          index: 1,
          subItems: {
            "0": { index: 2 },
            "1": { index: 3 },
          },
        },
        "2": { index: 4 },
      },
    };

    expect(indexesMap).toEqual(expected);
  });

  test("should return an object with the global indexes where the first level of the second row is opened", () => {
    const trees = { 2: { rowIndex: 2, columnIndex: 1 } };
    const indexesMap = Utils.getAllIndexesMap(trees, rows);
    const expected = {
      absolute: {
        "0": { index: 0, parentIndex: null },
        "1": { index: 1, parentIndex: null },
        "2": { index: 2, parentIndex: null },
        "3": { index: 0, parentIndex: 2 },
        "4": { index: 1, parentIndex: 2 },
      },
      relative: {
        "0": { index: 0 },
        "1": { index: 1 },
        "2": {
          index: 2,
          subItems: {
            "0": { index: 3 },
            "1": { index: 4 },
          },
        },
      },
    };

    expect(indexesMap).toEqual(expected);
  });

  test("should return an object with the global indexes without sub-items opened", () => {
    const trees: ITrees = {};
    const indexesMap = Utils.getAllIndexesMap(trees, rows);
    const expected = {
      absolute: {
        "0": { index: 0, parentIndex: null },
        "1": { index: 1, parentIndex: null },
        "2": { index: 2, parentIndex: null },
      },
      relative: {
        "0": { index: 0 },
        "1": { index: 1 },
        "2": { index: 2 },
      },
    };

    expect(indexesMap).toEqual(expected);
  });
});

describe("filterRowsByIndexes method", () => {
  test("should return the first and the second rows", () => {
    const trees = {
      1: {
        rowIndex: 1,
        columnIndex: 0,
        subTrees: { 0: { rowIndex: 0, columnIndex: 2 } },
      },
      2: {
        rowIndex: 2,
        columnIndex: 1,
        subTrees: { 0: { rowIndex: 0, columnIndex: 2 } },
      },
    };
    const indexesMap = Utils.getAllIndexesMap(trees, rows);
    const [rowsRelativeIndexes] = Utils.filterRowsByIndexes(rows, [0, 1, 2, 3], indexesMap.absolute, null);
    expect(rowsRelativeIndexes).toEqual([0, 1]);
  });

  test("should return the first row for the first level", () => {
    const trees = {
      1: {
        rowIndex: 1,
        columnIndex: 0,
        subTrees: { 0: { rowIndex: 0, columnIndex: 2 } },
      },
      2: {
        rowIndex: 2,
        columnIndex: 1,
        subTrees: { 0: { rowIndex: 0, columnIndex: 2 } },
      },
    };
    const indexesMap = Utils.getAllIndexesMap(trees, rows);
    const [rowsRelativeIndexes] = Utils.filterRowsByIndexes(rows, [1, 2, 3, 4], indexesMap.absolute, null);
    expect(rowsRelativeIndexes).toEqual([1]);
  });

  test("should return the first row for the first level. Rows 2, 3, 4 and 5 are included in the second and third levels.", () => {
    const trees = {
      1: {
        rowIndex: 1,
        columnIndex: 0,
        subTrees: { 0: { rowIndex: 0, columnIndex: 2 } },
      },
      2: {
        rowIndex: 2,
        columnIndex: 1,
        subTrees: { 0: { rowIndex: 0, columnIndex: 2 } },
      },
    };
    const indexesMap = Utils.getAllIndexesMap(trees, rows);
    const [rowsRelativeIndexes] = Utils.filterRowsByIndexes(rows, [2, 3, 4, 5], indexesMap.absolute, null);
    expect(rowsRelativeIndexes).toEqual([1]);
  });

  test("should return the first and the second rows for the first level. Rows 3, 4 and 5 are included in the second and third levels.", () => {
    const trees = {
      1: {
        rowIndex: 1,
        columnIndex: 0,
        subTrees: { 0: { rowIndex: 0, columnIndex: 2 } },
      },
      2: {
        rowIndex: 2,
        columnIndex: 1,
        subTrees: { 0: { rowIndex: 0, columnIndex: 2 } },
      },
    };
    const indexesMap = Utils.getAllIndexesMap(trees, rows);
    const [rowsRelativeIndexes] = Utils.filterRowsByIndexes(rows, [3, 4, 5, 6], indexesMap.absolute, null);
    expect(rowsRelativeIndexes).toEqual([1, 2]);
  });

  test("should return the second row for the first level. Rows 7, and 10 are included in the second level of the second row.", () => {
    const trees = {
      1: {
        rowIndex: 1,
        columnIndex: 0,
        subTrees: { 0: { rowIndex: 0, columnIndex: 2 } },
      },
      2: {
        rowIndex: 2,
        columnIndex: 1,
        subTrees: { 0: { rowIndex: 0, columnIndex: 2 } },
      },
    };
    const indexesMap = Utils.getAllIndexesMap(trees, rows);
    const [rowsRelativeIndexes] = Utils.filterRowsByIndexes(rows, [7, 8, 9, 10], indexesMap.absolute, null);
    expect(rowsRelativeIndexes).toEqual([2]);
  });

  test("should return the first and the second rows of the second row of the first level.", () => {
    const trees = {
      1: {
        rowIndex: 1,
        columnIndex: 0,
        subTrees: { 0: { rowIndex: 0, columnIndex: 2 } },
      },
      2: {
        rowIndex: 2,
        columnIndex: 1,
        subTrees: { 0: { rowIndex: 0, columnIndex: 2 } },
      },
    };
    const indexesMap = Utils.getAllIndexesMap(trees, rows);
    const [rowsRelativeIndexes] = Utils.filterRowsByIndexes(rows, [7, 8, 9, 10], indexesMap.absolute, 6);
    expect(rowsRelativeIndexes).toEqual([0, 1]);
  });

  test("should return the first and the second rows of the first row of the second level of the second row of the first level.", () => {
    const trees = {
      1: {
        rowIndex: 1,
        columnIndex: 0,
        subTrees: { 0: { rowIndex: 0, columnIndex: 2 } },
      },
      2: {
        rowIndex: 2,
        columnIndex: 1,
        subTrees: { 0: { rowIndex: 0, columnIndex: 2 } },
      },
    };
    const indexesMap = Utils.getAllIndexesMap(trees, rows);
    const [rowsRelativeIndexes] = Utils.filterRowsByIndexes(rows, [7, 8, 9, 10], indexesMap.absolute, 7);
    expect(rowsRelativeIndexes).toEqual([0, 1]);
  });
});

describe("filterRowsByIndexes method", () => {
  test("should return the first and the second rows", () => {
    const trees = {
      1: {
        rowIndex: 1,
        columnIndex: 0,
        subTrees: { 0: { rowIndex: 0, columnIndex: 2 } },
      },
      2: {
        rowIndex: 2,
        columnIndex: 1,
        subTrees: { 0: { rowIndex: 0, columnIndex: 2 } },
      },
    };
    const indexesMap = Utils.getAllIndexesMap(trees, rows);
    const [rowsRelativeIndexes] = Utils.filterRowsByIndexes(rows, [0, 1, 2, 3], indexesMap.absolute, null);
    expect(rowsRelativeIndexes).toEqual([0, 1]);
  });

  test("should return the first row for the first level", () => {
    const trees = {
      1: {
        rowIndex: 1,
        columnIndex: 0,
        subTrees: { 0: { rowIndex: 0, columnIndex: 2 } },
      },
      2: {
        rowIndex: 2,
        columnIndex: 1,
        subTrees: { 0: { rowIndex: 0, columnIndex: 2 } },
      },
    };
    const indexesMap = Utils.getAllIndexesMap(trees, rows);
    const [rowsRelativeIndexes] = Utils.filterRowsByIndexes(rows, [1, 2, 3, 4], indexesMap.absolute, null);
    expect(rowsRelativeIndexes).toEqual([1]);
  });

  test("should return the first row for the first level. Rows 2, 3, 4 and 5 are included in the second and third levels.", () => {
    const trees = {
      1: {
        rowIndex: 1,
        columnIndex: 0,
        subTrees: { 0: { rowIndex: 0, columnIndex: 2 } },
      },
      2: {
        rowIndex: 2,
        columnIndex: 1,
        subTrees: { 0: { rowIndex: 0, columnIndex: 2 } },
      },
    };
    const indexesMap = Utils.getAllIndexesMap(trees, rows);
    const [rowsRelativeIndexes] = Utils.filterRowsByIndexes(rows, [2, 3, 4, 5], indexesMap.absolute, null);
    expect(rowsRelativeIndexes).toEqual([1]);
  });

  test("should return the first and the second rows for the first level. Rows 3, 4 and 5 are included in the second and third levels.", () => {
    const trees = {
      1: {
        rowIndex: 1,
        columnIndex: 0,
        subTrees: { 0: { rowIndex: 0, columnIndex: 2 } },
      },
      2: {
        rowIndex: 2,
        columnIndex: 1,
        subTrees: { 0: { rowIndex: 0, columnIndex: 2 } },
      },
    };
    const indexesMap = Utils.getAllIndexesMap(trees, rows);
    const [rowsRelativeIndexes] = Utils.filterRowsByIndexes(rows, [3, 4, 5, 6], indexesMap.absolute, null);
    expect(rowsRelativeIndexes).toEqual([1, 2]);
  });

  test("should return the second row for the first level. Rows 7, and 10 are included in the second level of the second row.", () => {
    const trees = {
      1: {
        rowIndex: 1,
        columnIndex: 0,
        subTrees: { 0: { rowIndex: 0, columnIndex: 2 } },
      },
      2: {
        rowIndex: 2,
        columnIndex: 1,
        subTrees: { 0: { rowIndex: 0, columnIndex: 2 } },
      },
    };
    const indexesMap = Utils.getAllIndexesMap(trees, rows);
    const [rowsRelativeIndexes] = Utils.filterRowsByIndexes(rows, [7, 8, 9, 10], indexesMap.absolute, null);
    expect(rowsRelativeIndexes).toEqual([2]);
  });

  test("should return the first and the second rows of the second row of the first level.", () => {
    const trees = {
      1: {
        rowIndex: 1,
        columnIndex: 0,
        subTrees: { 0: { rowIndex: 0, columnIndex: 2 } },
      },
      2: {
        rowIndex: 2,
        columnIndex: 1,
        subTrees: { 0: { rowIndex: 0, columnIndex: 2 } },
      },
    };
    const indexesMap = Utils.getAllIndexesMap(trees, rows);
    const [rowsRelativeIndexes] = Utils.filterRowsByIndexes(rows, [7, 8, 9, 10], indexesMap.absolute, 6);
    expect(rowsRelativeIndexes).toEqual([0, 1]);
  });

  test("should return the first and the second rows of the first row of the second level of the second row of the first level.", () => {
    const trees = {
      1: {
        rowIndex: 1,
        columnIndex: 0,
        subTrees: { 0: { rowIndex: 0, columnIndex: 2 } },
      },
      2: {
        rowIndex: 2,
        columnIndex: 1,
        subTrees: { 0: { rowIndex: 0, columnIndex: 2 } },
      },
    };
    const indexesMap = Utils.getAllIndexesMap(trees, rows);
    const [rowsRelativeIndexes] = Utils.filterRowsByIndexes(rows, [7, 8, 9, 10], indexesMap.absolute, 7);
    expect(rowsRelativeIndexes).toEqual([0, 1]);
  });
});

describe("getTreeLength method", () => {
  test("should return the first and the second rows", () => {
    // With 2 levels
    let tree = {
      rowIndex: 1,
      columnIndex: 0,
      subTrees: [{ rowIndex: 0, columnIndex: 2 }],
    };
    let treesLength = Utils.getTreeLength(tree, rows);
    expect(treesLength).toEqual(4);
    // With 1 level
    tree = { rowIndex: 1, columnIndex: 0, subTrees: [] };
    treesLength = Utils.getTreeLength(tree, rows);
    expect(treesLength).toEqual(2);
  });
});

describe("getTreesLength method", () => {
  test("should return the length of the opened trees", () => {
    // With 2 levels
    let trees: ITrees = {
      1: {
        rowIndex: 1,
        columnIndex: 0,
        subTrees: { 0: { rowIndex: 0, columnIndex: 2 } },
      },
      2: {
        rowIndex: 2,
        columnIndex: 1,
        subTrees: { 0: { rowIndex: 0, columnIndex: 2 } },
      },
    };
    let treesLength = Utils.getTreesLength(trees, rows);
    expect(treesLength).toEqual(8);
    trees = {
      1: { rowIndex: 1, columnIndex: 0, subTrees: {} },
      2: {
        rowIndex: 2,
        columnIndex: 1,
        subTrees: { 0: { rowIndex: 0, columnIndex: 2 } },
      },
    };
    treesLength = Utils.getTreesLength(trees, rows);
    expect(treesLength).toEqual(6);
    // With 1 level
    trees = {
      1: { rowIndex: 1, columnIndex: 0, subTrees: {} },
      2: { rowIndex: 2, columnIndex: 1, subTrees: {} },
    };
    treesLength = Utils.getTreesLength(trees, rows);
    expect(treesLength).toEqual(4);
    trees = { 2: { rowIndex: 2, columnIndex: 1, subTrees: {} } };
    treesLength = Utils.getTreesLength(trees, rows);
    expect(treesLength).toEqual(2);
    // With no trees
    trees = [];
    treesLength = Utils.getTreesLength(trees, rows);
    expect(treesLength).toEqual(0);
  });
});

describe("getRootIndex method", () => {
  test("should return the root index of an item specified by its index", () => {
    const trees = {
      1: {
        rowIndex: 1,
        columnIndex: 0,
        subTrees: { 0: { rowIndex: 0, columnIndex: 2 } },
      },
      2: {
        rowIndex: 2,
        columnIndex: 1,
        subTrees: { 0: { rowIndex: 0, columnIndex: 2 } },
      },
    };
    const indexesMap = Utils.getAllIndexesMap(trees, rows);
    let rootIndex = Utils.getRootIndex(2, null, indexesMap.absolute);
    expect(rootIndex).toEqual(1);
    rootIndex = Utils.getRootIndex(1, null, indexesMap.absolute);
    expect(rootIndex).toEqual(1);
    rootIndex = Utils.getRootIndex(9, null, indexesMap.absolute);
    expect(rootIndex).toEqual(6);
    rootIndex = Utils.getRootIndex(9, 6, indexesMap.absolute);
    expect(rootIndex).toEqual(7);
    rootIndex = Utils.getRootIndex(9, 7, indexesMap.absolute);
    expect(rootIndex).toEqual(9);
  });
});

describe("getIndexesMap method", () => {
  test("should return an object with the global indexes where all of the sub-items are opened", () => {
    const trees = {
      1: {
        rowIndex: 1,
        columnIndex: 0,
        subTrees: { 0: { rowIndex: 0, columnIndex: 2 } },
      },
      2: {
        rowIndex: 2,
        columnIndex: 1,
        subTrees: { 0: { rowIndex: 0, columnIndex: 2 } },
      },
    };
    // first level
    let indexesMap = Utils.getIndexesMap(trees, 0, rows);
    const expected = {
      absolute: {
        "0": { index: 0, parentIndex: null },
      },
      relative: {
        "0": { index: 0 },
      },
    };
    expect(indexesMap).toEqual(expected);
    // Second level
    indexesMap = Utils.getIndexesMap(trees, 0, rows, 1);
    const expectedSecond = {
      absolute: {
        "2": { index: 0, parentIndex: 1 },
      },
      relative: {
        "0": {
          index: 2,
        },
      },
    };

    expect(indexesMap).toEqual(expectedSecond);
  });
});

describe("getRowTreeLength method", () => {
  test("should return the length of all sub-items of the first row (step by step)", () => {
    const trees = {
      1: {
        rowIndex: 1,
        columnIndex: 0,
        subTrees: { 0: { rowIndex: 0, columnIndex: 2 } },
      },
      2: {
        rowIndex: 2,
        columnIndex: 1,
        subTrees: { 0: { rowIndex: 0, columnIndex: 2 } },
      },
    };
    const indexesMap = Utils.getAllIndexesMap(trees, rows);
    // initial position (max top)
    let rowLength = Utils.getRowTreeLength(1, [0, 1, 2, 3, 4, 5, 6], indexesMap.absolute);
    expect(rowLength).toEqual(4);
    // scroll to 1
    rowLength = Utils.getRowTreeLength(1, [1, 2, 3, 4, 5, 6, 7], indexesMap.absolute);
    expect(rowLength).toEqual(4);
    // scroll to 2
    rowLength = Utils.getRowTreeLength(1, [2, 3, 4, 5, 6, 7, 8], indexesMap.absolute);
    expect(rowLength).toEqual(4);
    // scroll to 3
    rowLength = Utils.getRowTreeLength(1, [3, 4, 5, 6, 7, 8, 9], indexesMap.absolute);
    expect(rowLength).toEqual(3);
    // scroll to 4
    rowLength = Utils.getRowTreeLength(1, [4, 5, 6, 7, 8, 9, 10], indexesMap.absolute);
    expect(rowLength).toEqual(2);
    // scroll to 5
    rowLength = Utils.getRowTreeLength(1, [5, 6, 7, 8, 9, 10, 11], indexesMap.absolute);
    expect(rowLength).toEqual(1);
    // scroll to 6
    rowLength = Utils.getRowTreeLength(1, [6, 7, 8, 9, 10, 11, 12], indexesMap.absolute);
    expect(rowLength).toEqual(0);
  });
  test("should return the length of all sub-items of the first row (step by step) with empty opend trees", () => {
    const indexesMap = Utils.getAllIndexesMap([], rows);
    // initial position (max top)
    let rowLength = Utils.getRowTreeLength(1, [0, 1, 2, 3, 4, 5, 6], indexesMap.absolute);
    expect(rowLength).toEqual(0);
    // scroll to 1
    rowLength = Utils.getRowTreeLength(1, [1, 2, 3, 4, 5, 6, 7], indexesMap.absolute);
    expect(rowLength).toEqual(0);
  });
});

describe("filterIndexes method", () => {
  test("should return the filtered indexes", () => {
    const indexes = { 1: "foo", 2: "bar", 3: "car", 4: "tar", 5: "sar" };
    let filteredIndexes = Utils.filterIndexes(indexes, 2, 4);
    expect(filteredIndexes).toEqual({ "2": "bar", "3": "car", "4": "tar" });
    filteredIndexes = Utils.filterIndexes(indexes, 4, 19);
    expect(filteredIndexes).toEqual({ "4": "tar", "5": "sar" });
    // empty filter
    filteredIndexes = Utils.filterIndexes(indexes, 10, 19);
    expect(filteredIndexes).toEqual({});
  });
});

describe("getItemsCustomSizes method", () => {
  test("should return the height of all fixed rows with a custom height and count those elements", () => {
    const table = generateTable(5, 2, {}, true);
    table.rows[0].size = 25;
    table.rows[1].size = 150;
    table.rows[4].size = 225;
    const customCellsHeight = Utils.getItemsCustomSizes(table.rows, [0, 1, 4]);
    expect(customCellsHeight).toEqual({
      fixed: {
        sum: 400,
        count: 3,
      },
      scrollable: {
        count: 0,
        sum: 0,
      },
      customSizes: {
        0: 25,
        1: 150,
        4: 225,
      },
    });
  });

  test("should return a sum and count at 0 when there is no custom height for fixed rows", () => {
    const table = generateTable(5, 2, {}, true);
    const customCellsHeight = Utils.getItemsCustomSizes(table.rows, [0, 1, 4]);
    expect(customCellsHeight).toEqual({
      fixed: {
        sum: 0,
        count: 0,
      },
      scrollable: {
        count: 0,
        sum: 0,
      },
      customSizes: {},
    });
  });

  test("should return undefined if fixedRows is undefined", () => {
    const rowsProps = { 0: { size: 25 }, 1: { size: 150 }, 4: { size: 225 } };
    const customCellsHeight = Utils.getItemsCustomSizes(rowsProps);
    expect(customCellsHeight).toEqual({
      customSizes: {
        "0": 25,
        "1": 150,
        "4": 225,
      },
      fixed: {
        count: 0,
        sum: 0,
      },
      scrollable: {
        count: 3,
        sum: 400,
      },
    });
  });

  test("should return the width of all fixed columns with a custom width and count those elements", () => {
    const customCellsHeight = Utils.getItemsCustomSizes(
      {
        0: { size: 25 },
        1: { size: 150 },
        4: { size: 225 },
      },
      [0, 1, 4]
    );

    expect(customCellsHeight).toEqual({
      fixed: {
        sum: 400,
        count: 3,
      },
      scrollable: {
        count: 0,
        sum: 0,
      },
      customSizes: {
        0: 25,
        1: 150,
        4: 225,
      },
    });
  });
});

describe("getVisibleIndexesInsideDatalength", () => {
  test("should return visibleIndexes without indexes that are above the dataLenght", () => {
    const dataLength = 49;
    const visibleIndexes: number[] = [0, 1, 2, 3, 4, 49];
    const expectedNewVisibleIndexes: number[] = [0, 1, 2, 3, 4];
    const newVisibleIndexes = Utils.getVisibleIndexesInsideDatalength(dataLength, visibleIndexes);

    expect(newVisibleIndexes).toEqual(expectedNewVisibleIndexes);
  });

  test("should return visibleIndexes without changing it", () => {
    const dataLength = 49;
    const visibleIndexes: number[] = [0, 1, 2, 3, 4, 48];
    const expectedNewVisibleIndexes: number[] = [0, 1, 2, 3, 4, 48];
    const newVisibleIndexes = Utils.getVisibleIndexesInsideDatalength(dataLength, visibleIndexes);

    expect(newVisibleIndexes).toEqual(expectedNewVisibleIndexes);
  });

  test("should return empty when data length is 0", () => {
    const dataLength = 0;
    const visibleIndexes = [0, 1, 2, 3, 4, 48];
    const expectedNewVisibleIndexes: number[] = [];
    const newVisibleIndexes = Utils.getVisibleIndexesInsideDatalength(dataLength, visibleIndexes);

    expect(newVisibleIndexes).toEqual(expectedNewVisibleIndexes);
  });

  test("should return empty when visibleIndexes is empty", () => {
    const dataLength = 50;
    const visibleIndexes: number[] = [];
    const expectedNewVisibleIndexes: number[] = [];
    const newVisibleIndexes = Utils.getVisibleIndexesInsideDatalength(dataLength, visibleIndexes);

    expect(newVisibleIndexes).toEqual(expectedNewVisibleIndexes);
  });
});

describe("relativeToAbsoluteIndexes method", () => {
  test("should return the absolute indexes list", () => {
    const trees = {
      1: {
        rowIndex: 1,
        columnIndex: 0,
        subTrees: { 0: { rowIndex: 0, columnIndex: 2 } },
      },
      2: {
        rowIndex: 2,
        columnIndex: 1,
        subTrees: { 0: { rowIndex: 0, columnIndex: 2 } },
      },
    };
    const indexesMap = Utils.getAllIndexesMap(trees, rows);
    const relativeIndexes = Utils.relativeToAbsoluteIndexes([0, 1, 2], indexesMap.relative);
    expect(relativeIndexes).toEqual([0, 1, 6]);
  });
});

describe("getIndexesIdsMapping method", () => {
  test("should return the indexes ids mapping", () => {
    const items = [{ id: "foo" }, { id: "bar" }, { id: "tar" }];
    const mapping = Utils.getIndexesIdsMapping(items);
    const expectedMapping = {
      foo: 0,
      bar: 1,
      tar: 2,
    };
    expect(mapping).toEqual(expectedMapping);
  });

  test("should return an empty indexes ids mapping", () => {
    const items: Utils.INode[] = [];
    const mapping = Utils.getIndexesIdsMapping(items);
    const expectedMapping = {};
    expect(mapping).toEqual(expectedMapping);
  });
});

describe("getCell method", () => {
  test("should return undefined", () => {
    const path = [{ rowIndex: 0, cellIndex: 0 }];
    const cell = Utils.getCell([], path);
    const expectedCell = undefined;
    expect(cell).toEqual(expectedCell);
  });

  test("should return undefined (empty path)", () => {
    const path: ICellCoordinates[] = [];
    const cell = Utils.getCell(rows, path);
    const expectedCell = undefined;
    expect(cell).toEqual(expectedCell);
  });

  test("should return the first cell", () => {
    const path = [{ rowIndex: 0, cellIndex: 0 }];
    const cell = Utils.getCell(rows, path);
    const expectedCell = {
      id: "wawoo",
      value: "Wawooo!",
    };
    expect(cell).toEqual(expectedCell);
  });

  test("should return the second cell of the second level", () => {
    const path = [
      { rowIndex: 1, cellIndex: 0 },
      { rowIndex: 0, cellIndex: 1 },
    ];
    const cell = Utils.getCell(rows, path);
    const expectedCell = {
      id: "jest",
      value: "Jest",
    };
    expect(cell).toEqual(expectedCell);
  });
});

describe("setCell method", () => {
  test("should return the initial rows", () => {
    const path = [{ rowIndex: 0, cellIndex: 0 }];
    const newRows = Utils.setCell([], path, null);
    expect(newRows).toEqual([]);
  });

  test("should return the initial rows (empty path)", () => {
    const path: ICellCoordinates[] = [];
    const newCell = { id: "wawoo", value: "newValue" };
    const newRows = Utils.setCell(rows, path, newCell);
    expect(newRows).toEqual(rows);
  });

  test("should return an updated rows (first level)", () => {
    const path = [{ rowIndex: 0, cellIndex: 0 }];
    const newCell = { id: "wawoo", value: "newValue" };
    const newRows = Utils.setCell(rows, path, newCell);
    const cell = Utils.getCell(newRows, path);
    expect(cell).toEqual(newCell);
  });

  test("should return an updated rows (second level)", () => {
    const path = [
      { rowIndex: 1, cellIndex: 0 },
      { rowIndex: 0, cellIndex: 1 },
    ];
    const newCell = { id: "jest", value: "newValue" };
    const newRows = Utils.setCell(rows, path, newCell);
    const cell = Utils.getCell(newRows, path);
    expect(cell).toEqual(newCell);
  });
});

describe("getMappingCellsWithColspan method", () => {
  test("should return mapping with colspan when first item contain colspan 2", () => {
    const items: ICell[] = [
      { id: "1", colspan: 2 },
      { id: "2", colspan: 1 },
    ];
    const mapping = Utils.getMappingCellsWithColspan(items);
    const expectedMapping = {
      isIdentity: false,
      indexToColspan: {
        0: [0, 1],
        1: [2],
      },
      colspanToIndex: { 0: 0, 1: 0, 2: 1 },
    };

    expect(mapping).toEqual(expectedMapping);
  });

  test("should return mapping with colspan when all items contain colspan", () => {
    const items: ICell[] = [
      { id: "1", colspan: 4 },
      { id: "2", colspan: 2 },
    ];
    const mapping = Utils.getMappingCellsWithColspan(items);
    const expectedMapping = {
      isIdentity: false,
      indexToColspan: {
        0: [0, 1, 2, 3],
        1: [4, 5],
      },
      colspanToIndex: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 1, 5: 1 },
    };

    expect(mapping).toEqual(expectedMapping);
  });

  test("should return mapping with colspan  when first item contain colspan 1", () => {
    const items: ICell[] = [
      { id: "1", colspan: 1 },
      { id: "2", colspan: 2 },
    ];
    const mapping = Utils.getMappingCellsWithColspan(items);
    const expectedMapping = {
      isIdentity: false,
      indexToColspan: {
        0: [0],
        1: [1, 2],
      },
      colspanToIndex: { 0: 0, 1: 1, 2: 1 },
    };

    expect(mapping).toEqual(expectedMapping);
  });

  test("should return mapping with colspan when all items contain colspan 1", () => {
    const items: ICell[] = [
      { id: "1", colspan: 1 },
      { id: "2", colspan: 1 },
    ];
    const mapping = Utils.getMappingCellsWithColspan(items);
    const expectedMapping = {
      isIdentity: true,
      indexToColspan: {
        0: [0],
        1: [1],
      },
      colspanToIndex: { 0: 0, 1: 1 },
    };

    expect(mapping).toEqual(expectedMapping);
  });

  test("should return mapping with colspan when colspan value is placed between colspan 1", () => {
    const items: ICell[] = [
      { id: "1", colspan: 1 },
      { id: "2", colspan: 3 },
      { id: "3", colspan: 1 },
    ];
    const mapping = Utils.getMappingCellsWithColspan(items);
    const expectedMapping = {
      isIdentity: false,
      indexToColspan: {
        0: [0],
        1: [1, 2, 3],
        2: [4],
      },
      colspanToIndex: { 0: 0, 1: 1, 2: 1, 3: 1, 4: 2 },
    };

    expect(mapping).toEqual(expectedMapping);
  });

  test("should return mapping with colspan when items array is empty", () => {
    const items: ICell[] = [];
    const mapping = Utils.getMappingCellsWithColspan(items);
    const expectedMapping = {
      isIdentity: true,
      indexToColspan: {},
      colspanToIndex: {},
    };

    expect(mapping).toEqual(expectedMapping);
  });

  test("should return mapping with colspan when array items contain only one item whith a colspan", () => {
    const items: ICell[] = [{ id: "1", colspan: 5 }];
    const mapping = Utils.getMappingCellsWithColspan(items);
    const expectedMapping = {
      isIdentity: false,
      indexToColspan: {
        0: [0, 1, 2, 3, 4],
      },
      colspanToIndex: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 },
    };

    expect(mapping).toEqual(expectedMapping);
  });

  test("should return mapping with colspan when array items contain an empty object", () => {
    const items: ICell[] = [{ id: "1", colspan: 2 }, { id: "2" }];
    const mapping = Utils.getMappingCellsWithColspan(items);
    const expectedMapping = {
      isIdentity: false,
      indexToColspan: {
        0: [0, 1],
        1: [2],
      },
      colspanToIndex: { 0: 0, 1: 0, 2: 1 },
    };

    expect(mapping).toEqual(expectedMapping);
  });

  test("should return mapping with colspan when array items contain an empty object", () => {
    const items: ICell[] = [{ id: "1", colspan: 2 }, { id: "2" }, { id: "3" }, { id: "4" }, { id: "5", colspan: 3 }];
    const mapping = Utils.getMappingCellsWithColspan(items);
    const expectedMapping = {
      isIdentity: false,
      indexToColspan: {
        0: [0, 1],
        1: [2],
        2: [3],
        3: [4],
        4: [5, 6, 7],
      },
      colspanToIndex: { 0: 0, 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 4, 7: 4 },
    };

    expect(mapping).toEqual(expectedMapping);
  });
});

describe("generateArray method", () => {
  test("should return array when start index equal 0", () => {
    const startIndex = 0;
    const length = 3;
    const array = Utils.generateArray(startIndex, length);
    const expectedArray = [0, 1, 2];
    expect(array).toEqual(expectedArray);
  });

  test("should return array when start index isn't 0", () => {
    const startIndex = 5;
    const length = 3;
    const array = Utils.generateArray(startIndex, length);
    const expectedArray = [5, 6, 7];
    expect(array).toEqual(expectedArray);
  });

  test("should return array when length equal 0", () => {
    const startIndex = 5;
    const length = 0;
    const array = Utils.generateArray(startIndex, length);
    const expectedArray: number[] = [];
    expect(array).toEqual(expectedArray);
  });
});

describe("getColspanValues method", () => {
  test("should return colspan for index 0 when scroll index equal 2", () => {
    const indexes = [2, 3, 4];
    const mapping = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
    const result = Utils.getColspanValues(indexes, mapping);
    const expectedMapping = [[0], { 0: 3 }];
    expect(result).toEqual(expectedMapping);
  });

  test("should return mapping with colspan 1 when scroll index equal 2", () => {
    const indexes = [2, 3, 4];
    const mapping = { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4 };
    const result = Utils.getColspanValues(indexes, mapping);
    const expectedMapping = [[2, 3, 4], { 2: 1, 3: 1, 4: 1 }];
    expect(result).toEqual(expectedMapping);
  });
});

describe("getColumnsLength method", () => {
  test("should return 0 if rows is empty", () => {
    const rows: IRow[] = [];
    const columnsLength = Utils.getColumnsLength(rows);
    const expectedLength = 0;
    expect(columnsLength).toEqual(expectedLength);
  });

  test("should return a regular length", () => {
    const rows = [{ id: "header", cells: [{ id: "0" }, { id: "1" }, { id: "2" }] }];
    const columnsLength = Utils.getColumnsLength(rows);
    const expectedLength = 3;
    expect(columnsLength).toEqual(expectedLength);
  });

  test("should return the length including colspan values", () => {
    const rows = [
      {
        id: "header",
        cells: [{ id: "0", colspan: 1 }, { id: "1", colspan: 3 }, { id: "2" }],
      },
    ];
    const columnsLength = Utils.getColumnsLength(rows);
    const expectedLength = 5;
    expect(columnsLength).toEqual(expectedLength);
  });
});

describe("getDenseColumns method", () => {
  test("should return empty columns (table width == container wdth)", () => {
    const tableWidth = 400;
    const containerWidth = 400;
    const columnsLength = 8;
    const denseColumns = Utils.getDenseColumns(tableWidth, containerWidth, columnsLength);
    const expectedColumns: IColumns = {};
    expect(denseColumns).toEqual(expectedColumns);
  });

  test("should return empty columns (table width > container wdth)", () => {
    const tableWidth = 500;
    const containerWidth = 400;
    const columnsLength = 10;
    const denseColumns = Utils.getDenseColumns(tableWidth, containerWidth, columnsLength);
    const expectedColumns: IColumns = {};
    expect(denseColumns).toEqual(expectedColumns);
  });

  test("should return initial columns columns ", () => {
    const tableWidth = 500;
    const containerWidth = 400;
    const columnsLength = 10;
    const columns: IColumns = { "0": { size: 3 } };
    const denseColumns = Utils.getDenseColumns(tableWidth, containerWidth, columnsLength, columns);
    const expectedColumns: IColumns = columns;
    expect(denseColumns).toEqual(expectedColumns);
  });

  test("should return dense columns", () => {
    const tableWidth = 200;
    const containerWidth = 400;
    const columnsLength = 4;
    const denseColumns = Utils.getDenseColumns(tableWidth, containerWidth, columnsLength);
    const expectedColumns: IColumns = { "3": { style: { paddingRight: 200 } } };
    expect(denseColumns).toEqual(expectedColumns);
  });

  test("should return dense columns merged with the initial columns", () => {
    const tableWidth = 200;
    const containerWidth = 400;
    const columnsLength = 4;
    const columns: IColumns = { "0": { size: 3 }, "3": { size: 10 } };
    const denseColumns = Utils.getDenseColumns(tableWidth, containerWidth, columnsLength, columns);
    const expectedColumns: IColumns = {
      "0": { size: 3 },
      "3": { size: 10, style: { paddingRight: 200 } },
    };
    expect(denseColumns).toEqual(expectedColumns);
  });
});

describe("getIndexScrollMapping method", () => {
  test("should return the scroll mapping (4 itmes)", () => {
    const itemsLength = 4;
    const itemsSizes = { 0: 40 };
    const defaultCellSize = 10;
    const hiddenItems = [1];
    const fixedItemsTotalSizeWithCustomSizes = Utils.getIndexScrollMapping(itemsLength, itemsSizes, defaultCellSize, hiddenItems);
    expect(fixedItemsTotalSizeWithCustomSizes).toEqual([0, 40, 40, 50]);
  });

  test("should return the scroll mapping (10 items)", () => {
    const itemsLength = 10;
    const itemsSizes = { 1: 30, 4: 40 };
    const defaultCellSize = 10;
    const hiddenItems = [2, 7];
    const fixedItemsTotalSizeWithCustomSizes = Utils.getIndexScrollMapping(itemsLength, itemsSizes, defaultCellSize, hiddenItems);
    expect(fixedItemsTotalSizeWithCustomSizes).toEqual([0, 10, 40, 40, 50, 90, 100, 110, 110, 120]);
  });
});
