import React, { useState } from 'react';
import api from '../services/api';
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

      console.log('Sending incident data:', Object.fromEntries(formDataToSend));
      console.log('API Base URL:', api.defaults.baseURL);

      const response = await api.post('/api/incidents', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Incident reported successfully:', response.data);
      alert('Incident reported successfully!');
      navigate('/');
    } catch (error) {
      console.error('Error reporting incident:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      alert(`Failed to report incident: ${error.response?.data?.error || error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-400 via-violet-500 to-amber-400 ring-2 ring-slate-900/70 shadow-lg shadow-sky-500/40 mb-6">
          <span className="text-xl font-black tracking-wider uppercase text-slate-900">
            📝
          </span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">
          Report an Incident
        </h1>
        <p className="text-lg text-slate-300 text-readable-sm max-w-2xl mx-auto">
          Help keep your neighbourhood safe by reporting incidents and safety concerns
        </p>
      </div>

      {/* Form */}
      <div className="card-enhanced rounded-2xl p-8 lg:p-10">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-3">
                Incident Title *
              </label>
              <input
                required
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                placeholder="Brief description of the incident"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-3">
                Category *
              </label>
              <select
                required
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value} className="bg-slate-800">
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-3">
              Description *
            </label>
            <textarea
              required
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all resize-vertical"
              placeholder="Provide detailed information about the incident..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-3">
              Location/Address *
            </label>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  required
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                  placeholder="Enter the location of the incident"
                />
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={locationLoading}
                  className="btn-secondary inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-medium min-h-[48px] disabled:opacity-50"
                >
                  {locationLoading ? (
                    <>
                      <div className="animate-spin text-base">⟳</div>
                      <span>Getting...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-base">📍</span>
                      <span>Use My Location</span>
                    </>
                  )}
                </button>
              </div>
              {locationError && (
                <div className="bg-rose-500/20 border border-rose-500/40 text-rose-300 px-4 py-3 rounded-lg text-sm">
                  <span className="font-medium">⚠️ {locationError}</span>
                </div>
              )}
              {(formData.latitude && formData.longitude) && (
                <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-lg text-sm">
                  <span className="font-medium">✓ Location captured: {formData.latitude}, {formData.longitude}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-3">
              Upload Image (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-sky-500 file:text-white hover:file:bg-sky-400 transition-all"
            />
            {formData.image && (
              <p className="mt-3 text-sm text-slate-300">
                <span className="text-emerald-400">✓</span> Selected: {formData.image.name}
              </p>
            )}
          </div>

          <div className="border-t border-slate-600/50 pt-6">
            <div className="flex items-center gap-3 mb-6">
              <input
                type="checkbox"
                id="anonymous"
                name="isAnonymous"
                checked={formData.isAnonymous}
                onChange={handleInputChange}
                className="w-4 h-4 text-sky-500 bg-slate-800 border-slate-600 rounded focus:ring-sky-500 focus:ring-2"
              />
              <label htmlFor="anonymous" className="text-sm font-medium text-slate-200 cursor-pointer">
                Report anonymously
              </label>
            </div>

            {!formData.isAnonymous && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-3">
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="reporterName"
                    value={formData.reporterName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-3">
                    Contact Information
                  </label>
                  <input
                    type="text"
                    name="reporterContact"
                    value={formData.reporterContact}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                    placeholder="Email or phone number (optional)"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-600/50">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn-secondary flex-1 py-3 px-6 rounded-lg text-base font-medium min-h-[52px]"
            >
              ← Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 py-3 px-6 rounded-lg text-base font-semibold min-h-[52px] disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin">⟳</div>
                  <span>Submitting...</span>
                </div>
              ) : (
                '📤 Submit Report'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportIncident;

