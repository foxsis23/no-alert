import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_lib/supabase.js';
import { getMergedConfig } from '../config.js';

function checkAuth(req: VercelRequest): boolean {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Basic ')) return false;
  const decoded = Buffer.from(auth.slice(6), 'base64').toString('utf-8');
  const [, password] = decoded.split(':');
  return password === process.env.ADMIN_PASSWORD;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!checkAuth(req)) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin"');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const config = await getMergedConfig();
      return res.status(200).json(config);
    } catch {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'PUT') {
    const body = req.body as { table: string; id: string; updates: Record<string, unknown> };
    const { table, id, updates } = body ?? {};

    if (!table || !id || !updates) {
      return res.status(400).json({ error: 'Missing table, id, or updates' });
    }

    try {
      if (table === 'site') {
        const rows = Object.entries(updates).map(([key, value]) => ({
          key,
          value: String(value),
          updated_at: new Date().toISOString(),
        }));
        const { error } = await supabase.from('site_config').upsert(rows, { onConflict: 'key' });
        if (error) return res.status(500).json({ error: error.message });
      } else if (table === 'products') {
        const { error } = await supabase.from('products_config').upsert(
          { product_id: id, ...updates, updated_at: new Date().toISOString() },
          { onConflict: 'product_id' },
        );
        if (error) return res.status(500).json({ error: error.message });
      } else if (table === 'results') {
        const { error } = await supabase.from('result_types_config').upsert(
          { type_id: id, ...updates, updated_at: new Date().toISOString() },
          { onConflict: 'type_id' },
        );
        if (error) return res.status(500).json({ error: error.message });
      } else {
        return res.status(400).json({ error: 'Unknown table' });
      }

      return res.status(200).json({ ok: true });
    } catch {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
