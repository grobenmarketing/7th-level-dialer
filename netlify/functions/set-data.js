import { getStore } from '@netlify/blobs';
import { getCorsHeaders, validateAuth, unauthorizedResponse } from './_shared/auth.js';

export default async (req, context) => {
  // Get CORS headers with origin validation
  const headers = getCorsHeaders(req);

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  // SECURITY: Validate authentication token
  if (!validateAuth(req)) {
    return unauthorizedResponse(headers);
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers }
    );
  }

  try {
    const body = await req.json();
    const { key, data } = body;

    if (!key) {
      return new Response(
        JSON.stringify({ error: 'Missing key parameter' }),
        { status: 400, headers }
      );
    }

    if (data === undefined) {
      return new Response(
        JSON.stringify({ error: 'Missing data parameter' }),
        { status: 400, headers }
      );
    }

    // Get the blob store
    const store = getStore({
      name: 'r7-dialer-data',
      siteID: context.site.id,
      token: process.env.NETLIFY_BLOBS_TOKEN || Netlify.env.get('NETLIFY_BLOBS_TOKEN'),
    });

    // Save the data to blob storage
    await store.setJSON(key, data);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error('Error setting data:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers }
    );
  }
};

export const config = {
  path: '/api/set-data',
};
