import React, { useState, useEffect } from 'react';
import api from '../services/api';
import IncidentCard from '../components/IncidentCard';
import { Link } from 'react-router-dom';

const AllIncidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    category: '',
    status: '',
    priority: ''
  });

  useEffect(() => {
    fetchIncidents();
  }, [filter]);

  const fetchIncidents = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.category) params.append('category', filter.category);
      if (filter.status) params.append('status', filter.status);
      if (filter.priority) params.append('priority', filter.priority);

      const response = await api.get(`/api/incidents?${params.toString()}`);
      setIncidents(response.data);
    } catch (error) {
      console.error('Error fetching incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', 'emergency', 'suspicious', 'destruction', 'infrastructure', 'noise', 'other'];
  const statuses = ['all', 'pending', 'active', 'resolved'];
  const priorities = ['all', 'critical', 'high', 'normal', 'low'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading incidents...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-5xl font-display font-extrabold text-slate-900 dark:text-white mb-3">All Incidents</h1>
        <p className="text-xl text-gray-700 dark:text-slate-300 font-medium">Browse and filter all reported incidents</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <Link
          to="/report"
          className="bg-slate-900 hover:bg-slate-700 text-white font-display font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
        >
          + Report Incident
        </Link>
        <Link
          to="/map"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 shadow-sm transition"
        >
          <span>📍</span>
          <span>View map</span>
        </Link>

        <div className="ml-auto flex flex-wrap gap-3">
          <select
            value={filter.category}
            onChange={(e) => setFilter({ ...filter, category: e.target.value === 'all' ? '' : e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            {categories.map(cat => (
              <option key={cat} value={cat === 'all' ? '' : cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value === 'all' ? '' : e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            {statuses.map(status => (
              <option key={status} value={status === 'all' ? '' : status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={filter.priority}
            onChange={(e) => setFilter({ ...filter, priority: e.target.value === 'all' ? '' : e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            {priorities.map(priority => (
              <option key={priority} value={priority === 'all' ? '' : priority}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {incidents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600 text-lg mb-4">No incidents found matching your filters.</p>
          <Link
            to="/report"
            className="inline-block bg-slate-900 hover:bg-slate-700 text-white font-medium py-2 px-6 rounded-md dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          >
            Report Incident
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-4 text-gray-600">
            Showing {incidents.length} incident{incidents.length !== 1 ? 's' : ''}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {incidents.map(incident => (
              <IncidentCard key={incident.id} incident={incident} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AllIncidents;

