import React from 'react';
import { useNavigate } from 'react-router-dom';

const IncidentCard = ({ incident }) => {
  const navigate = useNavigate();

  const getCategoryColor = (category) => {
    const colors = {
      emergency: 'bg-red-100 text-red-800',
      suspicious: 'bg-yellow-100 text-yellow-800',
      destruction: 'bg-orange-100 text-orange-800',
      infrastructure: 'bg-blue-100 text-blue-800',
      noise: 'bg-purple-100 text-purple-800',
      traffic: 'bg-cyan-100 text-cyan-800',
      theft: 'bg-pink-100 text-pink-800',
      fire: 'bg-red-200 text-red-900',
      flooding: 'bg-blue-200 text-blue-900',
      animal: 'bg-green-100 text-green-800',
      health: 'bg-red-100 text-red-800',
      lighting: 'bg-yellow-100 text-yellow-800',
      parking: 'bg-indigo-100 text-indigo-800',
      waste: 'bg-gray-100 text-gray-800',
      accident: 'bg-red-100 text-red-800',
      assault: 'bg-red-200 text-red-900',
      drug: 'bg-purple-200 text-purple-900',
      trespassing: 'bg-orange-100 text-orange-800',
      water: 'bg-blue-100 text-blue-800',
      electrical: 'bg-yellow-200 text-yellow-900',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.other;
  };

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

  return (
    <div
      className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm hover:shadow-md transition cursor-pointer"
      onClick={() => navigate(`/map`, { state: { incidentId: incident.id } })}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white pr-4">{incident.title}</h3>
        {incident.isSOS && (
          <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
            🚨 SOS
          </span>
        )}
      </div>
      
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-2 leading-relaxed">{incident.description}</p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor(incident.category)}`}>
          {incident.category.charAt(0).toUpperCase() + incident.category.slice(1)}
        </span>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityBadge(incident.priority)}`}>
          {incident.priority.charAt(0).toUpperCase() + incident.priority.slice(1)}
        </span>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
          incident.status === 'active' ? 'bg-green-100 text-green-800' :
          incident.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
        </span>
      </div>
      
      <div className="flex items-center justify-between text-xs text-slate-500 mb-2 pt-2 border-t border-slate-100 dark:border-slate-700">
        <span className="flex items-center gap-1">📍 {incident.location.address}</span>
        <span>{formatDate(incident.createdAt)}</span>
      </div>
      
      {incident.image && (
        <div className="mt-4 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
          <img
            src={`http://localhost:3001${incident.image}`}
            alt="Incident"
            className="w-full h-48 object-cover"
          />
        </div>
      )}
    </div>
  );
};

export default IncidentCard;

