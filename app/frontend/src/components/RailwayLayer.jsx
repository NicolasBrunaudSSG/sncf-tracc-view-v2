import { GeoJSON, useMap } from 'react-leaflet'
import { useEffect } from 'react'

export default function RailwayLayer({ data, dimmed = false }) {
  const map = useMap()

  useEffect(() => {
    if (data && data.features && data.features.length > 0) {
      // Pas de fitBounds automatique — on garde le centrage France
    }
  }, [data, map])

  if (!data) return null

  return (
    <GeoJSON
      key={`reseau-${dimmed}`}
      data={data}
      style={() => ({
        color: dimmed ? '#94A3B8' : '#3B82F6',
        weight: dimmed ? 1 : 1.5,
        opacity: dimmed ? 0.35 : 0.7,
      })}
    />
  )
}
