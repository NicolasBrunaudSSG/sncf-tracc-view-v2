/**
 * Retourne la couleur de risque selon la valeur [0-1].
 * Dégradé continu : vert (#2ECC71) → orange (#F39C12) → rouge (#E74C3C)
 */
export function riskColor(value) {
  const v = Math.max(0, Math.min(1, value ?? 0))
  let r, g, b
  if (v < 0.5) {
    const t = v * 2
    r = Math.round(46  + (243 - 46)  * t)   // #2ECC71 → #F39C12
    g = Math.round(204 + (156 - 204) * t)
    b = Math.round(113 + (18  - 113) * t)
  } else {
    const t = (v - 0.5) * 2
    r = Math.round(243 + (231 - 243) * t)   // #F39C12 → #E74C3C
    g = Math.round(156 + (76  - 156) * t)
    b = Math.round(18  + (60  - 18)  * t)
  }
  return `rgb(${r},${g},${b})`
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
