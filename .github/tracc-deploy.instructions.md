---
applyTo: ".github/**,app/frontend/vite.config.js"
---

# Workflow — Déploiement / CI TRACC View SNCF

## Séquence standard de déploiement

```powershell
# 1. Ajouter Git au PATH (obligatoire dans VS Code PowerShell)
$env:PATH += ";C:\Users\nbrunelet\AppData\Local\Programs\Git\cmd"

# 2. Build local de validation (mode pages)
cd c:\AppsIA\tracc-view-sncf\app\frontend
npm run build  # ou npm run build:pages pour tester la config GH Pages

# 3. Commit + push
git -C c:\AppsIA\tracc-view-sncf add <fichiers>
git -C c:\AppsIA\tracc-view-sncf commit -m "<message>"
git -C c:\AppsIA\tracc-view-sncf push origin main
```

Le workflow GitHub Actions se déclenche automatiquement sur push `main` → déploiement en ~2 min.

## URL et repo

- **URL GitHub Pages** : https://nicolasbrunaudssg.github.io/sncf-tracc-view-v2/
- **Repo** : https://github.com/NicolasBrunaudSSG/sncf-tracc-view-v2.git
- **Workflow** : `tracc-view-sncf/.github/workflows/deploy-pages.yml`

## Étapes du workflow CI

1. `npm ci` + `npm run build:pages` dans `app/frontend/`
2. `node app/frontend/scripts/hash-data.js app/data app/frontend/dist/data` → GeoJSON hachés + `manifest.json`
3. `actions/upload-pages-artifact@v3` → `actions/deploy-pages@v4`

## vite.config.js — Modes

| Mode | Commande | `VITE_DATA_MODE` | `base` |
|---|---|---|---|
| dev local | `npm run dev` | `api` | `/` |
| pages | `npm run build:pages` | `static` | `/sncf-tracc-view-v2/` |

## GeoJSON hachés (Service Worker)

- Les fichiers sont copiés avec hash SHA256-8 : `hev_2050.08c84a8d.geojson`
- Le SW (`public/sw.js`) les met en cache indéfiniment (Cache-First)
- `manifest.json` est rechargé Network-First à chaque visite → invalidation propre
- Si les données changent → re-push → nouveaux hashes → SW télécharge les nouveaux fichiers

## Triggers workflow

Le workflow se déclenche sur push `main` si les chemins suivants sont modifiés :
- `app/frontend/**`
- `app/data/**`
- `.github/workflows/deploy-pages.yml`
