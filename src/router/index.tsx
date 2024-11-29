import { createBrowserRouter } from 'react-router-dom';
import AddKey from '../pages/addKey/addKey';
import Dashboard from '../pages/dashboard/dashboard';
import Login from '../pages/authentication/login';
import Register from '../pages/authentication/register';

export const router = createBrowserRouter([
  {
    path: '/',
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
]);
