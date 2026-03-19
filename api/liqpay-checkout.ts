import { createHash } from 'crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const APP_URL = process.env.APP_URL || 'https://тривога.net';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount, description, orderId, customerName, customerEmail, resultUrl } = req.body as {
    amount: number;
    description: string;
    orderId: string;
    customerName: string;
    customerEmail: string;
    resultUrl?: string;
  };

  const publicKey = process.env.LIQPAY_PUBLIC_KEY;
  const privateKey = process.env.LIQPAY_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    return res.status(500).json({ error: 'LiqPay not configured' });
  }

  const payload = {
    public_key: publicKey,
    version: '3',
    action: 'pay',
    amount,
    currency: 'UAH',
    description,
    order_id: orderId,
    customer: customerName,
    customer_email: customerEmail,
    result_url: `${APP_URL}${resultUrl ?? '/thank-you'}`,
    server_url: `${APP_URL}/api/liqpay-callback`,
    language: 'uk',
  };

  const data = Buffer.from(JSON.stringify(payload)).toString('base64');
  const signature = createHash('sha1')
    .update(privateKey + data + privateKey)
    .digest('base64');

  return res.status(200).json({ data, signature });
}
