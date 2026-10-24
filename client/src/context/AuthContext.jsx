import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('apex_bank_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('apex_bank_token'));
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync profile & accounts on startup
  useEffect(() => {
    if (token) {
      refreshProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  async function refreshProfile() {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
      setAccounts(res.data.accounts || []);
      localStorage.setItem('apex_bank_user', JSON.stringify(res.data.user));
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, user: newUser } = res.data;

    localStorage.setItem('apex_bank_token', newToken);
    localStorage.setItem('apex_bank_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);

    // Fetch accounts
    await refreshProfile();
    return newUser;
  }

  async function register(userData) {
    const res = await api.post('/auth/register', userData);
    const { token: newToken, user: newUser } = res.data;

    localStorage.setItem('apex_bank_token', newToken);
    localStorage.setItem('apex_bank_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);

    await refreshProfile();
    return newUser;
  }

  function logout() {
    localStorage.removeItem('apex_bank_token');
    localStorage.removeItem('apex_bank_user');
    setToken(null);
    setUser(null);
    setAccounts([]);
  }

  const isCustomer = user?.role === 'customer';
  const isAdmin = user?.role === 'admin' || user?.role === 'employee';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        accounts,
        loading,
        isCustomer,
        isAdmin,
        login,
        register,
        logout,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
