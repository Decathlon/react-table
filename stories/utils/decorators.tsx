import * as React from "react";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";

export const blueDkt = "#0082c3";

const muiDktTheme = createMuiTheme({
  typography: {
    fontFamily: "Roboto Condensed"
  },
  palette: {
    primary: {
      light: blueDkt,
      dark: blueDkt,
      main: blueDkt
    },
    secondary: {
      light: blueDkt,
      dark: blueDkt,
      main: blueDkt
    }
  }
});

/**
 * The MUI theme provider wrapper
 *
 * @param {() => JSX.Element} attributes a function to render the child component.
 *
 * @return {JSX.Element} The child wrapped by the MUI theme provider.
 */
export function withThemeProvider(renderChild: () => JSX.Element): JSX.Element {
  return <MuiThemeProvider theme={muiDktTheme}>{renderChild()}</MuiThemeProvider>;
}
