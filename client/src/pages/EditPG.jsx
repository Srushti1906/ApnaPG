import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pgService } from '../services';
import { PGForm } from '../components/PGForm';
import { Alert, LoadingSpinner } from '../components/Common';

export default function EditPG() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [pgData, setPGData] = useState(null);

  useEffect(() => {
    const fetchPG = async () => {
      try {
        setLoading(true);
        const response = await pgService.getPGById(id);
        setPGData(response.data.pg);
      } catch (error) {
        setAlert({
          type: 'error',
          message: error.response?.data?.message || 'Failed to load PG details',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPG();
  }, [id]);

  const handleEditPG = async (pgData) => {
    try {
      setLoading(true);
      await pgService.updatePG(id, pgData);
      setAlert({ type: 'success', message: 'PG updated successfully!' });
      setTimeout(() => navigate('/owner-dashboard'), 1500);
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update PG';
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  if (loading && !pgData) return <LoadingSpinner />;

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
        <h1 className="text-3xl font-bold text-gray-900">✏️ Edit PG Details</h1>
        <p className="text-gray-600 mt-2">Update your property information</p>
      </div>

      {pgData && <PGForm onSubmit={handleEditPG} loading={loading} initialData={pgData} />}
    </div>
  );
}
