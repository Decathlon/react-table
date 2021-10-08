/* eslint-disable  import/no-extraneous-dependencies */
/// <reference path="../typings.d.ts"/>
import { storiesOf } from "@storybook/react";
import { number } from "@storybook/addon-knobs";

import Readme from "./virtualizer.md";
import { withThemeProvider } from "../utils/decorators";
import Virtualizer from "../../src/components/virtualizer";

const items = Array.from(Array(100), (_, index) => ({
  id: index,
  title: `Item ${index}`
}));

const fixedItemsIndexes = [0, 3, 20];

const styles = {
  horizontalListContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  listContainer: {
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "center"
  },
  listItem: {
    height: 56,
    lineHeight: "56px",
    width: "100%",
    textAlign: "center",
    verticalAlign: "middle",
    fontSize: 20,
    borderBottom: "solid 1px #d7d4d4",
    borderRight: "solid 1px #d7d4d4",
    color: "gray"
  },
  fixedItem: {
    backgroundColor: "#1ea7fd",
    color: "white"
  },
  horizontalPadding: {
    width: "100%",
    backgroundColor: "orange",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
    fontWeight: 900,
    fontSize: 20
  },
  verticalPadding: {
    height: 56,
    backgroundColor: "orange",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
    fontWeight: 900,
    fontSize: 20
  }
};
storiesOf("Virtualizer", module)
  .addDecorator(withThemeProvider)
  .addParameters({ jest: ["virtualizer", "virtualized-table"] })
  .add(
    "Virtualized vertical List",
    () => (
      <Virtualizer
        height={number("height", 500)}
        width={number("width", 300)}
        rowsCount={number("rowsCount", 7)}
        rowsLength={items.length}
        columnsLength={1}
      >
        {({ visibleRowIndexes, cellHeight }) => {
          const visibleItems = visibleRowIndexes.map(vsibleItemIndex => items[vsibleItemIndex]);
          return <List items={visibleItems} itemHeight={cellHeight} />;
        }}
      </Virtualizer>
    ),
    {
      notes: { markdown: Readme },
      info: { inline: true }
    }
  )
  .add(
    "Virtualized vertical List with fixed rows",
    () => (
      <Virtualizer
        height={number("height", 500)}
        width={number("width", 300)}
        rowsCount={number("rowsCount", 7)}
        rowsLength={items.length}
        columnsLength={1}
        fixedRows={fixedItemsIndexes}
      >
        {({ visibleRowIndexes, cellHeight }) => {
          const visibleItems = visibleRowIndexes.map(vsibleItemIndex => items[vsibleItemIndex]);
          return <List items={visibleItems} itemHeight={cellHeight} fixedItems={fixedItemsIndexes} />;
        }}
      </Virtualizer>
    ),
    { info: { inline: true } }
  )
  .add(
    "Virtualized horizontal List",
    () => (
      <Virtualizer
        height={number("height", 70)}
        width={number("width", 1000)}
        columnsCount={number("columnsCount", 7)}
        rowsLength={1}
        columnsLength={items.length}
      >
        {({ visibleColumnIndexes, cellWidth }) => {
          const visibleItems = visibleColumnIndexes.map(vsibleItemIndex => items[vsibleItemIndex]);
          return <HorizontalList items={visibleItems} itemWidth={cellWidth} />;
        }}
      </Virtualizer>
    ),
    { info: { inline: true } }
  )
  .add(
    "Virtualized horizontal List with fixed columns",
    () => (
      <Virtualizer
        height={number("height", 70)}
        width={number("width", 1000)}
        columnsCount={number("columnsCount", 7)}
        rowsLength={1}
        columnsLength={items.length}
        fixedColumns={fixedItemsIndexes}
      >
        {({ visibleColumnIndexes, cellWidth }) => {
          const visibleItems = visibleColumnIndexes.map(vsibleItemIndex => items[vsibleItemIndex]);
          return <HorizontalList items={visibleItems} itemWidth={cellWidth} fixedItems={fixedItemsIndexes} />;
        }}
      </Virtualizer>
    ),
    { info: { inline: true } }
  )
  .add(
    "Virtualized vertical List with horzontal padding",
    () => {
      const padding = number("padding", 100);
      return (
        <Virtualizer
          height={number("height", 500)}
          width={number("width", 300)}
          rowsCount={number("rowsCount", 7)}
          rowsLength={items.length}
          columnsLength={1}
          fixedRows={fixedItemsIndexes}
          horizontalPadding={padding}
        >
          {({ visibleRowIndexes, cellHeight }) => {
            const visibleItems = visibleRowIndexes.map(vsibleItemIndex => items[vsibleItemIndex]);
            return (
              <List items={visibleItems} itemHeight={cellHeight} fixedItems={fixedItemsIndexes}>
                <div style={{ ...styles.horizontalPadding, height: padding }}>
                  <span>My Padding</span>
                </div>
              </List>
            );
          }}
        </Virtualizer>
      );
    },
    { info: { inline: true } }
  )
  .add(
    "Virtualized vertical List with horzontal padding with hidden rows",
    () => {
      const padding = number("padding", 100);
      return (
        <Virtualizer
          hiddenRows={[1, 2, 3, 4]}
          height={number("height", 500)}
          width={number("width", 300)}
          rowsCount={number("rowsCount", 7)}
          rowsLength={items.length}
          columnsLength={1}
          fixedRows={fixedItemsIndexes}
          horizontalPadding={padding}
        >
          {({ visibleRowIndexes, cellHeight }) => {
            const visibleItems = visibleRowIndexes.map(vsibleItemIndex => items[vsibleItemIndex]);
            return (
              <List items={visibleItems} itemHeight={cellHeight} fixedItems={fixedItemsIndexes}>
                <div style={{ ...styles.horizontalPadding, height: padding }}>
                  <span>My Padding</span>
                </div>
              </List>
            );
          }}
        </Virtualizer>
      );
    },
    { info: { inline: true } }
  )
  .add(
    "Virtualized vertical List with vertical padding",
    () => {
      const padding = number("padding", 100);
      return (
        <Virtualizer
          height={number("height", 70)}
          width={number("width", 1000)}
          columnsCount={number("columnsCount", 7)}
          rowsLength={1}
          columnsLength={items.length}
          fixedColumns={fixedItemsIndexes}
          verticalPadding={padding + padding}
        >
          {({ visibleColumnIndexes, cellWidth }) => {
            const visibleItems = visibleColumnIndexes.map(vsibleItemIndex => items[vsibleItemIndex]);
            return (
              <HorizontalList items={visibleItems} itemWidth={cellWidth} fixedItems={fixedItemsIndexes}>
                <div style={{ ...styles.verticalPadding, width: padding }}>
                  <span>My Padding</span>
                </div>
              </HorizontalList>
            );
          }}
        </Virtualizer>
      );
    },
    { info: { inline: true } }
  )
  .add(
    "Virtualized vertical List with vertical padding and hidden columns",
    () => {
      const padding = number("padding", 100);
      return (
        <Virtualizer
          hiddenColumns={[2, 3, 4]}
          height={number("height", 70)}
          width={number("width", 1000)}
          columnsCount={number("columnsCount", 7)}
          rowsLength={1}
          columnsLength={items.length}
          fixedColumns={fixedItemsIndexes}
          verticalPadding={padding + padding}
        >
          {({ visibleColumnIndexes, cellWidth }) => {
            const visibleItems = visibleColumnIndexes.map(vsibleItemIndex => items[vsibleItemIndex]);
            return (
              <HorizontalList items={visibleItems} itemWidth={cellWidth} fixedItems={fixedItemsIndexes}>
                <div style={{ ...styles.verticalPadding, width: padding }}>
                  <span>My Padding</span>
                </div>
              </HorizontalList>
            );
          }}
        </Virtualizer>
      );
    },
    { info: { inline: true } }
  );

interface IItem {
  id: number;
  title: string;
}

interface IProps {
  items: IItem[];
  fixedItems?: number[];
  children?: JSX.Element;
}

interface HorizontalListProps extends IProps {
  itemWidth: number;
}

const HorizontalList = ({ items, itemWidth, fixedItems = [], children = null }: HorizontalListProps) => {
  return (
    // @ts-ignore
    <div style={styles.horizontalListContainer}>
      {children}
      {items.map(item => (
        <div
          key={item.id}
          // @ts-ignore
          style={{
            ...styles.listItem,
            width: itemWidth,
            ...(fixedItems && fixedItems.includes(item.id) ? styles.fixedItem : {})
          }}
        >
          {item.title}
        </div>
      ))}
      {children}
    </div>
  );
};

interface ListProps extends IProps {
  itemHeight: number;
}

const List = ({ items, itemHeight, fixedItems = [], children = null }: ListProps) => {
  return (
    // @ts-ignore
    <div style={styles.listContainer}>
      {children}
      {items.map(item => (
        <div
          key={item.id}
          // @ts-ignore
          style={{
            ...styles.listItem,
            height: itemHeight,
            lineHeight: `${itemHeight}px`,
            ...(fixedItems && fixedItems.includes(item.id) ? styles.fixedItem : {})
          }}
        >
          {item.title}
        </div>
      ))}
    </div>
  );
};
