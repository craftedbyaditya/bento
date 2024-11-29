import { createBrowserRouter, Navigate } from 'react-router-dom';
import Login from '../pages/authentication/login';
import Register from '../pages/authentication/register';
import Dashboard from '../pages/dashboard/dashboard';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/register',
    element: <Register />
  },
  {
    path: '/dashboard',
    element: <Dashboard />
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />
  }
]);
