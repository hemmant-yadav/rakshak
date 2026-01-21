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
      <div className="flex items-center justify-center py-20">
        <div className="card-enhanced px-8 py-6 rounded-2xl text-center max-w-sm">
          <div className="animate-spin text-4xl mb-4">⟳</div>
          <h3 className="text-lg font-semibold text-white mb-2">Loading Dashboard</h3>
          <p className="text-slate-300 text-readable-sm">Fetching neighbourhood safety data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 sm:space-y-12 lg:space-y-16">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 lg:gap-8 mb-6 lg:mb-8 fade-in-up">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-3 w-3 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
            <p className="text-sm font-medium text-emerald-400 tracking-wide uppercase">
              LIVE NEIGHBOURHOOD GRID
            </p>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-4 leading-tight">
            🛡️ Rakshak Command
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl leading-relaxed text-readable">
            See what&apos;s happening around you, prioritise incidents, and trigger help in a few clicks.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 sm:gap-4 lg:gap-3 min-w-fit">
          <button
            onClick={() => navigate('/report')}
            className="btn-primary inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl text-base font-semibold text-white min-h-[52px] w-full sm:w-auto"
          >
            <span className="text-xl">+</span>
            <span>Quick Report</span>
          </button>
          <button
            onClick={() => navigate('/map')}
            className="btn-secondary inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl text-base font-medium text-slate-200 min-h-[52px] w-full sm:w-auto"
          >
            <span className="text-lg">🗺️</span>
            <span>Live Map</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8 lg:mb-12 fade-in-up fade-delayed-1">
        {quickStats.map((stat, index) => (
          <div
            key={index}
            className="card-enhanced hover-lift rounded-2xl p-6 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`text-2xl transition-transform group-hover:scale-110 ${stat.tone}`}>
                {stat.icon}
              </div>
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400 group-hover:text-slate-300 transition-colors">
                {stat.label}
              </span>
            </div>
            <p className="text-3xl lg:text-4xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions / Features */}
      <div className="mb-8 lg:mb-12 fade-in-up fade-delayed-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 lg:mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-white">Quick Actions</h2>
          <span className="text-sm text-slate-400 text-readable-sm">Essential shortcuts for neighbourhood safety</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
          {features.map((feature, index) => (
            <Link
              key={index}
              to={feature.path}
              className="card-enhanced hover-lift rounded-2xl p-6 group transition-all duration-300 min-h-[180px] flex flex-col"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
              <h3 className="text-lg lg:text-xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors">{feature.title}</h3>
              <p className="text-slate-300 leading-relaxed text-readable-sm flex-1">{feature.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Incidents */}
      <div className="mb-8 lg:mb-12 fade-in-up fade-delayed-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 lg:mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-white">Recent Incidents</h2>
          <Link
            to="/incidents"
            className="inline-flex items-center gap-2 text-base font-medium text-slate-300 hover:text-blue-300 transition-colors group"
          >
            <span>View All</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        {recentIncidents.length === 0 ? (
          <div className="card-enhanced rounded-2xl p-12 text-center">
            <div className="text-6xl mb-6">📋</div>
            <h3 className="text-xl font-semibold text-white mb-4">No Recent Incidents</h3>
            <p className="text-slate-300 mb-6 text-readable">Your neighbourhood is calm. Be the first to report any safety concerns.</p>
            <Link
              to="/report"
              className="btn-primary inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-semibold rounded-xl min-h-[56px]"
            >
              <span>+</span>
              <span>Report Incident</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {recentIncidents.map((incident, index) => (
              <div key={incident.id} className="fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                <IncidentCard incident={incident} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category Breakdown */}
      {stats.byCategory && Object.keys(stats.byCategory).length > 0 && (
        <div className="card-enhanced rounded-2xl p-6 lg:p-8 mb-8 lg:mb-12">
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-6 lg:mb-8">Incident Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
            {Object.entries(stats.byCategory).map(([category, count]) => (
              <div key={category} className="bg-slate-800/50 rounded-xl p-4 text-center border border-slate-600/30 hover:border-slate-500/50 transition-colors">
                <p className="text-2xl lg:text-3xl font-bold text-white mb-2">{count}</p>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-300">{category}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Emergency Alert Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-600 via-rose-500 to-orange-500 p-8 lg:p-12 text-center shadow-2xl shadow-rose-500/25">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 to-orange-500/20 backdrop-blur-sm"></div>
        <div className="relative z-10">
          <div className="text-6xl mb-6 animate-pulse">🚨</div>
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Emergency SOS</h2>
          <p className="text-lg text-rose-100 mb-8 max-w-2xl mx-auto text-readable">
            Need immediate help? Trigger the SOS button to instantly alert your emergency contacts with your location.
          </p>
          <button
            onClick={() => document.querySelector('button:has(🚨 SOS)')?.click()}
            className="inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold rounded-xl bg-white text-rose-600 hover:bg-rose-50 transition-all shadow-lg hover:shadow-xl min-h-[60px] transform hover:scale-105"
          >
            <span className="text-2xl">🚨</span>
            <span>Trigger SOS Alert</span>
          </button>
        </div>
      </div>

      <SOSButton />
    </div>
  );
};

export default Dashboard;

