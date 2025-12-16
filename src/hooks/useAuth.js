import { useState, useEffect } from 'react';

// This is the password - you can change it to anything you want
// Or set it via environment variable: import.meta.env.VITE_APP_PASSWORD
const APP_PASSWORD = import.meta.env.VITE_APP_PASSWORD || 'r7dialer2024';

const AUTH_KEY = 'r7_auth_token';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check if user has a valid session token
    const token = localStorage.getItem(AUTH_KEY);
    return token === 'authenticated';
  });

  const login = (password) => {
    if (password === APP_PASSWORD) {
      localStorage.setItem(AUTH_KEY, 'authenticated');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    login,
    logout
  };
}
