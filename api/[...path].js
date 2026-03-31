export default async function handler(req, res) {
  const { path } = req.query;
  const pathStr = Array.isArray(path) ? path.join('/') : (path ?? '');

  // Build query string (exclude the 'path' param used by Vercel catch-all)
  const query = { ...req.query };
  delete query.path;
  const qs = new URLSearchParams(query).toString();
  const url = `http://37.27.194.67/${pathStr}${qs ? '?' + qs : ''}`;

  const siteHost = process.env.VITE_SITE_HOST || 'no-alert.net';

  const fetchOptions = {
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
      'Host': siteHost,
      'x-forwarded-host': siteHost,
    },
  };

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    fetchOptions.body = JSON.stringify(req.body);
  }

  try {
    const response = await fetch(url, fetchOptions);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(502).json({ success: false, error: 'Backend unreachable' });
  }
}
