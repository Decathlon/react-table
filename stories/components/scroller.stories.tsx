/* eslint-disable  import/no-extraneous-dependencies */
import * as React from "react";
import { storiesOf } from "@storybook/react";
import { number } from "@storybook/addon-knobs";
import Button from "@mui/material/Button";
import Fab from "@mui/material/Fab";

import Scroller from "../../src/components/scroller";
import { withThemeProvider } from "../utils/decorators";

export const defaultScrollerProps = {
  width: 300,
  height: 300,
  virtualWidth: 4000,
  virtualHeight: 4000,
  onScroll: (scrollValues): void => console.log(scrollValues)
};

storiesOf("Scroller", module)
  .addDecorator(withThemeProvider)
  .addParameters({ jest: ["scroller", "virtualized-table"] })
  .add(
    "Default",
    () => (
      <Scroller {...defaultScrollerProps}>
        <DefaultScrollContent />
      </Scroller>
    ),
    {
      info: { inline: true }
    }
  )
  .add(
    "Vertical scroll",
    () => (
      <Scroller {...defaultScrollerProps} virtualWidth={defaultScrollerProps.width}>
        <DefaultScrollContent />
      </Scroller>
    ),
    {
      info: { inline: true }
    }
  )
  .add(
    "Horizontal scroll",
    () => (
      <Scroller {...defaultScrollerProps} virtualHeight={defaultScrollerProps.height}>
        <DefaultScrollContent />
      </Scroller>
    ),
    {
      info: { inline: true }
    }
  )
  .add(
    "Remote controlled",
    () => (
      <RemoteControlled>
        {/* Your content here */}
        <Scroller {...defaultScrollerProps} virtualWidth={0} width={0} />
      </RemoteControlled>
    ),
    { info: { inline: true } }
  )
  .add(
    "Playground",
    () => (
      // @ts-ignore
      <Counter>
        <Scroller
          {...defaultScrollerProps}
          width={number("width", defaultScrollerProps.width)}
          height={number("height", defaultScrollerProps.height)}
          virtualWidth={number("virtualWidth", defaultScrollerProps.virtualWidth)}
          virtualHeight={number("virtualHeight", defaultScrollerProps.virtualHeight)}
        />
      </Counter>
    ),
    { info: { inline: true } }
  )
  .add(
    "Multiple scroll",
    () => (
      <div style={{ display: "flex" }}>
        {/*
          // @ts-ignore not happy with the React clone element */}
        <Counter>
          <Scroller {...defaultScrollerProps} />
        </Counter>
        {/*
          // @ts-ignore not happy with the React clone element */}
        <Counter>
          <Scroller {...defaultScrollerProps} />
        </Counter>
      </div>
    ),
    { info: { inline: true } }
  );

// Story components

const DefaultScrollContent = () => <div>Scroll content</div>;

const CounterContent = ({ scrollToLeft, scrollToTop, leftCounter, topCounter, scrollToLeftValue, scrollToTopValue }) => {
  return (
    <div>
      <div>
        <div>Count Top: {topCounter}</div>
        <div>
          <Button color="primary" onClick={() => scrollToTop(scrollToTopValue)}>
            Scroll to Top
          </Button>
        </div>
      </div>
      <div>
        <div>Count Left: {leftCounter}</div>
        <div>
          <Button color="secondary" onClick={() => scrollToLeft(scrollToLeftValue)}>
            Scroll to Left
          </Button>
        </div>
      </div>
    </div>
  );
};

const Counter = ({ children }) => {
  const [topCounter, setTopCounter] = React.useState(0);
  const [leftCounter, setLeftCounter] = React.useState(0);
  const onScroll = ({ direction, scrollOrigin }) => {
    console.log(`Scroll direction: ${direction} ${scrollOrigin}`);
    if (direction === "down") {
      setTopCounter(topCounter + 1);
    } else if (direction === "up" && topCounter > 0) {
      setTopCounter(topCounter - 1);
    } else if (direction === "right") {
      setLeftCounter(leftCounter + 1);
    } else if (direction === "left" && leftCounter > 0) {
      setLeftCounter(leftCounter - 1);
    }
  };
  const newChildren = React.Children.map(children, child =>
    React.cloneElement(child, {
      onScroll,
      children: (
        // @ts-ignore missing properties (scrollToTop, scrollToLeft)
        <CounterContent
          leftCounter={leftCounter}
          topCounter={topCounter}
          scrollToLeftValue={number("scrollToLeftValue", defaultScrollerProps.virtualWidth / 2)}
          scrollToTopValue={number("scrollToTopValue", defaultScrollerProps.virtualHeight / 2)}
        />
      )
    })
  );
  return newChildren;
};

interface IState {
  topCounter: number;
}

class RemoteControlled extends React.Component<{}, IState> {
  constructor(props) {
    super(props);
    this.state = { topCounter: 0 };
  }

  public onScroll = ({ directions }) => {
    const { topCounter } = this.state;
    if (directions.includes("down")) {
      this.setState({ topCounter: topCounter + 1 });
    } else if (directions.includes("up") && topCounter > 0) {
      this.setState({ topCounter: topCounter - 1 });
    }
  };

  public render() {
    const { topCounter } = this.state;
    const { children } = this.props;
    const newChildren = React.Children.map(children, child =>
      // @ts-ignore Type 'string' is not assignable to type ReactElement
      React.cloneElement(child, {
        onScroll: this.onScroll
      })
    );
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around"
        }}
      >
        <Fab color="secondary">
          <div>{topCounter}</div>
        </Fab>
        {newChildren}
      </div>
    );
  }
}
