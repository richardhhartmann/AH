import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #fafafa; /* Cor de fundo padrão do Instagram */
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  main {
    max-width: 975px;
    padding: 30px 20px;
    margin: 0 auto;
  }
`;

export default GlobalStyles;