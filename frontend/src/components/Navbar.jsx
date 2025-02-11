
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <nav className="bg-indigo-600 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/dashboard" className="text-white font-bold text-xl">
              Event Platform
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            {/* Home Link (Always Visible) */}
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium ${
                  isActive ? 'bg-indigo-700' : 'text-white hover:bg-indigo-700'
                }`
              }
            >
              Home
            </NavLink>

            {/* Show Register Link Only for Unauthenticated Users */}
            {!isAuthenticated && (
              <NavLink
                to="/register"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium ${
                    isActive ? 'bg-indigo-700' : 'text-white hover:bg-indigo-700'
                  }`
                }
              >
                Register
              </NavLink>
            )}

            {isAuthenticated && user?.id !== 'guest' && (
              <NavLink
                to="/create-event"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium ${
                    isActive ? 'bg-indigo-700' : 'text-white hover:bg-indigo-700'
                  }`
                }
              >
                Create Event
              </NavLink>
            )}

            {isAuthenticated && (
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium ${
                    isActive ? 'bg-indigo-700' : 'text-white hover:bg-indigo-700'
                  }`
                }
              >
                Dashboard
              </NavLink>
            )}

            {/* User Info & Logout */}
            {isAuthenticated && (
              <div className="flex items-center space-x-2">
                <span className="text-white text-sm font-medium">
                  {user?.id === 'guest' ? 'Guest User' : user?.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-white hover:bg-red-600 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
