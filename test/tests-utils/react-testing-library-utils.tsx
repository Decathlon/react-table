/* eslint-disable  import/no-extraneous-dependencies */
import * as React from "react";
import { render, RenderOptions } from "@testing-library/react";
import { createTheme, StyledEngineProvider } from "@mui/material/styles";
import { ThemeProvider } from "@mui/styles";

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

const AllTheProviders = ({ children }: { children: JSX.Element | JSX.Element[] }) => {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={muiDktTheme}>{children}</ThemeProvider>
    </StyledEngineProvider>
  );
};

// Just using the same typing as react-testing-library render method.
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export const customRender = (ui: React.ReactElement<any>, options?: Omit<RenderOptions, "queries">) =>
  render(ui, { wrapper: AllTheProviders, ...options });
