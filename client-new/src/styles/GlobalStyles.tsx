import { createGlobalStyle } from 'styled-components';
import { theme } from './theme';

export const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    height: 100%;
    width: 100%;
  }

  body {
    background-color: ${theme.colors.gray[50]};
    color: ${theme.colors.gray[900]};
    font-size: ${theme.fontSizes.base};
    min-height: 100vh;
    width: 100%;
    overflow-x: hidden;
  }

  #root {
    min-height: 100vh;
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  button {
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
    margin: 0;
    outline: none;
    border: none;
    background: none;
    cursor: pointer;
  }

  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
    margin: 0;
    outline: none;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: ${theme.fontWeights.semibold};
    line-height: 1.25;
  }

  /* Focus styles for accessibility */
  button:focus-visible,
  input:focus-visible,
  textarea:focus-visible,
  select:focus-visible,
  a:focus-visible {
    outline: 2px solid ${theme.colors.primary[500]};
    outline-offset: 2px;
  }
`;