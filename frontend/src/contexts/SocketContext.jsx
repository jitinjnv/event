import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Initialize socket connection
    const newSocket = io(import.meta.env.VITE_API_URL, {
      auth: { token: localStorage.getItem('token') },
      reconnectionAttempts: 5,
      reconnectionDelay: 3000
    });

    newSocket.on('connect', () => console.log('✅ Socket connected'));
    newSocket.on('disconnect', () => console.log('❌ Socket disconnected'));
    newSocket.on('connect_error', (error) => console.error('⚠️ Socket connection error:', error));

    setSocket(newSocket);

    // Cleanup on unmount or user logout
    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
