/**
 * Detects if the user is on an iOS device
 * @returns {boolean} True if iOS device (iPhone, iPad, iPod)
 */
export const isIOS = () => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  // Check for iOS devices
  return /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
};

/**
 * Formats a phone number for use in URLs
 * Ensures clean E.164 format and handles various input formats
 * @param {string} phoneNumber - The phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';

  // Remove all non-digit characters except +
  let cleaned = phoneNumber.replace(/[^\d+]/g, '');

  // Ensure it starts with + if it doesn't already
  if (!cleaned.startsWith('+')) {
    // If it's a 10-digit US number, add +1
    if (cleaned.length === 10) {
      cleaned = '+1' + cleaned;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      cleaned = '+' + cleaned;
    } else {
      // For other formats, just add + at the start
      cleaned = '+' + cleaned;
    }
  }

  return cleaned;
};

/**
 * Generates the appropriate phone call URL based on device
 * @param {string} phoneNumber - The phone number to call
 * @returns {string} The URL to use for the call link
 */
export const generatePhoneURL = (phoneNumber) => {
  const formattedNumber = formatPhoneNumber(phoneNumber);

  if (isIOS()) {
    // Use Quo (OpenPhone) deep link for iOS
    const encodedNumber = encodeURIComponent(formattedNumber);
    return `openphone://dial?number=${encodedNumber}&action=call`;
  } else {
    // Use standard tel: scheme for Android/Desktop
    return `tel:${formattedNumber}`;
  }
};
