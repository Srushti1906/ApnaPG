import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services';

const Alert = ({ type, message, onClose }) => {
  if (!message) return null;
  
  const bgColor = type === 'success' ? 'bg-green-100' : 'bg-red-100';
  const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
  const borderColor = type === 'success' ? 'border-green-300' : 'border-red-300';

  return (
    <div className={`mb-4 p-4 ${bgColor} border ${borderColor} rounded-lg ${textColor} flex justify-between items-center`}>
      <span>{message}</span>
      <button onClick={onClose} className="text-lg cursor-pointer">×</button>
    </div>
  );
};

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState('phone'); // 'phone' or 'reset'
  const [formData, setFormData] = useState({
    phone: '',
    resetCode: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resetCodeSent, setResetCodeSent] = useState(false);
  const [testCode, setTestCode] = useState(null); // For testing purposes

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRequestReset = async (e) => {
    e.preventDefault();
    
    if (!formData.phone.trim()) {
      setAlert({ type: 'error', message: 'Phone number is required' });
      return;
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      setAlert({ type: 'error', message: 'Phone must be 10 digits' });
      return;
    }

    setLoading(true);
    try {
      const response = await authService.forgotPassword(formData.phone);

      if (response.data.success) {
        setTestCode(response.data.resetCode); // Store for display
        setResetCodeSent(true);
        setStep('reset');
        setAlert({ 
          type: 'success', 
          message: `Reset code sent to ${formData.phone}. Check the code below (for testing).` 
        });
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Error requesting password reset',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!formData.resetCode.trim()) {
      setAlert({ type: 'error', message: 'Reset code is required' });
      return;
    }

    if (!formData.newPassword.trim()) {
      setAlert({ type: 'error', message: 'New password is required' });
      return;
    }

    if (formData.newPassword.length < 6) {
      setAlert({ type: 'error', message: 'Password must be at least 6 characters' });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setAlert({ type: 'error', message: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    try {
      const response = await authService.resetPassword(
        formData.phone,
        formData.resetCode,
        formData.newPassword,
        formData.confirmPassword
      );

      if (response.data.success) {
        setAlert({ type: 'success', message: 'Password reset successfully! Redirecting to login...' });
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Error resetting password',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto mt-10">
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        <div className="card">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold mb-2">🔐 Reset Password</h2>
            <p className="text-gray-600">
              {step === 'phone' 
                ? 'Enter your phone number to receive a reset code'
                : 'Enter the reset code and your new password'}
            </p>
          </div>

          {step === 'phone' ? (
            <form onSubmit={handleRequestReset}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Phone Number (10 digits)
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  className="input-field"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full mb-4"
              >
                {loading ? 'Sending...' : 'Send Reset Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
              {testCode && (
                <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg">
                  <p className="text-sm text-gray-800">
                    <strong>Test Code:</strong> {testCode}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    (For production, use actual SMS service)
                  </p>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Reset Code
                </label>
                <input
                  type="text"
                  name="resetCode"
                  value={formData.resetCode}
                  onChange={handleChange}
                  placeholder="Enter 6-digit code"
                  className="input-field"
                  disabled={loading}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  className="input-field"
                  disabled={loading}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className="input-field"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full mb-4"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setResetCodeSent(false);
                  setFormData({ phone: '', resetCode: '', newPassword: '', confirmPassword: '' });
                }}
                className="w-full px-4 py-2 text-blue-600 hover:text-blue-800 transition"
              >
                Back to Phone Entry
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-blue-600 hover:text-blue-800 font-medium transition"
              >
                Login here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
