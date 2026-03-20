import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_lib/supabase.js';

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
    const page = Number(req.query.page ?? 1);
    const limit = 50;
    const offset = (page - 1) * limit;
    const statusFilter = req.query.status as string | undefined;
    const emailSearch = req.query.email as string | undefined;
    const productFilter = req.query.product_id as string | undefined;

    let query = supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    } else if (!statusFilter) {
      query = query.eq('status', 'success');
    }

    if (emailSearch) {
      query = query.ilike('email', `%${emailSearch}%`);
    }

    if (productFilter) {
      query = query.eq('product_id', productFilter);
    }

    const { data: orders, error, count } = await query;

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ orders, total: count, page });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
