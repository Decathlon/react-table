import { IRow } from "../../../src/components/table/row";
import HeaderCell from "../../../src/components/styled-table/header-cell";

const indicatorNames = [
  "CA_TTC_OMNICANAL",
  "PROG_CA_TTC",
  "MARGIN_RATE",
  "HOURS",
  "FEES_PROGRESSION",
  "TURNOVER",
  "RATE_SHRINKAGE",
  "PERSONAL_FEES",
  "SQUARE_METERS",
  "SURFACE_COST",
  "TOTAL_FEES",
  "CONTRIBUTION",
  "OVERHEADS",
  "ADVISED_TURNOVER",
  "CA_TTC_OMNICANALF",
  "PROG_CA_TTCF",
  "MARGIN_RATEF",
  "HOURSF",
  "FEES_PROGRESSIONF",
  "TURNOVERF",
  "RATE_SHRINKAGEF",
  "PERSONAL_FEESF",
  "SQUARE_METERSF",
  "SURFACE_COSTF",
  "TOTAL_FEESF",
  "CONTRIBUTIONF",
  "OVERHEADSF",
  "ADVISED_TURNOVERF",
];

const text = "Lorem Ipsum is that it has a more-or-less normal";

export function getTable(cells = {}) {
  const weeks = Array.from(Array(52), (_, rowIndex) => ({
    id: rowIndex < 9 ? `0${rowIndex + 1}` : `${rowIndex + 1}`,
    value: `W${rowIndex + 1}${rowIndex === 3 ? text : ""}`,
  }));
  const headerRow: IRow = {
    id: "headers",
    isHeader: true,
    size: 126,
    cells: [
      {
        id: "indicators",
        value: `Indicateurs ${text}`,
      },
    ],
  };
  weeks.forEach((week) =>
    headerRow.cells.push({
      id: week.id,
      value: week.value,
      cellContent: HeaderCell,
      cellContentProps: {
        title: "2019",
        isCurrent: week.value === "W12",
        subtitle: "1 éphéméride",
        value: week.value,
      },
    })
  );
  const rows: IRow[] = [headerRow];

  indicatorNames.forEach((indicatorName) => {
    const row: IRow = {
      id: indicatorName,
      cells: [
        {
          id: indicatorName,
          value: indicatorName,
        },
      ],
    };
    weeks.forEach((week) => {
      row.cells.push({
        id: `${indicatorName}-${week.value}`,
        value: "0.00",
      });
    });
    rows.push(row);
  });

  Object.keys(cells).forEach((row) => {
    Object.keys(cells[row]).forEach((cell) => {
      rows[row].cells[cell] = cells[row][cell];
    });
  });

  return { id: "styled-tabel", rows };
}
