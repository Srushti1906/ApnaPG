import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services';
import { RegisterForm } from '../components/AuthForms';
import { Alert } from '../components/Common';

export default function Register() {
  const navigate = useNavigate();
  const [alert, setAlert] = useState(null);

  const handleRegister = async (values) => {
    if (values.password !== values.confirmPassword) {
      setAlert({ type: 'error', message: 'Passwords do not match' });
      return;
    }

    try {
      const response = await authService.register({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
        phone: values.phone,
        gender: values.gender,
        role: values.role,
      });

      localStorage.setItem('token', response.data.token);
      setAlert({ type: 'success', message: 'Registration successful!' });
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Registration failed',
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
      <RegisterForm onSubmit={handleRegister} />
    </div>
  );
}
