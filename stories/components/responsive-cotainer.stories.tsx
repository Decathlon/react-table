/* eslint-disable  import/no-extraneous-dependencies */
import * as React from "react";
import { storiesOf } from "@storybook/react";

import ResponsiveContainer from "../../src/components/responsive-container";

const minItemHeight = 100;

const styles = {
  sizeContainer: {
    display: "flex",
    justifyContent: "center",
    fontSize: 30,
    fontWeight: 900
  },
  listContainer: {
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "center"
  },
  listItem: {
    width: "100%",
    textAlign: "center",
    verticalAlign: "middle",
    fontSize: 30,
    borderBottom: "solid 1px #d7d4d4",
    color: "gray"
  }
};

storiesOf("Responsive container", module)
  .addParameters({ jest: ["responsive-container"] })
  .add("Default", () => (
    <div style={{ height: "100vh", width: "100%" }}>
      <ResponsiveContainer>
        {({ width, height }) => {
          return (
            <div style={{ ...styles.sizeContainer, paddingTop: height / 2 - 20 }}>
              <div>
                {width} X {height}
              </div>
            </div>
          );
        }}
      </ResponsiveContainer>
    </div>
  ))
  .add("List", () => (
    <div style={{ height: "100vh", width: "100%" }}>
      <ResponsiveContainer>
        {({ height }) => {
          const items = Array.from(Array(Math.ceil(height / minItemHeight)), (_, index) => ({
            id: index,
            title: `Item ${index}`
          }));
          const itemHeight = height / items.length;
          return <List items={items} itemHeighet={itemHeight} />;
        }}
      </ResponsiveContainer>
    </div>
  ));

const List = ({ items, itemHeighet }) => {
  return (
    // @ts-ignore
    <div style={styles.listContainer}>
      {items.map(item => (
        <div
          key={item.id}
          // @ts-ignore textAlign type
          style={{
            ...styles.listItem,
            height: itemHeighet,
            lineHeight: `${itemHeighet}px`
          }}
        >
          {item.title}
        </div>
      ))}
    </div>
  );
};
