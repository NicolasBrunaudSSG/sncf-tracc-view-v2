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
    showLeftPanel, setShowLeftPanel,
    showRightPanel, setShowRightPanel,
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

      {/* Zone carte : taille explicite pour éviter CLS au chargement des GeoJSON */}
      <div className="absolute top-12 bottom-0 left-0 right-0" style={{ contain: 'strict' }}>
        {!reseauData && !loadError && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
            <span className="text-gray-400 text-sm">Chargement de la carte…</span>
          </div>
        )}
        <MapView reseauData={reseauData} riskData={riskFeatures} crossData={crossData} />
        <Legend />
      </div>

      {showLeftPanel && <LeftPanel onInfraToggle={handleInfraToggle} onCarroyageToggle={handleCarroyageToggle} />}

      {/* Bouton toggle volet gauche */}
      <button
        type="button"
        onClick={() => setShowLeftPanel(v => !v)}
        aria-label={showLeftPanel ? 'Masquer le volet gauche' : 'Afficher le volet gauche'}
        className="absolute z-[1001] bg-white border border-gray-200 shadow rounded-r px-1 py-3 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-all"
        style={{ left: showLeftPanel ? '200px' : '0px', top: 'calc(48px + (100vh - 48px) / 2)', transform: 'translateY(-50%)' }}
      >
        <span className="text-xs leading-none select-none">{showLeftPanel ? '◀' : '▶'}</span>
      </button>

      {/* Bouton toggle volet droit */}
      <button
        type="button"
        onClick={() => setShowRightPanel(v => !v)}
        aria-label={showRightPanel ? 'Masquer le volet droit' : 'Afficher le volet droit'}
        className="absolute z-[1001] bg-white border border-gray-200 shadow rounded-l px-1 py-3 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-all"
        style={{ right: showRightPanel ? '232px' : '0px', top: 'calc(48px + (100vh - 48px) / 2)', transform: 'translateY(-50%)' }}
      >
        <span className="text-xs leading-none select-none">{showRightPanel ? '▶' : '◀'}</span>
      </button>

      {showRightPanel && <RightPanel onApply={handleApply} onCross={handleCross} />
      }
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