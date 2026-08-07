---
title: "TRACC View SNCF — Complete Development Documentation"
subtitle: "Setup, Architecture, Components, and Workflow Guide"
date: 2026-08-07
project: tracc-view-sncf
phase: implementation
artifacts:
  - development-guide
  - setup-instructions
  - component-inventory
  - workflow-guide
status: active
---

# TRACC View SNCF — Complete Development Documentation

## Table of Contents

1. [Quick Start](#quick-start)
2. [Project Structure](#project-structure)
3. [Environment Setup](#environment-setup)
4. [Running the Application](#running-the-application)
5. [Frontend Architecture](#frontend-architecture)
6. [Backend Architecture](#backend-architecture)
7. [Data Pipeline](#data-pipeline)
8. [Component Reference](#component-reference)
9. [API Endpoints](#api-endpoints)
10. [Development Workflow](#development-workflow)
11. [Git & BMAD Integration](#git--bmad-integration)
12. [Troubleshooting](#troubleshooting)

---

## Quick Start

### For the Impatient (5 minutes)

```bash
# 1. Navigate to project
cd c:\AppsIA\tracc-view-sncf

# 2. Install all dependencies
cd app\backend && pip install -r requirements.txt
cd ..\pipeline && pip install -r requirements.txt
cd ..\frontend && npm install

# 3. Start services (3 separate terminals)
# Terminal 1: Backend
cd app\backend
python -m uvicorn main:app --reload --port 8000

# Terminal 2: Frontend
cd app\frontend
npm run dev

# Terminal 3: Data pipeline (if needed)
cd app\pipeline
python build_geojson.py

# 4. Open browser
# Frontend: http://localhost:5173
# API Docs: http://localhost:8000/docs
```

That's it! The app should load with the map visible.

---

## Project Structure

### Directory Tree

```
tracc-view-sncf/
│
├─ app/                          # Main application code
│  ├─ frontend/                  # React + Leaflet UI
│  │  ├─ src/
│  │  │  ├─ components/         # React components (11 files)
│  │  │  ├─ services/           # API client (dataService.js)
│  │  │  ├─ assets/             # Images, styles
│  │  │  ├─ App.jsx             # Root component
│  │  │  ├─ AppContext.jsx      # Global state (React Context)
│  │  │  ├─ index.css           # Global styles
│  │  │  ├─ main.jsx            # Entry point
│  │  │  └─ utils.js            # Utility functions
│  │  ├─ public/                # Static assets (logos, icons)
│  │  ├─ package.json           # Dependencies (React, Leaflet, Vite)
│  │  ├─ vite.config.js         # Vite configuration
│  │  ├─ eslint.config.js       # ESLint rules
│  │  └─ index.html             # HTML template
│  │
│  ├─ backend/                  # FastAPI server
│  │  ├─ main.py               # API routes & handlers
│  │  ├─ requirements.txt       # Dependencies (fastapi, uvicorn)
│  │  └─ __pycache__/          # Python cache
│  │
│  ├─ pipeline/                 # Data processing (GeoPandas)
│  │  ├─ build_geojson.py      # Main ETL pipeline
│  │  ├─ validate_sources.py   # Data validation script
│  │  ├─ config.py             # Configuration & paths
│  │  ├─ _check_rcan.py        # Debugging utility
│  │  ├─ requirements.txt       # Dependencies (geopandas, pandas)
│  │  └─ __pycache__/          # Python cache
│  │
│  └─ data/                     # Generated data (GeoJSON)
│     └─ geojson/              # Pre-computed GeoJSON files
│
├─ inputs/                      # Source data (not in git)
│  ├─ Données_modélisation/    # CEREMA climate scenarios
│  ├─ Construction des indicateurs/  # Hazard definitions
│  ├─ Documentation/            # Reference docs
│  └─ Rendus finaux/           # Final outputs
│
├─ stories/                     # Requirements & acceptance criteria
│  ├─ user_stories_detaillees.md
│  ├─ backlog_mvp.md
│  ├─ tests_acceptance.md
│  └─ wireframe.md
│
├─ docs/                        # (Empty, reserved for future docs)
│
├─ _bmad/                       # BMAD configuration
│  ├─ config.toml              # BMAD settings
│  ├─ config.user.toml         # User overrides
│  ├─ core/                    # Core BMAD modules
│  ├─ custom/                  # Custom BMAD modules
│  └─ scripts/                 # Automation scripts
│
├─ _bmad-output/               # BMAD artifacts (auto-generated)
│  ├─ planning-artifacts/      # Planning docs, project context
│  │  └─ PROJECT-CONTEXT.md    # (You created this!)
│  └─ implementation-artifacts/ # Code, test results
│
├─ .github/                    # GitHub/BMAD integration
│  ├─ agents/                  # Domain-specific agents
│  │  ├─ tracc-data.agent.md        # Data pipeline agent
│  │  ├─ tracc-backend.agent.md     # API agent
│  │  ├─ tracc-frontend.agent.md    # UI agent
│  │  └─ tracc-qa.agent.md          # QA agent
│  ├─ instructions/            # Project rules
│  │  └─ tracc-view-sncf.instructions.md
│  └─ workflows/              # CI/CD (future)
│
├─ .git/                       # Git repository
├─ .gitignore                  # Ignored files (node_modules, __pycache__, etc.)
├─ ROADMAP.md                  # Sprint roadmap & timeline
├─ hook-config.json           # BMAD hook configuration
└─ .backbone-settings.json    # Project metadata

```

### Key Directories Explained

| Directory | Purpose | What's Inside |
|-----------|---------|---|
| `app/frontend/` | React UI | Components, styles, Vite config |
| `app/backend/` | FastAPI server | Routes, data handlers |
| `app/pipeline/` | Data ETL | GeoJSON generation, spatial processing |
| `app/data/geojson/` | Computed output | Pre-generated GeoJSON files (served to frontend) |
| `inputs/` | Source data | Raw CEREMA files, GeoPackage, RFN ZIP |
| `stories/` | Requirements | User stories, acceptance criteria, wireframes |
| `_bmad/` | BMAD config | Project settings, modules, automation |
| `_bmad-output/` | Artifacts | Generated docs, test results, plans |
| `.github/agents/` | Domain agents | Specialized LLM roles for dev work |

---

## Environment Setup

### Prerequisites

#### Required
- **Python**: 3.10 or higher (tested with 3.11, 3.12)
- **Node.js**: 18.x or higher (LTS recommended)
- **npm**: 9+ (comes with Node.js)
- **Git**: Latest stable version
- **Windows PowerShell 7+** or Bash (for scripts)

#### Optional
- **VS Code**: Latest with Python & JavaScript extensions
- **Postman**: For API testing
- **QGIS**: For geospatial data inspection
- **Docker**: For containerization (future sprints)

### Installation Steps

#### Step 1: Clone Repository

```bash
cd c:\AppsIA
git clone https://github.com/SNCF/tracc-view-sncf.git
# OR navigate if already cloned
cd tracc-view-sncf
```

#### Step 2: Create Python Virtual Environments

**Backend:**
```bash
cd app\backend
python -m venv venv
venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
```

**Pipeline:**
```bash
cd ..\pipeline
python -m venv venv
venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
```

#### Step 3: Install Frontend Dependencies

```bash
cd ..\frontend
npm install
```

**Expected output** (check that no errors appear):
```
added 500+ packages, audited XXX packages in XXs
found 0 vulnerabilities
```

#### Step 4: Verify Installation

```bash
# Check Python installations
python --version          # Should show 3.10+
pip list | findstr fastapi

# Check Node.js
node --version           # Should show 18+
npm --version           # Should show 9+

# Check Git
git --version
```

### Environment Variables (Optional)

Create `.env` files for each service if needed:

**`app/backend/.env`** (if using environment variables):
```
BACKEND_PORT=8000
FRONTEND_URL=http://localhost:5173
CORS_ORIGINS=["http://localhost:5173", "http://localhost:3000"]
```

**`app/frontend/.env`** (if using environment variables):
```
VITE_API_BASE_URL=http://localhost:8000
```

---

## Running the Application

### Method 1: Sequential Start (Recommended for Development)

Open **three terminal tabs** in VS Code or PowerShell and run each command:

**Tab 1 — Backend (FastAPI)**
```bash
cd c:\AppsIA\tracc-view-sncf\app\backend
venv\Scripts\activate
python -m uvicorn main:app --reload --port 8000
```

Expected output:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Watching for file changes in directory: ...
```

**Tab 2 — Frontend (React)**
```bash
cd c:\AppsIA\tracc-view-sncf\app\frontend
npm run dev
```

Expected output:
```
  VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  press h + enter to show help
```

**Tab 3 — Optional: Pipeline/Data Regeneration**
```bash
cd c:\AppsIA\tracc-view-sncf\app\pipeline
venv\Scripts\activate
python build_geojson.py
```

Expected output:
```
Loading GeoPackage...
Loading CEREMA scenarios...
Building GeoJSON for 5 hazards × 3 horizons...
[████████████████████] 100%
Generated X GeoJSON files in app/data/geojson/
```

### Method 2: Docker Compose (Future)

Once Docker setup is ready:
```bash
docker-compose up
```

### Accessing the Application

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | `http://localhost:5173` | Main app (React UI) |
| **Backend** | `http://localhost:8000` | API base URL |
| **API Docs** | `http://localhost:8000/docs` | Swagger UI (interactive) |
| **API Docs Alt** | `http://localhost:8000/redoc` | ReDoc (read-only) |
| **Health Check** | `http://localhost:8000/api/health` | Server status |

---

## Frontend Architecture

### Technology Stack

| Tool | Purpose | Version |
|------|---------|---------|
| **React** | UI framework | 19.x |
| **Leaflet.js** | Mapping library | 1.9.x |
| **react-leaflet** | React bindings for Leaflet | 5.x |
| **Vite** | Build tool & dev server | 5.x |
| **Tailwind CSS** | Utility-first CSS | 4.x |
| **ESLint** | Code linter | 10.x |

### Component Architecture

```
App.jsx (Root)
│
├─ AppContext.jsx (Global State)
│  ├─ selectedInfra (string)
│  ├─ selectedScenario (string)
│  ├─ selectedHazard (string)
│  ├─ riskThreshold (number)
│  ├─ showNetwork (boolean)
│  └─ dispatch (reducer function)
│
├─ MapView.jsx (Leaflet Container)
│  ├─ BaseLayer (OSM/CartoDB)
│  ├─ RailwayLayer.jsx (Network lines)
│  ├─ InfraLayer.jsx (Infrastructure points)
│  ├─ RiskLayer.jsx (Hazard-specific risk visualization)
│  ├─ CarroyageLayer.jsx (Grid overlay, optional)
│  └─ CrossLayer.jsx (Analysis overlay, optional)
│
├─ LeftPanel.jsx (Control Panel)
│  ├─ IntroModal.jsx (Welcome/help)
│  ├─ RailwayLayer (Toggle: Show/hide network)
│  ├─ InfraLayer (Dropdown: Select infrastructure type)
│  ├─ Scenario selector (Dropdown: 2030/2050/2100)
│  ├─ Hazard selector (Dropdown: flooding/heat/wind/etc.)
│  ├─ Threshold input (Slider: 0-100)
│  ├─ Analysis button (Trigger risk calculation)
│  └─ Clear button (Reset all)
│
├─ RightPanel.jsx (Info Panel)
│  └─ Legend.jsx (Color scale, current selections)
│
└─ Error handling (ErrorBoundary, if implemented)
```

### Component Descriptions

#### **App.jsx** — Root Component
- Initializes global state via `AppContext`
- Renders main layout (left panel, map, right panel)
- Handles state updates from child components

#### **AppContext.jsx** — State Management
- Global state using React Context + useReducer
- Avoids prop drilling across deep component hierarchies
- Dispatch actions for state updates

#### **MapView.jsx** — Leaflet Container
- Initializes Leaflet map with OSM base layer
- Centers on France (default bounds)
- Manages zoom level, pan, and map events
- Renders all layer components as children

#### **RailwayLayer.jsx** — Network Display
- Fetches railway network GeoJSON from `/api/networks`
- Displays as PolylineGroup with styling
- Toggleable via "Lignes du réseau national" checkbox
- Color: dark blue or red (configurable)

#### **InfraLayer.jsx** — Infrastructure Display
- Fetches specific infrastructure type from `/api/infrastructure?type={type}`
- Displays as CircleMarkerGroup
- Filterable by type (stations, bridges, tunnels, etc.)
- Size scales with density for readability

#### **RiskLayer.jsx** — Hazard & Risk Visualization
- Fetches risk analysis from `/api/risk-analysis`
- Overlays infrastructure with color-coded risk (green → yellow → red)
- Updates when scenario, hazard, or threshold changes
- Animates color transitions

#### **LeftPanel.jsx** — Control Panel
- Houses all user input controls
- Vertically stacked: network toggle, dropdowns, threshold, buttons
- Responsive: collapses on mobile (future sprint)

#### **Legend.jsx** — Color Scale & Status
- Displays current hazard color mapping (0-100 scale)
- Shows selected scenario, infrastructure type, threshold
- Updates in real-time as user changes settings

#### **IntroModal.jsx** — Welcome/Help
- Shown on first load or when "Help" button clicked
- Explains how to use the app
- Can be dismissed

#### **ClearButton.jsx** — Reset Control
- Clears all selections
- Resets map to default view
- Hides all overlay layers

### State Management (useContext + useReducer)

```javascript
// AppContext.jsx pattern
const initialState = {
  selectedInfra: null,
  selectedScenario: '2050',
  selectedHazard: 'flooding',
  riskThreshold: 50,
  showNetwork: true,
  loading: false,
  error: null,
};

function appReducer(state, action) {
  switch(action.type) {
    case 'SELECT_INFRASTRUCTURE':
      return { ...state, selectedInfra: action.payload };
    case 'SELECT_HAZARD':
      return { ...state, selectedHazard: action.payload };
    // ... other actions
    default:
      return state;
  }
}
```

### Styling Approach

- **Global CSS** (`index.css`): Base styles, Leaflet overrides, responsive
- **Tailwind CSS**: Utility classes for LeftPanel, RightPanel components
- **Component scoping**: Inline styles for dynamic colors (risk visualization)

Example:
```jsx
// Dynamic risk color in RiskLayer
const riskColor = getRiskColor(riskScore); // Returns hex color
<Circle color={riskColor} radius={8} />
```

### Data Flow (Frontend)

```
User Input (click/select)
    ↓
AppContext dispatch action
    ↓
State updated
    ↓
Components re-render
    ↓
dataService.fetchRiskAnalysis()
    ↓
Backend /api/risk-analysis
    ↓
GeoJSON response
    ↓
RiskLayer updates Leaflet markers
    ↓
Map refreshes with new colors
```

---

## Backend Architecture

### Technology Stack

| Tool | Purpose | Version |
|------|---------|---------|
| **FastAPI** | Web framework | 0.110+ |
| **Uvicorn** | ASGI server | 0.29+ |
| **Pydantic** | Data validation | (bundled with FastAPI) |
| **Python** | Language | 3.10+ |

### API Structure

```
main.py
├─ Imports & initialization
├─ CORS middleware configuration
├─ Pydantic models (request/response schemas)
├─ Route handlers
│  ├─ GET /api/health              → {status: "ok"}
│  ├─ GET /api/networks             → List networks
│  ├─ GET /api/infrastructure      → Get by type
│  ├─ GET /api/hazards              → List hazards
│  └─ POST /api/risk-analysis       → Compute risk
└─ Main block (uvicorn run)
```

### Endpoints Reference

#### **GET `/api/health`**
- **Purpose**: Health check / liveness probe
- **Response**:
  ```json
  {
    "status": "ok",
    "timestamp": "2026-08-07T10:30:00Z"
  }
  ```
- **Status Code**: 200

#### **GET `/api/networks`**
- **Purpose**: List available network layers
- **Response**:
  ```json
  [
    {
      "id": "sncf_network",
      "name": "SNCF National Network",
      "description": "Railway lines across France",
      "geojson_url": "/data/geojson/networks.geojson",
      "feature_count": 12345
    }
  ]
  ```
- **Status Code**: 200

#### **GET `/api/infrastructure?type={type}`**
- **Purpose**: Get infrastructure by category
- **Query Parameters**:
  - `type` (required): `stations`, `bridges`, `tunnels`, `substations`, `all`
- **Response**:
  ```json
  {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "properties": {
          "id": "STN-001",
          "name": "Paris Gare de Lyon",
          "type": "station",
          "mnemo": "PGLYA"
        },
        "geometry": {
          "type": "Point",
          "coordinates": [2.3736, 48.8439]
        }
      }
    ]
  }
  ```
- **Status Code**: 200
- **Error**: 400 if `type` invalid, 500 if data load fails

#### **GET `/api/hazards`**
- **Purpose**: List available climate hazards and scenarios
- **Response**:
  ```json
  [
    {
      "id": "flooding",
      "name": "Flooding",
      "description": "Depth and probability of inundation",
      "unit": "meters",
      "scenarios": ["reference", "2030", "2050", "2100"],
      "color_scale": ["#00ff00", "#ffff00", "#ff0000"]
    },
    {
      "id": "heat",
      "name": "Heat Stress",
      "description": "Temperature anomaly",
      "unit": "°C",
      "scenarios": ["reference", "2030", "2050", "2100"],
      "color_scale": ["#00ff00", "#ffff00", "#ff0000"]
    }
    // ... 3 more hazards (wildfire, wind, landslide)
  ]
  ```
- **Status Code**: 200

#### **POST `/api/risk-analysis`**
- **Purpose**: Compute risk for infrastructure given threshold
- **Request Body**:
  ```json
  {
    "infrastructure_type": "stations",
    "hazard": "flooding",
    "scenario": "2050",
    "threshold": 0.5
  }
  ```
- **Response**:
  ```json
  {
    "at_risk": {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "properties": {
            "id": "STN-001",
            "risk_score": 0.75,
            "risk_level": "HIGH"
          },
          "geometry": { "type": "Point", "coordinates": [...] }
        }
      ]
    },
    "safe": {
      "type": "FeatureCollection",
      "features": [ /* ... */ ]
    },
    "summary": {
      "total_analyzed": 5000,
      "at_risk_count": 342,
      "safe_count": 4658,
      "risk_percentage": 6.84
    }
  }
  ```
- **Status Code**: 200
- **Error**: 400 if validation fails, 500 if processing fails

### Error Handling

All endpoints return consistent error responses:

```json
{
  "detail": "Infrastructure type 'invalid' not supported",
  "status_code": 400,
  "timestamp": "2026-08-07T10:30:00Z"
}
```

---

## Data Pipeline

### Pipeline Architecture

```
Raw Data Sources
├─ GeoPackage: Trafic_2022.gpkg
│  └─ Layers: network (LineString), infrastructure (Point/LineString)
├─ CEREMA CSV files (3 scenarios)
│  └─ Hazards: flooding, heat, wind (2050 horizon)
└─ RFN Characteristics ZIP
   └─ rfn_caracteristiques.gpkg → infrastructure attributes

        ↓ [Pipeline Process]

Validation Layer
├─ Check GeoPackage readability
├─ Verify CEREMA column structure
└─ Validate coordinate systems

        ↓

Transformation Layer
├─ Load network geometries
├─ Load climate grids
├─ Spatial join: infrastructure ← climate
├─ IDW interpolation (k=8 neighbors)
└─ Risk score calculation

        ↓

Normalization Layer
├─ Min-max scaling by scenario & hazard
├─ Color mapping (0-1 → green-yellow-red)
└─ Attribute enrichment

        ↓

Output Layer
└─ app/data/geojson/
   ├─ network_2050_flooding.geojson
   ├─ infrastructure_2050_heat.geojson
   ├─ ... (15 files total)
   └─ ...
```

### Key Scripts

#### **config.py** — Configuration
- Defines absolute paths to source data
- Stores hazard metadata (names, units, thresholds)
- Sets processing parameters (IDW k-value, E-weight, etc.)

```python
# Example config structure
CONFIG = {
    'source_paths': {
        'geopackage': 'C:\\...\\Trafic_2022.gpkg',
        'cerema_2050': 'C:\\...\\CEREMA_2050.txt',
        # ...
    },
    'hazards': {
        'flooding': {'unit': 'm', 'threshold_high': 0.5},
        'heat': {'unit': '°C', 'threshold_high': 4.0},
        # ...
    },
    'processing': {
        'idw_k': 8,
        'e_weight': 1.0,
        'normalization': 'minmax'
    },
    'output_dir': 'C:\\...\\app\\data\\geojson\\'
}
```

#### **validate_sources.py** — Validation Script
- Checks data source availability and readability
- Validates columns and data types
- Reports on data quality issues

```bash
python validate_sources.py
```

Output:
```
✓ GeoPackage found: Trafic_2022.gpkg (12345 features)
✓ CEREMA 2050 readable (1200 rows, 15 columns)
✓ RFN ZIP extractable (geom + attributes)
✓ Output directory writable
All checks passed!
```

#### **build_geojson.py** — Main Pipeline
- Orchestrates entire ETL workflow
- Outputs 15 GeoJSON files (5 hazards × 3 horizons)
- Includes error handling and progress indicators

```bash
python build_geojson.py
```

Output:
```
Loading GeoPackage: Trafic_2022.gpkg
  → 12,345 features loaded
Loading CEREMA scenarios (2050)
  → Flooding: 1,200 grid points
  → Heat: 1,200 grid points
  → Wind: 1,200 grid points
Building spatial index (IDW k=8)...
Processing hazards for each scenario:
  [████████████████████] 100%
  ├─ flooding_2030.geojson: 5,000 features
  ├─ flooding_2050.geojson: 5,000 features
  ├─ flooding_2100.geojson: 5,000 features
  ├─ heat_2030.geojson: 4,500 features
  ├─ heat_2050.geojson: 4,500 features
  ├─ heat_2100.geojson: 4,500 features
  └─ ... (9 more files)
✓ Complete! Generated 15 GeoJSON files
Total size: 145 MB (optimized for Leaflet)
```

#### **_check_rcan.py** — Debugging Utility
- Analyzes computed GeoJSON files
- Shows statistics and anomalies
- Used for validation and troubleshooting

```bash
python _check_rcan.py flooding_2050.geojson
```

### Data Transformations

#### 1. Load & Validate

```python
# Load network from GeoPackage
gdf_network = gpd.read_file('Trafic_2022.gpkg', layer='network')
# Filter valid geometries, check CRS

# Load CEREMA climate data
df_climate = pd.read_csv('CEREMA_2050.txt', skiprows=47)
# Validate expected columns
```

#### 2. Spatial Join (Infrastructure ← Climate)

```python
# Infrastructure points to climate grid
result = gpd.sjoin_nearest(
    gdf_infrastructure,
    gdf_climate_grid,
    how='left',
    distance_col='distance'
)
# Each infrastructure now has nearest climate value
```

#### 3. IDW Interpolation (Optional Enhancement)

```python
# For k=8 nearest neighbors
from scipy.interpolate import griddata

# Weight inversely by distance
weights = 1 / (distances + 1e-6)  # +epsilon to avoid division by zero
interpolated_value = np.average(nearest_values, weights=weights)
```

#### 4. Risk Score Calculation

```python
# Raw hazard value → risk score (0-1)
if hazard == 'flooding':
    risk_score = min(depth / 1.0, 1.0)  # Cap at 1.0
elif hazard == 'heat':
    risk_score = max(0, temp_anomaly / 5.0)  # Normalize to 5°C
elif hazard == 'wind':
    risk_score = min(wind_speed / 30.0, 1.0)  # Cap at 30 m/s
```

#### 5. Normalization & Color Mapping

```python
# Min-max normalization within hazard × scenario
min_val = risk_scores.min()
max_val = risk_scores.max()
normalized = (risk_scores - min_val) / (max_val - min_val)

# Map to color scale
def score_to_color(score):
    if score < 0.33:
        return '#00ff00'  # Green (low risk)
    elif score < 0.67:
        return '#ffff00'  # Yellow (medium risk)
    else:
        return '#ff0000'  # Red (high risk)
```

#### 6. Export to GeoJSON

```python
# Prepare GeoDataFrame with all attributes
gdf_output['risk_score'] = risk_scores
gdf_output['risk_color'] = colors
gdf_output['scenario'] = '2050'
gdf_output['hazard'] = 'flooding'

# Export
gdf_output.to_file(
    f'geojson/flooding_2050.geojson',
    driver='GeoJSON'
)
```

---

## Component Reference

### Frontend Components

#### **MapView.jsx**
```javascript
<MapView
  center={[46.2276, 2.2137]}  // France center
  zoom={6}
  onMapReady={handleMapReady}
/>
// Children: RailwayLayer, InfraLayer, RiskLayer, etc.
```

#### **RailwayLayer.jsx**
```javascript
<RailwayLayer
  visible={showNetwork}
  onToggle={(visible) => dispatch(...)}
/>
// Fetches from /api/networks
// Renders as PolylineGroup (dark blue by default)
```

#### **InfraLayer.jsx**
```javascript
<InfraLayer
  type={selectedInfra}
  onSelect={(id) => dispatch(...)}
/>
// Fetches from /api/infrastructure?type={type}
// Renders as CircleMarkers
```

#### **RiskLayer.jsx**
```javascript
<RiskLayer
  hazard={selectedHazard}
  scenario={selectedScenario}
  threshold={riskThreshold}
  onAnalysisComplete={(results) => dispatch(...)}
/>
// POSTs to /api/risk-analysis
// Overlays color-coded risk visualization
```

#### **LeftPanel.jsx**
```javascript
<LeftPanel>
  <RailwayToggle />
  <InfraTypeSelect />
  <ScenarioSelect />
  <HazardSelect />
  <ThresholdSlider />
  <AnalysisButton />
  <ClearButton />
</LeftPanel>
```

#### **Legend.jsx**
```javascript
<Legend
  hazard={selectedHazard}
  colorScale={colorScaleForHazard}
  currentRisk={riskResults}
/>
// Shows color gradient, thresholds, current selections
```

### Backend Modules

#### **main.py** — Core API
```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import geopandas as gpd

app = FastAPI(title="TRACC View API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes...
```

---

## Development Workflow

### Daily Development Cycle

```
1. Check current sprint & tasks
   → Read _bmad-output/planning-artifacts/PROJECT-CONTEXT.md
   → Or invoke: tracc-qa agent → "What's the current status?"

2. Identify component/module to work on
   → Frontend feature → Invoke tracc-frontend agent
   → Backend endpoint → Invoke tracc-backend agent
   → Data issue → Invoke tracc-data agent

3. Develop locally
   → npm run dev  (frontend)
   → python -m uvicorn main:app --reload  (backend)
   → Test in browser at http://localhost:5173

4. Test changes
   → Check browser console for errors
   → Use http://localhost:8000/docs for API testing
   → Manual testing of feature

5. Commit & push
   → git add .
   → git commit -m "feat: [component] description"
   → git push origin feature/xxx

6. End of sprint
   → Invoke tracc-qa agent → "Launch Sprint N acceptance testing"
   → Review test results
   → Merge to main if all tests pass
```

### Using BMAD Agents

#### For Data Work
```
Activate: tracc-data agent
Prompt: "Regenerate GeoJSON for flooding hazard with 
         IDW k=8, normalize by scenario, output to 
         app/data/geojson/"
```

#### For Backend Work
```
Activate: tracc-backend agent
Prompt: "Create endpoint GET /api/infrastructure-bounds 
         that returns bounding box of all infrastructure 
         for a given type"
```

#### For Frontend Work
```
Activate: tracc-frontend agent
Prompt: "Create a React component <RiskSummary /> that 
         displays count of at-risk infrastructure and 
         percentage affected"
```

#### For QA/Testing
```
Activate: tracc-qa agent
Prompt: "Launch Sprint 1 acceptance testing. Verify 
         all 9 user stories against acceptance criteria.
         Produce PASS/FAIL report."
```

### Debugging Workflow

#### Frontend Issues

**Browser Console Errors:**
1. Open DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for failed API calls
4. Verify API URLs match backend (http://localhost:8000)

**React Component Issues:**
```javascript
// Add console.log in component
console.log('selectedHazard:', selectedHazard);
console.log('riskResults:', riskResults);

// Or use React DevTools extension
```

**Leaflet Map Issues:**
```javascript
// Check if map initialized
console.log('map instance:', mapRef.current);

// Verify layer rendering
mapRef.current.eachLayer(layer => console.log(layer));
```

#### Backend Issues

**API Endpoint Errors:**
1. Check Swagger UI: http://localhost:8000/docs
2. Try endpoint directly in Swagger
3. Check console output for exceptions
4. Use Postman for detailed request/response inspection

**Data Loading Issues:**
```bash
# Validate data sources
cd app/pipeline
python validate_sources.py

# Regenerate GeoJSON
python build_geojson.py

# Check specific file
python _check_rcan.py flooding_2050.geojson
```

#### Full Stack Debugging

```bash
# Terminal 1: Backend with verbose logging
cd app/backend
python -m uvicorn main:app --reload --log-level debug

# Terminal 2: Frontend with source maps
cd app/frontend
npm run dev -- --open

# Terminal 3: Monitor network requests
# (Use browser DevTools Network tab)
```

---

## Git & BMAD Integration

### Git Workflow

#### Clone the Repository
```bash
git clone https://github.com/SNCF/tracc-view-sncf.git
cd tracc-view-sncf
```

#### Create Feature Branch
```bash
git checkout -b feature/your-feature-name
# e.g., feature/add-infrastructure-details
```

#### Commit Changes
```bash
git add .
git commit -m "feat: add infrastructure details panel"
# Follow Conventional Commits: feat, fix, refactor, docs, test
```

#### Push & Create Pull Request
```bash
git push origin feature/your-feature-name
# Then create PR on GitHub
```

#### Before Merging
```bash
# Run linting (frontend)
cd app/frontend && npm run lint

# Run any tests
npm run test  (when test suite exists)

# Manual testing
# Terminal 1: npm run dev
# Terminal 2: python -m uvicorn main:app --reload
# Browser: http://localhost:5173
```

### BMAD Integration

**BMAD automatically:**
- Tracks all artifacts in `_bmad-output/`
- Maintains decision logs in `_bmad/`
- Validates sprints against acceptance criteria
- Manages agent collaboration

**Using BMAD Commands:**
```bash
# Show next steps (interactive)
bmad-help

# Start building a change
bmad-build "Add filter for inactive stations"

# Plan a larger initiative
bmad-plan "Implement station details panel with export"

# After development, trigger QA
bmad-qa "Sprint 1 acceptance testing"
```

### CI/CD Hooks (Future)

When `.github/workflows/` is set up:
- Linting on every commit
- Tests on every PR
- Deployment on merge to main
- BMAD report generation

---

## Troubleshooting

### Common Issues & Solutions

#### Issue: "Port 5173 already in use"

**Cause**: Another Vite dev server is running

**Solution**:
```bash
# Find and kill process
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Or use different port
cd app/frontend
npm run dev -- --port 5174
```

---

#### Issue: "CORS error: Access to XMLHttpRequest blocked"

**Cause**: Backend not running or CORS misconfigured

**Solution**:
```bash
# Verify backend is running
curl http://localhost:8000/api/health

# Check CORS configuration in main.py
# Ensure frontend URL (http://localhost:5173) is in allow_origins

# Restart backend if config changed
Ctrl+C to stop
python -m uvicorn main:app --reload
```

---

#### Issue: "GeoJSON file not found"

**Cause**: Pipeline not run or config.py paths wrong

**Solution**:
```bash
# Check if geojson files exist
dir app\data\geojson\

# If empty, regenerate
cd app\pipeline
python build_geojson.py

# Verify config.py paths are correct
python validate_sources.py
```

---

#### Issue: "API returns 400: Invalid infrastructure type"

**Cause**: Frontend sending unsupported type value

**Solution**:
```bash
# Check valid types at /api/infrastructure-types (if endpoint exists)
# Or look at backend main.py for allowed values

# Valid types (example):
# - "stations"
# - "bridges"
# - "tunnels"
# - "substations"
# - "all"

# Verify frontend is sending correct type
console.log('Requesting type:', selectedInfra);
```

---

#### Issue: "Map doesn't load, blank white canvas"

**Cause**: Map not initialized, layer fetch failed, or CSS issue

**Solution**:
```bash
# Check browser console for errors
# Common issues:
# 1. Leaflet CSS not loaded (check index.html)
# 2. No GeoJSON data returned
# 3. Coordinate system mismatch

# Verify Leaflet CSS in index.html:
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

# Check API responses
curl http://localhost:8000/api/networks
# Should return valid GeoJSON, not error
```

---

#### Issue: "npm install fails with peer dependency warnings"

**Cause**: Version conflicts or missing packages

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm package-lock.json node_modules
npm install

# If still issues, use legacy peer deps flag
npm install --legacy-peer-deps
```

---

#### Issue: "Python script crashes: 'GeoPackage not found'"

**Cause**: config.py has incorrect file path

**Solution**:
```bash
# Verify GeoPackage exists
dir "C:\Path\To\Trafic_2022.gpkg"

# Update config.py with correct absolute path
# (Use Windows backslashes or raw strings)

# Example:
# config.py line: 'geopackage': r'C:\AppsIA\tracc-view-sncf\inputs\Trafic_2022.gpkg'

# Then re-run validation
cd app\pipeline
python validate_sources.py
```

---

#### Issue: "Risk calculations give zero scores"

**Cause**: Normalization, missing data, or wrong thresholds

**Solution**:
```bash
# Run debug utility
cd app/pipeline
python _check_rcan.py flooding_2050.geojson

# Output should show:
# - Total features: XXXX
# - Risk score range: 0.0-1.0
# - Percentage at risk: XX%

# If all scores are 0 or 1:
# 1. Check source data (climate grid, infrastructure geometries)
# 2. Verify IDW interpolation parameters (k value)
# 3. Check normalization logic in build_geojson.py
```

---

### Getting Help

1. **Check Project Context**:
   - Read `_bmad-output/planning-artifacts/PROJECT-CONTEXT.md`

2. **Invoke Relevant Agent**:
   - Data issue → `tracc-data` agent
   - API issue → `tracc-backend` agent
   - UI issue → `tracc-frontend` agent
   - QA issue → `tracc-qa` agent

3. **Check Logs**:
   - Frontend: Browser DevTools Console
   - Backend: Terminal output or uvicorn logs
   - Pipeline: Terminal output from script

4. **Use Swagger UI**:
   - http://localhost:8000/docs
   - Try endpoints interactively

5. **Escalate if Stuck**:
   - Invoke BMAD `/bmad-help` command
   - Contact team lead with:
     - What you were doing
     - What error you got
     - Which component/layer (frontend/backend/pipeline)
     - Full error message/stack trace

---

## Appendix: File Reference

### Important Files to Know

| File | Purpose | When to Edit |
|------|---------|---|
| `app/frontend/src/App.jsx` | Root component | Layout changes, new routes |
| `app/frontend/src/AppContext.jsx` | Global state | Adding new state slices |
| `app/frontend/src/components/MapView.jsx` | Map container | Map config, zoom bounds |
| `app/frontend/src/services/dataService.js` | API client | Changing API URLs, adding fetch calls |
| `app/backend/main.py` | API routes | Adding endpoints, validation |
| `app/pipeline/build_geojson.py` | ETL main | Changing hazard logic, adding data sources |
| `app/pipeline/config.py` | Configuration | File paths, processing parameters |
| `.github/agents/tracc-*.agent.md` | Agent definitions | Role responsibilities, tools |
| `stories/user_stories_detaillees.md` | Requirements | Reference for acceptance criteria |
| `_bmad-output/planning-artifacts/PROJECT-CONTEXT.md` | This doc | General reference |

---

## Summary

You now have a complete guide to developing TRACC View SNCF. Key takeaways:

✅ **Setup**: 3 virtual environments (backend, pipeline, frontend) + npm install  
✅ **Run**: 3 terminals for dev server, backend, and pipeline  
✅ **Frontend**: React + Leaflet, global state via Context API, 11 components  
✅ **Backend**: FastAPI with 4+ endpoints, async, Pydantic validation  
✅ **Data**: GeoPandas pipeline with IDW interpolation, 15 GeoJSON files output  
✅ **Agents**: 4 domain-specific BMAD agents for collaboration  
✅ **Testing**: Acceptance test suite in `stories/tests_acceptance.md`  
✅ **Troubleshooting**: Solutions for 10+ common issues  

**Next Step**: Pick a task from the backlog and invoke the appropriate BMAD agent to start developing!

---

*Documentation generated: 2026-08-07*  
*Project: tracc-view-sncf | Phase: Implementation*  
*For updates, re-run `/bmad-document-project tracc-view-sncf`*
