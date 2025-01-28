import React, { createContext, useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Token found in localStorage:', token); // Logging
      try {
        const decodedToken = jwtDecode(token.split(' ')[1]); // Remove 'Bearer ' prefix
        console.log('Decoded Token:', decodedToken); // Logging
        // Check if the token is expired
        if (decodedToken.exp * 1000 > Date.now()) {
          console.log('Token is valid'); // Logging
          setIsAuthenticated(true);
          fetchUserData(token);
        } else {
          console.log('Token is expired'); // Logging
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Failed to decode token:', error);
        localStorage.removeItem('token');
      }
    } else {
      console.log('No token found in localStorage'); // Logging
    }
    setLoading(false);
  }, []);

  const fetchUserData = async (token) => {
    try {
      const res = await axios.get('https://itdesk-backend.vercel.app/api/users/me', {
        headers: { Authorization: token },
      });
      setUser(res.data);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  const login = (token) => {
    console.log('Logging in with token:', token); // Logging
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
    fetchUserData(token);
  };

  const logout = () => {
    console.log('Logging out'); // Logging
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
