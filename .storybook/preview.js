import "../dist/style/index.css";
import results from "../jest-test-results.json";
import { withTests } from "@storybook/addon-jest";

const withStoryStyles = Story => {
  return <Story />;
};

export const decorators = [withStoryStyles, withTests({ results })];

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" }
};
