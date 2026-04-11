import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { LoginForm } from '../components/AuthForms';
import { Alert } from '../components/Common';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthContext();
  const [alert, setAlert] = useState(null);

  const handleLogin = async (values, selectedRole) => {
    try {
      const result = await login(values.email, values.password);
      
      if (result.success) {
        setAlert({ type: 'success', message: 'Login successful!' });
        
        // Redirect based on user role - use the returned user data
        const userRole = result.user?.role;
        setTimeout(() => {
          if (userRole === 'Owner') {
            navigate('/owner-dashboard');
          } else if (userRole === 'User') {
            navigate('/my-bookings');
          } else {
            navigate('/');
          }
        }, 800);
      } else {
        setAlert({
          type: 'error',
          message: result.error || 'Login failed',
        });
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Login failed',
      });
    }
  };

  return (
    <div>
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}
      <LoginForm onSubmit={handleLogin} />
    </div>
  );
}
