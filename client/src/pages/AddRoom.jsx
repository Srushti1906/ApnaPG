import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pgService, roomService } from '../services';
import { Alert, LoadingSpinner } from '../components/Common';

export default function AddRoom() {
  const { pgId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pg, setPG] = useState(null);
  const [alert, setAlert] = useState(null);
  const [formData, setFormData] = useState({
    roomNumber: '',
    roomType: 'Single',
    capacity: 1,
    dailyPrice: '',
    allowOneDayStay: true,
  });

  useEffect(() => {
    const fetchPG = async () => {
      try {
        const res = await pgService.getPGById(pgId);
        setPG(res.data.pg);
      } catch (error) {
        setAlert({
          type: 'error',
          message: 'Failed to load PG details',
        });
      }
    };
    fetchPG();
  }, [pgId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) : value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.roomNumber || !formData.dailyPrice) {
      setAlert({ type: 'error', message: 'Please fill all required fields' });
      return;
    }

    try {
      setLoading(true);
      const roomData = {
        pg: pgId, // Required: PG reference
        roomNumber: formData.roomNumber,
        roomType: formData.roomType,
        bedCount: formData.capacity, // Required
        availableBeds: formData.capacity, // Required
        monthlyPrice: parseInt(formData.dailyPrice) * 30, // Calculate monthly price
        dailyPrice: parseInt(formData.dailyPrice),
        allowOneDayStay: formData.allowOneDayStay,
        availability: {
          totalBeds: formData.capacity,
          vacantBeds: formData.capacity,
        },
      };
      
      console.log('Sending room data:', roomData);
      await roomService.createRoom(roomData);
      setAlert({ type: 'success', message: 'Room added successfully!' });
      setTimeout(() => navigate(`/owner-pg-details/${pgId}`), 1500);
    } catch (error) {
      console.error('Error creating room:', error);
      setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Failed to add room',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!pg) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="mb-8">
        <button
          onClick={() => navigate(`/owner-pg-details/${pgId}`)}
          className="mb-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          ← Back to {pg?.name}
        </button>
        <h1 className="text-3xl font-bold text-gray-900">🛏️ Add New Room</h1>
        <p className="text-gray-600 mt-2">for <span className="font-semibold">{pg?.name}</span></p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Room Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Room Number *</label>
            <input
              type="text"
              name="roomNumber"
              value={formData.roomNumber}
              onChange={handleChange}
              placeholder="e.g., 101, A1, Room 1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Room Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Room Type *</label>
            <select
              name="roomType"
              value={formData.roomType}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Single">Single Bed</option>
              <option value="Double">Double Bed</option>
              <option value="Triple">Triple Bed</option>
              <option value="Dormitory">Dormitory</option>
            </select>
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Bed Count (persons) *</label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              min="1"
              max="10"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Daily Price */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Daily Price (₹) *</label>
            <input
              type="number"
              name="dailyPrice"
              value={formData.dailyPrice}
              onChange={handleChange}
              min="0"
              placeholder="e.g., 500"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* One-Day Stay Option */}
          <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <input
              type="checkbox"
              name="allowOneDayStay"
              checked={formData.allowOneDayStay}
              onChange={handleChange}
              id="oneDay"
              className="w-5 h-5 cursor-pointer"
            />
            <label htmlFor="oneDay" className="cursor-pointer flex-1">
              <p className="font-semibold text-gray-900">📅 Allow One-Day Stay</p>
              <p className="text-sm text-gray-600">Customers can book this room for just 1 day</p>
            </label>
          </div>

          {/* Summary */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">📋 Summary</h3>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>Room Number: <span className="font-semibold">{formData.roomNumber || 'Not set'}</span></li>
              <li>Room Type: <span className="font-semibold">{formData.roomType}</span></li>
              <li>Bed Count: <span className="font-semibold">{formData.capacity} beds</span></li>
              <li>Daily Price: <span className="font-semibold">₹{formData.dailyPrice || 0}</span></li>
              <li>Monthly Price: <span className="font-semibold">₹{(parseInt(formData.dailyPrice) * 30) || 0}</span></li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate(`/owner-pg-details/${pgId}`)}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
            >
              {loading ? '⏳ Adding Room...' : '✅ Add Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
