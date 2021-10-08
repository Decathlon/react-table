/* eslint-disable  import/no-extraneous-dependencies */
import { storiesOf } from "@storybook/react";
import { text, select } from "@storybook/addon-knobs";

import { withThemeProvider } from "../../utils/decorators";
import Bubble, { BubbleType } from "../../../src/components/styled-table/bubble";

const BubbleTypeOptions = {
  info: BubbleType.info,
  success: BubbleType.success,
  warning: BubbleType.warning,
  error: BubbleType.error
};

storiesOf("Bubble", module)
  .addDecorator(withThemeProvider)
  .addParameters({ jest: ["bubble"] })
  .add(
    "Default",
    () => (
      <div style={{ width: 200, height: 200 }}>
        <Bubble badge="20" />
      </div>
    ),
    {
      info: { inline: true }
    }
  )
  .add(
    "Without badge",
    () => (
      <div style={{ width: 200, height: 200 }}>
        <Bubble />
      </div>
    ),
    {
      info: { inline: true }
    }
  )
  .add(
    "With content",
    () => (
      <div style={{ width: 200, height: 200 }}>
        <Bubble badge={text("badge", "20")} type={select("type", BubbleTypeOptions, BubbleType.info)}>
          <div style={{ fontSize: 20, fontWeight: 900 }}>{text("content", "My content")}</div>
        </Bubble>
      </div>
    ),
    {
      info: { inline: true }
    }
  );
