// ⚠️  SECURITY NOTE:
// VITE_ env vars are bundled into the client — the private key becomes visible
// in the browser. For production, generate the signature in a serverless function
// (Vercel Edge / Netlify Functions) and expose only a signed-redirect endpoint.

const LIQPAY_CHECKOUT_URL = 'https://www.liqpay.ua/api/3/checkout';

export interface LiqPayCheckoutParams {
  amount: number;
  description: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
}

/**
 * SHA-1 hash → raw binary → base64
 * LiqPay signature = base64(sha1(private_key + data + private_key))
 */
async function sha1Base64(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-1', bytes);
  const binary = Array.from(new Uint8Array(hashBuffer))
    .map((b) => String.fromCharCode(b))
    .join('');
  return btoa(binary);
}

/**
 * JSON object → UTF-8 bytes → base64
 * (handles Cyrillic / Unicode in description fields correctly)
 */
function encodeData(payload: object): string {
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

/**
 * Generates LiqPay `data` + `signature` and submits a hidden POST form
 * that redirects the browser to the LiqPay checkout page.
 */
export async function redirectToLiqPay(params: LiqPayCheckoutParams): Promise<void> {
  const publicKey = import.meta.env.VITE_LIQPAY_PUBLIC_KEY;
  const privateKey = import.meta.env.VITE_LIQPAY_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    throw new Error('LiqPay keys are not configured. Add VITE_LIQPAY_PUBLIC_KEY and VITE_LIQPAY_PRIVATE_KEY to .env');
  }

  const payload = {
    public_key: publicKey,
    version: '3',
    action: 'pay',
    amount: params.amount,
    currency: 'UAH',
    description: params.description,
    order_id: params.orderId,
    customer: params.customerName,
    customer_email: params.customerEmail,
    result_url: `${window.location.origin}/thank-you`,
    language: 'uk',
  };

  const data = encodeData(payload);
  const signature = await sha1Base64(privateKey + data + privateKey);

  // LiqPay requires a POST (not GET redirect) — submit a hidden form
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = LIQPAY_CHECKOUT_URL;
  form.style.display = 'none';

  const dataInput = document.createElement('input');
  dataInput.type = 'hidden';
  dataInput.name = 'data';
  dataInput.value = data;

  const sigInput = document.createElement('input');
  sigInput.type = 'hidden';
  sigInput.name = 'signature';
  sigInput.value = signature;

  form.appendChild(dataInput);
  form.appendChild(sigInput);
  document.body.appendChild(form);
  form.submit();
}

/** Unique order ID per transaction */
export function generateOrderId(productId: string): string {
  const random = Math.random().toString(36).slice(2, 7);
  return `trivoga_${productId}_${Date.now()}_${random}`;
}
