import React, { useState } from 'react';
import { useForm } from '../hooks';
import { Alert } from './Common';

export function LoginForm({ onSubmit }) {
  const [alert, setAlert] = useState(null);
  const [userRole, setUserRole] = useState('User');
  const { values, handleChange, handleSubmit: handleFormSubmit } = useForm(
    { email: '', password: '' },
    (formValues) => onSubmit(formValues, userRole)
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="card max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">Login to Apna PG</h2>

        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        {/* Role Selection */}
        <div className="mb-6">
          <label className="label">Login As</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setUserRole('User')}
              className={`p-3 rounded-lg border-2 font-medium transition ${
                userRole === 'User'
                  ? 'border-blue-600 bg-blue-50 text-blue-600'
                  : 'border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              👤 Tenant/User
            </button>
            <button
              type="button"
              onClick={() => setUserRole('Owner')}
              className={`p-3 rounded-lg border-2 font-medium transition ${
                userRole === 'Owner'
                  ? 'border-green-600 bg-green-50 text-green-600'
                  : 'border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              🏢 Owner/Manager
            </button>
          </div>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              name="email"
              value={values.email}
              onChange={handleChange}
              className="input-field"
              placeholder={userRole === 'Owner' ? 'owner@example.com' : 'user@example.com'}
              required
            />
          </div>

          <div>
            <label className="label">Password</label>
            <input
              type="password"
              name="password"
              value={values.password}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          <button type="submit" className="btn-primary w-full">
            Login as {userRole}
          </button>

          <div className="mt-3 text-center">
            <a href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 transition">
              🔐 Forgot Password?
            </a>
          </div>
        </form>

        <p className="text-center mt-4 text-sm">
          Don't have an account?{' '}
          <a href="/register" className="text-blue-600 hover:underline">
            Register here
          </a>
        </p>

        {/* Role Information */}
        <div className="mt-6 p-3 rounded-lg bg-gray-50 text-xs text-gray-700">
          <p className="font-semibold mb-2">
            {userRole === 'Owner' ? '🏢 Owner Account' : '👤 Tenant Account'}
          </p>
          {userRole === 'Owner' ? (
            <ul className="list-disc list-inside space-y-1">
              <li>Manage your PGs</li>
              <li>View bookings & customers</li>
              <li>Track ratings & reviews</li>
              <li>Update PG details</li>
            </ul>
          ) : (
            <ul className="list-disc list-inside space-y-1">
              <li>Browse available PGs</li>
              <li>Book rooms</li>
              <li>Track your bookings</li>
              <li>Rate & review PGs</li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export function RegisterForm({ onSubmit }) {
  const [userType, setUserType] = useState('User');
  const { values, handleChange, handleSubmit } = useForm(
    {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      gender: '',
      role: 'User',
    },
    onSubmit
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="card max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">Register to Apna PG</h2>

        <div className="mb-4">
          <label className="label">I am a</label>
          <select
            value={userType}
            onChange={(e) => {
              const type = e.target.value;
              setUserType(type);
              handleChange({ target: { name: 'role', value: type } });
            }}
            className="input-field"
          >
            <option value="User">User (Looking for PG)</option>
            <option value="Owner">Owner (PG Manager)</option>
          </select>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="label">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={values.fullName}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="label">Email</label>
            <input
              type="email"
              name="email"
              value={values.email}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="label">Phone</label>
            <input
              type="tel"
              name="phone"
              value={values.phone}
              onChange={handleChange}
              className="input-field"
              required
              placeholder="10 digit number"
            />
          </div>

          <div>
            <label className="label">Gender</label>
            <select
              name="gender"
              value={values.gender}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="label">Password</label>
            <input
              type="password"
              name="password"
              value={values.password}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="label">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={values.confirmPassword}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          <button type="submit" className="btn-primary w-full">
            Register
          </button>
        </form>

        <p className="text-center mt-4 text-sm">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 hover:underline">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
}
