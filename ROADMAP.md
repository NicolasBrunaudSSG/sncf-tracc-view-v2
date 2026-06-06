# TRACC View SNCF — Démarche de développement

## Architecture générale

```
┌──────────────────────────────────────────────────────────┐
│                    TRACC View SNCF                        │
│                                                          │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────┐ │
│  │  PIPELINE   │───▶│   BACKEND    │◀───│  FRONTEND   │ │
│  │   Python    │    │   FastAPI    │    │React+Leaflet│ │
│  │ GeoPandas   │    │  port 8000   │    │  port 5173  │ │
│  └─────────────┘    └──────────────┘    └─────────────┘ │
│         ▲                  ▲                             │
│         │                  │                             │
│  ┌─────────────┐    ┌──────────────┐                    │
│  │  DONNÉES    │    │  GeoJSON     │                    │
│  │  SOURCES    │    │  app/data/   │                    │
│  │ .gpkg/.txt  │    │  (générés)   │                    │
│  └─────────────┘    └──────────────┘                    │
└──────────────────────────────────────────────────────────┘
```

---

## Agents disponibles

| Agent | Fichier | Rôle | Activer quand |
|---|---|---|---|
| **tracc-data** | `.github/agents/tracc-data.agent.md` | Pipeline de données | Générer/régénérer les GeoJSON, déboguer le calcul HEV |
| **tracc-backend** | `.github/agents/tracc-backend.agent.md` | API FastAPI | Créer/modifier les endpoints, déboguer l'API |
| **tracc-frontend** | `.github/agents/tracc-frontend.agent.md` | React + Leaflet | Créer/modifier l'UI, les composants, les couches |
| **tracc-qa** | `.github/agents/tracc-qa.agent.md` | Recette & acceptance | **En fin de chaque sprint** — valider les US et produire le rapport |

**Instructions globales** : `.github/instructions/tracc-view-sncf.instructions.md`
→ Appliquées automatiquement à tous les fichiers `tracc-view-sncf/**`

---

## Cycle de sprint

Chaque sprint suit le même cycle en 4 phases :

```
┌─────────────────────────────────────────────────────────┐
│  1. DÉVELOPPEMENT          Agents métier (data/back/front)│
│  2. INTÉGRATION            Vérification manuelle locale   │
│  3. RECETTE                Agent tracc-qa                 │
│     → Rapport PASS/FAIL/WARN par critère US               │
│  4. VALIDATION / CORRECTION                               │
│     → Si PASS  : sprint clos, passer au suivant          │
│     → Si FAIL  : corriger, relancer la recette           │
└─────────────────────────────────────────────────────────┘
```

**Commande de recette :** activer l'agent `tracc-qa` → _"Lance la recette du sprint N"_

---

## Plan de développement par sprints

---

### Sprint 0 — Socle technique (~2 jours)

**Objectif :** Préparer l'environnement, valider les données sources, dézipper les archives.

**Agents de développement :** `tracc-data`
**Commande :** _"Inspecte les fichiers sources GeoPackage et CEREMA, dézippe rfn_caracteristiques.zip et génère config.py"_

**Actions :**
1. Installer les dépendances : `python -m pip install geopandas pandas numpy scipy openpyxl`
2. Dézipper `Données réseau SNCF/ICV/rfn_caracteristiques.zip`
3. Valider la lecture du GeoPackage trafic (colonnes Trafic_2022, code_ligne, mnemo)
4. Valider la lecture des 3 fichiers CEREMA `.txt` (format brut, skiprows=47)
5. Créer `app/pipeline/config.py` avec tous les chemins absolus

**Recette Sprint 0 :** `tracc-qa` → _"Lance la recette du sprint 0"_

| Test | Critère |
|---|---|
| S0-01 | GeoPackage trafic lisible, colonnes attendues présentes |
| S0-02 | Fichier CEREMA 2050 lisible, >100 lignes, colonnes climatiques |
| S0-03 | ZIP rfn_caracteristiques contient un .gpkg |
| S0-04 | `config.py` créé avec tous les chemins valides |

**Verdict requis :** 4/4 PASS pour passer au Sprint 1.

---

### Sprint 1 — Application complète V1 : réseau + 5 aléas (~3 jours)

**Objectif :** Application démo livrable — réseau colorisé par risque pour 3 horizons.

**Agents de développement (en parallèle) :**

| Volet | Agent | Commande |
|---|---|---|
| Pipeline | `tracc-data` | _"Génère les GeoJSON complets avec les 5 aléas (E=1.0), IDW k=8, normalisation par horizon"_ |
| Backend | `tracc-backend` | _"Crée le backend FastAPI complet avec les 4 endpoints"_ |
| Frontend | `tracc-frontend` | _"Initialise le projet frontend, crée la carte avec réseau, panneaux et colorisation risque"_ |

**Livrables attendus :**
- `app/data/reseau_national.geojson`
- `app/data/hev_2050.geojson`, `hev_2065.geojson`, `hev_2100.geojson` (5 aléas chacun)
- `app/data/metadata.json`
- Backend FastAPI opérationnel sur port 8000
- Frontend React opérationnel sur port 5173

**US couvertes :** US-001, US-002, US-003, US-006, US-007, US-008, US-010, US-012, US-013

**Recette Sprint 1 :** `tracc-qa` → _"Lance la recette du sprint 1"_

| Test | Critère |
|---|---|
| S1-01 | 5 fichiers GeoJSON présents dans `app/data/` |
| S1-02 | Structure GeoJSON valide, >100 features |
| S1-03 | 20 propriétés HEV présentes par feature |
| S1-04 | Toutes les valeurs HEV dans [0, 1] |
| S1-05 | IDW appliqué — variance H > 0.01 |
| S1-06 | `metadata.json` : 4 scénarios et 5 aléas |
| S1-07 à S1-12 | 6 tests API (status codes, structure, erreurs 400/404) |
| US-001 à US-013 | 9 critères d'acceptation visuels |

**Verdict requis :** 0 FAIL bloquant pour valider le sprint.

---

### Sprint 2 — Canicule V2 : modélisation physique flambage + caténaire (~2 jours)

**Objectif :** Implémenter la formule VETSD complète pour la canicule.

**Agent de développement :** `tracc-data`
**Commande :** _"Implémente H_flambage et H_caténaire VETSD pour la canicule, utilise les fichiers Rayonnement/"_

**Formules :**
- `T_rail = TX30D_yr + (0.85 × G_max) / 15`
- `H_flambage = minmax(max(T_rail - 25, 0)) × minmax(TX30D_yr)`
- `H_caténaire = minmax(max(TX30D_yr - 33, 0))`
- `H_canicule = minmax(H_flambage + H_caténaire)`

**Données nouvelles :** `Rayonnement/2050/RIR2050.txt`, `2065/`, `2100/`

**Recette Sprint 2 :** `tracc-qa` → _"Lance la recette du sprint 2"_

| Test | Critère |
|---|---|
| S2-01 | H_canicule V2 a une variance ≥ 80% de H_canicule V1 |
| S2-02 | Propriétés `H_flambage` et `H_catenaire` présentes dans les GeoJSON |
| S2-03 | Lignes 25kV ont R_canicule moyen > lignes Autonome |
| S2-04 | Toutes les valeurs H_canicule dans [0, 1] |

---

### Sprint 3 — Inondation V2 : exposition calculée (~2 jours)

**Objectif :** Calculer E_inondation à partir des données TRI et réseau hydrographique.

**Agent de développement :** `tracc-data`
**Commande :** _"Calcule E_inondation à partir de tri_2020_sig_di et TronconHydrographique_FXX.gpkg"_

**Formule :**
- `E_inondation = zone_inondable × dist_cours_eau_norm × densite_hydro_norm`

**Données nouvelles :** `tri_2020_sig_di/n_carte_inond_s.shp`, `TronconHydrographique_FXX.gpkg`

**Recette Sprint 3 :** `tracc-qa` → _"Lance la recette du sprint 3"_

| Test | Critère |
|---|---|
| S3-01 | E_inondation n'est plus constant à 1.0 (std > 0.01) |
| S3-02 | Segments en zone inondable ont R_inondation moyen > hors zone |
| S3-03 | E_inondation dans [0, 1] |

---

### Sprint 4 — Canicule V3 : exposition thermique urbaine CLC (~2 jours)

**Objectif :** Ajouter E_canicule avec l'indice d'amplification thermique CLC.

**Agent de développement :** `tracc-data`
**Commande :** _"Calcule E_canicule via LULC_thermique_norm à partir de CLC12_FR_RGF_SHP"_

**Recette Sprint 4 :** `tracc-qa` → _"Lance la recette du sprint 4"_

| Test | Critère |
|---|---|
| S4-01 | E_canicule n'est plus constant à 1.0 (std > 0.01) |
| S4-02 | Segments en zone urbaine (CLC 1.1.1) ont E_canicule > segments boisés |
| S4-03 | E_canicule dans [0, 1] |

---

### Sprint 5 — Sécheresse V2 : aléa retrait-gonflement argiles (~1–2 jours)

**Objectif :** Remplacer E=1.0 par E calculé pour la sécheresse.

**Agent de développement :** `tracc-data`
**Commande :** _"Calcule E_secheresse à partir de AleaRG_2025_Fxx_L93 (BRGM)"_

**Recette Sprint 5 :** `tracc-qa` → _"Lance la recette du sprint 5"_

| Test | Critère |
|---|---|
| S5-01 | E_secheresse n'est plus constant à 1.0 (std > 0.01) |
| S5-02 | Zones argile fort aléa ont R_secheresse moyen > zones faible aléa |
| S5-03 | E_secheresse dans [0, 1] |

---

## Tableau de bord des livrables et recettes

| Sprint | Aléas améliorés | US couvertes | Recette |
|---|---|---|---|
| **0** | — (données) | Prérequis techniques | S0-01 à S0-04 |
| **1** | 5 aléas V1 (E=1.0) | US-001, 002, 003, 006, 007, 008, 010, 012, 013 | S1-01 à S1-12 + 9 UA visuels |
| **2** | Canicule H physique | — | S2-01 à S2-04 |
| **3** | Inondation E calculé | — | S3-01 à S3-03 |
| **4** | Canicule E CLC | — | S4-01 à S4-03 |
| **5** | Sécheresse E RGA | — | S5-01 à S5-03 |

---

## Commandes de référence rapide

```powershell
# Activer l'environnement Python
c:\AppsIA\.venv\Scripts\activate

# Pipeline de données
cd c:\AppsIA\tracc-view-sncf\app\pipeline
python build_geojson.py

# Démarrer le backend
cd c:\AppsIA\tracc-view-sncf\app\backend
uvicorn main:app --reload --port 8000

# Démarrer le frontend (dans un autre terminal)
cd c:\AppsIA\tracc-view-sncf\app\frontend
npm run dev
# → http://localhost:5173
```
