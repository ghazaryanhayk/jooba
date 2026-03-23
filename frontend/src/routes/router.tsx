import { createBrowserRouter } from 'react-router-dom';

import { AppLayout } from '@/layouts/app-layout';
import { NotFoundPage } from '@/pages/not-found-page';
import { RankingPage } from '@/pages/ranking-page';
import { SearchPage } from '@/pages/search-page';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    handle: { crumb: 'Jooba OS' },
    children: [
      {
        path: 'roles/:roleId/search',
        element: <SearchPage />,
        handle: { crumb: 'Search' },
      },
      {
        path: 'roles/:roleId/ranking',
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
