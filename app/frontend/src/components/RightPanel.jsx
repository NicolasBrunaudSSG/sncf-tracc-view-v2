import { useState, useEffect } from 'react'
import { useApp } from '../AppContext.jsx'
import { ALEAS_LABELS, SCENARIOS_LABELS, riskColor } from '../utils.js'
import { fetchRiskStats } from '../services/dataService.js'

export default function RightPanel({ onApply, onCross }) {
  const {
    selectedScenario, setSelectedScenario,
    selectedAlea, setSelectedAlea,
    threshold, setThreshold,
    crossAlea1, setCrossAlea1,
    crossAlea2, setCrossAlea2,
    crossQ, setCrossQ,
    riskStats, setRiskStats,
  } = useApp()

  const [inputThreshold, setInputThreshold] = useState(String(threshold))
  const [showCross, setShowCross] = useState(false)
  const [loadingStats, setLoadingStats] = useState(false)

  // Charger les stats dès que scénario ou aléa change
  useEffect(() => {
    setLoadingStats(true)
    setRiskStats(null)
    fetchRiskStats(selectedScenario, selectedAlea)
      .then((s) => setRiskStats(s))
      .catch(() => setRiskStats(null))
      .finally(() => setLoadingStats(false))
  }, [selectedScenario, selectedAlea])

  function handleApply() {
    const val = parseFloat(inputThreshold)
    const clamped = isNaN(val) ? 0 : Math.min(1, Math.max(0, val))
    setThreshold(clamped)
    onApply(selectedScenario, selectedAlea, clamped)
  }

  function handleCross() {
    onCross(selectedScenario, crossAlea1, crossAlea2, crossQ, crossQ)
  }

  return (
    <div
      className="absolute right-2 z-[1000] bg-white rounded shadow-md p-4 w-56 sm:w-60 max-h-[calc(100vh-5rem)] overflow-y-auto"
      style={{ top: 'calc(48px + (100vh - 48px) / 2)', transform: 'translateY(-50%)' }}
    >
      <h2 className="font-semibold text-sm text-gray-700 mb-3" id="scenarios-label">Scénarios climatiques</h2>

      {Object.entries(SCENARIOS_LABELS).map(([key, label]) => (
        <label key={key} className="flex items-center gap-2 text-sm cursor-pointer mb-1">
          <input
            type="radio"
            name="scenario"
            value={key}
            checked={selectedScenario === key}
            onChange={() => setSelectedScenario(key)}
            className="w-4 h-4"
          />
          <span className={key === 'reference' ? 'text-gray-500' : ''}>{label}</span>
        </label>
      ))}

      <hr className="my-3" />

      <h2 className="font-semibold text-sm text-gray-700 mb-2" id="alea-label">Indice de risque</h2>
      <select
        id="select-alea"
        aria-labelledby="alea-label"
        value={selectedAlea}
        onChange={(e) => setSelectedAlea(e.target.value)}
        className="w-full border rounded text-sm px-2 py-1 mb-3"
      >
        {Object.entries(ALEAS_LABELS).map(([key, label]) => (
          <option key={key} value={key}>{label}</option>
        ))}
      </select>

      <h2 className="font-semibold text-sm text-gray-700 mb-2" id="seuil-label">Seuil de risque</h2>
      <div className="flex gap-2 items-center mb-2">
        <input
          id="input-seuil"
          type="number"
          min="0"
          max="1"
          step="0.05"
          aria-labelledby="seuil-label"
          aria-describedby="seuil-desc"
          value={inputThreshold}
          onChange={(e) => setInputThreshold(e.target.value)}
          className="border rounded text-sm px-2 py-1 w-20"
        />
        <button
          type="button"
          onClick={handleApply}
          className="bg-blue-600 text-white text-sm rounded px-3 py-1 hover:bg-blue-700"
        >
          Appliquer
        </button>
      </div>

      <div className="h-3 rounded mb-1"
        id="seuil-desc"
        aria-hidden="true"
        style={{ background: `linear-gradient(to right, ${[0, 0.25, 0.5, 0.75, 1].map(v => riskColor(v)).join(', ')})` }}
      />
      <div className="flex justify-between text-xs text-gray-400 mb-2">
        <span>0</span><span>0.5</span><span>1</span>
      </div>

      {/* ─── Aide contextuelle quantiles ──────────────────────────────── */}
      {loadingStats && (
        <div className="text-xs text-gray-400 italic mb-3">Calcul des quantiles…</div>
      )}
      {!loadingStats && riskStats && (
        <div className="bg-gray-50 rounded p-2 mb-3 text-xs">
          <div className="flex justify-between text-gray-500 mb-1.5">
            <span>min</span>
            <span className="text-blue-500 font-medium">Q25</span>
            <span className="text-orange-500 font-medium">Q50</span>
            <span className="text-red-500 font-medium">Q75</span>
            <span>max</span>
          </div>
          <div className="flex justify-between text-gray-700 font-mono mb-2">
            <span>{riskStats.min.toFixed(3)}</span>
            <button
              type="button"
              title="Utiliser Q25 comme seuil"
              onClick={() => setInputThreshold(riskStats.q25.toFixed(3))}
              className="text-blue-600 hover:underline font-medium"
            >{riskStats.q25.toFixed(3)}</button>
            <button
              type="button"
              title="Utiliser Q50 comme seuil"
              onClick={() => setInputThreshold(riskStats.q50.toFixed(3))}
              className="text-orange-500 hover:underline font-medium"
            >{riskStats.q50.toFixed(3)}</button>
            <button
              type="button"
              title="Utiliser Q75 comme seuil"
              onClick={() => setInputThreshold(riskStats.q75.toFixed(3))}
              className="text-red-500 hover:underline font-medium"
            >{riskStats.q75.toFixed(3)}</button>
            <span>{riskStats.max.toFixed(3)}</span>
          </div>
          <div className="text-gray-400 text-center">
            {riskStats.count.toLocaleString('fr-FR')} segments · cliquer pour appliquer
          </div>
        </div>
      )}
      {!loadingStats && !riskStats && (
        <div className="text-xs text-gray-400 italic mb-3">Aucune donnée de risque disponible</div>
      )}

      <hr className="mb-3" />

      {/* ─── Section croisement d'aléas ───────────────────────────── */}
      <button
        type="button"
        onClick={() => setShowCross((v) => !v)}
        aria-expanded={showCross}
        aria-controls="cross-panel"
        className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 mb-2"
      >
        <span>Croisement d’aléas</span>
        <span className="text-gray-400 text-xs" aria-hidden="true">{showCross ? '▲' : '▼'}</span>
      </button>

      {showCross && (
        <div id="cross-panel">
          <div className="flex gap-2 mb-2">
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-1" id="alea1-label">Aléa 1</div>
              <select
                aria-labelledby="alea1-label"
                value={crossAlea1}
                onChange={(e) => setCrossAlea1(e.target.value)}
                className="w-full border rounded text-xs px-1 py-1"
              >
                {Object.entries(ALEAS_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-1" id="alea2-label">Aléa 2</div>
              <select
                aria-labelledby="alea2-label"
                value={crossAlea2}
                onChange={(e) => setCrossAlea2(e.target.value)}
                className="w-full border rounded text-xs px-1 py-1"
              >
                {Object.entries(ALEAS_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Quantile min.</span>
              <span className="font-medium">{Math.round(crossQ * 100)}e percentile</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="0.95"
              step="0.05"
              aria-label="Quantile minimum pour le croisement d'aléas"
              aria-valuenow={crossQ}
              aria-valuemin="0.5"
              aria-valuemax="0.95"
              value={crossQ}
              onChange={(e) => setCrossQ(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-300">
              <span>50%</span>
              <span>95%</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCross}
            className="w-full bg-purple-600 text-white text-sm rounded px-3 py-1.5 hover:bg-purple-700"
          >
            Croiser les aléas
          </button>

          <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
            <span className="inline-block w-3 h-3 rounded-full bg-[#8E44AD]" />
            Segments à double risque
          </div>
        </div>
      )}
    </div>
  )
}
