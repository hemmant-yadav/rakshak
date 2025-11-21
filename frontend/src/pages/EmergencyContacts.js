import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
      const response = await axios.get('/api/contacts');
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

      await axios.post('/api/contacts', {
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
      await axios.delete(`/api/contacts/${id}`);
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white mb-2">Emergency contacts</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">People you’d want to notify during an emergency.</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* Info Banner */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 mb-6">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">How it works</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
          When you trigger an SOS alert, Rakshak opens WhatsApp chats with each contact, pre-filled with your emergency details and current location.
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          WhatsApp opens in new tabs/windows (allow popups). Only Indian mobile numbers are supported—enter 10 digits (e.g. 9876543210). We’ll store them as +91 numbers automatically.
        </p>
      </div>

      {/* Add Contact Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-slate-900 text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition"
        >
          {showAddForm ? '✕ Cancel' : '+ Add Contact'}
        </button>
      </div>

      {/* Add Contact Form */}
      {showAddForm && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Add contact</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                Contact Name *
              </label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="e.g., John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                Phone Number *
              </label>
              <input
                required
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="9876543210"
              />
              <p className="text-xs text-gray-500 mt-1">
                Indian mobile numbers only (10 digits). Example: 9876543210 — we will format it as +91XXXXXXXXXX automatically.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium rounded-md bg-slate-900 text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                Add Contact
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({ name: '', phone: '' });
                  setError('');
                }}
                className="px-4 py-2 text-sm font-medium rounded-md border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Contacts List */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">My contacts ({contacts.length})</h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">WhatsApp-ready</span>
        </div>
        
        {contacts.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600 mb-4">No contacts added yet.</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-slate-900 hover:bg-slate-700 text-white font-medium py-2 px-6 rounded-md dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              Add Your First Contact
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {contacts.map(contact => (
              <div
                key={contact.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center font-semibold text-lg">
                    {contact.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">{contact.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-300">{formatIndianPhoneForDisplay(contact.phone)}</p>
                    {contact.isDefault && (
                      <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 mt-1">Default</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openWhatsAppChat(contact.phone, `Hi ${contact.name}, checking in from Rakshak.`)}
                    className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    💬 WhatsApp
                  </button>
                  {!contact.isDefault && (
                    <button
                      onClick={() => handleDelete(contact.id)}
                      className="text-xs font-medium text-rose-600 hover:text-rose-700 px-3 py-2 rounded-full"
                    >
                      Delete
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

