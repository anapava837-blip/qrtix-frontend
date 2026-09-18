'use client';

import { createContext } from 'react';

// interfaces
export interface IUser {
  id: string;
  name: string;
  lastname: string;
  email: string;
  photo: string;
  cedula?: string;
  telefono?: string;
}

export interface IUserContext {
  user: IUser | null;
  isAuthenticated: boolean;
  login: (userData: IUser) => void;
  logout: () => void;
}

export const initialState: IUserContext = {
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
};

export const UserContext = createContext<IUserContext>(initialState);
