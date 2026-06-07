---
applyTo: "tracc-view-sncf/**"
---

# Instructions — SNCF TRACC View

## Vision produit

Application cartographique web permettant de visualiser l'exposition du réseau ferroviaire français aux risques climatiques selon différents horizons temporels. Modèle de risque **H × E × V** (Hazard × Exposure × Vulnerability) sur 5 aléas.

---

## Architecture technique

```
tracc-view-sncf/
├── inputs/                          ← données sources (NE PAS MODIFIER)
│   ├── Construction des indicateurs/
│   │   └── build_hev_indices.py     ← référence méthodologique
│   └── Données_modélisation/
│       └── Jeux de données/
│           ├── CEREMA/              ← données climatiques brutes
│           ├── Couche de ligne découpée/
│           ├── Données réseau SNCF/
│           └── ...
├── app/
│   ├── data/                        ← GeoJSON générés par le pipeline (gitignore si trop lourds)
│   │   ├── reseau_national.geojson
│   │   ├── hev_reference.geojson
│   │   ├── hev_2050.geojson
│   │   ├── hev_2065.geojson
│   │   ├── hev_2100.geojson
│   │   └── metadata.json
│   ├── pipeline/                    ← scripts Python de traitement
│   │   ├── build_geojson.py         ← pipeline principal
│   │   ├── config.py                ← chemins et constantes
│   │   └── requirements.txt
│   ├── backend/                     ← API FastAPI
│   │   ├── main.py
│   │   ├── routers/
│   │   └── requirements.txt
│   └── frontend/                    ← React + Vite + Leaflet
│       ├── src/
│       │   ├── components/
│       │   ├── hooks/
│       │   ├── services/
│       │   └── App.jsx
│       ├── package.json
│       └── vite.config.js
└── stories/                         ← backlog et user stories (référence)
```

---

## Chemins sources absolus (Windows)

```python
ROOT       = r"c:\AppsIA\tracc-view-sncf"
INPUTS_DIR = r"c:\AppsIA\tracc-view-sncf\inputs\Données_modélisation\Jeux de données"

# Données ferroviaires
PATH_TRAFIC = INPUTS_DIR + r"\Couche de ligne découpée\Lignes découpées avec Trafic.gpkg"
PATH_RESEAU = INPUTS_DIR + r"\Données réseau SNCF\resseau ferroviaire"  # GeoPackage(s) réseau
PATH_ICV    = INPUTS_DIR + r"\Données réseau SNCF\ICV"

# Données climatiques CEREMA
PATH_CEREMA_2050 = INPUTS_DIR + r"\CEREMA\donnes 2050.txt"
PATH_CEREMA_2065 = INPUTS_DIR + r"\CEREMA\donnes 2065.txt"
PATH_CEREMA_2100 = INPUTS_DIR + r"\CEREMA\donnes_2100.txt"

# Données exposition
PATH_FORET       = INPUTS_DIR + r"\MASQUE-FORET_1-0_2021-2023_GPKG_LAMB93_FXX_2025-09-25\MASQUE-FORET"
PATH_INONDATION  = INPUTS_DIR + r"\Donnes inondations"
PATH_HYDRO       = INPUTS_DIR + r"\Réseau hydrographique\TronconHydrographique_FXX.gpkg"
PATH_CORINE      = INPUTS_DIR + r"\Corine Land Cover\CLC12_FR_RGF_SHP"

# Données solaires (rayonnement)
PATH_RAYON_2050  = INPUTS_DIR + r"\Rayonnement\2050"
PATH_RAYON_2065  = INPUTS_DIR + r"\Rayonnement\2065"
PATH_RAYON_2100  = INPUTS_DIR + r"\Rayonnement\2100"
```

---

## Algorithme de calcul — Méthode VETSD (référence)

> Source de référence : `inputs/Rendus finaux/note_methodologique_VETSD (4).docx`
> La méthode VETSD prévaut sur tout autre document en cas de divergence avec `build_hev_indices.py`.

---

### Formule générale

```
Risk_k = H_k × E_k × V_k    (tous les termes normalisés [0, 1])
```

Formulation **multiplicative** : si un facteur est nul, le risque est nul. Permet d'identifier le facteur limitant par tronçon.

---

### Interpolation spatiale des données climatiques — IDW (VETSD)

Les points TRACC ne coïncident pas avec les centroïdes du réseau. Utiliser obligatoirement l'**IDW k=8, puissance p=2** (et non le plus proche voisin k=1 de build_hev_indices.py) :

```python
from scipy.spatial import cKDTree
import numpy as np

def idw_interpolate(seg_pts, clim_pts, clim_vals, k=8, power=2):
    """IDW k=8, p=2 — méthode VETSD (section 5.2)."""
    tree = cKDTree(clim_pts)
    dists, idxs = tree.query(seg_pts, k=k)
    dists = np.maximum(dists, 1e-10)   # éviter division par zéro
    weights = 1.0 / (dists ** power)
    weights /= weights.sum(axis=1, keepdims=True)
    result = np.einsum('ij,ijk->ik', weights, clim_vals[idxs])
    return result
```

---

### Normalisation min-max

```python
def minmax(s):
    mn, mx = s.min(), s.max()
    if mx == mn:
        return pd.Series(0.5, index=s.index)
    return (s - mn) / (mx - mn)
```

> **IMPORTANT (VETSD §2.2) :** la normalisation est appliquée **séparément par horizon** (2050, 2065, 2100).
> Les scores ne sont donc pas directement comparables entre horizons. Pour comparer l'évolution d'un tronçon, utiliser les valeurs brutes avant normalisation ou fixer des bornes communes a priori.

---

### Scénarios climatiques et fichiers sources

| Scénario | Clé API | Fichier CEREMA | Format | Horizon | Réchauffement |
|---|---|---|---|---|---|
| Référence | `reference` | — | — | 1976–2005 | — |
| 2050 | `2050` | `CEREMA/donnes 2050.txt` | Brut (sep `;`, skiprows=47) | 2031–2050 | Monde +1,5°C / FR +2°C |
| 2065 | `2065` | `CEREMA/donnes 2065.txt` | Brut (sep `;`, skiprows=47) | 2046–2065 | Monde +2°C / FR +2,7°C |
| 2100 | `2100` | `CEREMA/donnes_2100.txt` | Brut (sep `;`, skiprows=47) | 2070–2089 | Monde +3°C / FR +4°C |

Variables CEREMA extraites par aléa :

| Aléa | Colonne CEREMA brute | Colonne normalisée |
|---|---|---|
| Canicule | `TX30D_yr` | jours Tx≥30°C |
| Incendie | `IFM40_yr` | IFM40 |
| Sécheresse | `SWI04_yr` | SWI<0,4 |
| Inondation | `RR_yr` | précip. annuelles |
| Glissement | `Rx1d_yr` | Rx1d |

---

### Aléa 1 — Canicule (méthode VETSD §2.3 — deux sous-phénomènes)

**H_flambage** — déformation thermique des rails :

```python
# Paramètres physiques (VETSD / référentiel CS2R SNCF·Sopra Steria)
ALPHA  = 0.85   # absorptivité acier oxydé standard
H_CONV = 15.0   # coefficient convection W/m²K (vent faible en canicule)
T_REF  = 25.0   # seuil de référence °C

# T_air_max    : TX30D_yr (°C) — projection CEREMA
# G_max        : irradiance solaire max annuelle (W/m²) — fichiers Rayonnement/
#   PATH_RAYON_2050 = INPUTS_DIR + r"\Rayonnement\2050\Rayonnement infra-rouge incident a la surface\RIR2050.txt"
#   PATH_RAYON_2065 = INPUTS_DIR + r"\Rayonnement\2065\..."
#   PATH_RAYON_2100 = INPUTS_DIR + r"\Rayonnement\2100\..."

T_rail = T_air_max + (ALPHA * G_max) / H_CONV
depassement = np.maximum(T_rail - T_REF, 0)
H_flambage = minmax(depassement) * minmax(TX30D_yr)
```

**H_caténaire** — défaillance alimentation électrique :

```python
# Seuil opérationnel 32–35°C (hypothèse de travail VETSD §7.1 — à calibrer)
T_SEUIL_OP = 33.0
H_catenaire = minmax(np.maximum(TX30D_yr - T_SEUIL_OP, 0))
```

**H_canicule total (formulation additive entre les deux sous-phénomènes)** :

```python
H_canicule = H_flambage + H_catenaire
# Re-normaliser après addition pour rester dans [0,1]
H_canicule = minmax(H_canicule)
```

**E_canicule** :

```python
# LULC_thermique_norm : CLC reclassifié (tissu urbain dense=1.0, eau=0.0)
# exposure_config_index : config voie (remblai/déblai/tunnel) — données SNCF Open Data
# En l'absence de exposure_config_index : E_canicule = LULC_thermique_norm
E_canicule = LULC_thermique_norm * exposure_config_index  # si données dispo
# Sinon : E_canicule = 1.0  (majorant conservateur)
```

**V_canicule** :

```python
V_canicule = train_flow * catenary_index * rail_index
```

---

### Aléa 2 — Inondation (méthode VETSD §6.3 — E calculé)

```python
H_inondation = minmax(RR_yr)
# + FRQ_q99 si disponible (absent de 2100 dans VETSD)

# E_inondation — calculé à partir des données disponibles dans les inputs
# Sources : tri_2020_sig_di/n_carte_inond_s.shp + TronconHydrographique_FXX.gpkg
zone_inondable     = intersect(segment_bbox, TRI_polygons)  # 0 ou 1
dist_cours_eau_norm = minmax(1 / (distance_to_nearest_river + 1))
densite_hydro_norm  = minmax(river_length_in_1km_buffer)
E_inondation = zone_inondable * dist_cours_eau_norm * densite_hydro_norm
# Si données TRI/hydro non chargées : E_inondation = 1.0

V_inondation = train_flow
```

---

### Aléas 3, 4, 5 — Incendie, Sécheresse, Glissement (E = 1.0 assumé)

Conformément à VETSD §3.3 : les données nécessaires à E ne sont pas encore disponibles.
La valeur `E = 1.0` est un **majorant conservateur assumé** (signalé en jaune dans le classeur VETSD).

```python
H_incendie    = minmax(IFM40_yr)
E_incendie    = 1.0   # TODO : (1 - forest_prox_norm) * LULC_flammability (masque forêt + CLC)
V_incendie    = train_flow

H_secheresse  = minmax(SWI04_yr)
E_secheresse  = 1.0   # TODO : RGA_zone_norm (AleaRG_2025_Fxx_L93 BRGM)
V_secheresse  = train_flow

H_glissement  = minmax(Rx1d_yr)
E_glissement  = 1.0   # TODO : slope_norm * earthwork_index_norm
V_glissement  = train_flow
```

---

### Indices de vulnérabilité communs (convergence totale VETSD / build_hev_indices.py)

```python
# --- train_flow ---
df["trafic_raw"] = df["Trafic_2022"].fillna(0)
df.loc[df["mnemo"] == "NON EXPLOITE", "trafic_raw"] = 0
df["train_flow"] = minmax(df["trafic_raw"])

# --- catenary_index ---
CATENARY_SCORE = {
    "Autonome": 0.0,  # thermique — pas de caténaire
    "750V":     0.3,  # 3e rail DC
    "1,5kV":    0.3,  # DC basse tension
    "3kV":      0.5,
    "15kV":     0.6,
    "25kV":     0.7,  # → 0.8 si Age >= 30 ans (VETSD §6.2)
}
AGE_THRESHOLD_CATENARY = 30  # ans

# --- rail_index (VETSD §6.2 — état de voie) ---
# ICV : 0=neuf → 100=très dégradé ; rail_index : haut = vulnérable
icv_vuln  = (1 - df["ICV"].clip(0, 100) / 100).fillna(0.5)
age_vuln  = df["Age_relatif"].clip(0, 1).fillna(0.4)
df["rail_index"] = (0.6 * icv_vuln + 0.4 * age_vuln).clip(0, 1)
# Pondérations VETSD : 60% ICV (état instantané), 40% âge (usure diffuse)
```

---

### Tableau récapitulatif des 5 aléas

| Aléa | H — source | H — méthode | E — MVP | E — cible | V |
|---|---|---|---|---|---|
| **Canicule** | TX30D_yr + G_max (Rayonnement/) | H_flambage + H_caténaire (additif) | 1.0 | LULC_thermique × exposure_config | train_flow × catenary_index × rail_index |
| **Inondation** | RR_yr | minmax | E calculé (TRI + hydro) | — | train_flow |
| **Incendie** | IFM40_yr | minmax | 1.0 (majorant) | (1-forest_prox) × LULC_flammability | train_flow |
| **Sécheresse** | SWI04_yr | minmax | 1.0 (majorant) | RGA_zone_norm | train_flow |
| **Glissement** | Rx1d_yr | minmax | 1.0 (majorant) | slope × earthwork_index | train_flow |

---

### Limites méthodologiques à conserver en mémoire (VETSD §7)

- **Normalisation par horizon** : les scores 2050/2065/2100 ne sont pas directement comparables entre eux.
- **Indépendance des aléas** : les interactions (canicule → sécheresse → incendie) ne sont pas modélisées.
- **Stationnarité de V** : ICV, âge et trafic sont figés à 2022 pour tous les horizons.
- **E = 1.0 pour 3 aléas** : incendie, sécheresse, glissement sont des majorants du risque réel.
- **Seuil caténaire non calibré** : T_seuil_op = 33°C est une hypothèse d'expert, à confronter aux données d'incidents SNCF.
- **IDW et relief** : l'IDW suppose l'isotropie — biais possibles en zones de montagne (Alpes, Pyrénées).

---

## API Backend — contrats d'interface

### Endpoints

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/reseau` | Réseau ferroviaire complet (GeoJSON) |
| GET | `/api/hev/{scenario}` | Réseau avec indices HEV pour le scénario |
| GET | `/api/hev/{scenario}/risk` | Segments filtrés par aléa + seuil |
| GET | `/api/metadata` | Listes scénarios, aléas, plages de valeurs |

### Paramètres filtre risque

- `alea` : `canicule` | `incendie` | `secheresse` | `inondation` | `glissement`
- `threshold` : float [0–1]

### Format GeoJSON property par feature (segment)

```json
{
  "Segment_ID": "string",
  "code_ligne": "string",
  "lib_ligne": "string",
  "Région": "string",
  "mnemo": "string",
  "Traction": "string",
  "train_flow": 0.0,
  "catenary_index": 0.0,
  "rail_index": 0.0,
  "H_canicule": 0.0,  "E_canicule": 0.0,  "V_canicule": 0.0,  "R_canicule": 0.0,
  "H_incendie": 0.0,  "E_incendie": 0.0,  "V_incendie": 0.0,  "R_incendie": 0.0,
  "H_secheresse": 0.0, "E_secheresse": 0.0, "V_secheresse": 0.0, "R_secheresse": 0.0,
  "H_inondation": 0.0, "E_inondation": 0.0, "V_inondation": 0.0, "R_inondation": 0.0,
  "H_glissement": 0.0, "E_glissement": 0.0, "V_glissement": 0.0, "R_glissement": 0.0
}
```

---

## Frontend — conventions

### Stack
- **React 18** + **Vite 5**
- **Leaflet 1.9** via `react-leaflet 4`
- **Tailwind CSS** pour le style
- Pas de state manager externe (React Context suffit pour le MVP)

### Layout wireframe

```
┌─────────────────────────────────────────────────────────────────────┐
│ [+][-]         SNCF TRACC View          [Nettoyer la carte]         │
│                                                                      │
│ ┌──────────────┐                              ┌───────────────────┐ │
│ │   Réseau     │     CARTE LEAFLET            │ Scénarios         │ │
│ │              │     (plein écran)            │ (•) Référence     │ │
│ │ [x] Lignes   │                              │ ( ) 2050          │ │
│ │              │                              │ ( ) 2065          │ │
│ │ Infra:       │                              │ ( ) 2100          │ │
│ │ [Select v]   │                              │                   │ │
│ └──────────────┘                              │ Indice: [v]       │ │
│                                               │ Croisement: [v]   │ │
│                                               │ Seuil: [0] [OK]   │ │
│                                               └───────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### Composants principaux

| Composant | Rôle |
|---|---|
| `<App />` | Contexte global, état scénario/aléa/seuil/infra |
| `<MapView />` | Conteneur Leaflet plein écran |
| `<RailwayLayer />` | Couche réseau national (toggle) |
| `<RiskLayer />` | Couche réseau colorisée par risque |
| `<LeftPanel />` | Toggle réseau + sélecteur infrastructure |
| `<RightPanel />` | Scénario + indice + croisement + seuil |
| `<ClearButton />` | Réinitialisation de l'analyse |

### Couleurs risque (interpolation)

```js
// 0.0 → vert (#2ECC71), 0.5 → orange (#F39C12), 1.0 → rouge (#E74C3C)
function riskColor(value) {
  if (value < 0.33) return '#2ECC71';
  if (value < 0.66) return '#F39C12';
  return '#E74C3C';
}
```

---

## Conventions de code

### Python (pipeline + backend)
- Python 3.12, venv `.venv` à `c:\AppsIA\.venv`
- Activer : `c:\AppsIA\.venv\Scripts\activate`
- Installer : `.venv\Scripts\python.exe -m pip install <package>`
- Encodage fichiers : `utf-8`
- CRS réseau ferroviaire : Lambert 93 (EPSG:2154) → convertir en WGS84 (EPSG:4326) pour le GeoJSON
- Les chemins de fichiers doivent utiliser `pathlib.Path` ou `os.path.join`

### JavaScript/React
- ES Modules uniquement (pas de CommonJS)
- Nommage composants : PascalCase
- Nommage hooks : `use` + PascalCase
- Variables d'environnement : préfixe `VITE_`

---

## User Stories MVP (priorités Must Have)

- US-001 : Afficher/masquer réseau national
- US-002 : Naviguer dans la carte
- US-003 : Nettoyer la carte
- US-004 : Sélectionner une catégorie d'infrastructure
- US-005 : Visualiser les infrastructures sélectionnées
- US-006 : Scénario de référence
- US-007 : Horizons climatiques futurs (2050, 2065, 2100)
- US-008 : Sélectionner un indice climatique
- US-010 : Croiser données réseau + indices climatiques
- US-012 : Saisir un seuil de risque et afficher les segments exposés
