import { CircleMarker, Polyline, Tooltip } from 'react-leaflet'

const INFRA_STYLES = {
  'gares':       { color: '#1A73E8', fillColor: '#1A73E8', radius: 5 },
  'passerelles': { color: '#E67E22', fillColor: '#E67E22', radius: 4 },
  'ponts-route': { color: '#8E44AD', fillColor: '#8E44AD', radius: 3 },
  'ouvrages':    { color: '#6D4C41', weight: 2 },
}

export default function InfraLayer({ type, data, riskKey, threshold }) {
  if (!data || !data.features || data.features.length === 0) return null

  const style = INFRA_STYLES[type] || { color: '#555', radius: 4 }

  // riskKey=null -> pas de filtre actif, afficher tout
  // riskKey=string -> afficher uniquement si R_canicule_2050 >= threshold
  //   La valeur R vient de la cellule carroyage dont l'infra est spatialementle plus proche
  const features = (riskKey && threshold > 0)
    ? data.features.filter((f) => (f.properties[riskKey] ?? 0) >= threshold)
    : data.features

  return features.map((f, i) => {
    const geom = f.geometry
    if (!geom) return null
    const p = f.properties
    const name = p.libelle || p.code_uic || `${type} ${i}`
    const codeLigne = p.code_ligne ? ` (L.${p.code_ligne})` : ''

    if (geom.type === 'Point') {
      const [lng, lat] = geom.coordinates
      return (
        <CircleMarker
          key={`${type}-${i}`}
          center={[lat, lng]}
          radius={style.radius}
          pathOptions={{
            color: style.color,
            fillColor: style.fillColor,
            fillOpacity: 0.85,
            weight: 1.5,
          }}
        >
          <Tooltip>{name}{codeLigne}</Tooltip>
        </CircleMarker>
      )
    }

    if (geom.type === 'LineString') {
      const positions = geom.coordinates.map(([lng, lat]) => [lat, lng])
      return (
        <Polyline
          key={`${type}-${i}`}
          positions={positions}
          pathOptions={{ color: style.color, weight: style.weight || 2, opacity: 0.85 }}
        >
          <Tooltip>{name}{codeLigne}</Tooltip>
        </Polyline>
      )
    }

    return null
  })
}
