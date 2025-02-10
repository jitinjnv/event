// frontend/src/pages/Home.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { user } = useAuth();
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedEvents();
  }, []);

  const fetchFeaturedEvents = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/events?featured=true`);
      if (response.ok) {
        const data = await response.json();
        setFeaturedEvents(data.slice(0, 3)); // Get top 3 featured events
      }
    } catch (error) {
      console.error('Error fetching featured events:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-indigo-900">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover"
            src="/api/placeholder/1920/600"
            alt="Event background"
          />
          <div className="absolute inset-0 bg-indigo-900 opacity-75"></div>
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Event Management Platform
          </h1>
          <p className="mt-6 text-xl text-indigo-100 max-w-3xl">
            Create, manage, and discover amazing events. Connect with people who share your interests and make memorable experiences together.
          </p>
          <div className="mt-10 flex space-x-4">
            {user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-indigo-800"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Featured Events Section */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-8">
          Featured Events
        </h2>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featuredEvents.map((event) => (
              <div
                key={event._id}
                className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {event.name}
                  </h3>
                  <p className="mt-2 text-gray-600 line-clamp-2">
                    {event.description}
                  </p>
                  <div className="mt-4">
                    <span className="text-sm font-medium text-indigo-600">
                      Learn more →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            to={user ? "/dashboard" : "/register"}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            {user ? 'View All Events' : 'Join Now to Explore More'}
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Why Choose Our Platform?
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="relative rounded-lg bg-white p-6">
              <h3 className="text-lg font-medium text-gray-900">Easy to Use</h3>
              <p className="mt-2 text-gray-500">
                Create and manage events with our intuitive interface. No technical experience required.
              </p>
            </div>

            <div className="relative rounded-lg bg-white p-6">
              <h3 className="text-lg font-medium text-gray-900">Real-time Updates</h3>
              <p className="mt-2 text-gray-500">
                Get instant notifications about event changes and attendee updates.
              </p>
            </div>

            <div className="relative rounded-lg bg-white p-6">
              <h3 className="text-lg font-medium text-gray-900">Secure & Reliable</h3>
              <p className="mt-2 text-gray-500">
                Your data is protected with industry-standard security measures.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;