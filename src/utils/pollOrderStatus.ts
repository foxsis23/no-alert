import { fetchOrderStatus } from '../lib/api';

export interface PollHandle {
  cancel: () => void;
}

interface PollOptions {
  intervalMs?: number;
  timeoutMs?: number;
}

// Polls the order status until it settles (PAID/FAILED) or times out.
// Source of truth is the hutko-callback, so this resolves even when the
// customer paid on another device (QR flow) and never got redirected here.
export function pollOrderStatus(
  orderId: string,
  onResolved: (status: 'PAID' | 'FAILED') => void,
  options: PollOptions = {},
): PollHandle {
  const intervalMs = options.intervalMs ?? 3000;
  const timeoutMs = options.timeoutMs ?? 10 * 60 * 1000;

  let stopped = false;

  const stop = () => {
    if (stopped) return;
    stopped = true;
    clearInterval(timer);
    clearTimeout(timeout);
  };

  const tick = async () => {
    if (stopped) return;
    try {
      const { status } = await fetchOrderStatus(orderId);
      if (status === 'PAID' || status === 'FAILED') {
        stop();
        onResolved(status);
      }
    } catch {
      // Transient network/API error — keep polling until timeout.
    }
  };

  const timer = setInterval(tick, intervalMs);
  const timeout = setTimeout(stop, timeoutMs);
  void tick();

  return { cancel: stop };
}
