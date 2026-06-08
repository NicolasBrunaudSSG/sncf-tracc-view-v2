import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'leaflet/dist/leaflet.css'
import './index.css'
import App from './App.jsx'

// Enregistrement du Service Worker (mode statique GitHub Pages uniquement)
if ('serviceWorker' in navigator && import.meta.env.VITE_DATA_MODE === 'static') {
  const base = import.meta.env.BASE_URL ?? '/'
  navigator.serviceWorker
    .register(`${base}sw.js`, { scope: base })
    .then((reg) => console.log('[SW] Enregistré, scope:', reg.scope))
    .catch((err) => console.warn('[SW] Échec enregistrement:', err))
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
