import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pgService, bookingService, reviewService, enquiryService } from '../services';
import { Alert, LoadingSpinner, EmptyState } from '../components/Common';
import { useAuthContext } from '../context/AuthContext';

export default function PGDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthContext();
  const [pg, setPG] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingResult, setBookingResult] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const resultRef = useRef(null);
  const [bookingDates, setBookingDates] = useState({
    checkInDate: '',
    checkOutDate: '',
  });
  // helper: minimum selectable date (today) and date utilities
  const addDays = (dateStr, days) => {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  };
  const today = new Date();
  const minDate = today.toISOString().slice(0, 10);
  const [durationType, setDurationType] = useState('custom'); // 'oneDay' | 'oneMonth' | 'custom'
  const [estimatedPrice, setEstimatedPrice] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pgRes, roomsRes, reviewsRes] = await Promise.all([
          pgService.getPGById(id),
          pgService.getPGRooms(id),
          reviewService.getPGReviews(id),
        ]);

        setPG(pgRes.data.pg);
        setRooms(roomsRes.data.rooms || []);
        setReviews(reviewsRes.data.reviews || []);
      } catch (error) {
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

  const handleBooking = async () => {
    if (!selectedRoom) {
      setAlert({ type: 'error', message: 'Please select a room' });
      return;
    }

    // validate dates for custom duration
    if (durationType === 'custom') {
      const { checkInDate, checkOutDate } = bookingDates;
      if (!checkInDate || !checkOutDate) {
        setAlert({ type: 'error', message: 'Please select check-in and check-out dates' });
        return;
      }
      if (checkInDate < minDate) {
        setAlert({ type: 'error', message: 'Check-in cannot be in the past' });
        return;
      }
      if (checkOutDate <= checkInDate) {
        setAlert({ type: 'error', message: 'Check-out must be after check-in' });
        return;
      }
    }

    try {
      // For authenticated users, create a real booking
      if (isAuthenticated()) {
        let checkInDate = bookingDates.checkInDate;
        let checkOutDate = bookingDates.checkOutDate;
        let bookingType = 'Daily';

        // Set dates based on duration type
        if (durationType === 'oneDay') {
          const today = new Date();
          checkInDate = today.toISOString().split('T')[0];
          // For one-day stay, checkout is the next day
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          checkOutDate = tomorrow.toISOString().split('T')[0];
          bookingType = 'Daily';
        } else if (durationType === 'oneMonth') {
          if (!bookingDates.checkInDate) {
            const today = new Date();
            checkInDate = today.toISOString().split('T')[0];
            const co = new Date(today);
            co.setDate(co.getDate() + 30);
            checkOutDate = co.toISOString().split('T')[0];
          }
          bookingType = 'Monthly';
        }

        const bookingData = {
          roomId: selectedRoom._id,
          checkInDate,
          checkOutDate,
          bookingType,
          specialRequests: '',
        };

        await bookingService.createBooking(bookingData);
        setBookingResult({ type: 'success', message: 'Your booking has been confirmed! Check your bookings for details.' });
        setAlert({ type: 'success', message: 'Your booking has been confirmed!' });
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: 'smooth' });
          // Reset form
          setSelectedRoom(null);
          setBookingDates({ checkInDate: '', checkOutDate: '' });
          setDurationType('custom');
        }, 2000);
      } else {
        // For unauthenticated users, create an enquiry
        let days = null;
        if (bookingDates.checkInDate && bookingDates.checkOutDate) {
          const ci = new Date(bookingDates.checkInDate);
          const co = new Date(bookingDates.checkOutDate);
          days = Math.max(1, Math.round((co - ci) / (1000 * 60 * 60 * 24)));
        } else if (durationType === 'oneDay') days = 1;
        else if (durationType === 'oneMonth') days = 30;

        const enquiry = {
          pgId: pg._id,
          roomId: selectedRoom._id,
          name: 'Guest User',
          phone: '9999999999',
          collegeName: '',
          age: null,
          occupation: 'Guest',
          durationType,
          days,
        };

        await enquiryService.createEnquiry(enquiry);
        setBookingResult({ type: 'success', message: 'Your booking request has been sent. Owner will contact you soon!' });
        setAlert({ type: 'success', message: 'Your booking request has been sent. Please log in for confirmed bookings.' });
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (error) {
      console.error('Booking error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Request failed';
      setAlert({ type: 'error', message: errorMsg });
      setBookingResult({ type: 'error', message: errorMsg });
    }
  };

  // Update estimated price when selectedRoom or dates or durationType change
  useEffect(() => {
    if (!selectedRoom) {
      setEstimatedPrice(null);
      return;
    }

    const daily = selectedRoom.dailyPrice || selectedRoom.monthlyPrice / 30 || 0;

    if (durationType === 'oneDay') {
      setEstimatedPrice(daily * 1);
      // set dates if not set
      if (!bookingDates.checkInDate) {
        const today = new Date().toISOString().slice(0, 10);
        setBookingDates({ checkInDate: today, checkOutDate: today });
      }
      return;
    }

    if (durationType === 'oneMonth') {
      const price = selectedRoom.monthlyPrice || daily * 30;
      setEstimatedPrice(price);
      // set checkOutDate based on 30 days if checkIn present
      if (bookingDates.checkInDate) {
        const ci = new Date(bookingDates.checkInDate);
        const co = new Date(ci);
        co.setDate(ci.getDate() + 30);
        setBookingDates({ checkInDate: bookingDates.checkInDate, checkOutDate: co.toISOString().slice(0, 10) });
      }
      return;
    }

    // custom: compute from dates if available
    if (bookingDates.checkInDate && bookingDates.checkOutDate) {
      const ci = new Date(bookingDates.checkInDate);
      const co = new Date(bookingDates.checkOutDate);
      const diffDays = Math.max(1, Math.round((co - ci) / (1000 * 60 * 60 * 24)));
      setEstimatedPrice(daily * diffDays);
    } else {
      setEstimatedPrice(null);
    }
  }, [selectedRoom, bookingDates, durationType]);

  if (loading) return <LoadingSpinner />;

  if (!pg) {
    return <EmptyState icon="❌" title="PG Not Found" description="The PG you're looking for doesn't exist" />;
  }

  const images = Array.from(new Set(pg.images || []));
  // compute minimum date for inputs and checkout-min based on selection
  const checkOutMin = bookingDates.checkInDate ? addDays(bookingDates.checkInDate, 1) : minDate;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* PG Header */}
      <div className="card mb-8">
        {/* Image Carousel */}
        {(images.length > 0 || pg.thumbnail) && (
          <div className="relative mb-6">
            {(() => {
              const currentImg = images.length > 0 ? images[currentImageIndex % Math.max(1, images.length)] : pg.thumbnail;
              const imageUrl = currentImg && currentImg.startsWith('http') ? currentImg : `http://localhost:5000${currentImg}`;
              return (
                <img
                  src={imageUrl}
                  alt={pg.name}
                  className="w-full h-80 object-cover rounded-lg"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'; }}
                />
              );
            })()}

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-2 transition-all"
                  title="Previous image"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <button
                  onClick={() => setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-2 transition-all"
                  title="Next image"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        )}

        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{pg.name}</h1>
            <p className="text-gray-600">
              {pg.address.street}, {pg.address.city}, {pg.address.state}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              ⭐ {pg.averageRating.toFixed(1)} / 5
            </div>
            <p className="text-gray-600">({pg.reviewCount} reviews)</p>
            <div className="mt-2 text-2xl font-bold text-blue-600">₹{pg.minPrice}{pg.maxPrice ? ` - ${pg.maxPrice}` : ''}</div>
            <div className="mt-2">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${pg.location?.coordinates[1]},${pg.location?.coordinates[0]}`}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-blue-600"
              >
                Navigate →
              </a>
            </div>
            <div className="text-sm text-gray-600">{pg.allowsDailyStay ? 'Daily stay available' : 'Daily stay not available'}</div>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4 py-4 border-t border-b">
          <div>
            <span className="text-gray-600 text-sm">Gender Policy</span>
            <p className="font-bold">{pg.genderAllowed}</p>
          </div>
          <div>
            <span className="text-gray-600 text-sm">Verification</span>
            <p className="font-bold">{pg.isVerified ? '✅ Verified' : '⏳ Pending'}</p>
          </div>
          <div>
            <span className="text-gray-600 text-sm">Daily Stay</span>
            <p className="font-bold">{pg.allowsDailyStay ? '✅ Available' : '❌ Not Available'}</p>
          </div>
          <div>
            <span className="text-gray-600 text-sm">Owner</span>
            <p className="font-bold">{pg.owner?.fullName || pg.ownerName || 'Owner'}</p>
          </div>
        </div>

        {/* Owner Contact Card */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border-2 border-blue-200">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            📞 Contact Owner
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 text-sm mb-1">Owner Name</p>
              <p className="text-xl font-bold text-gray-800">{pg.owner?.fullName || pg.ownerName || 'PG Owner'}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Phone</p>
              <div className="flex gap-2 items-center">
                <p className="text-xl font-bold text-gray-800">{pg.owner?.phone || pg.ownerPhone || 'N/A'}</p>
                {(pg.owner?.phone || pg.ownerPhone) && (
                  <>
                    <a
                      href={`tel:${pg.owner?.phone || pg.ownerPhone}`}
                      className="btn-primary px-3 py-2 text-sm inline-flex items-center gap-1"
                      title="Call owner"
                    >
                      📞 Call
                    </a>
                    <button
                      onClick={() => {
                        const phoneNum = pg.owner?.phone || pg.ownerPhone;
                        navigator.clipboard.writeText(phoneNum);
                        setAlert({ type: 'success', message: 'Phone number copied!' });
                      }}
                      className="bg-gray-200 hover:bg-gray-300 px-3 py-2 text-sm rounded-lg font-medium inline-flex items-center gap-1"
                      title="Copy phone number"
                    >
                      📋 Copy
                    </button>
                  </>
                )}
              </div>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Email</p>
              <p className="text-gray-800">{pg.owner?.email || pg.ownerEmail || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Availability</p>
              <p className="text-gray-800 font-semibold">Available for inquiries</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-white rounded border border-blue-200">
            <p className="text-sm text-gray-700">
              💡 <strong>Tip:</strong> You can directly call the owner to discuss pricing, availability, or any special requests before booking.
            </p>
          </div>
        </div>

        {/* Nearby Mess & Mess Availability */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Mess / Food</h3>
          <p className="mb-2">
            <strong>In-house mess:</strong> {pg.hasMess ? 'Yes — meals available' : 'No'}
          </p>
          {pg.nearbyMess && pg.nearbyMess.length > 0 ? (
            <div>
              <strong>Nearby mess / food outlets:</strong>
              <ul className="list-disc list-inside">
                {pg.nearbyMess.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-gray-600">No nearby mess information</p>
          )}
        </div>

        <p className="mt-4 text-gray-700">{pg.description}</p>
      </div>

      {/* Amenities */}
      <div className="card mb-8">
        <h2 className="text-2xl font-bold mb-6">Amenities</h2>
        {pg.amenities ? (
          <>
            {/* Basic Amenities - Always show these 3 if they exist */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Basic Amenities</h3>
              <div className="grid md:grid-cols-3 gap-3">
                {pg.amenities.bed && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded border border-blue-200">
                    <span className="text-2xl">🛏️</span>
                    <span className="font-medium">Bed</span>
                  </div>
                )}
                {!pg.amenities.bed && (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded border border-gray-200 opacity-50">
                    <span className="text-2xl">🛏️</span>
                    <span className="font-medium text-gray-500">Bed</span>
                  </div>
                )}
                {pg.amenities.wardrobe && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded border border-blue-200">
                    <span className="text-2xl">🚪</span>
                    <span className="font-medium">Wardrobe</span>
                  </div>
                )}
                {!pg.amenities.wardrobe && (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded border border-gray-200 opacity-50">
                    <span className="text-2xl">🚪</span>
                    <span className="font-medium text-gray-500">Wardrobe</span>
                  </div>
                )}
                {pg.amenities.attachedBathroom && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded border border-blue-200">
                    <span className="text-2xl">🚿</span>
                    <span className="font-medium">Attached Bathroom</span>
                  </div>
                )}
                {!pg.amenities.attachedBathroom && (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded border border-gray-200 opacity-50">
                    <span className="text-2xl">🚿</span>
                    <span className="font-medium text-gray-500">Attached Bathroom</span>
                  </div>
                )}
              </div>
            </div>

            {/* Special Amenities - Show all other amenities */}
            {(pg.amenities.ac || pg.amenities.wifi || pg.amenities.studyTable || pg.amenities.parking || pg.amenities.cctv || pg.amenities.powerBackup || pg.amenities.washingMachine || pg.amenities.kitchenAccess) && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Special Amenities</h3>
                <div className="grid md:grid-cols-4 gap-3">
                  {pg.amenities.ac && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded border border-green-200">
                      <span className="text-2xl">❄️</span>
                      <span className="font-medium">Air Conditioning</span>
                    </div>
                  )}
                  {pg.amenities.wifi && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded border border-green-200">
                      <span className="text-2xl">📶</span>
                      <span className="font-medium">WiFi</span>
                    </div>
                  )}
                  {pg.amenities.studyTable && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded border border-green-200">
                      <span className="text-2xl">📚</span>
                      <span className="font-medium">Study Table</span>
                    </div>
                  )}
                  {pg.amenities.parking && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded border border-green-200">
                      <span className="text-2xl">🚗</span>
                      <span className="font-medium">Parking</span>
                    </div>
                  )}
                  {pg.amenities.cctv && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded border border-green-200">
                      <span className="text-2xl">📹</span>
                      <span className="font-medium">CCTV</span>
                    </div>
                  )}
                  {pg.amenities.powerBackup && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded border border-green-200">
                      <span className="text-2xl">⚡</span>
                      <span className="font-medium">Power Backup</span>
                    </div>
                  )}
                  {pg.amenities.washingMachine && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded border border-green-200">
                      <span className="text-2xl">🧺</span>
                      <span className="font-medium">Washing Machine</span>
                    </div>
                  )}
                  {pg.amenities.kitchenAccess && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded border border-green-200">
                      <span className="text-2xl">🍳</span>
                      <span className="font-medium">Kitchen Access</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="text-gray-600">No amenities information available</p>
        )}
      </div>

      {/* Rooms */}
      <div className="card mb-8">
        <h2 className="text-2xl font-bold mb-6">Available Rooms</h2>
        {rooms.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div
                key={room._id}
                className={`border-2 rounded-lg p-5 cursor-pointer transition-all hover:shadow-xl ${
                  selectedRoom?._id === room._id
                    ? 'border-green-500 bg-green-50 shadow-lg'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => setSelectedRoom(room)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg">{room.roomType} Room</h3>
                    <p className="text-sm text-gray-500">Room #{room.roomNumber}</p>
                  </div>
                  {selectedRoom?._id === room._id && (
                    <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">✓ Selected</span>
                  )}
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="text-lg">🛏️</span>
                    <span>{room.bedCount} bed{room.bedCount > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="text-lg">👥</span>
                    <span>{room.availability?.vacantBeds || 0} vacant bed{(room.availability?.vacantBeds || 0) > 1 ? 's' : ''}</span>
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded mb-3 border-l-4 border-blue-500">
                  <p className="text-sm text-gray-600 mb-1">Daily Rate</p>
                  <p className="text-2xl font-bold text-blue-600">₹{room.dailyPrice}/night</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-gray-100 p-2 rounded">
                    <p className="text-gray-600">Monthly</p>
                    <p className="font-bold">₹{room.monthlyPrice}</p>
                  </div>
                  <div className="bg-gray-100 p-2 rounded">
                    <p className="text-gray-600">Occupancy</p>
                    <p className="font-bold">{room.occupancy} person{room.occupancy > 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-6xl mb-4">🏨</p>
            <p className="text-xl text-gray-600 font-semibold mb-2">No Rooms Available</p>
            <p className="text-gray-500">Rooms for this PG are being set up</p>
          </div>
        )}
      </div>

      {/* Booking Section */}
      <div className="card mb-8 bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0">
        <h2 className="text-2xl font-bold mb-6">🏠 Book This PG</h2>
        
        {!selectedRoom ? (
          <div className="text-center py-8">
            <p className="text-lg mb-4">Select a room to proceed with booking</p>
            <p className="text-blue-100">Choose a room from the "Available Rooms" section above</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white bg-opacity-20 p-4 rounded-lg border border-white border-opacity-30">
              <p className="text-blue-100 mb-1">Selected Room</p>
              <p className="text-xl font-bold">{selectedRoom.roomType} - ₹{selectedRoom.dailyPrice}/night</p>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="label text-blue-100">Duration</label>
                <select 
                  className="input-field bg-white text-gray-800" 
                  value={durationType} 
                  onChange={(e) => setDurationType(e.target.value)}
                >
                  <option value="oneDay">1 Day</option>
                  <option value="custom">Custom Dates</option>
                  <option value="oneMonth">1 Month</option>
                </select>
              </div>

              {durationType === 'custom' && (
                <>
                  <div>
                    <label className="label text-blue-100">Check-in</label>
                    <input
                      type="date"
                      className="input-field bg-white text-gray-800"
                      value={bookingDates.checkInDate}
                      min={minDate}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val < minDate) {
                          setAlert({ type: 'error', message: 'Check-in cannot be in the past' });
                          return;
                        }
                        if (bookingDates.checkOutDate && bookingDates.checkOutDate <= val) {
                          setBookingDates({ ...bookingDates, checkInDate: val, checkOutDate: '' });
                        } else {
                          setBookingDates({ ...bookingDates, checkInDate: val });
                        }
                      }}
                    />
                  </div>
                  <div>
                    <label className="label text-blue-100">Check-out</label>
                    <input
                      type="date"
                      className="input-field bg-white text-gray-800"
                      value={bookingDates.checkOutDate}
                      min={checkOutMin}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (bookingDates.checkInDate && val <= bookingDates.checkInDate) {
                          setAlert({ type: 'error', message: 'Check-out must be after check-in' });
                          return;
                        }
                        setBookingDates({ ...bookingDates, checkOutDate: val });
                      }}
                    />
                  </div>
                </>
              )}

              <div className="flex flex-col justify-end">
                <p className="text-blue-100 text-sm">Estimated Cost</p>
                <p className="text-2xl font-bold">{estimatedPrice ? `₹${estimatedPrice}` : '—'}</p>
              </div>
            </div>

            <div className="bg-white bg-opacity-10 p-4 rounded-lg">
              <p className="text-sm text-blue-100 mb-2">📋 How it works:</p>
              <ul className="text-sm text-blue-100 space-y-1">
                <li>✓ Select room and dates</li>
                <li>✓ Click "Send Booking Request"</li>
                <li>✓ Owner will review and contact you</li>
                <li>✓ You can track status in "My Bookings"</li>
              </ul>
            </div>

            <button 
              onClick={handleBooking} 
              disabled={loading}
              className="btn-primary w-full text-lg font-bold py-3 bg-white text-blue-600 hover:bg-blue-50 disabled:opacity-50"
            >
              {loading ? '⏳ Sending Request...' : '📤 Send Booking Request to Owner'}
            </button>
          </div>
        )}
      </div>

      {/* Booking Result (visible and scrolled-to) */}
      {bookingResult && (
        <div ref={resultRef} className={`mb-6 border-l-4 p-6 rounded-lg ${bookingResult.type === 'success' ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
          <div className="flex justify-between items-start gap-4">
            <div className={`flex-1 ${bookingResult.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
              <div className="font-bold text-lg">{bookingResult.type === 'success' ? '✓ Success!' : '✗ Error'}</div>
              <div className="mt-2 text-base">{bookingResult.message}</div>
            </div>
            <button className="text-gray-400 hover:text-gray-600 font-bold text-2xl px-2" onClick={() => setBookingResult(null)}>✕</button>
          </div>
        </div>
      )}

      {/* Reviews */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-4">Reviews ({reviews.length})</h2>
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="border-b pb-4 last:border-b-0">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold">{review.user.fullName}</p>
                    <p className="text-gray-600 text-sm">⭐ {review.overallRating}/5</p>
                  </div>
                  <p className="text-gray-500 text-sm">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <h4 className="font-semibold mb-1">{review.title}</h4>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon="📝" title="No Reviews Yet" description="Be the first to review this PG" />
        )}
      </div>
    </div>
  );
}
