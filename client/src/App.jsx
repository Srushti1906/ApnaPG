import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Browse from './pages/Browse';
import PGDetails from './pages/PGDetails';
import MyBookings from './pages/MyBookings';
// Admin pages removed
import ProtectedRoute from './pages/ProtectedRoute';
import './index.css';
// ChatWidget removed in favor of Botpress webchat
import BookingModal from './components/BookingModal';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <BookingModal />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/pg/:id" element={<PGDetails />} />
          {/* Admin routes removed */}

          {/* Protected Routes */}
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute requiredRole="User">
                <MyBookings />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
