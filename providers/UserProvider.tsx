'use client';

import { useState, useEffect } from 'react';

import { UserContext, type IUser, type IUserContext } from '../contexts/userContext';

const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Cargar datos del usuario desde localStorage al inicializar
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      try {
        localStorage.removeItem('user');
      } catch (_) {}
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (userData: IUser) => {
    setUser(userData);
    setIsAuthenticated(true);
    setIsLoading(false);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setIsLoading(false);
    localStorage.removeItem('user');
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
