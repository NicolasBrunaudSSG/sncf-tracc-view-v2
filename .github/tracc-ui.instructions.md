---
applyTo: "app/frontend/src/**"
---

# Workflow — Tâche UI/Composant TRACC View SNCF

## Fichiers à lire en priorité (dans cet ordre)

1. Le composant ciblé directement (ex: `Legend.jsx`, `RightPanel.jsx`)
2. `AppContext.jsx` si la tâche touche un state global
3. `utils.js` **uniquement** si la tâche mentionne couleur, gradient ou statistiques

**Ne pas lire** `App.jsx`, `dataService.js`, `vite.config.js` sauf mention explicite.

## Patterns UI établis

### Centrage vertical dans la zone carte (hors header 48px)
```jsx
style={{ top: 'calc(48px + (100vh - 48px) / 2)', transform: 'translateY(-50%)' }}
```

### Position dynamique selon volet droit
```jsx
style={{ right: showRightPanel ? '256px' : '8px' }}   // légende / ClearButton
style={{ right: showRightPanel ? '232px' : '0px' }}   // bouton toggle droit
```

### Gradient horizontal RightPanel (vert gauche → rouge droite)
```jsx
[0, 0.25, 0.5, 0.75, 1].map(v => riskColor(v)).join(', ')
// direction: to right
```

### Gradient vertical Legend (vert bas → rouge haut)
```jsx
[0, 0.25, 0.5, 0.75, 1].map(v => `${riskColor(v)} ${(v * 100).toFixed(0)}%`).join(', ')
// direction: linear-gradient(to top, ...)
```

### Dimensions volets
- LeftPanel : `w-48 sm:w-52`
- RightPanel : `w-56 sm:w-60`

## Règles de validation

- **Pas de `npm run build`** pour une modif purement CSS/Tailwind (className, couleur, position)
- Lancer le build si : nouvelle prop, import ajouté, logique JS modifiée
- Vérifier `get_errors()` après toute modif JSX
