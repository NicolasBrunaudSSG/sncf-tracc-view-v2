/**
 * dataService.js — Abstraction API / mode statique (GitHub Pages)
 *
 * En mode backend  (VITE_DATA_MODE=api, défaut dev) :
 *   → appels vers /api/* proxifiés vers FastAPI
 *
 * En mode statique (VITE_DATA_MODE=static) :
 *   → lecture des fichiers JSON dans /data/* + filtrage côté client
 */

import { computeStats } from '../utils.js'

const MODE = import.meta.env.VITE_DATA_MODE ?? 'api'
const BASE = import.meta.env.VITE_DATA_BASE ?? '/data'

// ─── Manifest (résolution des noms hachés en mode statique) ──────────────────

let _manifest = null

async function _getManifest() {
  if (_manifest) return _manifest
  try {
    const r = await fetch(`${BASE}/manifest.json`, { cache: 'no-store' })
    if (r.ok) {
      _manifest = await r.json()
    }
  } catch {
    _manifest = {}
  }
  return _manifest ?? {}
}

/**
 * Résout le nom réel d'un fichier data depuis le manifest.
 * Si le manifest n'a pas de hash pour cette clé, on retombe sur le nom original.
 */
async function _resolveUrl(logicalKey, fallbackName) {
  const manifest = await _getManifest()
  const hashedName = manifest[logicalKey]
  const name = hashedName ?? fallbackName
  // infra/ prefix est déjà dans la clé du manifest
  if (logicalKey.startsWith('infra/')) {
    const subdir = 'infra/'
    const fileName = name
    return `${BASE}/${subdir}${fileName}`
  }
  return `${BASE}/${name}`
}

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
  const url = await _resolveUrl('reseau_national', 'reseau_national.geojson')
  return _fetchStatic('reseau', url)
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
  const url = await _resolveUrl(`hev_${scenario}`, `hev_${scenario}.geojson`)
  const hev = await _fetchStatic(`hev_${scenario}`, url)
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
  const url = await _resolveUrl(`hev_${scenario}`, `hev_${scenario}.geojson`)
  const hev = await _fetchStatic(`hev_${scenario}`, url)
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
  const stem = file.replace('.geojson', '')
  const url = await _resolveUrl(`infra/${stem}`, file).then(u => u)
  return _fetchStatic(`infra_${type}`, url)
}

/**
 * Retourne les statistiques de distribution (min/Q25/Q50/Q75/max)
 * pour un aléa donné sur un scénario, sans appliquer de seuil.
 * Utilise le cache HEV statique ou appelle l'API avec threshold=0.
 */
export async function fetchRiskStats(scenario, alea) {
  if (MODE === 'api') {
    const r = await fetch(`/api/hev/${scenario}/risk?alea=${alea}&threshold=0`)
    if (!r.ok) return null
    const data = await r.json()
    return computeStats(data.features, `R_${alea}`)
  }
  const url = await _resolveUrl(`hev_${scenario}`, `hev_${scenario}.geojson`)
  const hev = await _fetchStatic(`hev_${scenario}`, url)
  return computeStats(hev.features, `R_${alea}`)
}

export async function fetchCarroyage() {
  if (MODE === 'api') {
    const r = await fetch('/api/carroyage')
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    return r.json()
  }
  const url = await _resolveUrl('carroyage_light', 'carroyage_light.geojson')
  return _fetchStatic('carroyage', url)
}
