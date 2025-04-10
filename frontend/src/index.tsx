import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/globals.css';
import App from './App';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { ThemeProvider } from './contexts/ThemeContext';
import CssBaseline from '@mui/material/CssBaseline';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);
