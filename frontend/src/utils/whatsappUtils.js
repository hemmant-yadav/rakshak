/**
 * Open WhatsApp chat with a contact
 * @param {string} phoneNumber - Phone number in international format (e.g., +1234567890)
 * @param {string} message - Pre-filled message (optional)
 * @returns {void}
 */
import { formatIndianPhoneNumber } from './phoneUtils';

const isMobileDevice = () => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  // Only detect really mobile devices
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};
export { isMobileDevice };

export const openWhatsAppChat = (phoneNumber, message = '') => {
  try {
    const formattedNumber = formatIndianPhoneNumber(phoneNumber);
    if (!formattedNumber) {
      alert('Please enter a valid Indian phone number (10 digits).');
      return false;
    }
    const encodedMessage = encodeURIComponent(message);
    const numberDigits = formattedNumber.replace('+', '');
    // Prioritize WhatsApp Web everywhere except strict mobile (so iPad/Mac in Safari still uses web)
    const isMobile = isMobileDevice();
    const url = isMobile
      ? `https://wa.me/${numberDigits}?text=${encodedMessage}`
      : `https://web.whatsapp.com/send?phone=${numberDigits}&text=${encodedMessage}`;
    if (typeof window !== 'undefined') {
      // DEV ONLY: Optional debug log
      console.log('[Rakshak][WhatsApp] Opening URL:', url, 'User-Agent:', navigator.userAgent);
      window.open(url, '_blank', 'noopener,noreferrer');
    }
    return true;
  } catch (error) {
    console.error('Error opening WhatsApp:', error);
    alert('Failed to open WhatsApp. Please check if WhatsApp is installed.');
    return false;
  }
};

/**
 * Open WhatsApp chat with multiple contacts (sends to each one)
 * @param {Array} contacts - Array of contact objects with phone property
 * @param {string} message - Message to send
 * @returns {void}
 */
export const openWhatsAppChatWithContacts = (contacts, message) => {
  if (!contacts || contacts.length === 0) {
    alert('No contacts found. Please add emergency contacts first.');
    return;
  }

  // Open WhatsApp for each contact
  contacts.forEach((contact, index) => {
    // Use a longer delay between windows to maximize success rate
    setTimeout(() => {
      openWhatsAppChat(contact.phone, message);
    }, index * 1000); // 1000ms = 1 second between each tab
  });
};

/**
 * Format phone number for WhatsApp
 * @param {string} phoneNumber - Phone number
 * @returns {string} - Formatted phone number
 */
export const formatPhoneForWhatsApp = (phoneNumber) => {
  if (!phoneNumber) return '';
  
  // Remove all non-digit characters except +
  let cleaned = phoneNumber.replace(/[^\d+]/g, '');
  
  // Ensure it starts with +
  if (!cleaned.startsWith('+')) {
    cleaned = `+${cleaned}`;
  }
  
  // Remove the + for WhatsApp URL (wa.me uses number without +)
  return cleaned.replace('+', '');
};

/**
 * Create WhatsApp message for SOS alert
 * @param {Object} incident - Incident object
 * @returns {string} - Formatted message
 */
export const createSOSMessage = (incident) => {
  // Support both .latitude/.longitude and .location.{latitude,longitude} and address
  const lat = incident.latitude || incident.location?.latitude;
  const lon = incident.longitude || incident.location?.longitude;
  const address = incident.address || incident.location?.address || 'Location not provided';
  const time = new Date(incident.createdAt || new Date()).toLocaleString();
  let message = `🚨 *SOS EMERGENCY ALERT* 🚨\n\n*Emergency Location:* ${address}\n\n*Description:* ${incident.description || 'Emergency situation'}\n\n*Time:* ${time}\n`;
  if (lat && lon) {
    message += `\n*Coordinates:* ${lat}, ${lon}\n`;
    message += `\n📍 *View on Maps:* https://www.google.com/maps?q=${lat},${lon}\n`;
  }
  message += `\n⚠️ *Please respond immediately!*`;
  return message;
};

