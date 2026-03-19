import { createHash } from 'crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from './_lib/supabase';
import { sendAccessEmail } from './_lib/email';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { data, signature } = req.body as { data?: string; signature?: string };

  if (!data || !signature) {
    return res.status(400).json({ error: 'Missing data or signature' });
  }

  const privateKey = process.env.LIQPAY_PRIVATE_KEY;
  if (!privateKey) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  // Verify LiqPay signature
  const computedSignature = createHash('sha1')
    .update(privateKey + data + privateKey)
    .digest('base64');

  if (computedSignature !== signature) {
    console.error('Invalid LiqPay signature');
    return res.status(403).json({ error: 'Invalid signature' });
  }

  const payload = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));
  console.log('LiqPay payload:', JSON.stringify(payload));

  const { status, order_id, amount, customer_email } = payload as {
    status: string;
    order_id?: string;
    amount?: number;
    customer_email?: string;
  };

  if (!order_id) {
    return res.status(200).json({ ok: true, skipped: 'missing order_id' });
  }

  // Parse order_id: trivoga_{productId}_{timestamp}_{random}_{emailHex}
  const parts = order_id.split('_');
  const emailHex = parts[parts.length - 1];
  const productId = parts.slice(1, -3).join('_');
  const email = customer_email || Buffer.from(emailHex, 'hex').toString('utf-8');

  const isSuccess = status === 'success' || status === 'sandbox';

  const accessToken = isSuccess ? crypto.randomUUID() : null;

  // Upsert order in Supabase
  await supabase.from('orders').upsert({
    order_id,
    email,
    product_id: productId,
    amount: amount ?? 0,
    status: isSuccess ? 'success' : 'failed',
    liqpay_status: status,
    ...(accessToken ? { access_token: accessToken } : {}),
  }, { onConflict: 'order_id' });

  if (!isSuccess) {
    return res.status(200).json({ ok: true, skipped: `status: ${status}` });
  }

  // Send access email
  try {
    await sendAccessEmail(email, productId, accessToken!);
  } catch (err) {
    console.error('Email send failed:', err);
    // Don't fail the callback — order is already saved
  }

  return res.status(200).json({ ok: true });
}
