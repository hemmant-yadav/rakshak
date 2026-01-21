import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsResponse, incidentsResponse] = await Promise.all([
        axios.get('/api/stats'),
        axios.get('/api/incidents')
      ]);
      setStats(statsResponse.data);
      setIncidents(incidentsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this incident?')) {
      try {
        await axios.delete(`/api/incidents/${id}`);
        fetchData();
        alert('Incident deleted successfully');
      } catch (error) {
        console.error('Error deleting incident:', error);
        alert('Failed to delete incident');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="card-enhanced px-8 py-6 rounded-2xl text-center max-w-sm">
          <div className="animate-spin text-4xl mb-4">⟳</div>
          <h3 className="text-lg font-semibold text-white mb-2">Loading Dashboard</h3>
          <p className="text-slate-300 text-readable-sm">Fetching admin data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-400 via-pink-500 to-red-400 ring-2 ring-slate-900/70 shadow-lg shadow-purple-500/40 mb-6">
          <span className="text-xl font-black tracking-wider uppercase text-slate-900">
            👑
          </span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">
          Admin Dashboard
        </h1>
        <p className="text-lg text-slate-300 text-readable-sm max-w-2xl mx-auto">
          Complete system oversight and incident management
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 mb-8 lg:mb-12">
        <div className="card-enhanced hover-lift rounded-2xl p-6 text-center">
          <div className="text-3xl mb-2">📊</div>
          <h3 className="text-sm font-semibold text-slate-300 mb-2">Total Incidents</h3>
          <p className="text-3xl lg:text-4xl font-bold text-white">{stats.total || 0}</p>
        </div>
        <div className="card-enhanced hover-lift rounded-2xl p-6 text-center">
          <div className="text-3xl mb-2">⏳</div>
          <h3 className="text-sm font-semibold text-amber-300 mb-2">Pending</h3>
          <p className="text-3xl lg:text-4xl font-bold text-amber-400">{stats.pending || 0}</p>
        </div>
        <div className="card-enhanced hover-lift rounded-2xl p-6 text-center">
          <div className="text-3xl mb-2">🔴</div>
          <h3 className="text-sm font-semibold text-emerald-300 mb-2">Active</h3>
          <p className="text-3xl lg:text-4xl font-bold text-emerald-400">{stats.active || 0}</p>
        </div>
        <div className="card-enhanced hover-lift rounded-2xl p-6 text-center">
          <div className="text-3xl mb-2">✅</div>
          <h3 className="text-sm font-semibold text-sky-300 mb-2">Resolved</h3>
          <p className="text-3xl lg:text-4xl font-bold text-sky-400">{stats.resolved || 0}</p>
        </div>
        <div className="card-enhanced hover-lift rounded-2xl p-6 text-center">
          <div className="text-3xl mb-2">🚨</div>
          <h3 className="text-sm font-semibold text-rose-300 mb-2">Critical</h3>
          <p className="text-3xl lg:text-4xl font-bold text-rose-400">{stats.critical || 0}</p>
        </div>
      </div>

      {/* Category Breakdown */}
      {stats.byCategory && Object.keys(stats.byCategory).length > 0 && (
        <div className="card-enhanced rounded-2xl p-6 lg:p-8 mb-8 lg:mb-12">
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-6 lg:mb-8">Incidents by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
            {Object.entries(stats.byCategory).map(([category, count]) => (
              <div key={category} className="bg-slate-800/50 rounded-xl p-4 text-center border border-slate-600/30 hover:border-slate-500/50 transition-colors">
                <p className="text-2xl lg:text-3xl font-bold text-white mb-2">{count}</p>
                <p className="text-sm font-medium text-slate-300 capitalize">{category}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Incidents List */}
      <div className="card-enhanced rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-600/50">
          <h2 className="text-2xl font-bold text-white">All Incidents</h2>
          <p className="text-slate-400 text-sm mt-1">Complete incident management and oversight</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-600/30">
            <thead className="bg-slate-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Reporter
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-600/30">
              {incidents.map(incident => (
                <tr key={incident.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-semibold text-white">
                        {incident.title}
                      </div>
                      {incident.isSOS && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold rounded-full">
                          <span>🚨</span>
                          <span>SOS</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-slate-300 capitalize">{incident.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                      incident.priority === 'critical' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                      incident.priority === 'high' ? 'bg-orange-500/20 text-orange-300 border-orange-500/40' :
                      'bg-blue-500/20 text-blue-300 border-blue-500/40'
                    }`}>
                      {incident.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                      incident.status === 'active' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                      incident.status === 'pending' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                      'bg-slate-500/20 text-slate-300 border-slate-500/40'
                    }`}>
                      {incident.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {incident.reporter?.name || 'Anonymous'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {new Date(incident.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(incident.id)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 border border-rose-500/40 hover:border-rose-500/60 rounded-lg transition-all"
                    >
                      <span>🗑️</span>
                      <span>Delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

