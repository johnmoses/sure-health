import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { User } from '../types';

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  loading: false,
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

// Helper hooks
export const useAuth = () => {
  const { state, dispatch } = useAppContext();

  const login = (user: User) => {
    dispatch({ type: 'SET_USER', payload: user });
    dispatch({ type: 'SET_AUTHENTICATED', payload: true });
  };

  const logout = () => {
    dispatch({ type: 'SET_USER', payload: null });
    dispatch({ type: 'SET_AUTHENTICATED', payload: false });
  };

  return {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    login,
    logout,
  };
};
