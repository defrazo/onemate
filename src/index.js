import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { store } from './reducers';
import { Provider } from 'react-redux';
import Portal from './components/UI/portal/Portal';

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
    <Portal target="portal">
    </Portal>
  </Provider>
);