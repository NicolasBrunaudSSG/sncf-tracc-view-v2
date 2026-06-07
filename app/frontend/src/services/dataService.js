/**
 * dataService.js — Abstraction API / mode statique (GitHub Pages)
 *
 * En mode backend  (VITE_DATA_MODE=api, défaut dev) :
 *   → appels vers /api/* proxifiés vers FastAPI
 *
 * En mode statique (VITE_DATA_MODE=static) :
 *   → lecture des fichiers JSON dans /data/* + filtrage côté client
 */

const MODE = import.meta.env.VITE_DATA_MODE ?? 'api'
const BASE = import.meta.env.VITE_DATA_BASE ?? '/data'

// ─── Cache local (mode static) ────────────────────────────────────────────────

const _localCache = {}

async function _fetchStatic(key, path) {
  if (_localCache[key]) return _localCache[key]
  const r = await fetch(path)
  if (!r.ok) throw new Error(`HTTP ${r.status} pour ${path}`)
  const data = await r.json()
  _localCache[key] = data
  return data
}

// ─── Helpers de calcul (portage du backend Python) ───────────────────────────

function _quantile(features, rKey, q) {
  const vals = features
    .map((f) => f?.properties?.[rKey] ?? 0)
    .filter((v) => v > 0)
    .sort((a, b) => a - b)
  if (!vals.length) return 0
  return vals[Math.min(Math.floor(q * vals.length), vals.length - 1)]
}

function _filterRisk(features, alea, scenario, threshold) {
  const rKey = scenario === 'reference' ? `R_${alea}` : `R_${alea}`
  // Les GeoJSON HEV ont R_canicule, R_inondation etc. (sans horizon en mode réseau)
  return features.filter((f) => (f?.properties?.[rKey] ?? 0) >= threshold)
}

function _filterCross(features, alea1, alea2, q1, q2) {
  const k1 = `R_${alea1}`
  const k2 = `R_${alea2}`
  const seuil1 = _quantile(features, k1, q1)
  const seuil2 = _quantile(features, k2, q2)
  return features.filter(
    (f) =>
      (f?.properties?.[k1] ?? 0) >= seuil1 &&
      (f?.properties?.[k2] ?? 0) >= seuil2
  )
}

// ─── API publique ─────────────────────────────────────────────────────────────

export async function fetchReseau() {
  if (MODE === 'api') {
    const r = await fetch('/api/reseau')
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    return r.json()
  }
  return _fetchStatic('reseau', `${BASE}/reseau_national.geojson`)
}

export async function fetchRisk(scenario, alea, threshold) {
  if (MODE === 'api') {
    const r = await fetch(`/api/hev/${scenario}/risk?alea=${alea}&threshold=${threshold}`)
    if (!r.ok) {
      const err = await r.json().catch(() => ({}))
      throw new Error(err.detail ?? `HTTP ${r.status}`)
    }
    return r.json()
  }
  const hev = await _fetchStatic(`hev_${scenario}`, `${BASE}/hev_${scenario}.geojson`)
  const features = _filterRisk(hev.features, alea, scenario, threshold)
  return { type: 'FeatureCollection', features }
}

export async function fetchCross(scenario, alea1, alea2, q1, q2) {
  if (MODE === 'api') {
    const r = await fetch(
      `/api/hev/${scenario}/cross?alea1=${alea1}&alea2=${alea2}&q1=${q1}&q2=${q2}`
    )
    if (!r.ok) {
      const err = await r.json().catch(() => ({}))
      throw new Error(err.detail ?? `HTTP ${r.status}`)
    }
    return r.json()
  }
  const hev = await _fetchStatic(`hev_${scenario}`, `${BASE}/hev_${scenario}.geojson`)
  const features = _filterCross(hev.features, alea1, alea2, q1, q2)
  return { type: 'FeatureCollection', features }
}

const INFRA_FILES = {
  gares:       'liste-des-gares.geojson',
  passerelles: 'liste-des-passerelles.geojson',
  'ponts-route': 'liste-des-ponts-route.geojson',
  ouvrages:    'liste-ouvrages-en-terre.geojson',
}

export async function fetchInfra(type) {
  if (MODE === 'api') {
    const r = await fetch(`/api/infra/${type}`)
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    return r.json()
  }
  const file = INFRA_FILES[type]
  if (!file) throw new Error(`Type infra inconnu : ${type}`)
  return _fetchStatic(`infra_${type}`, `${BASE}/infra/${file}`)
}

export async function fetchCarroyage() {
  if (MODE === 'api') {
    const r = await fetch('/api/carroyage')
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    return r.json()
  }
  return _fetchStatic('carroyage', `${BASE}/carroyage_light.geojson`)
}
