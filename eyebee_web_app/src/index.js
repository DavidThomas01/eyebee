import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider as MuiStylesThemeProvider } from '@mui/styles';
import mainTheme from './MainTheme';
import './index.css';
import './overscroll.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = createRoot(document.getElementById('root'));
root.render(
  <MuiStylesThemeProvider theme={mainTheme}>
    <App />
  </MuiStylesThemeProvider>
);

// If you want to start measuring performance in your app, pass a function
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
