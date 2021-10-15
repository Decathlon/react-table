import { IRow } from "../../src/components/table/row";

export const simpleTable = ({
  customCell,
  customCellProps,
  loading = false,
}: {
  customCell?: React.ComponentType<any>;
  customCellProps?: object;
  loading?: boolean;
}): IRow[] => [
  {
    id: "front",
    isHeader: true,
    cells: [
      {
        id: "wawoo",
        value: "Wawooo!",
      },
      {
        id: "wah",
        value: "Wah!",
      },
      {
        id: "cool",
        value: "Cool!",
      },
    ],
  },
  {
    id: "front1",
    cells: [
      {
        id: "react",
        value: "React",
        cellContent: customCell,
        cellContentProps: customCellProps,
      },
      {
        id: "angular",
        value: "Angular",
      },
      {
        id: "vuejs",
        value: "VueJS",
      },
    ],
  },
  {
    id: "back",
    loading,
    cells: [
      {
        id: "python",
        value: "Python",
      },
      {
        id: "Go",
        value: "Go",
      },
      {
        id: "Java",
        value: "java",
      },
    ],
  },
  {
    id: "back1",
    cells: [
      {
        id: "python",
        value: "Python1",
      },
      {
        id: "Go",
        value: "Go",
      },
      {
        id: "Java",
        value: "java",
      },
    ],
  },
  {
    id: "back2",
    cells: [
      {
        id: "python",
        value: "Python2",
      },
      {
        id: "Go",
        value: "Go",
      },
      {
        id: "Java",
        value: "java",
      },
    ],
  },
  {
    id: "back3",
    cells: [
      {
        id: "python",
        value: "Python3",
      },
      {
        id: "Go",
        value: "Go",
      },
      {
        id: "Java",
        value: "java",
      },
    ],
  },
];

export const subRows = ({ subsubRows = [] }: { subsubRows?: IRow[] }): IRow[] => [
  {
    id: "foo",
    cells: [
      {
        id: "storybook",
        value: "Storybook",
      },
      {
        id: "jest",
        value: "Jest",
      },
      {
        id: "Enzym",
        value: "enzyme",
        subItems: subsubRows,
      },
    ],
  },
  {
    id: "back",
    cells: [
      {
        id: "docker",
        value: "Docker",
      },
      {
        id: "doccomp",
        value: "Docker compose",
      },
      {
        id: "Sentry",
        value: "Sentry",
        subItems: subsubRows,
      },
    ],
  },
];

export const subMiam: IRow[] = [
  {
    id: "miam",
    cells: [
      {
        id: "sushi",
        value: "Sushi",
      },
      {
        id: "pizza",
        value: "Pizza",
      },
      {
        id: "mafe",
        value: "Mafe",
      },
    ],
  },
];

export const tableWithSubItems = ({
  firstSubRows = [],
  secondSubRows = [],
}: {
  firstSubRows?: IRow[];
  secondSubRows?: IRow[];
}): IRow[] => {
  const table = [
    {
      id: "front",
      isHeader: true,
      isSelectable: false,
      cells: [
        {
          id: "wawoo",
          value: "Wawooo!",
        },
        {
          id: "wah",
          value: "Wah!",
        },
        {
          id: "cool",
          value: "Cool!",
        },
      ],
    },
    {
      title: "foo",
      id: "front1",
      cells: [
        {
          id: "react",
          value: "React",
          subItems: firstSubRows,
        },
        {
          id: "angular",
          value: "Angular",
        },
        {
          id: "vuejs",
          value: "VueJS",
        },
      ],
    },
    {
      id: "back",
      cells: [
        {
          id: "python",
          value: "Python",
        },
        {
          id: "Go",
          value: "Go",
          subItems: secondSubRows,
        },
        {
          id: "Java",
          value: "java",
        },
      ],
    },
  ];
  return table;
};

export const tableWithDifferentRowSizes: IRow[] = [
  {
    id: "front",
    isHeader: true,
    cells: [
      {
        id: "wawoo",
        value: "Wawooo!",
      },
      {
        id: "wah",
        value: "Wah!",
      },
      {
        id: "cool",
        value: "Cool!",
      },
    ],
  },
  {
    id: "front1",
    isHeader: false,
    cells: [
      {
        id: "foo",
        value: "foo",
      },
      {
        id: "bar",
        value: "bar",
      },
      {
        id: "fuzz",
        value: "fuzz",
      },
    ],
  },
  {
    id: "small",
    size: 25,
    cells: [
      {
        id: "small",
        value: "Wawooo!",
      },
      {
        id: "wah",
        value: "Wah!",
      },
      {
        id: "cool",
        value: "Cool!",
      },
    ],
  },
  {
    id: "medium",
    size: 40,
    cells: [
      {
        id: "medium",
        value: "React",
      },
      {
        id: "angular",
        value: "Angular",
      },
      {
        id: "vuejs",
        value: "VueJS",
      },
    ],
  },
  {
    id: "large",
    size: 80,
    cells: [
      {
        id: "large",
        value: "Python",
      },
      {
        id: "Go",
        value: "Go",
      },
      {
        id: "Java",
        value: "java",
      },
    ],
  },
];

export const tableWithDifferentColspan: IRow[] = [
  {
    id: "front",
    isHeader: true,
    cells: [
      {
        id: "wawoo",
        value: "Wawooo!",
      },
      {
        id: "wah",
        value: "Wah!",
      },
      {
        id: "cool",
        value: "Cool!",
      },
    ],
  },
  {
    id: "front1",
    isHeader: false,
    cells: [
      {
        id: "foo",
        value: "foo",
        colspan: 2,
      },
      {
        id: "fuzz",
        value: "fuzz",
      },
    ],
  },
  {
    id: "foo",
    cells: [
      {
        id: "wah",
        value: "Wah!",
      },
      {
        id: "cool",
        value: "Cool!",
        colspan: 2,
      },
    ],
  },
  {
    id: "foo",
    cells: [
      {
        id: "medium",
        value: "React",
      },
      {
        id: "angular",
        value: "Angular",
      },
      {
        id: "vuejs",
        value: "VueJS",
      },
    ],
  },
  {
    id: "foo",
    cells: [
      {
        id: "large",
        value: "Python",
        colspan: 3,
      },
    ],
  },
];

export const defaultColspanMatrix = (cellsCount: number) => [
  {
    cells: [
      {
        column: 0,
        value: "Table title",
        colspan: cellsCount,
        colspanMatrix: [
          {
            cells: [
              {
                column: 0,
                value: "****** My chart ******",
                colspan: cellsCount,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    cells: [
      {
        column: 1,
        colspan: 2,
      },
    ],
  },
];

export function generateTableWithCustomColspan(
  rowsCount: number,
  cellsCount: number,
  subRow = false,
  level = 0,
  colspanMatrix: any = defaultColspanMatrix(cellsCount)
) {
  const rows: IRow[] = Array.from(Array(rowsCount), (_, rowIndex) => {
    const totalColspan = colspanMatrix[rowIndex]
      ? colspanMatrix[rowIndex].cells.reduce((sum: number, currentValue: any) => {
          return sum + currentValue.colspan;
        }, 0)
      : 0;
    const cellsCountWithColspan =
      cellsCount - totalColspan + (colspanMatrix[rowIndex] ? colspanMatrix[rowIndex].cells.length : 0);
    const cells = generateRowWithCustomColumns(rowIndex, cellsCount, cellsCountWithColspan, subRow, level, colspanMatrix);

    return {
      id: `${rowIndex}`,
      isHeader: false,
      cells,
    };
  });

  return {
    id: `test`,
    rows,
  };
}

function generateRowWithCustomColumns(
  rowIndex: number,
  cellsCount: number,
  cellsCountWithColspan: number,
  subRow: boolean,
  level: number,
  colspanMatrix: any
) {
  return Array.from(Array(cellsCountWithColspan), (_, cellIndex) => {
    const currentCell = colspanMatrix[rowIndex]
      ? colspanMatrix[rowIndex].cells.find((cell: any) => cell.column === cellIndex && cell.colspan)
      : null;
    if (currentCell && currentCell.colspan >= 1) {
      return {
        id: `(${rowIndex},${cellIndex})-${level}`,
        value: currentCell.value || `(${rowIndex},${cellIndex})`,
        colspan: currentCell.colspan,
        subItems:
          subRow && cellIndex === 0
            ? Array.from(Array(cellsCount), (_, rowIndex) =>
                generateRow(rowIndex, cellsCount, level <= 2, level + 1, currentCell.colspanMatrix)
              )
            : [],
      };
    }
    return {
      id: `(${rowIndex},${cellIndex})-${level}`,
      value: `(${rowIndex},${cellIndex})`,
    };
  });
}

export function generateRow(index: number, cellsCount: number, subRow = false, level = 0, colspanMatrix?: any): IRow {
  const cells = Array.from(Array(cellsCount), (_, cellIndex) => {
    const currentCell =
      colspanMatrix && colspanMatrix[index]
        ? colspanMatrix[index].cells.find((cell: any) => cell.column === cellIndex && cell.colspan)
        : null;
    return {
      id: `(${index},${cellIndex})-${level}`,
      value: (currentCell && currentCell.value) || `(${index},${cellIndex})`,
      colspan: currentCell ? currentCell.colspan : 1,
      subItems:
        subRow && cellIndex === 0 && index === 2
          ? Array.from(Array(20), (_, rowIndex) => generateRow(rowIndex, cellsCount, level <= 2, level + 1))
          : [],
    };
  });
  return {
    id: `${index}`,
    isHeader: index === 0,
    cells,
  };
}

export function generateTable(rowsCount: number, cellsCount: number, props = {}, subRow = false) {
  const rows = Array.from(Array(rowsCount), (_, rowIndex) => generateRow(rowIndex, cellsCount, subRow));
  return {
    id: "table-foo",
    ...props,
    rows,
  };
}
