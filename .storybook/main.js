module.exports = {
  stories: ["../stories/**/*.stories.mdx", "../stories/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-actions",
    "@storybook/addon-viewport",
    "@storybook/addon-knobs",
    "@storybook/addon-jest",
    "@storybook/addon-a11y",
    "@storybook/addon-storysource",
  ],
};
