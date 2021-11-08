/* eslint-disable  import/no-extraneous-dependencies */
/// <reference path="../typings.d.ts"/>
import * as React from "react";
import { storiesOf } from "@storybook/react";
import { number } from "@storybook/addon-knobs";

import Readme from "./virtualizer.md";
import { withThemeProvider } from "../utils/decorators";
import VirtualizedGrid from "../../src/redesign/VirtualizedGrid";
import { generateTable } from "../utils/tables";

const items = Array.from(Array(100), (_, index) => ({
  id: index,
  title: `Item ${index}`,
}));

const rows = generateTable(100, 1, {}, true).rows;

const row = generateTable(1, 100, {}, true).rows;

const fixedItemsIndexes = [0, 3, 17, 20, 45];

const styles = {
  horizontalListContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "center",
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
    color: "gray",
  },
  fixedItem: {
    backgroundColor: "#1ea7fd",
    color: "white",
  },
  horizontalPadding: {
    width: "100%",
    backgroundColor: "orange",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
    fontWeight: 900,
    fontSize: 20,
  },
  verticalPadding: {
    height: 56,
    backgroundColor: "orange",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
    fontWeight: 900,
    fontSize: 20,
  },
};
storiesOf("VirtualizedGrid", module)
  .addDecorator(withThemeProvider)
  .addParameters({ jest: ["virtualizer", "virtualized-table"] })
  .add(
    "VirtualizedGrid vertical List",
    () => (
      <VirtualizedGrid
        rows={rows}
        //@ts-ignore
        columnsVirtualizerProps={{
          containerSize: 300,
          itemsLength: 1,
        }}
        //@ts-ignore
        rowsVirtualizerProps={{
          containerSize: 500,
          itemsLength: items.length,
          itemsCount: 7,
          initialScroll: 30,
        }}
      >
        {({ visibleRowIndexes, cellHeight }) => {
          const visibleItems = visibleRowIndexes.map((vsibleItemIndex) => items[vsibleItemIndex]);
          return <List items={visibleItems} itemHeight={cellHeight} />;
        }}
      </VirtualizedGrid>
    ),
    {
      notes: { markdown: Readme },
      info: { inline: true },
    }
  )
  .add(
    "Virtualized vertical List with fixed rows",
    () => (
      <VirtualizedGrid
        rows={rows}
        //@ts-ignore
        columnsVirtualizerProps={{
          containerSize: 300,
          itemsLength: 1,
        }}
        //@ts-ignore
        rowsVirtualizerProps={{
          containerSize: 500,
          itemsLength: items.length,
          itemsCount: 7,
          fixedItems: fixedItemsIndexes,
          initialScroll: 30,
        }}
      >
        {({ visibleRowIndexes, cellHeight }) => {
          const visibleItems = visibleRowIndexes.map((vsibleItemIndex) => items[vsibleItemIndex]);
          return <List items={visibleItems} itemHeight={cellHeight} fixedItems={fixedItemsIndexes} />;
        }}
      </VirtualizedGrid>
    ),
    { info: { inline: true } }
  )
  .add(
    "Virtualized horizontal List",
    () => (
      <VirtualizedGrid
        rows={row}
        //@ts-ignore
        rowsVirtualizerProps={{
          containerSize: 70,
          itemsLength: 1,
        }}
        //@ts-ignore
        columnsVirtualizerProps={{
          containerSize: 1000,
          itemsLength: items.length,
          itemsCount: 7,
          initialScroll: 30,
        }}
      >
        {({ visibleColumnIndexes, cellWidth }) => {
          const visibleItems = visibleColumnIndexes.map((vsibleItemIndex) => items[vsibleItemIndex]);
          return <HorizontalList items={visibleItems} itemWidth={cellWidth} />;
        }}
      </VirtualizedGrid>
    ),
    { info: { inline: true } }
  )
  .add(
    "Virtualized horizontal List with fixed columns",
    () => (
      <VirtualizedGrid
        rows={row}
        //@ts-ignore
        rowsVirtualizerProps={{
          containerSize: 70,
          itemsLength: 1,
        }}
        //@ts-ignore
        columnsVirtualizerProps={{
          containerSize: 1000,
          itemsLength: items.length,
          itemsCount: 7,
          fixedItems: fixedItemsIndexes,
          initialScroll: 30,
        }}
      >
        {({ visibleColumnIndexes, cellWidth }) => {
          const visibleItems = visibleColumnIndexes.map((vsibleItemIndex) => items[vsibleItemIndex]);
          return <HorizontalList items={visibleItems} itemWidth={cellWidth} fixedItems={fixedItemsIndexes} />;
        }}
      </VirtualizedGrid>
    ),
    { info: { inline: true } }
  )
  .add(
    "Virtualized vertical List with horzontal padding",
    () => {
      const padding = number("padding", 100);
      return (
        <VirtualizedGrid
          rows={rows}
          //@ts-ignore
          columnsVirtualizerProps={{
            containerSize: 300,
            itemsLength: 1,
          }}
          //@ts-ignore
          rowsVirtualizerProps={{
            containerSize: 500,
            itemsLength: items.length,
            itemsCount: 7,
            fixedItems: fixedItemsIndexes,
            padding,
            initialScroll: 30,
          }}
        >
          {({ visibleRowIndexes, cellHeight }) => {
            const visibleItems = visibleRowIndexes.map((vsibleItemIndex) => items[vsibleItemIndex]);
            return (
              <List items={visibleItems} itemHeight={cellHeight} fixedItems={fixedItemsIndexes}>
                <div style={{ ...styles.horizontalPadding, height: padding }}>
                  <span>My Padding</span>
                </div>
              </List>
            );
          }}
        </VirtualizedGrid>
      );
    },
    { info: { inline: true } }
  )
  .add(
    "Virtualized vertical List with horzontal padding with hidden rows",
    () => {
      const padding = number("padding", 100);
      return (
        <VirtualizedGrid
          rows={rows}
          //@ts-ignore
          columnsVirtualizerProps={{
            containerSize: 300,
            itemsLength: 1,
          }}
          //@ts-ignore
          rowsVirtualizerProps={{
            containerSize: 500,
            itemsLength: items.length,
            itemsCount: 7,
            fixedItems: fixedItemsIndexes,
            padding,
            hiddenItems: [1, 2, 3, 17, 4],
            initialScroll: 30,
          }}
        >
          {({ visibleRowIndexes, cellHeight }) => {
            const visibleItems = visibleRowIndexes.map((vsibleItemIndex) => items[vsibleItemIndex]);
            return (
              <List items={visibleItems} itemHeight={cellHeight} fixedItems={fixedItemsIndexes}>
                <div style={{ ...styles.horizontalPadding, height: padding }}>
                  <span>My Padding</span>
                </div>
              </List>
            );
          }}
        </VirtualizedGrid>
      );
    },
    { info: { inline: true } }
  )
  .add(
    "Virtualized vertical List with vertical padding",
    () => {
      const padding = number("padding", 100);
      return (
        <VirtualizedGrid
          rows={rows}
          //@ts-ignore
          rowsVirtualizerProps={{
            containerSize: 70,
            itemsLength: 1,
          }}
          //@ts-ignore
          columnsVirtualizerProps={{
            containerSize: 1000,
            itemsLength: items.length,
            itemsCount: 7,
            fixedItems: fixedItemsIndexes,
            padding: padding + padding,
            initialScroll: 30,
          }}
        >
          {({ visibleColumnIndexes, cellWidth }) => {
            const visibleItems = visibleColumnIndexes.map((vsibleItemIndex) => items[vsibleItemIndex]);
            return (
              <HorizontalList items={visibleItems} itemWidth={cellWidth} fixedItems={fixedItemsIndexes}>
                <div style={{ ...styles.verticalPadding, width: padding }}>
                  <span>My Padding</span>
                </div>
              </HorizontalList>
            );
          }}
        </VirtualizedGrid>
      );
    },
    { info: { inline: true } }
  )
  .add(
    "Virtualized vertical List with vertical padding and hidden columns",
    () => {
      const padding = number("padding", 100);
      return (
        <VirtualizedGrid
          rows={rows}
          //@ts-ignore
          rowsVirtualizerProps={{
            containerSize: 70,
            itemsLength: 1,
          }}
          //@ts-ignore
          columnsVirtualizerProps={{
            containerSize: 1000,
            itemsLength: items.length,
            itemsCount: 7,
            fixedItems: fixedItemsIndexes,
            padding: padding + padding,
            hiddenItems: [1, 2, 3, 4],
            initialScroll: 30,
          }}
        >
          {({ visibleColumnIndexes, cellWidth }) => {
            const visibleItems = visibleColumnIndexes.map((vsibleItemIndex) => items[vsibleItemIndex]);
            return (
              <HorizontalList items={visibleItems} itemWidth={cellWidth} fixedItems={fixedItemsIndexes}>
                <div style={{ ...styles.verticalPadding, width: padding }}>
                  <span>My Padding</span>
                </div>
              </HorizontalList>
            );
          }}
        </VirtualizedGrid>
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
      {items.map((item) => (
        <div
          key={item.id}
          // @ts-ignore
          style={{
            ...styles.listItem,
            width: itemWidth,
            ...(fixedItems && fixedItems.includes(item.id) ? styles.fixedItem : {}),
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

function Item({ item, itemHeight, fixedItems }) {
  return (
    <div
      key={item.id}
      // @ts-ignore
      style={{
        ...styles.listItem,
        height: itemHeight,
        lineHeight: `${itemHeight}px`,
        ...(fixedItems && fixedItems.includes(item.id) ? styles.fixedItem : {}),
      }}
    >
      {item.title}
    </div>
  );
}

const ItemMem = React.memo(Item);

const cache = {};
const List = ({ items, itemHeight, fixedItems = [], children = null }: ListProps) => {
  return (
    // @ts-ignore
    <div style={styles.listContainer}>
      {children}
      {items.map((item) => {
        // if (cache[item.id]) {
        //   console.log("cache", cache[item.id]);

        //   return cache[item.id];
        // }
        cache[item.id] = <ItemMem key={item.id} item={item} itemHeight={itemHeight} fixedItems={fixedItems} />;
        return cache[item.id];
      })}
    </div>
  );
};
