import { GeoJSON, useMap } from 'react-leaflet'
import { useEffect, useMemo } from 'react'
import L from 'leaflet'

export default function RailwayLayer({ data, dimmed = false }) {
  const map = useMap()

  useEffect(() => {
    if (data && data.features && data.features.length > 0) {
      // Pas de fitBounds automatique — on garde le centrage France
    }
  }, [data, map])

  if (!data) return null

  // Canvas renderer : réduit le DOM de ~6 000 éléments SVG
  const renderer = useMemo(() => L.canvas({ padding: 0.5 }), [])

  return (
    <GeoJSON
      key={`reseau-${dimmed}`}
      data={data}
      renderer={renderer}
      style={() => ({
        color: dimmed ? '#94A3B8' : '#3B82F6',
        weight: dimmed ? 1 : 1.5,
        opacity: dimmed ? 0.35 : 0.7,
      })}
    />
  )
}
