const LIQPAY_CHECKOUT_URL = 'https://www.liqpay.ua/api/3/checkout';

export interface LiqPayCheckoutParams {
  amount: number;
  description: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  resultUrl?: string;
}

/**
 * Calls the server-side /api/liqpay-checkout to get signed data,
 * then submits a hidden POST form to LiqPay checkout.
 * Private key never leaves the server.
 */
export async function redirectToLiqPay(params: LiqPayCheckoutParams): Promise<void> {
  const response = await fetch('/api/liqpay-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? 'Failed to initiate payment');
  }

  const { data, signature } = await response.json() as { data: string; signature: string };

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

/** Unique order ID per transaction, with email encoded for callback */
export function generateOrderId(productId: string, email: string): string {
  const random = Math.random().toString(36).slice(2, 7);
  const emailHex = Array.from(new TextEncoder().encode(email))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `trivoga_${productId}_${Date.now()}_${random}_${emailHex}`;
}
