import { addParameters, addDecorator, configure } from "@storybook/react";
import { withTests } from "@storybook/addon-jest";
import { withA11y } from "@storybook/addon-a11y";
import { withKnobs } from "@storybook/addon-knobs";
import { withInfo } from "@storybook/addon-info";

import results from "../jest-test-results.json";
import "../src/style/index.scss";
// Add tests for each story (wee need to run jest tests after)
addDecorator(
  withTests({
    results,
    filesExt: ".test.tsx"
  })
);

// My Game Story book options
addParameters({
  options: {
    name: "React Table",
    url: "#",
    panelPosition: "right"
  }
});

addDecorator(
  withInfo({
    source: false
  })
);

addDecorator(withA11y);
addDecorator(withKnobs);

// automatically import all files ending in *.stories.tsx
const req = require.context("../stories", true, /.stories.tsx$/);

function loadStories() {
  req.keys().forEach(req);
}

configure(loadStories, module);
