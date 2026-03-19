import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from './_lib/supabase.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const email = req.query.email as string | undefined;
  if (!email) {
    return res.status(400).json({ error: 'Missing email' });
  }

  const { data: orders } = await supabase
    .from('orders')
    .select('product_id')
    .eq('email', email.toLowerCase().trim())
    .eq('status', 'success');

  const productIds = (orders ?? []).map((o) => o.product_id as string);

  return res.status(200).json({ productIds });
}
