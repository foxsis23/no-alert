import { createHash } from 'crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from './_lib/supabase.js';
import { sendAccessEmail } from './_lib/email.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('[liqpay-callback] headers:', JSON.stringify(req.headers));
  console.log('[liqpay-callback] body type:', typeof req.body);
  console.log('[liqpay-callback] body keys:', req.body ? Object.keys(req.body) : 'null');

  try {
    const { data, signature } = req.body as { data?: string; signature?: string };

    if (!data || !signature) {
      console.error('[liqpay-callback] Missing data or signature. Body:', JSON.stringify(req.body));
      return res.status(400).json({ error: 'Missing data or signature' });
    }

    const privateKey = process.env.LIQPAY_PRIVATE_KEY;
    if (!privateKey) {
      console.error('[liqpay-callback] LIQPAY_PRIVATE_KEY not set');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Verify LiqPay signature
    const computedSignature = createHash('sha1')
      .update(privateKey + data + privateKey)
      .digest('base64');

    if (computedSignature !== signature) {
      console.error('[liqpay-callback] Invalid signature. Expected:', computedSignature, 'Got:', signature);
      return res.status(403).json({ error: 'Invalid signature' });
    }

    const payload = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));
    console.log('[liqpay-callback] payload:', JSON.stringify(payload));

    const { status, order_id, amount, customer_email } = payload as {
      status: string;
      order_id?: string;
      amount?: number;
      customer_email?: string;
    };

    if (!order_id) {
      console.warn('[liqpay-callback] Missing order_id in payload');
      return res.status(200).json({ ok: true, skipped: 'missing order_id' });
    }

    // Parse order_id: trivoga_{productId}_{timestamp}_{random}_{emailHex}
    const parts = order_id.split('_');
    const emailHex = parts[parts.length - 1];
    const productId = parts.slice(1, -3).join('_');
    const email = customer_email || Buffer.from(emailHex, 'hex').toString('utf-8');

    console.log('[liqpay-callback] parsed — productId:', productId, 'email:', email, 'status:', status);

    const isSuccess = status === 'success' || status === 'sandbox';
    const accessToken = isSuccess ? crypto.randomUUID() : null;

    // Upsert order in Supabase
    const { error: upsertError } = await supabase.from('orders').upsert({
      order_id,
      email,
      product_id: productId,
      amount: amount ?? 0,
      status: isSuccess ? 'success' : 'failed',
      liqpay_status: status,
      ...(accessToken ? { access_token: accessToken } : {}),
    }, { onConflict: 'order_id' });

    if (upsertError) {
      console.error('[liqpay-callback] Supabase upsert error:', JSON.stringify(upsertError));
      return res.status(500).json({ error: 'DB error', detail: upsertError.message });
    }

    console.log('[liqpay-callback] order saved. isSuccess:', isSuccess);

    if (!isSuccess) {
      return res.status(200).json({ ok: true, skipped: `status: ${status}` });
    }

    // Send access email
    try {
      await sendAccessEmail(email, productId, accessToken!);
      console.log('[liqpay-callback] access email sent to:', email);
    } catch (err) {
      console.error('[liqpay-callback] Email send failed:', err);
      // Don't fail the callback — order is already saved
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[liqpay-callback] Unhandled error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
