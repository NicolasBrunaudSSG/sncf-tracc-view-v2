import { useApp } from '../AppContext.jsx'

export default function Legend() {
  const { threshold } = useApp()

  // Position of threshold marker on the gradient bar (top = 1.0, bottom = 0.0)
  const markerPct = (1 - threshold) * 100

  return (
    <div className="absolute bottom-8 right-2 z-[1000] bg-white/90 rounded shadow-md p-2 select-none pointer-events-none">
      <div className="text-xs font-semibold text-gray-600 mb-1 text-center">Risque</div>
      <div className="flex gap-1.5 items-stretch h-36">
        {/* Scale labels */}
        <div className="flex flex-col justify-between text-xs text-gray-400 text-right leading-none">
          <span>1.0</span>
          <span>0.75</span>
          <span>0.50</span>
          <span>0.25</span>
          <span>0.0</span>
        </div>

        {/* Gradient bar */}
        <div
          className="relative w-4 rounded"
          style={{ background: 'linear-gradient(to top, #2ECC71, #F39C12 50%, #E74C3C)' }}
        >
          {/* Quartile dashes */}
          {[0.25, 0.5, 0.75].map((q) => (
            <div
              key={q}
              className="absolute left-0 right-0 border-t border-white/50"
              style={{ top: `${(1 - q) * 100}%` }}
            />
          ))}
          {/* Threshold marker */}
          {threshold > 0 && (
            <div
              className="absolute left-0 right-0 border-t-2 border-black"
              style={{ top: `${markerPct}%` }}
            />
          )}
        </div>

        {/* Quartile labels */}
        <div className="flex flex-col justify-between text-xs text-gray-400 text-left leading-none">
          <span className="invisible">·</span>
          <span>Q3</span>
          <span>Q2</span>
          <span>Q1</span>
          <span className="invisible">·</span>
        </div>
      </div>

      {threshold > 0 && (
        <div className="text-xs text-center text-gray-600 mt-1 font-medium">
          seuil {threshold.toFixed(2)}
        </div>
      )}
    </div>
  )
}
