import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axiosInstance';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      const savedUser = localStorage.getItem('user_data');
      
      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          const res = await api.get('/auth/profile');
          setUser(res.data);
          localStorage.setItem('user_data', JSON.stringify(res.data));
        } catch (error) {
          console.error('Error verificando sesión inicial:', error);
          localStorage.clear();
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();

    // Conexión Server-Sent Events (SSE) push en lugar de polling
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
    const eventSource = new EventSource(`${API_URL}/auth/events`);

    eventSource.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        const savedUser = localStorage.getItem('user_data');
        if (savedUser) {
          const u = JSON.parse(savedUser);
          if (u.id === data.userId) {
            // Verificar validez de la sesión de inmediato tras el evento push
            try {
              await api.get('/auth/profile');
            } catch (err) {
              if (err.response?.status === 401) {
                localStorage.clear();
                setUser(null);
              }
            }
          }
        }
      } catch (e) {
        console.warn('Error en SSE:', e);
      }
    };

    return () => eventSource.close();
  }, []);

  const login = async (usuario, clave) => {
    let clientIp = null;
    try {
      const ipRes = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipRes.json();
      clientIp = ipData.ip;
    } catch (e) {
      console.warn('No se pudo resolver la IP pública en cliente:', e);
    }

    const res = await api.post('/auth/login', { usuario, clave, clientIp });
    const { user, access_token, refresh_token } = res.data;

    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    localStorage.setItem('user_data', JSON.stringify(user));

    setUser(user);
    return user;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.warn('Cierre de sesión local:', e);
    } finally {
      localStorage.clear();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
