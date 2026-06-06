import React, { createContext, useState, useEffect } from 'react';
import api, {
  clearStoredAuth,
  getApiErrorMessage,
  getPayload,
  normalizeRole,
  readStoredUser,
  setStoredAuth
} from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(readStoredUser());
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const data = response.data;
      if (data?.success === false) {
        return { success: false, message: data.message || 'Login failed' };
      }
      const authPayload = getPayload(data) || data;
      if (authPayload?.accessToken) {
        const authUser = setStoredAuth(authPayload);
        setUser(authUser);
        return { success: true };
      }
      return { success: false, message: data?.message || 'Login failed' };
    } catch (error) {
      return { 
        success: false, 
        message: getApiErrorMessage(error, 'Login failed')
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const data = response.data;
      if (data?.success === false) {
        return { success: false, message: data.message || 'Registration failed' };
      }
      const authPayload = getPayload(data) || data;
      if (authPayload?.accessToken) {
        const authUser = setStoredAuth(authPayload);
        setUser(authUser);
        return { success: true };
      }
      return { success: false, message: data?.message || 'Registration failed' };
    } catch (error) {
      return { 
        success: false, 
        message: getApiErrorMessage(error, 'Registration failed')
      };
    }
  };

  const logout = () => {
    clearStoredAuth();
    setUser(null);
  };

  const hasRole = (roles) => {
    if (!user) return false;
    const currentRole = normalizeRole(user.role);
    if (Array.isArray(roles)) {
      return roles.map(normalizeRole).includes(currentRole);
    }
    return normalizeRole(roles) === currentRole;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};
