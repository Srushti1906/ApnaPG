import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pgService, reviewService, roomService } from '../services';
import { LoadingSpinner, Alert } from '../components/Common';

export default function OwnerPGDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pg, setPG] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [pgRes, roomsRes, reviewsRes] = await Promise.all([
          pgService.getPGById(id),
          pgService.getPGRooms(id),
          reviewService.getPGReviews(id),
        ]);

        console.log('PG Data:', pgRes.data.pg);
        console.log('Rooms Data:', roomsRes.data);
        console.log('Reviews Data:', reviewsRes.data);

        setPG(pgRes.data.pg);
        setRooms(roomsRes.data.rooms || []);
        setReviews(reviewsRes.data.reviews || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setAlert({
          type: 'error',
          message: error.response?.data?.message || 'Failed to load PG details',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);



  if (loading) return <LoadingSpinner />;

  if (!pg) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert type="error" message="PG not found" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
      >
        ← Back
      </button>

      {/* PG Header */}
      <div className="card mb-6">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{pg.name}</h1>
              {pg.isVerified && (
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                  ✓ Verified
                </span>
              )}
              {!pg.isVerified && (
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                  ⏳ Pending Verification
                </span>
              )}
            </div>
            <p className="text-gray-600 text-lg mb-4">
              📍 {pg.address?.street}, {pg.address?.city}, {pg.address?.state} - {pg.address?.zipCode}
            </p>
            <p className="text-gray-700 mb-4">{pg.description}</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-blue-600 mb-2">₹{pg.price}/month</p>
            <p className="text-gray-600 mb-4">⭐ {pg.averageRating || 'No ratings yet'}</p>
            <button
              onClick={() => navigate(`/edit-pg/${id}`)}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              ✏️ Edit PG
            </button>
          </div>
        </div>
      </div>

      {/* Key Information */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Gender Allowed</h3>
          <p className="text-2xl font-bold text-gray-900">{pg.genderAllowed}</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Amenities</h3>
          <p className="text-lg font-semibold text-gray-900">
            {Object.values(pg.amenities || {}).filter(Boolean).length} available
          </p>
        </div>
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Rooms</h3>
          <p className="text-2xl font-bold text-gray-900">{rooms.length}</p>
        </div>
      </div>

      {/* Amenities */}
      {pg.amenities && Object.keys(pg.amenities).length > 0 && (
        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-4">🏠 Amenities</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(pg.amenities)
              .filter(([_, value]) => value)
              .map(([key]) => (
                <div key={key} className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                  <span className="text-2xl">✓</span>
                  <span className="text-gray-900 font-medium">
                    {key.replace(/([A-Z])/g, ' $1').trim().charAt(0).toUpperCase() + key.replace(/([A-Z])/g, ' $1').trim().slice(1)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Rooms */}
      <div className="card mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">🛏️ Rooms ({rooms.length})</h2>
          <button 
            onClick={() => navigate(`/add-room/${id}`)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
          >
            + Add Room
          </button>
        </div>
        {rooms && rooms.length > 0 ? (
          <div className="space-y-4">
            {rooms.map((room, idx) => (
              <div key={room._id || idx} className="border-2 border-blue-100 bg-blue-50 rounded-lg p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{room.roomType || 'Room'}</h3>
                    <p className="text-sm text-gray-600">Room #{idx + 1}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/edit-room/${room._id}`)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
                    >
                      ✏️ Edit Room
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-white p-3 rounded-lg">
                    <span className="text-gray-600 text-sm font-semibold block mb-1">Capacity</span>
                    <p className="text-2xl font-bold text-blue-600">{room.capacity || 1}</p>
                    <p className="text-xs text-gray-500">persons</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <span className="text-gray-600 text-sm font-semibold block mb-1">Daily Price</span>
                    <p className="text-2xl font-bold text-green-600">₹{room.dailyPrice || 'N/A'}</p>
                    <p className="text-xs text-gray-500">per night</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <span className="text-gray-600 text-sm font-semibold block mb-1">Status</span>
                    <p className={`text-lg font-bold ${room.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {room.isActive ? '✓ Active' : '✗ Inactive'}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <span className="text-gray-600 text-sm font-semibold block mb-1">One-Day Stay</span>
                    <p className={`text-lg font-bold ${room.allowOneDayStay ? 'text-green-600' : 'text-gray-500'}`}>
                      {room.allowOneDayStay ? 'Allowed' : 'Not Allowed'}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <span className="text-gray-600 text-sm font-semibold block mb-1">Bookings</span>
                    <p className="text-2xl font-bold text-purple-600">{room.bookings?.length || 0}</p>
                    <p className="text-xs text-gray-500">total</p>
                  </div>
                </div>


              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-600 size-lg mb-4">🛏️ No rooms added yet</p>
            <button 
              onClick={() => navigate(`/add-room/${id}`)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Create First Room
            </button>
          </div>
        )}
      </div>

      {/* Reviews & Ratings */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">⭐ Reviews & Ratings ({reviews.length})</h2>
        </div>
        {reviews && reviews.length > 0 ? (
          <div>
            <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-gray-600 text-sm">Average Rating</p>
                  <p className="text-3xl font-bold text-yellow-500">
                    ⭐ {(reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Total Reviews</p>
                  <p className="text-3xl font-bold text-blue-600">{reviews.length}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">5 Star</p>
                  <p className="text-3xl font-bold text-green-600">
                    {reviews.filter(r => r.rating === 5).length}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">1 Star</p>
                  <p className="text-3xl font-bold text-red-600">
                    {reviews.filter(r => r.rating === 1).length}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {reviews.map((review, idx) => (
                <div key={review._id || idx} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-lg text-gray-900">{review.userName || 'Anonymous'}</p>
                      <p className="text-sm text-gray-600">
                        📅 {new Date(review.createdAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">
                        {Array(review.rating || 0).fill('⭐').join('')}
                        {Array(5 - (review.rating || 0)).fill('☆').join('')}
                      </p>
                      <p className="text-xs text-gray-600">{review.rating}/5 Stars</p>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{review.comment || 'No comment'}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-600 text-lg mb-2">⭐ No reviews yet</p>
            <p className="text-gray-500 text-sm">Reviews will appear here after customers book and rate your PG</p>
          </div>
        )}
      </div>
    </div>
  );
}
