import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { setTheme } from './features/theme/themeSlice';
import ErrorBoundary from './components/common/ErrorBoundary';
import App from './App';
import './index.css';

// Initialize theme based on system preference
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const savedTheme = localStorage.getItem('theme');
const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
store.dispatch(setTheme(initialTheme));

// Add theme change listener
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (!localStorage.getItem('theme')) {
    store.dispatch(setTheme(e.matches ? 'dark' : 'light'));
  }
});

// Set JWT token from localStorage if exists
const token = localStorage.getItem('token');
if (token) {
  // Configure axios with token
  import('./utils/api').then(({ default: api }) => {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  });
}

// Render app
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </Provider>
  </React.StrictMode>
);

// Clean up on app unload
window.addEventListener('unload', () => {
  window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change');
});

// Log environment
if (process.env.NODE_ENV === 'development') {
  console.log('Development mode');
  console.log('API URL:', import.meta.env.VITE_API_URL);
}
