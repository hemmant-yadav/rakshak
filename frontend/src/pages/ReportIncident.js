import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getLocationWithAddress, getCurrentLocation, reverseGeocode } from '../services/locationService';

const ReportIncident = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    address: '',
    isAnonymous: false,
    reporterName: '',
    reporterContact: '',
    latitude: '',
    longitude: '',
    image: null
  });

  const categories = [
    { value: 'emergency', label: 'Emergency' },
    { value: 'suspicious', label: 'Suspicious activity' },
    { value: 'infrastructure', label: 'Infrastructure / utilities' },
    { value: 'health', label: 'Health & medical' },
    { value: 'environment', label: 'Environment & weather' },
    { value: 'safety', label: 'Public safety' },
    { value: 'accessibility', label: 'Accessibility & mobility' },
    { value: 'community', label: 'Community issue' },
    { value: 'other', label: 'Other' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        image: e.target.files[0]
      });
    }
  };

  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');

  const handleGetLocation = async () => {
    setLocationLoading(true);
    setLocationError('');
    
    try {
      // Get location with address using the location service
      const locationData = await getLocationWithAddress();
      
      setFormData({
        ...formData,
        latitude: locationData.latitude.toString(),
        longitude: locationData.longitude.toString(),
        address: locationData.address || formData.address // Update address if available
      });
      
      // Show success message
      if (locationData.address) {
        alert(`Location captured successfully!\nCoordinates: ${locationData.latitude}, ${locationData.longitude}\nAddress: ${locationData.address}`);
      } else {
        alert(`Location captured successfully!\nCoordinates: ${locationData.latitude}, ${locationData.longitude}`);
      }
    } catch (error) {
      console.error('Location error:', error);
      setLocationError(error.message);
      alert(`Error: ${error.message}\nPlease enter your location manually.`);
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('isAnonymous', formData.isAnonymous);
      formDataToSend.append('reporterName', formData.reporterName);
      formDataToSend.append('reporterContact', formData.reporterContact);
      formDataToSend.append('latitude', formData.latitude || 40.7128);
      formDataToSend.append('longitude', formData.longitude || -74.0060);
      
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      await axios.post('/api/incidents', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('Incident reported successfully!');
      navigate('/');
    } catch (error) {
      console.error('Error reporting incident:', error);
      alert('Failed to report incident. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-5xl font-display font-extrabold text-slate-900 dark:text-white mb-8">📝 Report an Incident</h1>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Incident Title *
            </label>
            <input
              required
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="Brief description of the incident"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              required
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="Provide detailed information about the incident..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              required
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location/Address *
            </label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    required
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                    placeholder="Enter the location of the incident"
                  />
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={locationLoading}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-2 rounded-full text-sm font-display font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {locationLoading ? '⏳ Getting...' : '📍 Use My Location'}
                  </button>
                </div>
                {locationError && (
                  <p className="text-red-600 text-sm font-medium">{locationError}</p>
                )}
                {(formData.latitude && formData.longitude) && (
                  <p className="text-green-600 text-sm font-medium">
                    ✓ Location captured: {formData.latitude}, {formData.longitude}
                  </p>
                )}
              </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Image (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
            {formData.image && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {formData.image.name}
              </p>
            )}
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="anonymous"
                name="isAnonymous"
                checked={formData.isAnonymous}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label htmlFor="anonymous" className="text-sm font-medium text-gray-700">
                Report anonymously
              </label>
            </div>

            {!formData.isAnonymous && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="reporterName"
                    value={formData.reporterName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Information
                  </label>
                  <input
                    type="text"
                    name="reporterContact"
                    value={formData.reporterContact}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                    placeholder="Email or phone number (optional)"
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-slate-900 hover:bg-slate-700 text-white font-medium py-3 px-6 rounded-md disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportIncident;

