import React, { useState, useEffect } from 'react';
import axios from 'axios';
import IncidentCard from '../components/IncidentCard';
import SOSButton from '../components/SOSButton';
import { Link } from 'react-router-dom';
import { getCurrentLocation, filterIncidentsByRadius } from '../utils/locationUtils';

const Home = () => {
  const [incidents, setIncidents] = useState([]);
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [radiusFilter, setRadiusFilter] = useState(true); // Enable 5km filter by default
  const [locationLoading, setLocationLoading] = useState(false);
  const [filter, setFilter] = useState({
    category: '',
    status: '',
    priority: ''
  });

  useEffect(() => {
    getUserLocation();
    fetchIncidents();
  }, []);

  useEffect(() => {
    fetchIncidents();
  }, [filter]);

  useEffect(() => {
    if (userLocation && radiusFilter) {
      const filtered = filterIncidentsByRadius(incidents, userLocation.latitude, userLocation.longitude, 5);
      setFilteredIncidents(filtered);
    } else {
      setFilteredIncidents(incidents);
    }
  }, [incidents, userLocation, radiusFilter]);

  const getUserLocation = async () => {
    setLocationLoading(true);
    try {
      const location = await getCurrentLocation();
      setUserLocation(location);
    } catch (error) {
      console.error('Error getting location:', error);
      setRadiusFilter(false); // Disable radius filter if location unavailable
    } finally {
      setLocationLoading(false);
    }
  };

  const fetchIncidents = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.category) params.append('category', filter.category);
      if (filter.status) params.append('status', filter.status);
      if (filter.priority) params.append('priority', filter.priority);
      
      // Add location filtering if user location is available
      if (userLocation && radiusFilter) {
        params.append('latitude', userLocation.latitude);
        params.append('longitude', userLocation.longitude);
        params.append('radius', '5'); // 5km radius
      }

      const response = await axios.get(`/api/incidents?${params.toString()}`);
      setIncidents(response.data);
    } catch (error) {
      console.error('Error fetching incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = [
    { value: '', label: 'All types' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'suspicious', label: 'Suspicious' },
    { value: 'infrastructure', label: 'Infrastructure' },
    { value: 'health', label: 'Health' },
    { value: 'environment', label: 'Environment' },
    { value: 'community', label: 'Community' },
    { value: 'other', label: 'Other' }
  ];
  const statusOptions = [
    { value: '', label: 'All statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'active', label: 'Active' },
    { value: 'resolved', label: 'Resolved' }
  ];
  const priorityOptions = [
    { value: '', label: 'All priorities' },
    { value: 'critical', label: 'Critical' },
    { value: 'high', label: 'High' },
    { value: 'normal', label: 'Normal' },
    { value: 'low', label: 'Low' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading incidents...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white mb-2">Neighbourhood feed</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">Filter incidents nearby and stay in the loop.</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <Link
          to="/report"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-slate-900 text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition"
        >
          + Report Incident
        </Link>
        <Link
          to="/map"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        >
          View map
        </Link>

        <div className="ml-auto flex flex-wrap gap-3 items-center">
          {userLocation && (
            <label className="flex items-center gap-2 px-3 py-2 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                id="radius-filter"
                checked={radiusFilter}
                onChange={(e) => setRadiusFilter(e.target.checked)}
                className="w-4 h-4 text-slate-900 dark:text-white rounded focus:ring-slate-500"
              />
              <span>Within 5km</span>
            </label>
          )}
          
          {!userLocation && !locationLoading && (
            <button
              onClick={getUserLocation}
              className="px-4 py-2 text-xs font-medium rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Use my location
            </button>
          )}

          {locationLoading && (
            <span className="text-xs text-slate-500">Locating…</span>
          )}
          <select
            value={filter.category}
            onChange={(e) => setFilter({ ...filter, category: e.target.value })}
            className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md text-sm bg-white dark:bg-slate-900"
          >
            {categoryOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md text-sm bg-white dark:bg-slate-900"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={filter.priority}
            onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
            className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md text-sm bg-white dark:bg-slate-900"
          >
            {priorityOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {(radiusFilter && userLocation ? filteredIncidents : incidents).length === 0 ? (
        <div className="text-center py-10 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
          <p className="text-slate-600 dark:text-slate-300 text-sm font-medium mb-3">
            {radiusFilter && userLocation 
              ? 'No incidents found within 5km radius. Be the first to report one!' 
              : 'No incidents found. Be the first to report one!'}
          </p>
          <Link
            to="/report"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full bg-slate-900 text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition"
          >
            Report Incident
          </Link>
        </div>
      ) : (
        <>
          {radiusFilter && userLocation && (
            <div className="mb-4 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-300">
              Showing {filteredIncidents.length} incident{filteredIncidents.length !== 1 ? 's' : ''} within 5km
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(radiusFilter && userLocation ? filteredIncidents : incidents).map(incident => (
              <IncidentCard key={incident.id} incident={incident} />
            ))}
          </div>
        </>
      )}

      <SOSButton />
    </div>
  );
};

export default Home;

