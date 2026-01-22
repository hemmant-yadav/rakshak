import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../services/api';
import { useLocation } from 'react-router-dom';
import { getCurrentLocation, filterIncidentsByRadius, calculateDistance } from '../utils/locationUtils';

// Fix for default marker icon in react-leaflet
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom marker icons based on priority
const getMarkerIcon = (priority, isSOS) => {
  // Use default icon as fallback
  const defaultIcon = new Icon.Default();
  
  if (isSOS) {
    try {
      return new Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      });
    } catch {
      return defaultIcon;
    }
  }

  const iconColors = {
    critical: 'red',
    high: 'orange',
    normal: 'blue',
    low: 'grey'
  };

  const color = iconColors[priority] || 'blue';
  
  try {
    return new Icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });
  } catch {
    return defaultIcon;
  }
};

// Component to center map on incident if incidentId is provided
function MapCenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  return null;
}

const MapView = () => {
  const location = useLocation();
  const [incidents, setIncidents] = useState([]);
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [center, setCenter] = useState([40.7128, -74.0060]);
  const [zoom, setZoom] = useState(13);
  const [userLocation, setUserLocation] = useState(null);
  const [radiusFilter, setRadiusFilter] = useState(true); // Enable 5km filter by default
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    getUserLocation();
    fetchIncidents();
  }, []);

  useEffect(() => {
    if (userLocation && radiusFilter) {
      // Filter incidents within 5km radius
      const filtered = filterIncidentsByRadius(incidents, userLocation.latitude, userLocation.longitude, 5);
      setFilteredIncidents(filtered);
      // Center map on user location
      setCenter([userLocation.latitude, userLocation.longitude]);
      setZoom(13);
    } else {
      setFilteredIncidents(incidents);
      // Center on specific incident if provided
      if (location.state?.incidentId) {
        const incident = incidents.find(inc => inc.id === location.state.incidentId);
        if (incident) {
          setCenter([incident.location.latitude, incident.location.longitude]);
          setZoom(15);
        }
      } else if (incidents.length > 0) {
        const firstIncident = incidents[0];
        setCenter([firstIncident.location.latitude, firstIncident.location.longitude]);
      }
    }
  }, [incidents, userLocation, radiusFilter, location.state]);

  const getUserLocation = async () => {
    try {
      const location = await getCurrentLocation();
      setUserLocation(location);
      setLocationError('');
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationError(error.message);
      setRadiusFilter(false); // Disable radius filter if location unavailable
    }
  };

  const fetchIncidents = async () => {
    try {
      // Build query params with location filtering if user location is available
      const params = new URLSearchParams();
      if (userLocation && radiusFilter) {
        params.append('latitude', userLocation.latitude);
        params.append('longitude', userLocation.longitude);
        params.append('radius', '5'); // 5km radius
      }

      const response = await api.get(`/api/incidents?${params.toString()}`);
      setIncidents(response.data);
    } catch (error) {
      console.error('Error fetching incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRadiusFilter = () => {
    setRadiusFilter(!radiusFilter);
    fetchIncidents(); // Re-fetch with new filter settings
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading map...</div>
      </div>
    );
  }

  const displayIncidents = radiusFilter && userLocation ? filteredIncidents : incidents;

  return (
    <div className="h-screen w-full relative">
      <div className="absolute top-4 left-4 z-[1000] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 p-5 shadow-sm max-w-xs">
        <h2 className="text-2xl font-display font-bold mb-3 text-slate-900 dark:text-white">🗺️ Live Incident Map</h2>
        <p className="text-sm font-semibold text-gray-700 mb-3">
          Showing {displayIncidents.length} incident{displayIncidents.length !== 1 ? 's' : ''}
          {radiusFilter && userLocation && (
            <span className="block text-xs text-green-600 mt-1">✓ Within 5km radius</span>
          )}
        </p>
        
        {userLocation && (
          <div className="mb-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-xs font-semibold text-green-800 mb-1">📍 Your Location</p>
            <p className="text-xs text-green-700">
              {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
            </p>
          </div>
        )}

        {locationError && (
          <div className="mb-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-xs font-semibold text-yellow-800">⚠️ {locationError}</p>
          </div>
        )}

        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={radiusFilter}
              onChange={toggleRadiusFilter}
              disabled={!userLocation}
              className="w-4 h-4 text-slate-900 rounded focus:ring-slate-900"
            />
            <span className={!userLocation ? 'text-gray-400' : ''}>
              5km Radius Filter
            </span>
          </label>
        </div>

        {!userLocation && (
          <button
            onClick={getUserLocation}
            className="w-full bg-slate-900 hover:bg-slate-700 text-white font-display font-bold py-2 px-4 rounded-full text-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          >
            📍 Get My Location
          </button>
        )}
        <div className="text-xs space-y-1">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 mr-2"></div>
            <span>Critical/SOS</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-orange-500 mr-2"></div>
            <span>High Priority</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 mr-2"></div>
            <span>Normal Priority</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-500 mr-2"></div>
            <span>Low Priority</span>
          </div>
        </div>
      </div>

      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
      >
        <MapCenter center={center} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Draw 5km radius circle around user location */}
        {userLocation && radiusFilter && (
          <Circle
            center={[userLocation.latitude, userLocation.longitude]}
            radius={5000} // 5km in meters
            pathOptions={{
              color: '#6366f1',
              fillColor: '#6366f1',
              fillOpacity: 0.1,
              weight: 2
            }}
          />
        )}

        {/* User location marker */}
        {userLocation && (
          <Marker
            position={[userLocation.latitude, userLocation.longitude]}
            icon={new Icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
              shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
            })}
          >
            <Popup>
              <div className="text-center">
                <strong>📍 Your Location</strong>
                <p className="text-xs mt-1">You are here</p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {displayIncidents.map(incident => (
          <Marker
            key={incident.id}
            position={[incident.location.latitude, incident.location.longitude]}
            icon={getMarkerIcon(incident.priority, incident.isSOS)}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-bold text-lg mb-1">{incident.title}</h3>
                {incident.isSOS && (
                  <span className="inline-block bg-red-600 text-white px-2 py-1 rounded text-xs font-bold mb-2">
                    🚨 SOS
                  </span>
                )}
                <p className="text-sm text-gray-700 mb-2">{incident.description}</p>
                <div className="text-xs space-y-1">
                  <p><strong>Category:</strong> {incident.category}</p>
                  <p><strong>Priority:</strong> {incident.priority}</p>
                  <p><strong>Status:</strong> {incident.status}</p>
                  <p><strong>Location:</strong> {incident.location.address}</p>
                  <p><strong>Reported:</strong> {formatDate(incident.createdAt)}</p>
                  {incident.distance !== undefined && (
                    <p className="font-semibold text-slate-900">
                      📍 {incident.distance} km away
                    </p>
                  )}
                  {incident.image && (
                    <img
                      src={`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}${incident.image}`}
                      alt="Incident"
                      className="w-full h-32 object-cover rounded mt-2"
                    />
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;

