import { addons } from "@storybook/addons";
import { themes } from "@storybook/theming";

addons.setConfig({
  panelPosition: "right",
  theme: {
    ...themes.normal,
    brandTitle: "@decathlon/react-table",
    brandUrl: "#",

    // UI
    appBg: "white",
    appBorderRadius: 4
  }
});
