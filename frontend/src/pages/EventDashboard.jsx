// frontend/src/pages/EventDashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import EventCard from '../components/EventCard';

const EventDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    date: 'upcoming',
    search: ''
  });
  
  const { user } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
    
    if (socket) {
      socket.on('eventUpdated', handleEventUpdate);
      socket.on('eventDeleted', handleEventDelete);
      socket.on('attendeeUpdated', handleAttendeeUpdate);
    }

    return () => {
      if (socket) {
        socket.off('eventUpdated');
        socket.off('eventDeleted');
        socket.off('attendeeUpdated');
      }
    };
  }, [socket, filters]);

  const fetchEvents = async () => {
    try {
      const queryParams = new URLSearchParams({
        category: filters.category !== 'all' ? filters.category : '',
        date: filters.date,
        search: filters.search
      }).toString();

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/events?${queryParams}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch events');

      const data = await response.json();
      setEvents(data);
    } catch (err) {
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleEventUpdate = (updatedEvent) => {
    setEvents(prev => 
      prev.map(event => 
        event._id === updatedEvent._id ? updatedEvent : event
      )
    );
  };

  const handleEventDelete = (deletedEventId) => {
    setEvents(prev => prev.filter(event => event._id !== deletedEventId));
  };

  const handleAttendeeUpdate = ({ eventId, attendeeCount }) => {
    setEvents(prev =>
      prev.map(event =>
        event._id === eventId 
          ? { ...event, attendeeCount } 
          : event
      )
    );
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Events Dashboard</h1>
        <button
          onClick={() => navigate('/create-event')}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Create Event
        </button>
      </div>

      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <select
          name="category"
          value={filters.category}
          onChange={handleFilterChange}
          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="all">All Categories</option>
          <option value="tech">Technology</option>
          <option value="business">Business</option>
          <option value="social">Social</option>
          <option value="education">Education</option>
        </select>

        <select
          name="date"
          value={filters.date}
          onChange={handleFilterChange}
          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="upcoming">Upcoming Events</option>
          <option value="past">Past Events</option>
          <option value="all">All Events</option>
        </select>

        <input
          type="text"
          name="search"
          value={filters.search}
          onChange={handleFilterChange}
          placeholder="Search events..."
          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      {error && (
        <div className="text-red-500 text-center mb-8">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(event => (
          <EventCard 
            key={event._id} 
            event={event}
            isOrganizer={event.organizer === user.id}
            onUpdate={handleEventUpdate}
            onDelete={handleEventDelete}
          />
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          No events found. Try adjusting your filters or create a new event.
        </div>
      )}
    </div>
  );
};

export default EventDashboard;