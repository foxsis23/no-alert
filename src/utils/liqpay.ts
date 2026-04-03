const LIQPAY_URL = 'https://www.liqpay.ua/api/3/checkout';

async function sha1Base64(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = await crypto.subtle.digest('SHA-1', encoder.encode(str));
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function encodeBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  bytes.forEach((b) => { binary += String.fromCharCode(b); });
  return btoa(binary);
}

export interface LiqPayParams {
  amount: string;
  description: string;
  orderId: string;
  resultUrl: string;
  serverUrl: string;
  productId: string;
  email: string;
  currency?: string;
}

export async function submitToLiqPay(params: LiqPayParams): Promise<void> {
  const publicKey = import.meta.env.VITE_LIQPAY_PUBLIC_KEY as string;
  const privateKey = import.meta.env.VITE_LIQPAY_PRIVATE_KEY as string;

  const dataObj = {
    public_key: publicKey,
    version: '3',
    action: 'pay',
    amount: params.amount,
    currency: params.currency ?? 'UAH',
    description: params.description,
    order_id: params.orderId,
    result_url: params.resultUrl,
    server_url: params.serverUrl,
    language: 'uk',
    info: JSON.stringify({ product_id: params.productId, customer_email: params.email }),
  };

  const data = encodeBase64(JSON.stringify(dataObj));
  const signature = await sha1Base64(privateKey + data + privateKey);

  const form = document.createElement('form');
  form.method = 'POST';
  form.action = LIQPAY_URL;
  form.style.display = 'none';
  form.acceptCharset = 'utf-8';

  const addField = (name: string, value: string) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.appendChild(input);
  };

  addField('data', data);
  addField('signature', signature);
  document.body.appendChild(form);
  form.submit();
}
