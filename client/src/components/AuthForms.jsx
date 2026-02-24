import React, { useState } from 'react';
import { useForm } from '../hooks';
import { Alert } from './Common';

export function LoginForm({ onSubmit }) {
  const [alert, setAlert] = useState(null);
  const { values, handleChange, handleSubmit } = useForm(
    { email: '', password: '' },
    onSubmit
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

        <form onSubmit={handleSubmit} className="space-y-4">
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
            Login
          </button>
        </form>

        <p className="text-center mt-4 text-sm">
          Don't have an account?{' '}
          <a href="/register" className="text-blue-600 hover:underline">
            Register here
          </a>
        </p>
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
            onChange={(e) => setUserType(e.target.value)}
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
