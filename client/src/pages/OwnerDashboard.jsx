import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { pgService, bookingService, enquiryService } from '../services';
import { LoadingSpinner, Alert } from '../components/Common';

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [pgs, setPGs] = useState([]);
  const [customers, setCustomers] = useState(null);
  const [bookingRequests, setBookingRequests] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [sortBy, setSortBy] = useState('lastBooking');

  useEffect(() => {
    fetchOwnerPGs();
    if (activeTab === 'customers') {
      fetchOwnerCustomers();
    }
    if (activeTab === 'requests') {
      fetchBookingRequests();
      fetchEnquiries();
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'customers' && !customers) {
      fetchOwnerCustomers();
    }
    if (activeTab === 'requests') {
      fetchBookingRequests();
      fetchEnquiries();
    }
  }, [activeTab]);

  const fetchOwnerPGs = async () => {
    try {
      setLoading(true);
      const response = await pgService.getOwnerPGs();
      setPGs(response.data.pgs || []);
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Failed to load PGs',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOwnerCustomers = async () => {
    try {
      const response = await bookingService.getOwnerCustomers({ sortBy });
      setCustomers(response.data);
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Failed to load customers',
      });
    }
  };

  const fetchBookingRequests = async () => {
    try {
      const response = await bookingService.getOwnerBookings({ status: 'Pending' });
      setBookingRequests(response.data.bookings || []);
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Failed to load booking requests',
      });
    }
  };

  const fetchEnquiries = async () => {
    try {
      const response = await enquiryService.getOwnerEnquiries();
      setEnquiries(response.data.enquiries || []);
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Failed to load enquiries',
      });
    }
  };

  const handleApproveBooking = async (bookingId) => {
    try {
      await bookingService.approveBooking(bookingId);
      setAlert({ type: 'success', message: 'Booking approved!' });
      fetchBookingRequests();
      // Also refresh customers to show updated status
      if (customers) {
        fetchOwnerCustomers();
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to approve booking' });
    }
  };

  const handleRejectBooking = async (bookingId) => {
    try {
      await bookingService.rejectBooking(bookingId, { reason: 'Admin rejection' });
      setAlert({ type: 'success', message: 'Booking rejected!' });
      fetchBookingRequests();
      // Also refresh customers to show updated status
      if (customers) {
        fetchOwnerCustomers();
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to reject booking' });
    }
  };

  if (loading) return <LoadingSpinner />;

  // Calculate statistics
  const stats = {
    totalPGs: pgs.length,
    verifiedPGs: pgs.filter(pg => pg.isVerified).length,
    totalRooms: pgs.reduce((sum, pg) => sum + (pg.rooms?.length || 0), 0),
    averageRating: pgs.length > 0 
      ? (pgs.reduce((sum, pg) => sum + (pg.averageRating || 0), 0) / pgs.length).toFixed(2)
      : 0,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">📊 Owner Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome, {user?.fullName}! Manage your PGs from here.</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <h3 className="text-gray-600 text-sm font-semibold">Total PGs</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalPGs}</p>
          <p className="text-xs text-gray-500 mt-1">All your properties</p>
        </div>

        <div className="card">
          <h3 className="text-gray-600 text-sm font-semibold">Verified</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.verifiedPGs}</p>
          <p className="text-xs text-gray-500 mt-1">✅ Verified PGs</p>
        </div>

        <div className="card">
          <h3 className="text-gray-600 text-sm font-semibold">Total Rooms</h3>
          <p className="text-3xl font-bold text-orange-600 mt-2">{stats.totalRooms}</p>
          <p className="text-xs text-gray-500 mt-1">Available rooms</p>
        </div>

        <div className="card">
          <h3 className="text-gray-600 text-sm font-semibold">Avg Rating</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">⭐ {stats.averageRating}</p>
          <p className="text-xs text-gray-500 mt-1">From customers</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'overview'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📋 Overview
        </button>
        <button
          onClick={() => setActiveTab('pg-list')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'pg-list'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🏢 My PGs
        </button>
        <button
          onClick={() => setActiveTab('customers')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'customers'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          👥 Customers
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'bookings'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📅 Bookings
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'requests'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📬 Booking Requests
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'reviews'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          ⭐ Reviews
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">📊 Overview</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-3">Quick Stats</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <span className="text-gray-600">Email:</span> <span className="font-medium">{user?.email}</span>
                </li>
                <li>
                  <span className="text-gray-600">Phone:</span> <span className="font-medium">{user?.phone}</span>
                </li>
                <li>
                  <span className="text-gray-600">Role:</span> <span className="font-medium">{user?.role}</span>
                </li>
                <li>
                  <span className="text-gray-600">Member Since:</span> <span className="font-medium">
                    {new Date(user?.createdAt).toLocaleDateString()}
                  </span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-3">Key Metrics</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <span className="text-gray-600">Properties:</span> <span className="font-medium">{stats.totalPGs}</span>
                </li>
                <li>
                  <span className="text-gray-600">Verified:</span> <span className="font-medium text-green-600">{stats.verifiedPGs} ✓</span>
                </li>
                <li>
                  <span className="text-gray-600">Total Rooms:</span> <span className="font-medium">{stats.totalRooms}</span>
                </li>
                <li>
                  <span className="text-gray-600">Customer Rating:</span> <span className="font-medium">⭐ {stats.averageRating}/5</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'pg-list' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">My PGs</h2>
            <button onClick={() => navigate('/add-pg')} className="btn-primary">+ Add New PG</button>
          </div>

          {pgs.length > 0 ? (
            <div className="space-y-4">
              {pgs.map(pg => (
                <div key={pg._id} className="card flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold">{pg.name}</h3>
                      {pg.isVerified && <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">✓ Verified</span>}
                      {!pg.isVerified && <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-semibold">⏳ Pending</span>}
                    </div>
                    <p className="text-gray-600 text-sm mb-2">📍 {pg.address?.street}, {pg.address?.city}</p>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Price Range:</span>
                        <p className="font-semibold">₹{pg.minPrice} - ₹{pg.maxPrice}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Gender:</span>
                        <p className="font-semibold">{pg.genderAllowed}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Rooms:</span>
                        <p className="font-semibold">{pg.rooms?.length || 0} available</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Rating:</span>
                        <p className="font-semibold">⭐ {pg.averageRating || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => navigate(`/edit-pg/${pg._id}`)}
                      className="px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm font-medium"
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      onClick={() => navigate(`/owner-pg-details/${pg._id}`)}
                      className="px-3 py-1 bg-gray-50 text-gray-600 rounded hover:bg-gray-100 text-sm font-medium"
                    >
                      📊 View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-12">
              <p className="text-gray-600 mb-4">No PGs added yet</p>
              <button onClick={() => navigate('/add-pg')} className="btn-primary">Create Your First PG</button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'customers' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">👥 Your Customers</h2>
            <select 
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCustomers(null);
              }}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="lastBooking">Sort by Last Booking</option>
              <option value="totalAmount">Sort by Total Spent</option>
              <option value="totalBookings">Sort by Booking Count</option>
            </select>
          </div>

          {customers ? (
            <>
              {/* Summary Cards */}
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div className="card">
                  <h3 className="text-gray-600 text-sm font-semibold">Total Customers</h3>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{customers.summary?.totalCustomers || 0}</p>
                </div>
                <div className="card">
                  <h3 className="text-gray-600 text-sm font-semibold">Total Bookings</h3>
                  <p className="text-3xl font-bold text-green-600 mt-2">{customers.summary?.totalBookings || 0}</p>
                </div>
                <div className="card">
                  <h3 className="text-gray-600 text-sm font-semibold">Total Revenue</h3>
                  <p className="text-3xl font-bold text-orange-600 mt-2">₹{customers.summary?.totalRevenue?.toLocaleString() || 0}</p>
                </div>
                <div className="card">
                  <h3 className="text-gray-600 text-sm font-semibold">Avg Per Customer</h3>
                  <p className="text-3xl font-bold text-purple-600 mt-2">₹{Math.round(customers.summary?.averageSpentPerCustomer || 0).toLocaleString()}</p>
                </div>
              </div>

              {/* Customers List */}
              {customers.customers && customers.customers.length > 0 ? (
                <div className="grid gap-4">
                  {customers.customers.map(customer => (
                    <div key={customer.userId} className="card">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="font-bold text-blue-600">
                                {(customer.fullName || 'C')[0].toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-bold text-lg">{customer.fullName}</h3>
                              <p className="text-sm text-gray-600">{customer.email}</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">📞 {customer.phone}</p>
                          
                          <div className="grid grid-cols-5 gap-3 text-sm">
                            <div className="bg-blue-50 p-2 rounded">
                              <p className="text-gray-600 text-xs">Total Bookings</p>
                              <p className="font-bold text-lg">{customer.totalBookings}</p>
                            </div>
                            <div className="bg-green-50 p-2 rounded">
                              <p className="text-gray-600 text-xs">Total Spent</p>
                              <p className="font-bold">₹{customer.totalAmount?.toLocaleString()}</p>
                            </div>
                            <div className="bg-orange-50 p-2 rounded">
                              <p className="text-gray-600 text-xs">Status</p>
                              <p className="font-bold">
                                {customer.bookingStatus?.confirmed || 0}/{customer.totalBookings}
                              </p>
                            </div>
                            <div className="bg-purple-50 p-2 rounded">
                              <p className="text-gray-600 text-xs">Last Booking</p>
                              <p className="font-bold text-xs">
                                {customer.lastBooking?.checkInDate 
                                  ? new Date(customer.lastBooking.checkInDate).toLocaleDateString('en-IN', { 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })
                                  : 'N/A'}
                              </p>
                            </div>
                            <div className="bg-yellow-50 p-2 rounded">
                              <p className="text-gray-600 text-xs">Last Amount</p>
                              <p className="font-bold">
                                {customer.lastBooking?.totalPrice 
                                  ? `₹${customer.lastBooking.totalPrice.toLocaleString()}`
                                  : 'N/A'}
                              </p>
                            </div>
                          </div>

                          {/* Booking Status Breakdown */}
                          {customer.bookingStatus && (
                            <div className="mt-3 flex gap-3 text-xs">
                              {customer.bookingStatus.confirmed > 0 && (
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                                  ✓ {customer.bookingStatus.confirmed} Confirmed
                                </span>
                              )}
                              {customer.bookingStatus.pending > 0 && (
                                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                  ⏳ {customer.bookingStatus.pending} Pending
                                </span>
                              )}
                              {customer.bookingStatus.cancelled > 0 && (
                                <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
                                  ✕ {customer.bookingStatus.cancelled} Cancelled
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 font-medium text-sm">
                          📊 View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card text-center py-12">
                  <p className="text-gray-600 mb-2">No customers yet</p>
                  <p className="text-sm text-gray-500">You'll see your customers here once they book your properties</p>
                </div>
              )}
            </>
          ) : (
            <LoadingSpinner />
          )}
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">📅 Recent Bookings</h2>
          <div className="text-center py-12 text-gray-500">
            <p>Booking information will be displayed here</p>
            <p className="text-sm mt-2">View all bookings from your customers</p>
          </div>
        </div>
      )}

      {activeTab === 'requests' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">📬 Pending Booking Requests</h2>
            <button 
              onClick={() => { fetchBookingRequests(); fetchEnquiries(); }}
              className="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded text-sm font-medium"
            >
              🔄 Refresh
            </button>
          </div>

          {/* Pending Bookings Section */}
          {bookingRequests.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4">📋 Confirmed Bookings (Pending Approval)</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {bookingRequests.map(booking => (
                  <div key={booking._id} className="card border-2 border-yellow-300 bg-yellow-50">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold">{booking.pg?.name || 'PG'}</h3>
                        <p className="text-sm text-gray-600">Room: {booking.room?.roomNumber || 'N/A'}</p>
                      </div>
                      <span className="bg-yellow-300 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold">⏳ Pending</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                      <div className="bg-white p-2 rounded">
                        <p className="text-gray-600 text-xs">Check-in</p>
                        <p className="font-bold">{new Date(booking.checkInDate).toLocaleDateString()}</p>
                      </div>
                      <div className="bg-white p-2 rounded">
                        <p className="text-gray-600 text-xs">Check-out</p>
                        <p className="font-bold">{new Date(booking.checkOutDate).toLocaleDateString()}</p>
                      </div>
                      <div className="bg-white p-2 rounded">
                        <p className="text-gray-600 text-xs">Nights</p>
                        <p className="font-bold">{booking.numberOfNights}</p>
                      </div>
                      <div className="bg-white p-2 rounded">
                        <p className="text-gray-600 text-xs">Total Price</p>
                        <p className="font-bold">₹{booking.finalPrice}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveBooking(booking._id)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded text-sm"
                      >
                        ✅ Approve
                      </button>
                      <button
                        onClick={() => handleRejectBooking(booking._id)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded text-sm"
                      >
                        ❌ Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Enquiries Section */}
          {enquiries.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4">💬 Guest Enquiries (Quick Booking Requests)</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {enquiries.map(enquiry => (
                  <div key={enquiry._id} className="card border-2 border-blue-300 bg-blue-50">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold">{enquiry.pg?.name || enquiry.pgName || 'General Inquiry'}</h3>
                        <p className="text-sm text-gray-600">Guest: {enquiry.name}</p>
                      </div>
                      <span className="bg-blue-300 text-blue-900 px-3 py-1 rounded-full text-sm font-bold">💬 Enquiry</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                      <div className="bg-white p-2 rounded">
                        <p className="text-gray-600 text-xs">Phone</p>
                        <p className="font-bold"><a href={`tel:${enquiry.phone}`} className="text-blue-600 hover:underline">{enquiry.phone}</a></p>
                      </div>
                      <div className="bg-white p-2 rounded">
                        <p className="text-gray-600 text-xs">Duration</p>
                        <p className="font-bold">{enquiry.days} day{enquiry.days > 1 ? 's' : ''}</p>
                      </div>
                      {enquiry.collegeName && (
                        <div className="bg-white p-2 rounded col-span-2">
                          <p className="text-gray-600 text-xs">College</p>
                          <p className="font-bold">{enquiry.collegeName}</p>
                        </div>
                      )}
                      <div className="bg-white p-2 rounded col-span-2">
                        <p className="text-gray-600 text-xs">Received</p>
                        <p className="font-bold">{new Date(enquiry.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <a
                        href={`tel:${enquiry.phone}`}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded text-sm text-center"
                      >
                        📞 Call
                      </a>
                      <button
                        onClick={() => window.location.href = `mailto:${enquiry.phone}?subject=Re: Your enquiry for ${enquiry.pg?.name || enquiry.pgName}`}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded text-sm"
                      >
                        💬 Reply
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {bookingRequests.length === 0 && enquiries.length === 0 && (
            <div className="card text-center py-12 bg-green-50 border-2 border-green-200">
              <p className="text-3xl mb-3">✅</p>
              <p className="text-lg font-bold text-green-800">No Pending Requests</p>
              <p className="text-green-700 mt-2">All your booking requests and enquiries have been processed</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">⭐ Customer Reviews</h2>
          <div className="text-center py-12 text-gray-500">
            <p>Reviews will be displayed here</p>
            <p className="text-sm mt-2">View ratings and feedback from your customers</p>
          </div>
        </div>
      )}
    </div>
  );
}
