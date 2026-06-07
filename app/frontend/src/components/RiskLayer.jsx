import { GeoJSON } from 'react-leaflet'
import { riskColor } from '../utils.js'

export default function RiskLayer({ data, alea }) {
  if (!data || !data.features || data.features.length === 0) return null

  const riskKey = `R_${alea}`

  return (
    <GeoJSON
      key={`risk-${alea}-${data.features.length}`}
      data={data}
      style={(feature) => {
        const val = feature.properties[riskKey] ?? 0
        return {
          color: riskColor(val),
          weight: 3,
          opacity: 0.9,
        }
      }}
      onEachFeature={(feature, layer) => {
        const p = feature.properties
        const val = p[riskKey] ?? 0
        layer.bindTooltip(
          `<b>Ligne ${p.code_ligne}</b><br/>` +
          `R_${alea} : ${val.toFixed(3)}<br/>` +
          `H : ${(p[`H_${alea}`] ?? 0).toFixed(3)} | ` +
          `E : ${(p[`E_${alea}`] ?? 0).toFixed(3)} | ` +
          `V : ${(p[`V_${alea}`] ?? 0).toFixed(3)}`,
          { sticky: true }
        )
      }}
    />
  )
}
