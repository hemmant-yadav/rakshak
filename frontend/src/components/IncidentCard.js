import React from 'react';
import { useNavigate } from 'react-router-dom';

const IncidentCard = ({ incident }) => {
  const navigate = useNavigate();

  const getPriorityBadge = (priority) => {
    const badges = {
      critical: 'bg-red-500 text-white',
      high: 'bg-orange-500 text-white',
      normal: 'bg-blue-500 text-white',
      low: 'bg-gray-500 text-white'
    };
    return badges[priority] || badges.normal;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getCategoryColor = (category) => {
    const colors = {
      emergency: 'bg-red-500/20 text-red-300 border-red-500/30',
      suspicious: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      destruction: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      infrastructure: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      noise: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      traffic: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      theft: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
      fire: 'bg-red-600/25 text-red-200 border-red-600/40',
      flooding: 'bg-blue-600/25 text-blue-200 border-blue-600/40',
      animal: 'bg-green-500/20 text-green-300 border-green-500/30',
      health: 'bg-red-500/20 text-red-300 border-red-500/30',
      lighting: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      parking: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      waste: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
      accident: 'bg-red-500/20 text-red-300 border-red-500/30',
      assault: 'bg-red-600/25 text-red-200 border-red-600/40',
      drug: 'bg-purple-600/25 text-purple-200 border-purple-600/40',
      trespassing: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      water: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      electrical: 'bg-yellow-600/25 text-yellow-200 border-yellow-600/40',
      other: 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    };
    return colors[category] || colors.other;
  };

  const getStatusBadge = (status) => {
    if (status === 'active') return 'bg-green-500/20 text-green-300 border-green-500/30';
    if (status === 'pending') return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  return (
    <div
      className="card-enhanced hover-lift rounded-2xl p-6 cursor-pointer group transition-all duration-300"
      onClick={() => navigate(`/map`, { state: { incidentId: incident.id } })}
    >
      <div className="flex justify-between items-start mb-4 gap-3">
        <h3 className="text-lg lg:text-xl font-bold text-white leading-tight flex-1 group-hover:text-blue-300 transition-colors">{incident.title}</h3>
        {incident.isSOS && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-sm font-semibold animate-pulse">
            <span className="text-base">🚨</span>
            <span>SOS</span>
          </div>
        )}
      </div>

      <p className="text-slate-300 mb-6 line-clamp-2 leading-relaxed text-readable-sm text-base">{incident.description}</p>

      <div className="flex flex-wrap gap-2.5 mb-6">
        <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${getCategoryColor(incident.category)}`}>
          {incident.category.charAt(0).toUpperCase() + incident.category.slice(1)}
        </span>
        <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getPriorityBadge(incident.priority)}`}>
          {incident.priority.charAt(0).toUpperCase() + incident.priority.slice(1)}
        </span>
        <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusBadge(incident.status)}`}>
          {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-slate-400 pt-4 border-t border-slate-600/50">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base">📍</span>
          <span className="truncate text-slate-300">{incident.location.address}</span>
        </div>
        <span className="whitespace-nowrap text-slate-500 font-medium">{formatDate(incident.createdAt)}</span>
      </div>

      {incident.image && (
        <div className="mt-6 rounded-xl overflow-hidden border border-slate-600/50 group-hover:border-slate-500/50 transition-colors">
          <img
            src={`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}${incident.image}`}
            alt="Incident"
            className="w-full h-48 lg:h-56 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
    </div>
  );
};

export default IncidentCard;

