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
      <div className="flex items-center justify-center py-20">
        <div className="card-enhanced px-8 py-6 rounded-2xl text-center max-w-sm">
          <div className="animate-spin text-4xl mb-4">⟳</div>
          <h3 className="text-lg font-semibold text-white mb-2">Loading Incidents</h3>
          <p className="text-slate-300 text-readable-sm">Fetching moderation data...</p>
        </div>
      </div>
    );
  }

  const pendingIncidents = incidents.filter(inc => inc.status === 'pending');
  const activeIncidents = incidents.filter(inc => inc.status === 'active');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-400 via-cyan-500 to-teal-400 ring-2 ring-slate-900/70 shadow-lg shadow-blue-500/40 mb-6">
          <span className="text-xl font-black tracking-wider uppercase text-slate-900">
            👮
          </span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">
          Moderator Panel
        </h1>
        <p className="text-lg text-slate-300 text-readable-sm max-w-2xl mx-auto">
          Review and manage community safety incidents
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 lg:mb-12">
        <div className="card-enhanced hover-lift rounded-2xl p-6 text-center">
          <div className="text-3xl mb-2">📋</div>
          <h3 className="text-sm font-semibold text-slate-300 mb-2">Total Incidents</h3>
          <p className="text-3xl lg:text-4xl font-bold text-white">{incidents.length}</p>
        </div>
        <div className="card-enhanced hover-lift rounded-2xl p-6 text-center">
          <div className="text-3xl mb-2">⏳</div>
          <h3 className="text-sm font-semibold text-amber-300 mb-2">Pending Review</h3>
          <p className="text-3xl lg:text-4xl font-bold text-amber-400">{pendingIncidents.length}</p>
        </div>
        <div className="card-enhanced hover-lift rounded-2xl p-6 text-center">
          <div className="text-3xl mb-2">🔴</div>
          <h3 className="text-sm font-semibold text-emerald-300 mb-2">Active</h3>
          <p className="text-3xl lg:text-4xl font-bold text-emerald-400">{activeIncidents.length}</p>
        </div>
      </div>

      {/* Pending Incidents */}
      <div className="mb-8 lg:mb-12">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl lg:text-3xl font-bold text-white">Pending Review</h2>
          <div className="px-3 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-sm font-medium rounded-full">
            {pendingIncidents.length} awaiting approval
          </div>
        </div>
        {pendingIncidents.length === 0 ? (
          <div className="card-enhanced rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-semibold text-white mb-4">All Caught Up!</h3>
            <p className="text-slate-300 text-readable-sm">No pending incidents require your attention right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {pendingIncidents.map(incident => (
              <div key={incident.id} className="card-enhanced hover-lift rounded-2xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-white leading-tight flex-1">{incident.title}</h3>
                  {incident.isSOS && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold rounded-full ml-3">
                      <span>🚨</span>
                      <span>SOS</span>
                    </div>
                  )}
                </div>
                <p className="text-slate-300 mb-6 line-clamp-3 text-readable-sm">{incident.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded-full text-xs font-medium capitalize">
                    {incident.category}
                  </span>
                  <span className={`px-3 py-1 border rounded-full text-xs font-medium capitalize ${
                    incident.priority === 'critical' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                    incident.priority === 'high' ? 'bg-orange-500/20 text-orange-300 border-orange-500/40' :
                    'bg-slate-500/20 text-slate-300 border-slate-500/40'
                  }`}>
                    {incident.priority}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
                  <span className="text-base">📍</span>
                  <span className="truncate">{incident.location.address}</span>
                </div>
                {incident.image && (
                  <div className="rounded-xl overflow-hidden border border-slate-600/50 mb-6">
                    <img
                      src={`http://localhost:3001${incident.image}`}
                      alt="Incident"
                      className="w-full h-40 object-cover"
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatusChange(incident.id, 'active')}
                    className="flex-1 btn-primary py-2.5 px-4 rounded-lg text-sm font-semibold min-h-[44px]"
                  >
                    ✅ Approve
                  </button>
                  <button
                    onClick={() => handleStatusChange(incident.id, 'resolved')}
                    className="flex-1 btn-secondary py-2.5 px-4 rounded-lg text-sm font-medium min-h-[44px]"
                  >
                    ✅ Resolve
                  </button>
                  <button
                    onClick={() => {
                      setEditingIncident(incident);
                      setNotes(incident.moderatorNotes || '');
                    }}
                    className="px-4 py-2.5 rounded-lg text-sm font-medium bg-slate-700/60 hover:bg-slate-600/80 text-slate-200 border border-slate-600/50 transition-all min-h-[44px]"
                  >
                    ✏️ Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Incidents Table */}
      <div className="card-enhanced rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-600/50">
          <h2 className="text-2xl font-bold text-white">All Incidents</h2>
          <p className="text-slate-400 text-sm mt-1">Complete incident management overview</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-600/30">
            <thead className="bg-slate-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Title</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-600/30">
              {incidents.map(incident => (
                <tr key={incident.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-semibold text-white">{incident.title}</div>
                      {incident.isSOS && (
                        <div className="px-2 py-1 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold rounded-full">
                          SOS
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">{incident.location.address}</div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={incident.status}
                      onChange={(e) => handleStatusChange(incident.id, e.target.value)}
                      className="bg-slate-800/50 border border-slate-600/50 rounded-lg px-3 py-1.5 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    >
                      <option value="pending" className="bg-slate-800">Pending</option>
                      <option value="active" className="bg-slate-800">Active</option>
                      <option value="resolved" className="bg-slate-800">Resolved</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1.5 text-xs font-medium rounded-full border capitalize ${
                      incident.priority === 'critical' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                      incident.priority === 'high' ? 'bg-orange-500/20 text-orange-300 border-orange-500/40' :
                      'bg-slate-500/20 text-slate-300 border-slate-500/40'
                    }`}>
                      {incident.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {new Date(incident.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        setEditingIncident(incident);
                        setNotes(incident.moderatorNotes || '');
                      }}
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 border border-blue-500/40 hover:border-blue-500/60 rounded-lg transition-all"
                    >
                      <span>✏️</span>
                      <span>Edit</span>
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="card-enhanced rounded-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-2xl">✏️</div>
              <h2 className="text-2xl font-bold text-white">Edit Incident</h2>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-3">Status</label>
                <select
                  value={editingIncident.status}
                  onChange={(e) => setEditingIncident({ ...editingIncident, status: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                >
                  <option value="pending" className="bg-slate-800">Pending</option>
                  <option value="active" className="bg-slate-800">Active</option>
                  <option value="resolved" className="bg-slate-800">Resolved</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-3">Moderator Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="4"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all resize-vertical"
                  placeholder="Add notes about this incident..."
                />
              </div>
              <div className="flex gap-4 pt-6 border-t border-slate-600/50">
                <button
                  onClick={() => {
                    setEditingIncident(null);
                    setNotes('');
                  }}
                  className="btn-secondary flex-1 py-3 px-6 rounded-lg text-base font-medium min-h-[52px]"
                >
                  ← Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="btn-primary flex-1 py-3 px-6 rounded-lg text-base font-semibold min-h-[52px]"
                >
                  💾 Update Incident
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

