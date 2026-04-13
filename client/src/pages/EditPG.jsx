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
  const [uploadingImages, setUploadingImages] = useState(false);

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

  const handleUploadImages = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingImages(true);
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('images', files[i]);
      }

      console.log('📤 Uploading images for PG:', id);
      const response = await pgService.uploadImages(id, formData);
      console.log('✅ Upload response:', response.data);
      
      // Update pgData with new images from response
      const updatedImages = response.data.images || response.data.pg?.images || [];
      const updatedThumbnail = response.data.pg?.thumbnail || response.data.thumbnail;
      
      setPGData(prev => ({
        ...prev,
        images: updatedImages,
        thumbnail: updatedThumbnail
      }));
      
      setAlert({ type: 'success', message: `✅ ${files.length} image(s) uploaded successfully!` });
    } catch (error) {
      console.error('❌ Upload error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to upload images';
      setAlert({ type: 'error', message: errorMsg });
    } finally {
      setUploadingImages(false);
      event.target.value = ''; // Reset file input
    }
  };

  const handleDeleteImage = async (imagePath) => {
    try {
      console.log('🗑️ Deleting image:', imagePath);
      const response = await pgService.deleteImage(id, imagePath);
      console.log('✅ Delete response:', response.data);
      
      // Update pgData with remaining images from response
      const updatedImages = response.data.images || response.data.pg?.images || [];
      const updatedThumbnail = response.data.pg?.thumbnail || response.data.thumbnail;
      
      setPGData(prev => ({
        ...prev,
        images: updatedImages,
        thumbnail: updatedThumbnail
      }));
      
      setAlert({ type: 'success', message: 'Image deleted successfully!' });
    } catch (error) {
      console.error('❌ Delete error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to delete image';
      setAlert({ type: 'error', message: errorMsg });
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

      {pgData && (
        <>
          <PGForm onSubmit={handleEditPG} loading={loading} initialData={pgData} />

          {/* Image Management Section */}
          <div className="mt-12 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold mb-4">🖼️ Manage PG Images</h3>

              {/* Current Images */}
              {pgData.images && pgData.images.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Current Images ({pgData.images.length})</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {pgData.images.map((image, idx) => {
                      // Construct full URL for images stored in /uploads directory
                      const imageUrl = image.startsWith('http') ? image : `http://localhost:5000${image}`;
                      return (
                        <div key={idx} className="relative group">
                          <img
                            src={imageUrl}
                            alt={`PG Image ${idx + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=400&q=60';
                            }}
                          />
                          <button
                            onClick={() => handleDeleteImage(image)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded opacity-0 group-hover:opacity-100 transition"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Upload New Images */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <p className="text-gray-600 mb-4">Upload up to 10 images (JPG, PNG, WebP, GIF)</p>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleUploadImages}
                    disabled={uploadingImages}
                    className="hidden"
                  />
                  <span className={`inline-block px-6 py-2 rounded ${uploadingImages ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} text-white font-semibold`}>
                    {uploadingImages ? '⏳ Uploading...' : '📤 Choose Images'}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
