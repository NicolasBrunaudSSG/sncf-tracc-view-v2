/**
 * Dégradé 4 stops pour une meilleure lisibilité par quartile :
 *   0.00 → vert clair    (#6FCF97)
 *   0.25 → jaune         (#F7DC6F)
 *   0.50 → orange        (#F39C12)
 *   0.75 → rouge         (#E74C3C)
 *   1.00 → rouge foncé   (#7B241C)
 */
export function riskColor(value) {
  const v = Math.max(0, Math.min(1, value ?? 0))

  // Palette : 5 couleurs pour 4 intervalles
  const stops = [
    [111, 207, 151],  // #6FCF97 vert clair
    [247, 220, 111],  // #F7DC6F jaune
    [243, 156,  18],  // #F39C12 orange
    [231,  76,  60],  // #E74C3C rouge
    [123,  36,  28],  // #7B241C rouge foncé
  ]

  const seg = v * (stops.length - 1)
  const i = Math.min(Math.floor(seg), stops.length - 2)
  const t = seg - i

  const [r1, g1, b1] = stops[i]
  const [r2, g2, b2] = stops[i + 1]

  return `rgb(${Math.round(r1 + (r2 - r1) * t)},${Math.round(g1 + (g2 - g1) * t)},${Math.round(b1 + (b2 - b1) * t)})`
}

/**
 * Calcule les statistiques de distribution pour un champ de risque.
 * Ignore les valeurs nulles ou égales à zéro.
 * @param {Array} features - tableau de features GeoJSON
 * @param {string} rKey - clé ex: "R_canicule"
 * @returns {{min, q25, q50, q75, max, count} | null}
 */
export function computeStats(features, rKey) {
  const vals = features
    .map((f) => f?.properties?.[rKey] ?? 0)
    .filter((v) => v > 0)
    .sort((a, b) => a - b)
  if (!vals.length) return null
  const q = (p) => vals[Math.min(Math.floor(p * vals.length), vals.length - 1)]
  return {
    min: vals[0],
    q25: q(0.25),
    q50: q(0.50),
    q75: q(0.75),
    max: vals[vals.length - 1],
    count: vals.length,
  }
}

/**
 * Remapping piecewise quantile : normalise val vers [0,1] selon les
 * ancres statistiques réelles Q25/Q50/Q75 avant d'appliquer riskColor.
 * Si stats est null, retombe sur le mapping linéaire direct.
 * @param {number} val  - valeur brute R_xxx
 * @param {{min,q25,q50,q75,max}|null} stats
 */
export function riskColorAdaptive(val, stats) {
  if (!stats) return riskColor(val ?? 0)
  const { min, q25, q50, q75, max } = stats
  const v = val ?? 0
  let norm
  if (v <= q25) {
    norm = 0.25 * (v - min) / Math.max(q25 - min, 1e-9)
  } else if (v <= q50) {
    norm = 0.25 + 0.25 * (v - q25) / Math.max(q50 - q25, 1e-9)
  } else if (v <= q75) {
    norm = 0.50 + 0.25 * (v - q50) / Math.max(q75 - q50, 1e-9)
  } else {
    norm = 0.75 + 0.25 * (v - q75) / Math.max(max - q75, 1e-9)
  }
  return riskColor(Math.max(0, Math.min(1, norm)))
}

export const ALEAS_LABELS = {
  canicule:   'Canicule',
  incendie:   'Incendie',
  secheresse: 'Sécheresse',
  inondation: 'Inondation',
  glissement: 'Glissement',
}

export const SCENARIOS_LABELS = {
  reference: 'Référence (1976-2005)',
  '2050': 'Horizon 2050 (+2°C)',
  '2065': 'Horizon 2065 (+2,7°C)',
  '2100': 'Horizon 2100 (+4°C)',
}
