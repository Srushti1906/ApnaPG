import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Browse from './pages/Browse';
import PGDetails from './pages/PGDetails';
import MyBookings from './pages/MyBookings';
import AddPG from './pages/AddPG';
import EditPG from './pages/EditPG';
import AddRoom from './pages/AddRoom';
import OwnerPGDetails from './pages/OwnerPGDetails';
import OwnerDashboard from './pages/OwnerDashboard';
// Admin pages removed
import ProtectedRoute from './pages/ProtectedRoute';
import './index.css';
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
          <Route path="/forgot-password" element={<ForgotPassword />} />
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

          <Route
            path="/add-pg"
            element={
              <ProtectedRoute requiredRole="Owner">
                <AddPG />
              </ProtectedRoute>
            }
          />

          <Route
            path="/edit-pg/:id"
            element={
              <ProtectedRoute requiredRole="Owner">
                <EditPG />
              </ProtectedRoute>
            }
          />

          <Route
            path="/add-room/:pgId"
            element={
              <ProtectedRoute requiredRole="Owner">
                <AddRoom />
              </ProtectedRoute>
            }
          />

          <Route
            path="/owner-pg-details/:id"
            element={
              <ProtectedRoute requiredRole="Owner">
                <OwnerPGDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/owner-dashboard"
            element={
              <ProtectedRoute requiredRole="Owner">
                <OwnerDashboard />
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
