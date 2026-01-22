import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { openWhatsAppChat } from '../utils/whatsappUtils';
import { formatIndianPhoneNumber, formatIndianPhoneForDisplay } from '../utils/phoneUtils';

const EmergencyContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await api.get('/api/contacts');
      setContacts(response.data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setError('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const formattedPhone = formatIndianPhoneNumber(formData.phone);
      if (!formattedPhone) {
        setError('Please enter a valid 10-digit Indian mobile number (e.g., 9876543210).');
        return;
      }

      await api.post('/api/contacts', {
        ...formData,
        phone: formattedPhone
      });
      setSuccess('Contact added successfully!');
      setFormData({ name: '', phone: '' });
      setShowAddForm(false);
      fetchContacts();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to add contact');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) {
      return;
    }

    try {
      await api.delete(`/api/contacts/${id}`);
      setSuccess('Contact deleted successfully!');
      fetchContacts();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to delete contact');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading contacts...</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-400 via-teal-500 to-cyan-400 ring-2 ring-slate-900/70 shadow-lg shadow-emerald-500/40 mb-6">
          <span className="text-xl font-black tracking-wider uppercase text-slate-900">
            📞
          </span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">
          Emergency Contacts
        </h1>
        <p className="text-lg text-slate-300 text-readable-sm max-w-2xl mx-auto">
          People you'll want to notify during an emergency situation
        </p>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-rose-500/20 border border-rose-500/50 text-rose-200 px-6 py-4 rounded-xl mb-6 text-sm font-medium">
          <div className="flex items-center gap-2">
            <span className="text-base">⚠️</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 px-6 py-4 rounded-xl mb-6 text-sm font-medium">
          <div className="flex items-center gap-2">
            <span className="text-base">✅</span>
            <span>{success}</span>
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="card-enhanced rounded-2xl p-6 lg:p-8 mb-8">
        <div className="flex items-start gap-4">
          <div className="text-3xl mt-1">ℹ️</div>
          <div>
            <h3 className="text-lg font-bold text-white mb-2">How Emergency Alerts Work</h3>
            <p className="text-slate-300 mb-3 text-readable-sm">
              When you trigger an SOS alert, Rakshak automatically opens WhatsApp chats with each contact, pre-filled with your emergency details and current location for immediate response.
            </p>
            <p className="text-sm text-slate-400">
              WhatsApp opens in new tabs/windows (allow popups). Only Indian mobile numbers are supported—enter 10 digits (e.g. 9876543210). We format them as +91 numbers automatically.
            </p>
          </div>
        </div>
      </div>

      {/* Add Contact Button */}
      <div className="mb-8">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary inline-flex items-center gap-3 px-6 py-3 rounded-xl text-base font-semibold min-h-[52px]"
        >
          {showAddForm ? (
            <>
              <span>✕</span>
              <span>Cancel</span>
            </>
          ) : (
            <>
              <span>+</span>
              <span>Add Emergency Contact</span>
            </>
          )}
        </button>
      </div>

      {/* Add Contact Form */}
      {showAddForm && (
        <div className="card-enhanced rounded-2xl p-8 mb-8">
          <h2 className="text-xl font-bold text-white mb-6">Add New Contact</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-3">
                  Contact Name *
                </label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                  placeholder="e.g., John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-3">
                  Phone Number *
                </label>
                <input
                  required
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                  placeholder="9876543210"
                />
              </div>
            </div>
            <p className="text-sm text-slate-400">
              <span className="text-emerald-400">ℹ️</span> Indian mobile numbers only (10 digits). Example: 9876543210 — we format it as +91XXXXXXXXXX automatically.
            </p>
            <div className="flex gap-4 pt-2">
              <button
                type="submit"
                className="btn-primary px-6 py-3 rounded-lg text-base font-semibold min-h-[48px]"
              >
                <span>+ Add Contact</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({ name: '', phone: '' });
                  setError('');
                }}
                className="btn-secondary px-6 py-3 rounded-lg text-base font-medium min-h-[48px]"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Contacts List */}
      <div className="card-enhanced rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-600/50 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Emergency Contacts ({contacts.length})</h2>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30">
            <span className="text-xs text-emerald-300 font-medium">WhatsApp Ready</span>
            <span className="text-sm">✅</span>
          </div>
        </div>

        {contacts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📞</div>
            <h3 className="text-xl font-semibold text-white mb-4">No Contacts Added Yet</h3>
            <p className="text-slate-300 mb-6 text-readable-sm">Add emergency contacts to receive instant WhatsApp alerts during crises.</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary px-8 py-4 rounded-xl text-lg font-semibold min-h-[56px]"
            >
              <span>+ Add Your First Contact</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-600/30">
            {contacts.map(contact => (
              <div
                key={contact.id}
                className="px-6 py-5 flex items-center justify-between hover:bg-slate-800/30 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center font-bold text-lg text-white shadow-lg">
                    {contact.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">{contact.name}</h3>
                    <p className="text-slate-300 font-medium">{formatIndianPhoneForDisplay(contact.phone)}</p>
                    {contact.isDefault && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 mt-1">
                        <span>⭐</span>
                        <span>Default</span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => openWhatsAppChat(contact.phone, `Hi ${contact.name}, checking in from Rakshak.`)}
                    className="btn-secondary inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg min-h-[40px] hover:bg-green-500/20 hover:border-green-500/40 transition-all"
                  >
                    <span className="text-base">💬</span>
                    <span>Test</span>
                  </button>
                  {!contact.isDefault && (
                    <button
                      onClick={() => handleDelete(contact.id)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg text-rose-300 hover:text-rose-200 hover:bg-rose-500/20 border border-rose-500/30 hover:border-rose-500/50 transition-all min-h-[40px]"
                    >
                      <span className="text-base">🗑️</span>
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencyContacts;

