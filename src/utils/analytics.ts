declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

// Stable session ID for the current browser session
const SESSION_ID = Math.random().toString(36).slice(2);

export function initGA4(measurementId: string) {
  if (!measurementId || typeof window === 'undefined') return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', measurementId);
}

export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  // GA4
  if (window.gtag) {
    window.gtag('event', eventName, params);
  }

  // Server-side (fire and forget)
  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event: eventName, params, sessionId: SESSION_ID }),
  }).catch(() => {/* silent */});
}
