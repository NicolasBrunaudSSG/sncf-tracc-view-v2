import { useApp } from '../AppContext.jsx'
import { riskColor } from '../utils.js'

// Même remapping piecewise que riskColorAdaptive dans utils.js
function adaptiveNorm(val, stats) {
  if (!stats) return Math.max(0, Math.min(1, val ?? 0))
  const { min, q25, q50, q75, max } = stats
  const v = val ?? 0
  let norm
  if (v <= q25)      norm = 0.25 * (v - min)   / Math.max(q25 - min,  1e-9)
  else if (v <= q50) norm = 0.25 + 0.25 * (v - q25) / Math.max(q50 - q25, 1e-9)
  else if (v <= q75) norm = 0.50 + 0.25 * (v - q50) / Math.max(q75 - q50, 1e-9)
  else               norm = 0.75 + 0.25 * (v - q75) / Math.max(max - q75,  1e-9)
  return Math.max(0, Math.min(1, norm))
}

export default function Legend() {
  const { threshold, riskStats, selectedAlea } = useApp()

  // La barre représente l'échelle adaptive 0→1 (normalisé par quantiles)
  // Les stops correspondent aux 5 couleurs de la palette (0, 0.25, 0.5, 0.75, 1.0)
  const gradientStops = [1, 0.75, 0.5, 0.25, 0]
    .map((v) => `${riskColor(v)} ${((1 - v) * 100).toFixed(0)}%`)
    .join(', ')

  // Position du marqueur : même remapping que sur la carte
  const markerNorm = threshold > 0 ? adaptiveNorm(threshold, riskStats) : null
  const markerPct = markerNorm !== null ? (1 - markerNorm) * 100 : null

  // Labels : valeurs réelles si stats disponibles
  const leftLabels = riskStats
    ? [riskStats.max, riskStats.q75, riskStats.q50, riskStats.q25, riskStats.min]
    : [1, 0.75, 0.5, 0.25, 0]
  const rightLabels = riskStats
    ? ['max', 'Q75', 'Q50', 'Q25', 'min']
    : ['1.0', '0.75', '0.50', '0.25', '0.0']

  return (
    <div className="absolute bottom-8 right-2 z-[1000] bg-white/90 rounded shadow-md p-2 select-none pointer-events-none">
      <div className="text-xs font-semibold text-gray-600 mb-1 text-center capitalize">{selectedAlea}</div>
      <div className="flex gap-1.5 items-stretch h-36">
        {/* Valeurs réelles gauche */}
        <div className="flex flex-col justify-between text-xs text-gray-400 text-right leading-none w-10">
          {leftLabels.map((v, i) => (
            <span key={i}>{typeof v === 'number' ? v.toFixed(3) : v}</span>
          ))}
        </div>

        {/* Barre de gradient */}
        <div
          className="relative w-4 rounded"
          style={{ background: `linear-gradient(to top, ${gradientStops})` }}
        >
          {/* Tirets aux positions des quantiles (fixes à 25/50/75% de la barre) */}
          {[0.25, 0.5, 0.75].map((q) => (
            <div
              key={q}
              className="absolute left-0 right-0 border-t border-white/60"
              style={{ top: `${(1 - q) * 100}%` }}
            />
          ))}
          {/* Marqueur de seuil — positionné sur l'échelle adaptative */}
          {markerPct !== null && markerPct >= 0 && markerPct <= 100 && (
            <div
              className="absolute left-0 right-0 border-t-2 border-black"
              style={{ top: `${markerPct}%` }}
            />
          )}
        </div>

        {/* Tags droite */}
        <div className="flex flex-col justify-between text-xs text-gray-400 text-left leading-none">
          {rightLabels.map((t, i) => (
            <span key={i}>{t}</span>
          ))}
        </div>
      </div>

      {threshold > 0 && (
        <div className="text-xs text-center text-gray-600 mt-1 font-medium">
          seuil {threshold.toFixed(3)}
        </div>
      )}
    </div>
  )
}
