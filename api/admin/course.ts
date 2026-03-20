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
  if (!checkAuth(req)) return res.status(401).json({ error: 'Unauthorized' });

  // GET — list blocks for a product
  if (req.method === 'GET') {
    const productId = req.query.product_id as string | undefined;
    let query = supabase.from('course_blocks').select('*').order('order_index');
    if (productId) query = query.eq('product_id', productId);
    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ blocks: data ?? [] });
  }

  // POST — create block
  if (req.method === 'POST') {
    const { product_id, title, description, video_url, text_content } = req.body as Record<string, string>;
    if (!product_id || !title) return res.status(400).json({ error: 'product_id and title are required' });

    const { data: existing } = await supabase
      .from('course_blocks')
      .select('order_index')
      .eq('product_id', product_id)
      .order('order_index', { ascending: false })
      .limit(1);

    const nextOrder = (existing?.[0]?.order_index ?? -1) + 1;

    const { data, error } = await supabase
      .from('course_blocks')
      .insert({
        product_id,
        title,
        description: description || null,
        video_url: video_url || null,
        text_content: text_content || null,
        order_index: nextOrder,
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ block: data });
  }

  // PUT — update block
  if (req.method === 'PUT') {
    const id = req.query.id as string;
    if (!id) return res.status(400).json({ error: 'Missing id' });

    const body = req.body as Record<string, unknown>;
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = (body.description as string) || null;
    if (body.video_url !== undefined) updates.video_url = (body.video_url as string) || null;
    if (body.text_content !== undefined) updates.text_content = (body.text_content as string) || null;
    if (body.order_index !== undefined) updates.order_index = body.order_index;

    const { data, error } = await supabase
      .from('course_blocks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ block: data });
  }

  // DELETE — remove block
  if (req.method === 'DELETE') {
    const id = req.query.id as string;
    if (!id) return res.status(400).json({ error: 'Missing id' });

    const { error } = await supabase.from('course_blocks').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).end();
}
