import app from '../server/index.js';

export default function handler(req, res) {
  // Vercel will invoke this function for /api/*.
  // Our Express app defines routes at /treasury/*, /jobs, etc.
  // Strip the /api prefix so the same app works in both local and Vercel.
  if (req.url?.startsWith('/api/')) req.url = req.url.slice(4);
  if (req.url === '/api') req.url = '/';
  return app(req, res);
}

