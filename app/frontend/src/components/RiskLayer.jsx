import { GeoJSON } from 'react-leaflet'
import { useMemo } from 'react'
import L from 'leaflet'
import { riskColorAdaptive } from '../utils.js'
import { useApp } from '../AppContext.jsx'

export default function RiskLayer({ data, alea }) {
  const { riskStats } = useApp()
  if (!data || !data.features || data.features.length === 0) return null

  const riskKey = `R_${alea}`
  const renderer = useMemo(() => L.canvas({ padding: 0.5 }), [])

  return (
    <GeoJSON
      key={`risk-${alea}-${data.features.length}`}
      data={data}
      renderer={renderer}
      style={(feature) => {
        const val = feature.properties[riskKey] ?? 0
        return {
          color: riskColorAdaptive(val, riskStats),
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
