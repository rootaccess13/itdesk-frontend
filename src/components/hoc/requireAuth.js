import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const requireAuth = (WrappedComponent) => {
  return (props) => {
    const { isAuthenticated, loading } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
      if (!loading && !isAuthenticated) {
        navigate('/login');
      }
    }, [isAuthenticated, loading, navigate]);

    if (loading) {
      return <div>Loading...</div>;
    }

    return isAuthenticated ? <WrappedComponent {...props} /> : null;
  };
};

export default requireAuth;
