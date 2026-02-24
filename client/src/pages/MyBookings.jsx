import React, { useState, useEffect } from 'react';
import { bookingService } from '../services';
import { BookingCard, LoadingSpinner, EmptyState, Alert } from '../components/Common';
import { usePagination } from '../hooks';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const { page, setPage } = usePagination();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await bookingService.getUserBookings({
          status: statusFilter,
          page,
        });
        setBookings(response.data.bookings);
      } catch (error) {
        setAlert({
          type: 'error',
          message: 'Failed to load bookings',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [statusFilter, page]);

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await bookingService.cancelBooking(bookingId, {
          cancellationReason: 'User cancellation',
        });
        setAlert({ type: 'success', message: 'Booking cancelled' });
        setBookings(bookings.filter((b) => b._id !== bookingId));
      } catch (error) {
        setAlert({ type: 'error', message: 'Failed to cancel booking' });
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <h1 className="text-3xl font-bold mb-8">My Bookings</h1>

      <div className="mb-6">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="input-field max-w-xs"
        >
          <option value="">All Bookings</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="CheckedIn">Checked In</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {bookings.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {bookings.map((booking) => (
            <div key={booking._id}>
              <BookingCard booking={booking} />
              {['Pending', 'Confirmed'].includes(booking.status) && (
                <button
                  onClick={() => handleCancelBooking(booking._id)}
                  className="btn-danger w-full mt-2"
                >
                  Cancel Booking
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="📅"
          title="No Bookings Yet"
          description="Start booking your perfect PG today"
        />
      )}
    </div>
  );
}
