import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from './_lib/supabase.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  const productId = req.query.product_id as string;
  if (!productId) return res.status(400).json({ error: 'Missing product_id' });

  const { data, error } = await supabase
    .from('course_blocks')
    .select('id, title, description, video_url, text_content, order_index')
    .eq('product_id', productId)
    .order('order_index');

  if (error) return res.status(500).json({ error: error.message });

  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  return res.status(200).json({ blocks: data ?? [] });
}
