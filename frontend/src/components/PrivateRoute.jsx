// frontend/src/components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-indigo-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="text-white font-bold text-xl">
              Event Platform
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user.id !== 'guest' && (
              <Link
                to="/create-event"
                className="text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Create Event
              </Link>
            )}
            
            <Link
              to="/dashboard"
              className="text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium"
            >
              Dashboard
            </Link>

            <div className="flex items-center space-x-2">
              <span className="text-white text-sm">
                {user.id === 'guest' ? 'Guest User' : user.name}
              </span>
              <button
                onClick={handleLogout}
                className="text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;