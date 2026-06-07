import { GeoJSON } from 'react-leaflet'
import { ALEAS_LABELS } from '../utils.js'

export default function CrossLayer({ data, alea1, alea2 }) {
  if (!data || !data.features || data.features.length === 0) return null

  const label1 = ALEAS_LABELS[alea1] || alea1
  const label2 = ALEAS_LABELS[alea2] || alea2

  return (
    <GeoJSON
      key={`cross-${alea1}-${alea2}-${data.features.length}`}
      data={data}
      style={() => ({
        color: '#8E44AD',
        weight: 4,
        opacity: 0.9,
      })}
      onEachFeature={(feature, layer) => {
        const p = feature.properties
        const r1 = (p[`R_${alea1}`] ?? 0).toFixed(3)
        const r2 = (p[`R_${alea2}`] ?? 0).toFixed(3)
        layer.bindTooltip(
          `<b>Ligne ${p.code_ligne}</b><br/>` +
          `<span style="color:#8E44AD"><b>⚠ Double risque</b></span><br/>` +
          `${label1} : ${r1} &nbsp; ${label2} : ${r2}`,
          { sticky: true }
        )
      }}
    />
  )
}
