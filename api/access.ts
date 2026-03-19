import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from './_lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.query.token as string | undefined;
  if (!token) {
    return res.status(400).json({ valid: false, error: 'Missing token' });
  }

  const { data: order, error } = await supabase
    .from('orders')
    .select('product_id, status')
    .eq('access_token', token)
    .single();

  if (error || !order || order.status !== 'success') {
    return res.status(404).json({ valid: false });
  }

  return res.status(200).json({ valid: true, productId: order.product_id });
}
