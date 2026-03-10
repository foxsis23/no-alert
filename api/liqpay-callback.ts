import { createHash } from 'crypto';
import { Resend } from 'resend';

const PRODUCT_TITLES: Record<string, string> = {
  basic: 'Що робити зараз',
  course: 'Курс від тривоги',
  support_7_days: 'Підтримка 7 днів',
  upsell_panic_audio: 'Аудіо при паніці',
  upsell_stability_7days: 'Стабільність 7 днів',
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { data, signature } = req.body as { data?: string; signature?: string };

  if (!data || !signature) {
    return res.status(400).json({ error: 'Missing data or signature' });
  }

  const privateKey = process.env.LIQPAY_PRIVATE_KEY;
  if (!privateKey) {
    console.error('LIQPAY_PRIVATE_KEY not configured');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  // Verify LiqPay signature: base64(sha1(private_key + data + private_key))
  const computedSignature = createHash('sha1')
    .update(privateKey + data + privateKey)
    .digest('base64');

  if (computedSignature !== signature) {
    console.error('Invalid LiqPay signature');
    return res.status(403).json({ error: 'Invalid signature' });
  }

  // Decode payload
  const payload = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));
  console.log('LiqPay payload:', JSON.stringify(payload, null, 2));

  const status = payload.status as string;
  const order_id = payload.order_id as string | undefined;

  // Only send email for successful payments (or sandbox test payments)
  if (status !== 'success' && status !== 'sandbox') {
    return res.status(200).json({ ok: true, skipped: true, reason: `status: ${status}` });
  }

  if (!order_id) {
    console.error('Missing order_id');
    return res.status(200).json({ ok: true, skipped: true, reason: 'missing order_id' });
  }

  // order_id format: trivoga_${productId}_${timestamp}_${random}_${emailHex}
  const parts = order_id.split('_');
  const emailHex = parts[parts.length - 1];
  const productId = parts.slice(1, -3).join('_');
  const customer_email = Buffer.from(emailHex, 'hex').toString('utf-8');

  if (!customer_email || !customer_email.includes('@')) {
    console.error('Could not decode email from order_id:', order_id);
    return res.status(200).json({ ok: true, skipped: true, reason: 'invalid email' });
  }
  const productTitle = PRODUCT_TITLES[productId] ?? 'Ваш продукт';

  // Send email via Resend
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.error('RESEND_API_KEY not configured');
    return res.status(500).json({ error: 'Email service not configured' });
  }

  const resend = new Resend(resendKey);

  await resend.emails.send({
    from: 'тривога.net <onboarding@resend.dev>',
    to: customer_email,
    subject: 'Ваш курс готовий!',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #1a1a2e;">Дякуємо за покупку!</h1>
        <p style="font-size: 18px;">Ваш курс: <strong>${productTitle}</strong></p>
        <p>Ми надішлемо вам доступ до матеріалів найближчим часом.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #718096; font-size: 14px;">тривога.net — допомога при тривозі</p>
      </div>
    `,
  });

  return res.status(200).json({ ok: true, email_sent: true });
}
