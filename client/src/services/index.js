import apiClient from './api';

// Auth Services
export const authService = {
  register: (userData) => apiClient.post('/auth/register', userData),
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  getCurrentUser: () => apiClient.get('/auth/me'),
  updateProfile: (profileData) => apiClient.put('/auth/profile', profileData),
  logout: () => apiClient.post('/auth/logout'),
  forgotPassword: (phone) => apiClient.post('/auth/forgot-password', { phone }),
  resetPassword: (phone, resetCode, newPassword, confirmPassword) =>
    apiClient.post('/auth/reset-password', { phone, resetCode, newPassword, confirmPassword }),
};

// PG Services
export const pgService = {
  getAllPGs: (params) => apiClient.get('/pgs', { params }),
  getPGById: (id) => apiClient.get(`/pgs/${id}`),
  getOwnerPGs: (params) => apiClient.get('/pgs/owner/my-pgs', { params }),
  createPG: (pgData) => apiClient.post('/pgs', pgData),
  updatePG: (id, pgData) => apiClient.put(`/pgs/${id}`, pgData),
  deletePG: (id) => apiClient.delete(`/pgs/${id}`),
  getPGRooms: (pgId) => apiClient.get(`/pgs/${pgId}/rooms`),
  uploadImages: (id, formData) =>
    apiClient.post(`/pgs/${id}/upload-images`, formData),
  deleteImage: (id, imagePath) =>
    apiClient.delete(`/pgs/${id}/images/${encodeURIComponent(imagePath)}`),
};

// Room Services
export const roomService = {
  getRoomById: (id) => apiClient.get(`/rooms/${id}`),
  createRoom: (roomData) => apiClient.post('/rooms', roomData),
  updateRoom: (id, roomData) => apiClient.put(`/rooms/${id}`, roomData),
  deleteRoom: (id) => apiClient.delete(`/rooms/${id}`),
  updateAvailability: (id, availability) => 
    apiClient.put(`/rooms/${id}/availability`, availability),
  uploadImages: (id, formData) => 
    apiClient.post(`/rooms/${id}/upload-images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  deleteImage: (id, imagePath) => 
    apiClient.delete(`/rooms/${id}/images/${encodeURIComponent(imagePath)}`),
};

// Booking Services
export const bookingService = {
  createBooking: (bookingData) => apiClient.post('/bookings', bookingData),
  getBookingById: (id) => apiClient.get(`/bookings/${id}`),
  getUserBookings: (params) => apiClient.get('/bookings/user/bookings', { params }),
  getOwnerBookings: (params) => apiClient.get('/bookings/owner/bookings', { params }),
  getOwnerCustomers: (params) => apiClient.get('/bookings/owner/customers', { params }),
  approveBooking: (id) => apiClient.put(`/bookings/${id}/approve`),
  rejectBooking: (id, data) => apiClient.put(`/bookings/${id}/reject`, data),
  cancelBooking: (id, data) => apiClient.put(`/bookings/${id}/cancel`, data),
  updateCheckInOut: (id, data) => apiClient.patch(`/bookings/${id}/check-in-out`, data),
};

// Review Services
export const reviewService = {
  createReview: (reviewData) => apiClient.post('/reviews', reviewData),
  getPGReviews: (pgId, params) => apiClient.get(`/reviews/pg/${pgId}`, { params }),
  getReviewById: (id) => apiClient.get(`/reviews/${id}`),
  updateReview: (id, reviewData) => apiClient.put(`/reviews/${id}`, reviewData),
  deleteReview: (id) => apiClient.delete(`/reviews/${id}`),
  markHelpful: (id) => apiClient.post(`/reviews/${id}/helpful`),
  respondToReview: (id, response) => apiClient.put(`/reviews/${id}/respond`, response),
};

// Admin Services removed

// Enquiry Service (for quick booking requests)
export const enquiryService = {
  createEnquiry: (data) => apiClient.post('/enquiries', data),
  getOwnerEnquiries: (params) => apiClient.get('/enquiries/owner/enquiries', { params }),
};
