---
applyTo: "app/pipeline/**,app/data/**,inputs/**"
---

# Workflow — Tâche Pipeline / Data TRACC View SNCF

## Ordre de lecture obligatoire

1. `app/pipeline/config.py` en PREMIER — contient `PIVOT_COL_MAP` et `PIVOT_R_MAP`
2. `app/pipeline/build_geojson.py` uniquement si la tâche modifie la génération des GeoJSON

**Ne jamais ouvrir un fichier `.gpkg` ou `.geojson` directement** — utiliser Python inline :
```powershell
c:\AppsIA\.venv\Scripts\python.exe -c "
import geopandas as gpd
pivot = gpd.read_file('...gpkg', layer='HEV', engine='pyogrio', rows=1)
print([c for c in pivot.columns if 'inond' in c.lower()])
"
```

## Points d'attention récurrents

### PIVOT_R_MAP (bug connu)
`PIVOT_R_MAP` dans `build_geojson.py` doit lister **toutes** les colonnes R pour les 3 scénarios.
Vérifier systématiquement que chaque aléa a bien 2050 + 2065 + **2100**.
```python
PIVOT_R_MAP = {
    "R_can_2050":   "R_canicule_2050",
    "R_can_2065":   "R_canicule_2065",
    "R_can_2100":   "R_canicule_2100",
    "R_inond_2050": "R_inondation_2050",
    "R_inond_2065": "R_inondation_2065",
    "R_inond_2100": "R_inondation_2100",  # ← ne pas oublier
}
```

### Regénération partielle du carroyage (sans relancer tout le pipeline)
```powershell
cd c:\AppsIA\tracc-view-sncf\app\pipeline
c:\AppsIA\.venv\Scripts\python.exe -c "
import geopandas as gpd
from config import PIVOT_GPKG, PIVOT_LAYER, OUTPUT_DIR, PIVOT_R_MAP_... # adapter
# charger pivot, simplifier, exporter
"
```

### CRS
- Sources GPKG : Lambert 93 (EPSG:2154)
- Exports GeoJSON : WGS84 (EPSG:4326)
- Toujours `.to_crs(epsg=4326)` avant `to_file(..., driver='GeoJSON')`

## Données disponibles

| Fichier GeoJSON | Contenu | Taille |
|---|---|---|
| `reseau_national.geojson` | Segments réseau + indices | 9 MB |
| `hev_{2050/2065/2100}.geojson` | H/E/V/R par aléa par scénario | 12 MB chacun |
| `hev_reference.geojson` | Référence H=0 | 12 MB |
| `carroyage_light.geojson` | Cellules 1km² simplifiées + R par aléa/scénario | 26 MB |

## Activation venv
```powershell
c:\AppsIA\.venv\Scripts\python.exe  # chemin direct sans activation
# ou
& c:\AppsIA\.venv\Scripts\Activate.ps1  # si session interactive
```
