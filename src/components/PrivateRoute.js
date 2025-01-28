import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const PrivateRoute = () => {
  const { isAuthenticated } = useContext(AuthContext);
  console.log('PrivateRoute isAuthenticated:', isAuthenticated); // Logging
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
