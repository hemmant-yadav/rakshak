// Location Service - Handles geolocation and reverse geocoding
// This service integrates with geolocation API and reverse geocoding API

/**
 * Get user's current location using browser Geolocation API
 * @returns {Promise<{latitude: number, longitude: number}>}
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    const options = {
      enableHighAccuracy: true, // Try to get the most accurate location
      timeout: 10000, // 10 seconds timeout
      maximumAge: 0 // Don't use cached location
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

/**
 * Reverse Geocoding - Convert coordinates to address
 * You can integrate with different reverse geocoding APIs:
 * 
 * Options:
 * 1. OpenStreetMap Nominatim (Free, no API key needed)
 * 2. Google Maps Geocoding API (Requires API key)
 * 3. Mapbox Geocoding API (Requires API key)
 * 4. HERE Geocoding API (Requires API key)
 * 
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {Promise<string>} Formatted address
 */
export const reverseGeocode = async (latitude, longitude) => {
  try {
    // OPTION 1: Using OpenStreetMap Nominatim (Free, no API key required)
    // NOTE: For production, consider using a paid service for better reliability
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'Rakshak-Safety-App' // Required by Nominatim
        }
      }
    );

    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }

    const data = await response.json();
    
    // Format the address
    if (data.address) {
      const addr = data.address;
      // Build a readable address string
      const addressParts = [];
      
      if (addr.house_number || addr.road) {
        addressParts.push([addr.house_number, addr.road].filter(Boolean).join(' '));
      }
      if (addr.neighbourhood || addr.suburb) {
        addressParts.push(addr.neighbourhood || addr.suburb);
      }
      if (addr.city || addr.town || addr.village) {
        addressParts.push(addr.city || addr.town || addr.village);
      }
      if (addr.state) {
        addressParts.push(addr.state);
      }
      if (addr.postcode) {
        addressParts.push(addr.postcode);
      }
      if (addr.country) {
        addressParts.push(addr.country);
      }
      
      return addressParts.join(', ') || data.display_name;
    }
    
    return data.display_name || 'Address not available';
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    throw new Error('Failed to get address from coordinates');
  }
};

/**
 * OPTION 2: Using Google Maps Geocoding API
 * Uncomment and configure with your API key
 */
/*
export const reverseGeocodeGoogle = async (latitude, longitude, apiKey) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error('Google reverse geocoding failed');
    }

    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      return data.results[0].formatted_address;
    }
    
    throw new Error('No address found');
  } catch (error) {
    console.error('Google reverse geocoding error:', error);
    throw error;
  }
};
*/

/**
 * OPTION 3: Using Mapbox Geocoding API
 * Uncomment and configure with your access token
 */
/*
export const reverseGeocodeMapbox = async (latitude, longitude, accessToken) => {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${accessToken}`
    );

    if (!response.ok) {
      throw new Error('Mapbox reverse geocoding failed');
    }

    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      return data.features[0].place_name;
    }
    
    throw new Error('No address found');
  } catch (error) {
    console.error('Mapbox reverse geocoding error:', error);
    throw error;
  }
};
*/

/**
 * Get location with address - Combines geolocation and reverse geocoding
 * @returns {Promise<{latitude: number, longitude: number, address: string}>}
 */
export const getLocationWithAddress = async () => {
  try {
    // Get coordinates
    const location = await getCurrentLocation();
    
    // Get address from coordinates
    try {
      const address = await reverseGeocode(location.latitude, location.longitude);
      return {
        ...location,
        address
      };
    } catch (geocodeError) {
      // If reverse geocoding fails, return coordinates only
      console.warn('Reverse geocoding failed, using coordinates only:', geocodeError);
      return {
        ...location,
        address: `${location.latitude}, ${location.longitude}`
      };
    }
  } catch (error) {
    throw error;
  }
};

