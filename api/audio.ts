import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from './_lib/supabase.js';

// Map of audio keys to Supabase Storage file paths (bucket: "audio")
const AUDIO_FILES: Record<string, string> = {
  panic_wave: 'panic_wave.mp3',
  basic: 'basic.mp3',
};

// Which products grant access to which audio
const AUDIO_ACCESS: Record<string, (productIds: string[]) => boolean> = {
  panic_wave: (ids) => {
    const supportProducts = ['basic', 'support_7_days', 'upsell_panic_audio'];
    return ids.some((id) => supportProducts.includes(id));
  },
  basic: (ids) => ids.includes('basic'),
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { file, email } = req.query as { file?: string; email?: string };

  if (!file || !email) {
    return res.status(400).json({ error: 'Missing file or email' });
  }

  const filePath = AUDIO_FILES[file];
  if (!filePath) {
    return res.status(404).json({ error: 'Unknown audio file' });
  }

  // Check purchases for this email
  const { data: orders } = await supabase
    .from('orders')
    .select('product_id')
    .eq('email', email.toLowerCase().trim())
    .eq('status', 'success');

  const productIds = (orders ?? []).map((o) => o.product_id as string);
  const hasAccess = AUDIO_ACCESS[file]?.(productIds) ?? false;

  if (!hasAccess) {
    return res.status(403).json({ error: 'No access' });
  }

  // Generate signed URL valid for 1 hour
  const { data, error } = await supabase.storage
    .from('audio')
    .createSignedUrl(filePath, 3600);

  if (error || !data?.signedUrl) {
    console.error('Supabase storage error:', error);
    return res.status(500).json({ error: 'Could not generate audio URL' });
  }

  return res.status(200).json({ url: data.signedUrl });
}
