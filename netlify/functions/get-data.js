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

  try {
    const url = new URL(req.url);
    const key = url.searchParams.get('key');

    if (!key) {
      return new Response(
        JSON.stringify({ error: 'Missing key parameter' }),
        { status: 400, headers }
      );
    }

    // Get the blob store
    const store = getStore({
      name: 'r7-dialer-data',
      siteID: context.site.id,
      token: process.env.NETLIFY_BLOBS_TOKEN || Netlify.env.get('NETLIFY_BLOBS_TOKEN'),
    });

    // Get the data from blob storage
    const data = await store.get(key, { type: 'json' });

    if (!data) {
      return new Response(
        JSON.stringify({ data: null }),
        { status: 200, headers }
      );
    }

    return new Response(
      JSON.stringify({ data }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error('Error getting data:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers }
    );
  }
};

export const config = {
  path: '/api/get-data',
};
