/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_SITE_HOST: string;
  readonly VITE_GA4_MEASUREMENT_ID?: string;
  readonly VITE_HUTKO_TEST?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
