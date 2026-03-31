export default async function handler(req, res) {
  // Handle CORS preflight
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,x-admin-key');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { path } = req.query;
  const pathStr = Array.isArray(path) ? path.join('/') : (path ?? '');

  const query = { ...req.query };
  delete query.path;
  const qs = new URLSearchParams(query).toString();
  const url = `http://37.27.194.67/${pathStr}${qs ? '?' + qs : ''}`;

  const fetchOptions = {
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
      'Host': 'no-alert.net',
      'x-forwarded-host': 'no-alert.net',
    },
  };

  if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
    fetchOptions.body = JSON.stringify(req.body);
  }

  if (req.headers['x-admin-key']) {
    fetchOptions.headers['x-admin-key'] = req.headers['x-admin-key'];
  }

  try {
    const response = await fetch(url, fetchOptions);
    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { success: false, error: text };
    }

    res.status(response.status).json(data);
  } catch (err) {
    res.status(502).json({ success: false, error: 'Backend unreachable' });
  }
}
