import { createContext, useContext, useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !isValidating) {
      setIsValidating(true);
      validateToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const validateToken = async (token) => {
    try {
      const response = await fetch(`${API_URL}/auth/validate`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log("Token validation response status:", response.status);
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        handleInvalidToken();
      }
    } catch (error) {
      console.error('⚠️ Token validation error:', error);
      handleInvalidToken();
    } finally {
      setLoading(false);
      setIsValidating(false);
    }
  };

  const handleInvalidToken = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const login = async (email, password) => {
    try {
      console.log(`Logging in with: ${API_URL}/auth/login`);
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      console.log("Login response status:", response.status);

      const textResponse = await response.text();
      console.log("Raw response:", textResponse);

      const jsonResponse = JSON.parse(textResponse);

      if (!response.ok) {
        throw new Error(jsonResponse.message || 'Login failed');
      }

      localStorage.setItem('token', jsonResponse.token);
      setUser(jsonResponse.user);
      return true;
    } catch (error) {
      console.error('⚠️ Login error:', error.message);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      console.log(`Registering user at: ${API_URL}/auth/register`);
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      console.log("Registration response status:", response.status);

      const textResponse = await response.text();
      console.log("Raw response:", textResponse);

      if (!response.ok) {
        throw new Error(textResponse);
      }

      const jsonResponse = JSON.parse(textResponse);
      localStorage.setItem('token', jsonResponse.token);
      setUser(jsonResponse.user);
      return true;
    } catch (error) {
      console.error('⚠️ Registration error:', error.message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const guestLogin = () => {
    setUser({ id: 'guest', name: 'Guest User', role: 'guest' });
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      register, 
      guestLogin,
      isAuthenticated: !!user && user.id !== 'guest'
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
