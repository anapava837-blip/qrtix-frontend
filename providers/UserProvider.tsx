'use client';

import { useState, useEffect } from 'react';

import { UserContext, type IUser, type IUserContext } from '../contexts/userContext';

const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const markReady = () => {
    try {
      setIsLoading((prev) => (prev ? false : prev));
    } catch (_) {}
  };

  // Cargar datos del usuario desde localStorage al inicializar
  useEffect(() => {
    let cancelled = false;
    try {
      const storedUser =
        (typeof window !== 'undefined' && window.localStorage && window.localStorage.getItem('user')) ||
        null;
      if (storedUser && !cancelled) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsAuthenticated(true);
        } catch (e) {
          console.error('Error parsing stored user data:', e);
          try {
            window.localStorage.removeItem('user');
          } catch (_) {}
        }
      }
    } catch (error) {
      console.error('UserProvider localStorage read error:', error);
    } finally {
      if (!cancelled) {
        markReady();
      }
    }

    // Backup: si hidratacion se atasca por cualquier motivo (SSR / React 18 Strict / suspension),
    // forzamos que isLoading pase a false a los 1200ms COMO MINIMO (nunca se queda pegado).
    const t = window.setTimeout(() => {
      cancelled = true;
      markReady();
    }, 1200);

    return () => {
      cancelled = true;
      try { clearTimeout(t); } catch (_) {}
    };
  }, []);

  const login = (userData: IUser) => {
    setUser(userData);
    setIsAuthenticated(true);
    markReady();
    try {
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (_) {}
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    markReady();
    try {
      localStorage.removeItem('user');
    } catch (_) {}
  };

  const contextValue: IUserContext = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return <UserContext value={contextValue}>{children}</UserContext>;
};

export default UserProvider;
