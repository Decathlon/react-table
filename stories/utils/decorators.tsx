import { ThemeProvider, StyledEngineProvider, createTheme } from "@mui/material/styles";

export const blueDkt = "#0082c3";

const muiDktTheme = createTheme({
  typography: {
    fontFamily: "Roboto Condensed",
  },
  palette: {
    primary: {
      light: blueDkt,
      dark: blueDkt,
      main: blueDkt,
    },
    secondary: {
      light: blueDkt,
      dark: blueDkt,
      main: blueDkt,
    },
  },
});

/**
 * The MUI theme provider wrapper
 *
 * @param {() => JSX.Element} attributes a function to render the child component.
 *
 * @return {JSX.Element} The child wrapped by the MUI theme provider.
 */
export function withThemeProvider(renderChild: () => JSX.Element): JSX.Element {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={muiDktTheme}>{renderChild()}</ThemeProvider>
    </StyledEngineProvider>
  );
}
