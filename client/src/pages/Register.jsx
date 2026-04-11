import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { RegisterForm } from '../components/AuthForms';
import { Alert } from '../components/Common';

export default function Register() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuthContext();
  const [alert, setAlert] = useState(null);

  const handleRegister = async (values) => {
    if (values.password !== values.confirmPassword) {
      setAlert({ type: 'error', message: 'Passwords do not match' });
      return;
    }

    try {
      const result = await registerUser({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
        phone: values.phone,
        gender: values.gender,
        role: values.role,
      });

      if (result.success) {
        setAlert({ type: 'success', message: 'Registration successful!' });
        
        // Redirect based on user role
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
          message: result.error || 'Registration failed',
        });
      }
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
