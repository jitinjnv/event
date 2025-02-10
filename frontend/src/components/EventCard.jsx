// frontend/src/components/EventCard.jsx
import { useState } from 'react';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { CalendarIcon, MapPinIcon, UsersIcon, ClockIcon } from '@heroicons/react/24/outline';

const EventCard = ({ event, isOrganizer, onUpdate, onDelete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const isAttending = event.attendees?.includes(user?.id);
  const isFullyBooked = event.attendees?.length >= event.capacity;

  const handleAttend = async () => {
    if (!user || loading) return;
    
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/events/${event._id}/attend`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update attendance');
      }

      const updatedEvent = await response.json();
      onUpdate(updatedEvent);
    } catch (err) {
      setError(err.message || 'Failed to update attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isOrganizer || loading) return;

    if (!window.confirm('Are you sure you want to delete this event?')) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/events/${event._id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!response.ok) throw new Error('Failed to delete event');

      onDelete(event._id);
    } catch (err) {
      setError('Failed to delete event');
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Event Image */}
      <div className="relative h-48 w-full">
        <img
          src={event.imageUrl || '/api/placeholder/400/200'}
          alt={event.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4">
          <span className={`
            px-3 py-1 rounded-full text-sm font-medium
            ${event.category === 'tech' ? 'bg-blue-100 text-blue-800' :
              event.category === 'business' ? 'bg-green-100 text-green-800' :
              event.category === 'social' ? 'bg-purple-100 text-purple-800' :
              event.category === 'education' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'}
          `}>
            {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
          </span>
        </div>
      </div>

      {/* Event Content */}
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.name}</h3>
        
        <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>

        <div className="space-y-3">
          {/* Date and Time */}
          <div className="flex items-center text-gray-600">
            <CalendarIcon className="h-5 w-5 mr-2" />
            <span>{format(new Date(event.date), 'MMMM d, yyyy')}</span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <ClockIcon className="h-5 w-5 mr-2" />
            <span>{event.time}</span>
          </div>

          {/* Location */}
          <div className="flex items-center text-gray-600">
            <MapPinIcon className="h-5 w-5 mr-2" />
            <span>{event.location}</span>
          </div>

          {/* Attendees */}
          <div className="flex items-center text-gray-600">
            <UsersIcon className="h-5 w-5 mr-2" />
            <span>
              {event.attendees?.length || 0} / {event.capacity} attendees
            </span>
          </div>
        </div>

        {error && (
          <div className="mt-4 text-red-500 text-sm">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex gap-4">
          {!isOrganizer && (
            <button
              onClick={handleAttend}
              disabled={loading || (isFullyBooked && !isAttending)}
              className={`
                flex-1 px-4 py-2 rounded-md text-sm font-medium
                ${isAttending 
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : isFullyBooked
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'}
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors duration-200
              `}
            >
              {loading ? 'Processing...' : isAttending ? 'Cancel Attendance' : isFullyBooked ? 'Fully Booked' : 'Attend Event'}
            </button>
          )}

          {isOrganizer && (
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? 'Deleting...' : 'Delete Event'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;