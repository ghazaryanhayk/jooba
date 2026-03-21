import { createBrowserRouter } from 'react-router-dom';

import { AppLayout } from '@/layouts/app-layout';
import { DashboardPage } from '@/pages/dashboard-page';
import { NotFoundPage } from '@/pages/not-found-page';
import { RankingPage } from '@/pages/ranking-page';
import { SearchPage } from '@/pages/search-page';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    handle: { crumb: 'Jooba' },
    children: [
      {
        index: true,
        element: <DashboardPage />,
        handle: { crumb: 'Dashboard' },
      },
      {
        path: 'search',
        element: <SearchPage />,
        handle: { crumb: 'Search' },
      },
      {
        path: 'ranking',
        element: <RankingPage />,
        handle: { crumb: 'Ranking' },
      },
      {
        path: '*',
        element: <NotFoundPage />,
        handle: { crumb: 'Not found' },
      },
    ],
  },
]);
