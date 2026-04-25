/**
 * AuthContext.js
 * Provides authentication state and current user information throughout the app.
 */
import React, { createContext, useState, useEffect, useContext } from 'react';
import { getCurrentUser, setCurrentUser as setPersistedUser, clearCurrentUser as clearUser } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load current user on app start
    const loadUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = async (user) => {
    setCurrentUser(user);
    await setPersistedUser(user);
  };

  const signup = async (user) => {
    setCurrentUser(user);
    await setPersistedUser(user);
  };

  const logout = async () => {
    await clearUser();
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
