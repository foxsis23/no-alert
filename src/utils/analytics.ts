import { trackAnalyticsEvent } from '../lib/api';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

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

  // Backend (fire and forget)
  trackAnalyticsEvent({ event: eventName, metadata: params }).catch(() => {/* silent */});
}
