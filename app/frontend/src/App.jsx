import { useEffect, useState } from 'react'
import { AppProvider, useApp } from './AppContext.jsx'
import MapView from './components/MapView.jsx'
import LeftPanel from './components/LeftPanel.jsx'
import RightPanel from './components/RightPanel.jsx'
import ClearButton from './components/ClearButton.jsx'
import IntroModal from './components/IntroModal.jsx'
import Legend from './components/Legend.jsx'
import { fetchReseau, fetchRisk, fetchCross, fetchInfra, fetchCarroyage } from './services/dataService.js'

function AppInner() {
  const [reseauData, setReseauData] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const {
    showIntro, setShowIntro,
    riskFeatures, setRiskFeatures,
    crossData, setCrossData,
    infraData, setInfraData,
    setInfraVisible,
    setShowCarroyage, setCarroyageData,
  } = useApp()

  useEffect(() => {
    fetchReseau()
      .then(setReseauData)
      .catch((e) => setLoadError(e.message))
  }, [])

  async function handleApply(scenario, alea, threshold) {
    try {
      const data = await fetchRisk(scenario, alea, threshold)
      setRiskFeatures(data)
      setCrossData(null)
    } catch (e) {
      console.error('Erreur risk :', e.message)
    }
  }

  async function handleCross(scenario, alea1, alea2, q1, q2) {
    try {
      const data = await fetchCross(scenario, alea1, alea2, q1, q2)
      setCrossData(data)
      setRiskFeatures(null)
    } catch (e) {
      console.error('Erreur cross :', e.message)
    }
  }

  async function handleInfraToggle(type, visible) {
    setInfraVisible((prev) => ({ ...prev, [type]: visible }))
    if (visible && !infraData[type]) {
      try {
        const data = await fetchInfra(type)
        setInfraData((prev) => ({ ...prev, [type]: data }))
      } catch (e) {
        console.error(`Erreur infra/${type} :`, e.message)
      }
    }
  }

  async function handleCarroyageToggle(visible) {
    setShowCarroyage(visible)
    if (visible) {
      try {
        const data = await fetchCarroyage()
        setCarroyageData(data)
      } catch (e) {
        console.error('Erreur carroyage :', e.message)
      }
    }
  }

  return (
    <div className="relative w-full h-full">
      {showIntro && <IntroModal onClose={() => setShowIntro(false)} />}

      <div className="absolute top-0 left-0 right-0 z-[1000] h-12 bg-[#003189] text-white flex items-center px-4 shadow">
        <span className="font-bold text-base tracking-wide">SNCF TRACC View</span>
        {loadError && (
          <span className="ml-4 text-red-300 text-xs">Backend non disponible : {loadError}</span>
        )}
        <button
          type="button"
          onClick={() => setShowIntro(true)}
          aria-label="Ouvrir l'aide — présentation de l'application"
          className="ml-auto text-white/70 hover:text-white text-xs border border-white/30 rounded px-2 py-0.5 transition-colors"
        >
          ? Aide
        </button>
      </div>

      <div className="absolute top-12 bottom-0 left-0 right-0">
        <MapView reseauData={reseauData} riskData={riskFeatures} crossData={crossData} />
        <Legend />
      </div>

      <LeftPanel onInfraToggle={handleInfraToggle} onCarroyageToggle={handleCarroyageToggle} />
      <RightPanel onApply={handleApply} onCross={handleCross} />
      <ClearButton />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  )
}