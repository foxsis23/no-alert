export default async function handler(req, res) {
  const { path } = req.query;
  const pathStr = Array.isArray(path) ? path.join('/') : path ?? '';
  const url = `http://37.27.194.67/${pathStr}`;

  const fetchOptions = {
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
      'Host': 'no-alert.net',
    },
  };

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    fetchOptions.body = JSON.stringify(req.body);
  }

  const response = await fetch(url, fetchOptions);
  const data = await response.json();

  res.status(response.status).json(data);
}
