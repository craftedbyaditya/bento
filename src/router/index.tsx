import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import AddKey from '../pages/addKey/addKey';
import Dashboard from '../pages/dashboard/dashboard';
import Login from '../pages/authentication/login';
import Register from '../pages/authentication/register';
import Settings from '../pages/settings/settings';
import Members from '../pages/settings/members';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/add-key',
    element: <AddKey />,
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/settings',
    element: <Settings />,
  },
  {
    path: '/settings/members',
    element: <Members />,
  },
]);
