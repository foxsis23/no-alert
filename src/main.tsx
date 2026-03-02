import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { initGA4 } from './utils/analytics'

const GA4_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID as string | undefined;
if (GA4_ID) initGA4(GA4_ID);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
