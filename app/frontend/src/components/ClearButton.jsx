import { useApp } from '../AppContext.jsx'

export default function ClearButton() {
  const { setRiskFeatures, setCrossData, setThreshold, setSelectedScenario, setSelectedAlea, showRightPanel } = useApp()

  function handleClear() {
    setRiskFeatures(null)
    setCrossData(null)
    setThreshold(0)
    setSelectedScenario('reference')
    setSelectedAlea('canicule')
  }

  return (
    <button
      type="button"
      onClick={handleClear}
      aria-label="Réinitialiser la carte et effacer les résultats d'analyse"
      className="absolute top-3 z-[1001] bg-white border border-gray-300 text-sm rounded px-3 py-1 shadow hover:bg-gray-50 transition-all duration-200"
      style={{ right: showRightPanel ? '272px' : '12px' }}
    >
      Nettoyer la carte
    </button>
  )
}
