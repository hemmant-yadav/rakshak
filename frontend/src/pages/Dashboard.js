import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import IncidentCard from '../components/IncidentCard';
import SOSButton from '../components/SOSButton';

const Dashboard = () => {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState([]);
  const [stats, setStats] = useState({});
  const [recentIncidents, setRecentIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [incidentsResponse, statsResponse] = await Promise.all([
        axios.get('/api/incidents'),
        axios.get('/api/stats')
      ]);
      
      const allIncidents = incidentsResponse.data;
      setIncidents(allIncidents);
      setStats(statsResponse.data);
      setRecentIncidents(allIncidents.slice(0, 3));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickStats = [
    { label: 'Total Incidents', value: stats.total || 0, tone: 'text-sky-600', icon: '📋' },
    { label: 'Active', value: stats.active || 0, tone: 'text-rose-600', icon: '🔴' },
    { label: 'Pending', value: stats.pending || 0, tone: 'text-amber-600', icon: '⏳' },
    { label: 'Resolved', value: stats.resolved || 0, tone: 'text-emerald-600', icon: '✅' }
  ];

  const features = [
    {
      title: 'Report Incident',
      description: 'Report safety concerns and incidents in your neighborhood',
      icon: '📝',
      path: '/report'
    },
    {
      title: 'Map View',
      description: 'View all incidents on an interactive map',
      icon: '🗺️',
      path: '/map'
    },
    {
      title: 'All Incidents',
      description: 'Browse and filter all reported incidents',
      icon: '📋',
      path: '/incidents'
    },
    {
      title: 'Emergency Contacts',
      description: 'Manage your favorite emergency contacts',
      icon: '📞',
      path: '/contacts'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-white mb-2">🛡️ Rakshak</h1>
        <p className="text-base text-slate-600 dark:text-slate-300">Plan, track, and respond to community incidents in one place.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {quickStats.map((stat, index) => (
          <div
            key={index}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`text-xl ${stat.tone}`}>
                {stat.icon}
              </div>
              <span className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">{stat.label}</span>
            </div>
            <p className="text-3xl font-semibold text-slate-900 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions / Features */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Quick links</h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">Shortcuts you’ll need most</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, index) => (
            <Link
              key={index}
              to={feature.path}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-5 shadow-sm hover:shadow-md transition"
            >
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">{feature.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{feature.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Incidents */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent incidents</h2>
          <Link
            to="/incidents"
            className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            View all →
          </Link>
        </div>
        
          {recentIncidents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-10 text-center bg-white dark:bg-slate-900">
            <p className="text-slate-600 dark:text-slate-300 mb-4 text-base">No recent incidents to display</p>
            <Link
              to="/report"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-full bg-slate-900 text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition"
            >
              + Report an incident
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentIncidents.map((incident, index) => (
              <div key={incident.id} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <IncidentCard incident={incident} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category Breakdown */}
      {stats.byCategory && Object.keys(stats.byCategory).length > 0 && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 mb-8 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(stats.byCategory).map(([category, count]) => (
              <div key={category} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-center bg-slate-50 dark:bg-slate-900">
                <p className="text-2xl font-semibold text-slate-900 dark:text-white">{count}</p>
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mt-1">{category}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Emergency Alert Section */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-white dark:bg-white dark:text-slate-900 p-8 text-center shadow-sm">
        <h2 className="text-2xl font-semibold mb-2">🚨 Need help right now?</h2>
        <p className="text-sm opacity-80 mb-4">Use the SOS button to alert your trusted contacts instantly.</p>
        <button
          onClick={() => document.querySelector('button:has(🚨 SOS)')?.click()}
          className="inline-flex items-center justify-center px-5 py-2 text-sm font-medium rounded-full bg-white text-slate-900 hover:bg-slate-100 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800 transition"
        >
          Trigger SOS
        </button>
      </div>

      <SOSButton />
    </div>
  );
};

export default Dashboard;

