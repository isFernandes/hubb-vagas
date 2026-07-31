import React, { createContext, useContext, useState } from 'react';
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
  const [user, setUser] = useState<User | null>(() => {
    const storedToken = localStorage.getItem('@HubbVagas:token');
    const storedUser = localStorage.getItem('@HubbVagas:user');

    if (storedToken && storedUser && storedUser !== 'undefined') {
      try {
        return JSON.parse(storedUser);
      } catch (e) {
        console.error('Failed to parse stored user, clearing storage.', e);
        localStorage.removeItem('@HubbVagas:token');
        localStorage.removeItem('@HubbVagas:user');
      }
    }
    return null;
  });
  const navigate = useNavigate();

  const login = (token: string, loggedUser: User) => {
    localStorage.setItem('@HubbVagas:token', token);
    localStorage.setItem('@HubbVagas:user', JSON.stringify(loggedUser));
    setUser(loggedUser);
    
    // Ensure case-insensitivity since Prisma returns 'Company' while TS type is 'COMPANY'
    const userRole = String(loggedUser.role).toUpperCase();
    if (userRole === 'ADMIN') {
      navigate('/admin');
    } else if (userRole === 'COMPANY') {
      navigate('/dashboard');
    } else {
      navigate('/jobs');
    }
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

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
