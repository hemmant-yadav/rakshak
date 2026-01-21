export const formatIndianPhoneNumber = (input) => {
  if (!input) return null;

  // Remove all non-digit characters
  let digits = input.replace(/\D/g, '');

  // Remove leading 0
  if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  // Remove leading country code 91 if present
  if (digits.startsWith('91') && digits.length > 10) {
    digits = digits.slice(-10);
  }

  // Keep only last 10 digits if longer
  if (digits.length > 10) {
    digits = digits.slice(-10);
  }

  if (digits.length !== 10) {
    return null;
  }

  if (!['6', '7', '8', '9'].includes(digits.charAt(0))) {
    return null;
  }

  return `+91${digits}`;
};

export const formatIndianPhoneForDisplay = (phone) => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '').slice(-10);
  if (digits.length !== 10) return phone;
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
};

