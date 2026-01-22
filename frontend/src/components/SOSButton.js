import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { openWhatsAppChat, openWhatsAppChatWithContacts, createSOSMessage, isMobileDevice } from '../utils/whatsappUtils';

const SOSButton = () => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [formData, setFormData] = useState({
    description: '',
    address: '',
    isAnonymous: false,
    reporterName: '',
    reporterContact: '',
    latitude: '',
    longitude: ''
  });
  const [popupBlocked, setPopupBlocked] = useState(false);

  // Fetch emergency contacts on component mount
  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await api.get('/api/contacts');
      setContacts(response.data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get user's location if available
      try {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              formData.latitude = position.coords.latitude;
              formData.longitude = position.coords.longitude;
              
              // Try to get address if location is captured
              import('../services/locationService').then(({ reverseGeocode }) => {
                reverseGeocode(position.coords.latitude, position.coords.longitude)
                  .then(address => {
                    formData.address = address || formData.address;
                    submitSOS(formData);
                  })
                  .catch(() => {
                    // If reverse geocoding fails, use coordinates only
                    submitSOS(formData);
                  });
              }).catch(() => {
                submitSOS(formData);
              });
            },
            (error) => {
              console.error('Geolocation error:', error);
              // Default location if geolocation fails
              if (!formData.address) {
                alert('Unable to get your location. Please enter your address manually.');
                return;
              }
              formData.latitude = formData.latitude || 40.7128;
              formData.longitude = formData.longitude || -74.0060;
              submitSOS(formData);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0
            }
          );
        } else {
          // Browser doesn't support geolocation
          if (!formData.address) {
            alert('Geolocation not supported. Please enter your address manually.');
            return;
          }
          formData.latitude = formData.latitude || 40.7128;
          formData.longitude = formData.longitude || -74.0060;
          submitSOS(formData);
        }
      } catch (error) {
        console.error('Location error:', error);
        if (!formData.address) {
          alert('Error getting location. Please enter your address manually.');
          return;
        }
        submitSOS(formData);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to send SOS alert. Please try again.');
      setLoading(false);
    }
  };

  const openWhatsAppChatsSync = (contacts, message) => {
    let openedAtLeastOne = false;
    contacts.forEach((contact) => {
      const formattedNum = contact.phone;
      // Only attempt open for string with +91 and no spaces
      if (formattedNum && /^\+91\d{10}$/.test(formattedNum)) {
        try {
          const result = window.open(
            isMobileDevice()
              ? `https://wa.me/${formattedNum.replace('+','')}`
              : `https://web.whatsapp.com/send?phone=${formattedNum.replace('+','')}&text=${encodeURIComponent(message)}`,
            '_blank',
            'noopener,noreferrer'
          );
          if (result) {
            openedAtLeastOne = true;
          }
        } catch (err) {
          // ignore here, show banner if none opens
        }
      }
    });
    if (!openedAtLeastOne) setPopupBlocked(true);
  };

  const submitSOS = async (data) => {
    setPopupBlocked(false);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('description', data.description);
      formDataToSend.append('address', data.address);
      formDataToSend.append('isAnonymous', data.isAnonymous);
      formDataToSend.append('reporterName', data.reporterName);
      formDataToSend.append('reporterContact', data.reporterContact);
      formDataToSend.append('latitude', data.latitude);
      formDataToSend.append('longitude', data.longitude);

      const response = await api.post('/api/incidents/sos', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const incident = response.data;

      // Create SOS message
      const sosMessage = createSOSMessage(incident);

      // Open WhatsApp chats with all contacts in a single user gesture
      if (contacts && contacts.length > 0) {
        openWhatsAppChatsSync(contacts, sosMessage);
        alert(`SOS Alert created! Attempting to open WhatsApp for ${contacts.length} emergency contact(s)...`);
      } else {
        alert('SOS Alert created! Please add emergency contacts to automatically notify them via WhatsApp.');
      }

      setShowModal(false);
      setFormData({
        description: '',
        address: '',
        isAnonymous: false,
        reporterName: '',
        reporterContact: '',
        latitude: '',
        longitude: ''
      });
      
      // Reload after a short delay to allow WhatsApp windows to open
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to send SOS alert. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-700 text-white font-display font-extrabold py-5 px-8 rounded-full shadow-vivid text-xl z-50 animate-pulse hover:shadow-lg hover:scale-105 transition-all border-4 border-white dark:border-charcoal-100 focus:outline-none focus:ring-4 focus:ring-accent"
        style={{ boxShadow: '0 0 40px #dc262655, 0 8px 26px #7f1d1d33' }}
      >
        🚨 SOS
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-10 max-h-[90vh] overflow-y-auto shadow-md border-4 border-red-500 animate-slide-up">
            <h2 className="text-3xl font-display font-extrabold text-red-600 mb-4">
              🚨 Emergency SOS Alert
            </h2>
            <p className="text-base text-slate-700 mb-5">
              Use this for immediate emergencies. This creates an alert and opens WhatsApp Web or mobile with your location for your emergency contacts.
            </p>
            {contacts.length > 0 && (
              <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-300 animate-fade-in">
                <p className="text-sm text-green-800 font-semibold">
                  ✓ {contacts.length} emergency contact{contacts.length !== 1 ? 's' : ''} will be notified
                </p>
              </div>
            )}
            {contacts.length === 0 && (
              <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-300 animate-fade-in">
                <p className="text-sm text-amber-900 font-semibold">
                  ⚠️ No emergency contacts found. <a href="/contacts" className="underline font-bold">Add contacts</a> to get notified via WhatsApp.
                </p>
              </div>
            )}
            
            {popupBlocked && (
              <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-400 rounded text-red-800 font-semibold">
                Unable to open WhatsApp chats automatically. Please enable pop-ups for this site to use the SOS alert feature.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">
                  Emergency Description *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows="3"
                  placeholder="Describe the emergency situation..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">
                  Your Location/Address *
                </label>
                <input
                  required
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter your current location"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="sos-anonymous"
                  checked={formData.isAnonymous}
                  onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="sos-anonymous" className="text-sm text-gray-700">
                  Report anonymously
                </label>
              </div>

              {!formData.isAnonymous && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={formData.reporterName}
                      onChange={(e) => setFormData({ ...formData, reporterName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Number
                    </label>
                    <input
                      type="text"
                      value={formData.reporterContact}
                      onChange={(e) => setFormData({ ...formData, reporterContact: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Optional"
                    />
                  </div>
                </>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 border-2 border-slate-300 font-medium py-2 px-4 rounded-md transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-all tracking-wide shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 ${loading ? 'animate-pulse opacity-80' : ''}`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">Sending…</span>
                  ) : 'Send SOS Alert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default SOSButton;

