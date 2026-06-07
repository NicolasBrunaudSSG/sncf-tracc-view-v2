import { useState } from 'react'
import { useApp } from '../AppContext.jsx'
import { ALEAS_LABELS, SCENARIOS_LABELS } from '../utils.js'

export default function RightPanel({ onApply, onCross }) {
  const {
    selectedScenario, setSelectedScenario,
    selectedAlea, setSelectedAlea,
    threshold, setThreshold,
    crossAlea1, setCrossAlea1,
    crossAlea2, setCrossAlea2,
    crossQ, setCrossQ,
  } = useApp()

  const [inputThreshold, setInputThreshold] = useState(String(threshold))
  const [showCross, setShowCross] = useState(false)

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
    <div className="absolute top-16 right-2 z-[1000] bg-white rounded shadow-md p-4 w-60 max-h-[calc(100vh-5rem)] overflow-y-auto">
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
        style={{ background: 'linear-gradient(to right, #2ECC71, #F39C12, #E74C3C)' }}
      />
      <div className="flex justify-between text-xs text-gray-400 mb-3">
        <span>0</span><span>0.5</span><span>1</span>
      </div>

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
