import { createBrowserRouter } from 'react-router-dom';

import { AppLayout } from '@/layouts/app-layout';
import { DashboardPage } from '@/pages/dashboard-page';
import { NotFoundPage } from '@/pages/not-found-page';
import { SearchPage } from '@/pages/search-page';
import { SettingsPage } from '@/pages/settings-page';

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
        path: 'settings',
        element: <SettingsPage />,
        handle: { crumb: 'Settings' },
      },
      {
        path: 'search',
        element: <SearchPage />,
        handle: { crumb: 'Search' },
      },
      {
        path: '*',
        element: <NotFoundPage />,
        handle: { crumb: 'Not found' },
      },
    ],
  },
]);
