import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services';
import { LoginForm } from '../components/AuthForms';
import { Alert } from '../components/Common';

export default function Login() {
  const navigate = useNavigate();
  const [alert, setAlert] = useState(null);

  const handleLogin = async (values) => {
    try {
      const response = await authService.login(values.email, values.password);
      localStorage.setItem('token', response.data.token);
      setAlert({ type: 'success', message: 'Login successful!' });
      setTimeout(() => navigate('/'), 2000);
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
