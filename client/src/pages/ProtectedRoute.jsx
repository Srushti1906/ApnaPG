import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks';

export default function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" />;
  }

  return children;
}
