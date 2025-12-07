import { getStore } from '@netlify/blobs';

export default async (req, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  try {
    const store = getStore({
      name: 'r7-dialer-data',
      siteID: context.site.id,
      token: process.env.NETLIFY_BLOBS_TOKEN || Netlify.env.get('NETLIFY_BLOBS_TOKEN'),
    });

    if (req.method === 'POST') {
      // Bulk save operation
      const body = await req.json();
      const { items } = body;

      if (!items || !Array.isArray(items)) {
        return new Response(
          JSON.stringify({ error: 'Missing or invalid items array' }),
          { status: 400, headers }
        );
      }

      // Save all items
      const promises = items.map(({ key, data }) =>
        store.setJSON(key, data)
      );

      await Promise.all(promises);

      return new Response(
        JSON.stringify({ success: true, count: items.length }),
        { status: 200, headers }
      );
    } else if (req.method === 'GET') {
      // Get all data
      const url = new URL(req.url);
      const keysParam = url.searchParams.get('keys');

      if (!keysParam) {
        return new Response(
          JSON.stringify({ error: 'Missing keys parameter' }),
          { status: 400, headers }
        );
      }

      const keys = keysParam.split(',');
      const results = {};

      for (const key of keys) {
        try {
          const data = await store.get(key, { type: 'json' });
          results[key] = data;
        } catch (error) {
          console.error(`Error getting key ${key}:`, error);
          results[key] = null;
        }
      }

      return new Response(
        JSON.stringify({ data: results }),
        { status: 200, headers }
      );
    } else {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers }
      );
    }
  } catch (error) {
    console.error('Error syncing data:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers }
    );
  }
};

export const config = {
  path: '/api/sync-all',
};
