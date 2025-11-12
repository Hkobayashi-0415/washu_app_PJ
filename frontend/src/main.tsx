import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';

import App from './App.tsx';
import SearchPage from './pages/Search.tsx';
import { queryClient } from './lib/queryClient.ts';
import './styles.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root not found');
}

const futureConfig = {
  v7_startTransition: true,
} as const;

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <App />,
      children: [
        { index: true, element: <Navigate to="/search" replace /> },
        { path: 'search', element: <SearchPage /> },
      ],
    },
  ],
  {
    future: futureConfig as never,
  },
);

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} future={futureConfig as never} />
    </QueryClientProvider>
  </React.StrictMode>,
);
