/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance; // Distance in kilometers
};

/**
 * Convert degrees to radians
 */
const toRad = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Filter incidents within a specified radius (in kilometers)
 * @param {Array} incidents - Array of incident objects with location property
 * @param {number} centerLat - Latitude of center point
 * @param {number} centerLon - Longitude of center point
 * @param {number} radiusKm - Radius in kilometers (default: 5km)
 * @returns {Array} Filtered incidents within radius
 */
export const filterIncidentsByRadius = (incidents, centerLat, centerLon, radiusKm = 5) => {
  if (!centerLat || !centerLon) {
    return incidents; // Return all if no center location provided
  }

  return incidents.filter(incident => {
    if (!incident.location || !incident.location.latitude || !incident.location.longitude) {
      return false; // Skip incidents without valid location
    }

    const distance = calculateDistance(
      centerLat,
      centerLon,
      incident.location.latitude,
      incident.location.longitude
    );

    return distance <= radiusKm;
  }).map(incident => {
    // Add distance to incident object for sorting/display
    const distance = calculateDistance(
      centerLat,
      centerLon,
      incident.location.latitude,
      incident.location.longitude
    );
    
    return {
      ...incident,
      distance: Math.round(distance * 10) / 10 // Round to 1 decimal place
    };
  }).sort((a, b) => a.distance - b.distance); // Sort by distance
};

/**
 * Get user's current location with error handling
 * @returns {Promise<{latitude: number, longitude: number}>}
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location.';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
          default:
            errorMessage = 'An unknown error occurred while retrieving location.';
            break;
        }
        
        reject(new Error(errorMessage));
      },
      options
    );
  });
};

