import { useEffect, useRef } from 'react'

export default function IntroModal({ onClose }) {
  const modalRef = useRef(null)
  const closeBtnRef = useRef(null)

  useEffect(() => {
    // Focus sur le bouton de fermeture à l'ouverture
    closeBtnRef.current?.focus()

    function handleKeyDown(e) {
      // Fermeture au clavier Échap
      if (e.key === 'Escape') {
        onClose()
        return
      }

      // Piège de focus : Tab/Maj+Tab reste dans la modale
      if (e.key === 'Tab') {
        const focusable = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (!focusable || focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div ref={modalRef} className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[#003189] rounded flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-xs leading-tight text-center">SNCF</span>
          </div>
          <h1 id="modal-title" className="text-xl font-bold text-gray-800">TRACC View SNCF</h1>
        </div>

        <p className="text-sm text-gray-600 mb-3">
          Outil de visualisation des risques climatiques sur le réseau ferroviaire national,
          basé sur la méthodologie <strong>VETSD</strong> et le modèle <strong>H×E×V</strong>.
        </p>

        <ul className="text-sm text-gray-600 mb-4 space-y-1 list-disc list-inside">
          <li>5 aléas climatiques : canicule, inondation, incendie, sécheresse, glissement</li>
          <li>4 horizons (référence, 2050 +2°C, 2065 +2,7°C, 2100 +4°C)</li>
          <li>6 090 segments de lignes ferrées — IDW k=8 p=2 (VETSD §5.2)</li>
          <li>Croisement dynamique de 2 aléas par quantile</li>
          <li>Infrastructures ponctuelles SNCF (gares, passerelles, ponts, ouvrages)</li>
        </ul>

        <p className="text-xs text-gray-400 mb-4">
          Données CEREMA TRACC 2023 · ALADIN63/CNRM-CM5 · Réseau ferré national SNCF Réseau
        </p>

        <div className="flex items-center justify-end gap-4 mb-4 pt-2 border-t border-gray-100">
          <img
            src="logo-sopra-steria.svg"
            alt="Sopra Steria"
            className="h-6 object-contain"
          />
          <img
            src="logo-enpc.png"
            alt="École des Ponts ParisTech"
            className="h-7 object-contain"
          />
        </div>

        <button
          ref={closeBtnRef}
          type="button"
          onClick={onClose}
          className="w-full bg-[#003189] text-white rounded py-2 text-sm font-medium hover:bg-blue-800 transition-colors"
        >
          Accéder à la carte
        </button>
      </div>
    </div>
  )
}
