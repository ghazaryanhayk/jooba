import 'react-router';

declare module 'react-router' {
  interface RouteHandle {
    crumb?: string;
  }
}
