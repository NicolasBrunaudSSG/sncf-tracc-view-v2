import { useApp } from '../AppContext.jsx'

export default function ClearButton() {
  const { setRiskFeatures, setCrossData, setThreshold, setSelectedScenario, setSelectedAlea } = useApp()

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
      className="absolute top-3 right-2 z-[1000] bg-white border border-gray-300 text-sm rounded px-3 py-1 shadow hover:bg-gray-50"
    >
      Nettoyer la carte
    </button>
  )
}
