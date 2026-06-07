import { useApp } from '../AppContext.jsx'

const INFRA_TYPES = [
  { key: 'gares',       label: 'Gares',              color: '#1A73E8' },
  { key: 'passerelles', label: 'Passerelles',         color: '#E67E22' },
  { key: 'ponts-route', label: 'Ponts-route',         color: '#8E44AD' },
  { key: 'ouvrages',    label: 'Ouvrages en terre',   color: '#6D4C41' },
]

export default function LeftPanel({ onInfraToggle, onCarroyageToggle }) {
  const { showReseau, setShowReseau, infraVisible, infraData,
          selectedAlea, selectedScenario, threshold, riskFeatures,
          showCarroyage, carroyageData } = useApp()

  // Meme logique que MapView : cle R carroyage pour le filtre infra
  const ALEA_R_PREFIX = { canicule: 'R_canicule', inondation: 'R_inondation' }
  const infraRiskKey = (riskFeatures && selectedScenario !== 'reference' && ALEA_R_PREFIX[selectedAlea])
    ? `${ALEA_R_PREFIX[selectedAlea]}_${selectedScenario}`
    : null
  const hasRisk = !!(infraRiskKey && threshold > 0)

  function matchesRisk(f) {
    return (f.properties[infraRiskKey] ?? 0) >= threshold
  }

  function getAtRiskInfra(type) {
    if (!hasRisk) return []
    const features = infraData[type]?.features || []
    return features
      .filter(matchesRisk)
      .map((f) => f.properties.libelle || f.properties.code_uic || '—')
      .filter(Boolean)
      .slice(0, 20)
  }

  function getVisibleCount(type) {
    const features = infraData[type]?.features || []
    if (!hasRisk) return features.length
    return features.filter(matchesRisk).length
  }

  return (
    <div
      className="absolute left-2 z-[1000] bg-white rounded shadow-md p-3 w-48 sm:w-52 max-h-[calc(100vh-5rem)] overflow-y-auto"
      style={{ top: 'calc(48px + (100vh - 48px) / 2)', transform: 'translateY(-50%)' }}
      role="region"
      aria-label="Panneau de couches cartographiques"
    >
      <h2 className="font-semibold text-sm text-gray-700 mb-2">Réseau</h2>
      <label className="flex items-center gap-2 text-sm cursor-pointer mb-3">
        <input
          type="checkbox"
          checked={showReseau}
          onChange={(e) => setShowReseau(e.target.checked)}
          className="w-4 h-4"
        />
        Lignes ferroviaires
      </label>

      {/* ── Carroyage HEV ─────────────────────────────── */}
      <label className="flex items-center gap-2 text-sm cursor-pointer mb-1">
        <input
          type="checkbox"
          checked={showCarroyage}
          onChange={(e) => onCarroyageToggle(e.target.checked)}
          className="w-4 h-4"
        />
        <span
          className="inline-block w-2.5 h-2.5 rounded-sm shrink-0 border border-slate-400"
          style={{ background: 'linear-gradient(135deg, #2ECC71 0%, #F39C12 50%, #E74C3C 100%)' }}
        />
        Carroyage HEV 1km²
        {showCarroyage && !carroyageData && (
          <span className="text-xs text-gray-400 ml-auto">...</span>
        )}
      </label>
      {showCarroyage && carroyageData && (
        <div className="ml-6 mb-2 text-xs text-gray-400">
          {carroyageData.features.length.toLocaleString()} cellules
        </div>
      )}

      <hr className="mb-3" />

      <h2 className="font-semibold text-sm text-gray-700 mb-2">Infrastructures SNCF</h2>
      {INFRA_TYPES.map(({ key, label, color }) => {
        const atRisk = getAtRiskInfra(key)
        const isLoading = infraVisible[key] && !infraData[key]
        return (
          <div key={key} className="mb-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={infraVisible[key] || false}
                onChange={(e) => onInfraToggle(key, e.target.checked)}
                className="w-4 h-4"
              />
              <span
                className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: color }}
              />
              <span>{label}</span>
              {isLoading && <span className="text-xs text-gray-400 ml-auto">...</span>}
            </label>
            {infraVisible[key] && infraData[key] && (
              <div className="ml-6 mt-0.5 text-xs text-gray-400">
                {hasRisk
                  ? `${getVisibleCount(key)} / ${infraData[key].features.length} sur lignes à risque`
                  : `${infraData[key].features.length} éléments`}
              </div>
            )}
            {infraVisible[key] && hasRisk && atRisk.length > 0 && (
              <div className="ml-6 mt-1">
                <ul className="text-xs text-gray-500 space-y-0.5 max-h-28 overflow-y-auto">
                  {atRisk.map((name, i) => (
                    <li key={i} className="truncate" title={name}>
                      · {name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
