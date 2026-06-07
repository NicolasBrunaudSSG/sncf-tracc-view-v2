import { createContext, useContext, useState } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  // Réseau + risque
  const [showReseau, setShowReseau] = useState(true)
  const [selectedScenario, setSelectedScenario] = useState('reference')
  const [selectedAlea, setSelectedAlea] = useState('canicule')
  const [threshold, setThreshold] = useState(0)
  const [riskFeatures, setRiskFeatures] = useState(null)

  // Croisement d'aléas
  const [crossData, setCrossData] = useState(null)
  const [crossAlea1, setCrossAlea1] = useState('canicule')
  const [crossAlea2, setCrossAlea2] = useState('inondation')
  const [crossQ, setCrossQ] = useState(0.75)

  // Infrastructures ponctuelles
  const [infraVisible, setInfraVisible] = useState({
    gares: false,
    passerelles: false,
    'ponts-route': false,
    ouvrages: false,
  })
  const [infraData, setInfraData] = useState({})

  // Statistiques de distribution du risque (pour le remapping adaptatif)
  const [riskStats, setRiskStats] = useState(null)

  // Visibilité des volets latéraux
  const [showLeftPanel, setShowLeftPanel] = useState(true)
  const [showRightPanel, setShowRightPanel] = useState(true)

  // Modal d'intro
  const [showIntro, setShowIntro] = useState(true)

  // Carroyage HEV
  const [showCarroyage, setShowCarroyage] = useState(false)
  const [carroyageData, setCarroyageData] = useState(null)

  return (
    <AppContext.Provider value={{
      showReseau, setShowReseau,
      selectedScenario, setSelectedScenario,
      selectedAlea, setSelectedAlea,
      threshold, setThreshold,
      riskFeatures, setRiskFeatures,
      crossData, setCrossData,
      crossAlea1, setCrossAlea1,
      crossAlea2, setCrossAlea2,
      crossQ, setCrossQ,
      infraVisible, setInfraVisible,
      infraData, setInfraData,
      riskStats, setRiskStats,
      showLeftPanel, setShowLeftPanel,
      showRightPanel, setShowRightPanel,
      showIntro, setShowIntro,
      showCarroyage, setShowCarroyage,
      carroyageData, setCarroyageData,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
