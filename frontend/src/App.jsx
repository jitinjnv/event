// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import Login from './pages/Login';
import Register from './pages/Register';
import EventDashboard from './pages/EventDashboard';
import CreateEvent from './pages/CreateEvent';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home'; // Adjust this path based on your file structure

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Routes>
              {/* Home Route */}
              <Route path="/" element={<Home />} />
              
              {/* Login and Register */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes (PrivateRoute checks if the user is authenticated) */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <EventDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/create-event"
                element={
                  <PrivateRoute>
                    <CreateEvent />
                  </PrivateRoute>
                }
              />
              
              {/* Redirect to Dashboard if user is already logged in (or another appropriate redirect) */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
