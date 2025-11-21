import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ModeratorPanel = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingIncident, setEditingIncident] = useState(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const response = await axios.get('/api/incidents');
      setIncidents(response.data);
    } catch (error) {
      console.error('Error fetching incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (incidentId, newStatus) => {
    try {
      await axios.patch(`/api/incidents/${incidentId}`, {
        status: newStatus
      });
      fetchIncidents();
      alert('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const handleUpdate = async () => {
    if (!editingIncident) return;

    try {
      await axios.patch(`/api/incidents/${editingIncident.id}`, {
        status: editingIncident.status,
        notes: notes
      });
      fetchIncidents();
      setEditingIncident(null);
      setNotes('');
      alert('Incident updated successfully');
    } catch (error) {
      console.error('Error updating incident:', error);
      alert('Failed to update incident');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      resolved: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors.pending;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading incidents...</div>
      </div>
    );
  }

  const pendingIncidents = incidents.filter(inc => inc.status === 'pending');
  const activeIncidents = incidents.filter(inc => inc.status === 'active');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Moderator Panel</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Incidents</h3>
          <p className="text-3xl font-bold text-gray-900">{incidents.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Pending Review</h3>
          <p className="text-3xl font-bold text-yellow-600">{pendingIncidents.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Active</h3>
          <p className="text-3xl font-bold text-green-600">{activeIncidents.length}</p>
        </div>
      </div>

      {/* Pending Incidents */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Pending Review</h2>
        {pendingIncidents.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No pending incidents to review</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingIncidents.map(incident => (
              <div key={incident.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{incident.title}</h3>
                  {incident.isSOS && (
                    <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                      SOS
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{incident.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs capitalize">
                    {incident.category}
                  </span>
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs capitalize">
                    {incident.priority}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-4">{incident.location.address}</p>
                {incident.image && (
                  <img
                    src={`http://localhost:3001${incident.image}`}
                    alt="Incident"
                    className="w-full h-32 object-cover rounded mb-4"
                  />
                )}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleStatusChange(incident.id, 'active')}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusChange(incident.id, 'resolved')}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium py-2 px-4 rounded"
                  >
                    Resolve
                  </button>
                  <button
                    onClick={() => {
                      setEditingIncident(incident);
                      setNotes(incident.moderatorNotes || '');
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Incidents Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">All Incidents</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {incidents.map(incident => (
                <tr key={incident.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{incident.title}</div>
                    <div className="text-xs text-gray-500">{incident.location.address}</div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={incident.status}
                      onChange={(e) => handleStatusChange(incident.id, e.target.value)}
                      className={`text-xs font-medium px-2 py-1 rounded border-0 ${getStatusColor(incident.status)}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="active">Active</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-gray-900 capitalize">{incident.priority}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(incident.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        setEditingIncident(incident);
                        setNotes(incident.moderatorNotes || '');
                      }}
                      className="text-blue-600 hover:text-blue-900 text-sm"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingIncident && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Edit Incident</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editingIncident.status}
                  onChange={(e) => setEditingIncident({ ...editingIncident, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Moderator Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Add notes about this incident..."
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setEditingIncident(null);
                    setNotes('');
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="flex-1 bg-slate-900 hover:bg-slate-700 text-white font-medium py-2 px-4 rounded-md dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModeratorPanel;

