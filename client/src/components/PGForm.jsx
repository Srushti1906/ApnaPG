import React, { useState } from 'react';
import { Alert } from './Common';

export function PGForm({ onSubmit, loading, initialData = null }) {
  const [alert, setAlert] = useState(null);
  const [amenities, setAmenities] = useState({
    wifi: initialData?.amenities?.wifi || false,
    ac: initialData?.amenities?.ac || false,
    parking: initialData?.amenities?.parking || false,
    laundry: initialData?.amenities?.laundry || false,
    studyTable: initialData?.amenities?.studyTable || false,
    cctv: initialData?.amenities?.cctv || false,
    powerBackup: initialData?.amenities?.powerBackup || false,
    cooler: initialData?.amenities?.cooler || false,
    heater: initialData?.amenities?.heater || false,
  });

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    genderAllowed: initialData?.genderAllowed || 'Boys',
    price: initialData?.price || '',
    city: initialData?.address?.city || '',
    area: initialData?.address?.street || '',
    state: initialData?.address?.state || '',
    zipCode: initialData?.address?.zipCode || '',
    landmark: initialData?.address?.landmark || '',
    messAvailable: initialData?.messAvailable || false,
    dailyStaysAllowed: initialData?.dailyStaysAllowed || false,
    isVerified: initialData?.isVerified || false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAmenityChange = (amenity) => {
    setAmenities(prev => ({
      ...prev,
      [amenity]: !prev[amenity],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.price || !formData.city) {
      setAlert({ type: 'error', message: 'Please fill all required fields' });
      return;
    }

    const data = {
      name: formData.name,
      description: formData.description,
      genderAllowed: formData.genderAllowed,
      price: parseInt(formData.price),
      amenities: {
        wifi: amenities.wifi,
        ac: amenities.ac,
        parking: amenities.parking,
        studyTable: amenities.studyTable,
        cctv: amenities.cctv,
        powerBackup: amenities.powerBackup,
        // Only send supported amenities to match the model
      },
      hasMess: formData.messAvailable,
      address: {
        street: formData.area,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        landmark: formData.landmark,
      },
    };

    console.log('Data sent to backend:', data);

    const result = await onSubmit(data);
    if (!result.success) {
      setAlert({ type: 'error', message: result.error });
    } else {
      setAlert({ type: 'success', message: 'PG saved successfully!' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="card">
          <h3 className="text-lg font-bold mb-4">📋 Basic Information</h3>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="label">PG Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Sunny PG"
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label">Price per Month (₹) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="e.g., 5000"
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your PG, amenities, and highlights..."
              className="input-field"
              rows="4"
              required
            />
          </div>
        </div>

        {/* Location */}
        <div className="card">
          <h3 className="text-lg font-bold mb-4">📍 Location</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">City *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g., Bangalore"
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label">Area/Street *</label>
              <input
                type="text"
                name="area"
                value={formData.area}
                onChange={handleChange}
                placeholder="e.g., Koramangala"
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="e.g., Karnataka"
                className="input-field"
              />
            </div>
            <div>
              <label className="label">ZIP Code</label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                placeholder="e.g., 560034"
                className="input-field"
              />
            </div>
            <div className="md:col-span-2">
              <label className="label">Landmark</label>
              <input
                type="text"
                name="landmark"
                value={formData.landmark}
                onChange={handleChange}
                placeholder="e.g., Near Forum Mall"
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Gender & Options */}
        <div className="card">
          <h3 className="text-lg font-bold mb-4">👥 Gender & Options</h3>
          
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="label">Gender Allowed *</label>
              <select
                name="genderAllowed"
                value={formData.genderAllowed}
                onChange={handleChange}
                className="input-field"
              >
                <option value="Boys">Boys Only</option>
                <option value="Girls">Girls Only</option>
                <option value="Family/Couple">Family/Couple</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="messAvailable"
                checked={formData.messAvailable}
                onChange={handleChange}
                className="w-5 h-5"
              />
              <span className="font-medium">🍽️ Mess Available</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="dailyStaysAllowed"
                checked={formData.dailyStaysAllowed}
                onChange={handleChange}
                className="w-5 h-5"
              />
              <span className="font-medium">📅 Daily Stays Allowed</span>
            </label>
          </div>
        </div>

        {/* Amenities */}
        <div className="card">
          <h3 className="text-lg font-bold mb-4">✨ Amenities</h3>
          
          <div className="grid md:grid-cols-3 gap-4">
            {Object.entries(amenities).map(([amenity, value]) => {
              const labels = {
                wifi: '📶 WiFi',
                ac: '❄️ AC',
                parking: '🚗 Parking',
                laundry: '👕 Laundry',
                studyTable: '📚 Study Table',
                cctv: '📹 CCTV',
                powerBackup: '🔋 Power Backup',
                cooler: '🧊 Cooler',
                heater: '🔥 Heater',
              };

              return (
                <label key={amenity} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() => handleAmenityChange(amenity)}
                    className="w-5 h-5"
                  />
                  <span className="font-medium">{labels[amenity]}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1"
          >
            {loading ? '⏳ Saving...' : '✅ Save PG'}
          </button>
        </div>
      </form>
    </div>
  );
}
