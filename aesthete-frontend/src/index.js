import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Importa seu componente principal
import { Provider } from 'react-redux'; // Para o Redux
import { store } from './app/store'; // Para o Redux (caminho pode variar)
import GlobalStyles from './GlobalStyles';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* O Provider envolve a aplicação para que todos os componentes tenham acesso ao estado do Redux */}
    <Provider store={store}>
        <GlobalStyles />
      <App />
    </Provider>
  </React.StrictMode>
);