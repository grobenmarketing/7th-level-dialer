/**
 * Authentication and CORS helper for Netlify Functions
 * SECURITY: Validates API tokens and restricts CORS origins
 */

/**
 * Get allowed CORS origins from environment
 * @returns {string[]} Array of allowed origins
 */
export function getAllowedOrigins() {
  const allowedOrigins = process.env.VITE_ALLOWED_ORIGINS || '';
  return allowedOrigins.split(',').map(origin => origin.trim()).filter(Boolean);
}

/**
 * Validate authentication token from request headers
 * @param {Request} req - The request object
 * @returns {boolean} True if authenticated, false otherwise
 */
export function validateAuth(req) {
  const authToken = req.headers.get('x-api-token') || req.headers.get('authorization');
  const validToken = process.env.VITE_API_AUTH_TOKEN;

  if (!validToken) {
    console.error('CRITICAL: VITE_API_AUTH_TOKEN environment variable is not set!');
    return false;
  }

  if (!authToken) {
    return false;
  }

  // Support both "Bearer token" and direct token formats
  const token = authToken.startsWith('Bearer ') ? authToken.slice(7) : authToken;

  return token === validToken;
}

/**
 * Get CORS headers with origin validation
 * @param {Request} req - The request object
 * @returns {Object} Headers object with CORS settings
 */
export function getCorsHeaders(req) {
  const origin = req.headers.get('origin');
  const allowedOrigins = getAllowedOrigins();

  // Check if origin is allowed
  const isAllowed = allowedOrigins.length === 0 || allowedOrigins.includes(origin);

  return {
    'Access-Control-Allow-Origin': isAllowed ? (origin || allowedOrigins[0] || '*') : '',
    'Access-Control-Allow-Headers': 'Content-Type, x-api-token, authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json',
  };
}

/**
 * Return an unauthorized response
 * @param {Object} headers - Response headers
 * @returns {Response} 401 Unauthorized response
 */
export function unauthorizedResponse(headers) {
  return new Response(
    JSON.stringify({ error: 'Unauthorized: Invalid or missing API token' }),
    { status: 401, headers }
  );
}
