import { MapContainer, TileLayer } from 'react-leaflet'
import { useApp } from '../AppContext.jsx'
import RailwayLayer from './RailwayLayer.jsx'
import RiskLayer from './RiskLayer.jsx'
import InfraLayer from './InfraLayer.jsx'
import CrossLayer from './CrossLayer.jsx'
import CarroyageLayer from './CarroyageLayer.jsx'

// Fix icônes Leaflet avec Vite
import L from 'leaflet'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({ iconUrl, shadowUrl: iconShadow })

export default function MapView({ reseauData, riskData, crossData }) {
  const { selectedAlea, selectedScenario, threshold, infraVisible, infraData,
          crossAlea1, crossAlea2,
          showCarroyage, carroyageData } = useApp()

  // Mapping alea -> prefixe colonne R dans les infras enrichies
  // Les alea sans R pre-calcule (incendie, secheresse, glissement) n'ont pas de colonne R
  const ALEA_R_PREFIX = { canicule: 'R_canicule', inondation: 'R_inondation' }

  // Cle de la colonne R a utiliser pour filtrer les infras
  // ex: "R_canicule_2050" — null si pas de filtre actif ou alea sans R pivot
  const infraRiskKey = (riskData && selectedScenario !== 'reference' && ALEA_R_PREFIX[selectedAlea])
    ? `${ALEA_R_PREFIX[selectedAlea]}_${selectedScenario}`
    : null

  const hasActiveLayer = !!(riskData || crossData)

  return (
    <MapContainer
      center={[46.8, 2.3]}
      zoom={6}
      style={{ height: '100%', width: '100%' }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Carroyage HEV 1km² — affiché en dessous de tout sauf le fond de carte */}
      {showCarroyage && carroyageData && (
        <CarroyageLayer data={carroyageData} alea={selectedAlea} scenario={selectedScenario} />
      )}

      {/* Réseau toujours affiché ; grisé quand un risque est actif */}
      {reseauData && (
        <RailwayLayer data={reseauData} dimmed={hasActiveLayer} />
      )}

      {/* Uniquement les lignes impactées (au-dessus du seuil), en dégradé */}
      {riskData && (
        <RiskLayer data={riskData} alea={selectedAlea} />
      )}

      {crossData && (
        <CrossLayer data={crossData} alea1={crossAlea1} alea2={crossAlea2} />
      )}

      {/* Infras : filtrées via la valeur R de leur cellule carroyage la plus proche */}
      {Object.entries(infraVisible).map(([type, visible]) =>
        visible && infraData[type] ? (
          <InfraLayer key={type} type={type} data={infraData[type]} riskKey={infraRiskKey} threshold={threshold} />
        ) : null
      )}
    </MapContainer>
  )
}
