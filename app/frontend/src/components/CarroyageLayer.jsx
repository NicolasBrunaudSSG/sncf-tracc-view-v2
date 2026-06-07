import { useMemo } from 'react'
import { GeoJSON } from 'react-leaflet'
import { riskColorAdaptive, computeStats } from '../utils.js'

// Colonnes R disponibles dans le carroyage allégé
// Format: "R_canicule_2050", "R_canicule_2065", "R_canicule_2100",
//         "R_inondation_2050", "R_inondation_2065"
const ALEA_R_PREFIX = {
  canicule:   'R_canicule',
  inondation: 'R_inondation',
}

export default function CarroyageLayer({ data, alea, scenario }) {
  if (!data || !data.features || data.features.length === 0) return null

  const prefix = ALEA_R_PREFIX[alea]
  const riskKey = (prefix && scenario !== 'reference') ? `${prefix}_${scenario}` : null

  // Calcul des stats adaptatif sur les cellules du carroyage
  const stats = useMemo(
    () => riskKey ? computeStats(data.features, riskKey) : null,
    [data.features, riskKey]
  )

  return (
    <GeoJSON
      key={`carroyage-${alea}-${scenario}`}
      data={data}
      style={(feature) => {
        const val = riskKey ? (feature.properties[riskKey] ?? 0) : 0
        return {
          fillColor: val > 0 ? riskColorAdaptive(val, stats) : '#94A3B8',
          fillOpacity: val > 0 ? 0.35 : 0.08,
          color: '#64748B',
          weight: 0.3,
          opacity: 0.4,
        }
      }}
      onEachFeature={(feature, layer) => {
        const p = feature.properties
        const val = riskKey ? (p[riskKey] ?? 0) : null
        const lines = [`<b>Carreau HEV</b>`]
        if (val !== null) lines.push(`R_${alea} (${scenario}) : ${val.toFixed(4)}`)
        // Afficher toutes les valeurs R disponibles
        for (const [key, label] of Object.entries({
          R_canicule_2050: 'Canicule 2050',
          R_canicule_2065: 'Canicule 2065',
          R_canicule_2100: 'Canicule 2100',
          R_inondation_2050: 'Inondation 2050',
          R_inondation_2065: 'Inondation 2065',
        })) {
          if (p[key] != null) lines.push(`${label} : ${Number(p[key]).toFixed(4)}`)
        }
        layer.bindTooltip(lines.join('<br/>'), { sticky: true })
      }}
    />
  )
}
