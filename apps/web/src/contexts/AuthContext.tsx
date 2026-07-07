import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  role: 'COMPANY' | 'USER' | 'ADMIN';
  profileId: string;
}

interface AuthContextData {
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem('@HubbVagas:token');
    const storedUser = localStorage.getItem('@HubbVagas:user');

    if (storedToken && storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (token: string, loggedUser: User) => {
    localStorage.setItem('@HubbVagas:token', token);
    localStorage.setItem('@HubbVagas:user', JSON.stringify(loggedUser));
    setUser(loggedUser);
    navigate(loggedUser.role === 'COMPANY' ? '/dashboard' : '/jobs');
  };

  const logout = () => {
    localStorage.removeItem('@HubbVagas:token');
    localStorage.removeItem('@HubbVagas:user');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
