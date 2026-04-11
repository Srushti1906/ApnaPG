import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pgService } from '../services';
import { PGForm } from '../components/PGForm';
import { Alert } from '../components/Common';

export default function AddPG() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleAddPG = async (pgData) => {
    try {
      setLoading(true);
      await pgService.createPG(pgData);
      setAlert({ type: 'success', message: 'PG added successfully!' });
      setTimeout(() => navigate('/owner-dashboard'), 1500);
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to add PG';
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">🏠 Add Your New PG</h1>
        <p className="text-gray-600 mt-2">Fill in the details to list your property</p>
      </div>

      <PGForm onSubmit={handleAddPG} loading={loading} />
    </div>
  );
}
