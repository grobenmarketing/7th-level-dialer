import { useState, useEffect } from 'react';

// SECURITY: Password MUST be set via environment variable
// Set VITE_APP_PASSWORD in your .env file
const APP_PASSWORD = import.meta.env.VITE_APP_PASSWORD;

if (!APP_PASSWORD) {
  console.error('CRITICAL: VITE_APP_PASSWORD environment variable is not set!');
}

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
