import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';

import App from './App.tsx';
import SakeDetailPage from './pages/SakeDetail.tsx';
import SearchPage from './pages/Search.tsx';
import RecentPage from './pages/Recent.tsx';
import FavoritesPage from './pages/Favorites.tsx';
import { getRegions } from './lib/api.ts';
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
        { path: 'sake/:id', element: <SakeDetailPage /> },
        { path: 'recent', element: <RecentPage /> },
        { path: 'favorites', element: <FavoritesPage /> },
      ],
    },
  ],
  {
    future: futureConfig as never,
  },
);

if (typeof navigator !== 'undefined' && navigator.onLine) {
  queryClient
    .prefetchQuery({
      queryKey: ['meta', 'regions'],
      queryFn: ({ signal }) => getRegions({ signal }),
      staleTime: 1000 * 60 * 60 * 12,
    })
    .catch(() => undefined);
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} future={futureConfig as never} />
    </QueryClientProvider>
  </React.StrictMode>,
);
