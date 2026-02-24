import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  const login = (userData) => {
    setToken(userData.token);
    setUser(userData.user);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return { user, token, loading, login, logout, isAuthenticated: !!token };
};

export const usePagination = (initialPage = 1, initialLimit = 10) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  return { page, setPage, limit, setLimit };
};

export const useForm = (initialValues, onSubmit) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues({
      ...values,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(values);
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
  };

  return { values, errors, setErrors, handleChange, handleSubmit, resetForm };
};
