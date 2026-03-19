import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from './_lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { event, params, sessionId } = req.body as {
    event: string;
    params?: Record<string, unknown>;
    sessionId?: string;
  };

  if (!event) {
    return res.status(400).json({ error: 'Missing event' });
  }

  const { error } = await supabase.from('events').insert({
    event_type: event,
    metadata: params ?? null,
    session_id: sessionId ?? null,
  });

  if (error) console.error('Analytics insert error:', error.message);

  return res.status(200).json({ ok: true });
}
