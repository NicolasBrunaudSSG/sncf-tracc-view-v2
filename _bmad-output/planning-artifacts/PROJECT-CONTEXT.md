---
title: "TRACC View SNCF — Project Context & Development Guide"
subtitle: "Climate Vulnerability Assessment for French Railway Network"
date: 2026-08-07
project: tracc-view-sncf
phase: planning
artifacts:
  - project-context
  - development-guide
  - architecture-overview
status: active
---

# TRACC View SNCF — Project Context & Development Guide

## 1. Project Overview

**TRACC View SNCF** is a geospatial web application designed to help the French railway operator (SNCF) assess the vulnerability of the national railway network to climate-related hazards.

### Key Facts
- **Client**: SNCF (Société Nationale des Chemins de fer Français)
- **Purpose**: Visualize railway infrastructure exposure to 5 climate hazards across 4 time horizons
- **Scope**: MVP focuses on hazard visualization, infrastructure filtering, and risk threshold identification
- **Status**: Sprint 0 complete; Sprint 1 in progress

### Problem Statement
Climate change poses significant risks to railway infrastructure. SNCF needs a tool to:
1. Visualize the national railway network on an interactive map
2. Layer climate hazard data (5 hazards: flooding, wildfire, heat, wind, landslide)
3. Cross infrastructure with climate data across multiple time horizons (Reference, 2030, 2050, 2100)
4. Identify infrastructure at risk based on user-defined thresholds

---

## 2. Vision & Strategic Objectives

### Vision Statement
Empower SNCF stakeholders to make data-driven decisions about railway network resilience by providing intuitive, spatially-aware visualization of climate vulnerability across multiple scenarios.

### Strategic Goals
1. **Transparency**: Make climate risk visible at infrastructure level
2. **Scenario Planning**: Enable what-if analysis across time horizons
3. **Decision Support**: Highlight prioritization of resilience investments
4. **Scalability**: Extensible to include additional hazards, infrastructure types, and data sources

### Out of Scope (MVP)
- User authentication & role-based access control
- PDF/CSV export
- Multi-scenario comparison (side-by-side)
- Historical analysis tracking
- Mobile application
- Data editing/administration UI

---

## 3. Target Users

### Stakeholder Profiles

| Role | Responsibility | Key Needs |
|------|---|---|
| **Business User** | Consult maps, analyze network exposure | Quick access to scenario selection, risk threshold filtering |
| **Infrastructure Analyst** | Evaluate specific assets (stations, bridges, tunnels, substations) | Detailed infrastructure layer filtering, spatial search |
| **Climate/Resilience Analyst** | Interpret climate scenarios and exposure indices | Climate scenario selection, threshold calibration |
| **Functional Administrator** | Configure layers, reference data, default thresholds | Layer management UI (future sprint) |

---

## 4. Technical Stack & Architecture

### Tech Stack

| Layer | Technology | Details |
|-------|-----------|---------|
| **Frontend** | React 18 + Vite | Component-based UI, fast development server |
| **Mapping** | Leaflet.js | Open-source, lightweight, performant for web |
| **Styling** | CSS3 + Tailwind (optional) | Responsive design, accessibility-first |
| **Backend** | FastAPI (Python) | Async REST API, GeoJSON endpoints, schema validation |
| **Data Pipeline** | Python + GeoPandas | Spatial data processing, hazard calculations, GeoJSON generation |
| **Database** | GeoPackage + CSV (files-based) | No separate DB server needed for MVP; data pre-processed to GeoJSON |
| **Deployment** | Local dev (MVP); Docker ready | `docker-compose` for multi-container orchestration (future) |

### Architecture Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                         TRACC View SNCF                        │
│                                                                │
│  Frontend (React + Leaflet)          Backend (FastAPI)       │
│  ┌───────────────────────┐    ┌───────────────────────┐      │
│  │  Map Control Panel    │    │  /api/networks        │      │
│  │  ├─ Network toggle    │───▶│  /api/hazards         │      │
│  │  ├─ Infra type filter │    │  /api/infrastructure  │      │
│  │  ├─ Climate scenario  │    │  /api/risk-analysis   │      │
│  │  └─ Risk threshold    │    │  /api/health          │      │
│  │                       │    └───────────────────────┘      │
│  │  Leaflet Map Canvas   │            ▲                      │
│  │  ├─ Base layer (OSM)  │            │                      │
│  │  ├─ Network layer     │    ┌───────┴──────────────┐      │
│  │  ├─ Hazard layers     │    │   Data Pipeline      │      │
│  │  └─ Risk highlight    │    │   (Python)           │      │
│  └───────────────────────┘    │  ├─ build_geojson.py │      │
│         port 5173              │  ├─ validate_sources │      │
│                                │  └─ config.py        │      │
│                                └──────────────────────┘      │
│                                                                │
│  Data Sources (Local/Files)                                  │
│  ├─ GeoPackage: Trafic_2022 (network + infrastructure)      │
│  ├─ CEREMA 2050 (3 files: flooding, heat, wind)             │
│  └─ RFN Characteristics (ZIP: infrastructure attributes)    │
└────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
[GeoPackage]  [CEREMA Scenarios]  [RFN Characteristics]
     │                │                     │
     └────────────────┼─────────────────────┘
                      │
                      ▼
        Data Pipeline (Python + GeoPandas)
        ├─ Load & validate sources
        ├─ Hazard calculation (IDW interpolation, E-weight)
        ├─ Infrastructure-hazard spatial join
        └─ Generate GeoJSON (by scenario & hazard)
                      │
                      ▼
              /app/data/geojson/
     (pre-generated, served as static files)
                      │
                      ▼
     Backend (FastAPI) ←→ Frontend (React)
     Endpoints serve GeoJSON + metadata
                      │
                      ▼
                 Leaflet Canvas
          (Interactive map with risk highlighting)
```

---

## 5. Core Components

### 5.1 Data Pipeline (`app/pipeline/`)

**Purpose**: Transform raw geospatial data into analysis-ready GeoJSON files.

#### Key Scripts

| Script | Role | Input | Output |
|--------|------|-------|--------|
| `config.py` | Configuration & paths | Manual setup | Config object |
| `validate_sources.py` | Data validation | Raw data files | Validation report |
| `build_geojson.py` | Main pipeline | Validated data | GeoJSON files (by scenario/hazard) |
| `_check_rcan.py` | Debugging helper | GeoJSON | Analysis output |

#### Data Transformations

1. **Load Network Data**: Read GeoPackage `Trafic_2022` layer
   - Extract geometries, line identifiers, traffic values
   - Validate coordinate reference system (CRS)

2. **Load Climate Data**: Read CEREMA files (2050 scenarios)
   - Parse CSV with 47-line header skip
   - Extract hazard indices (flooding, heat, wind)
   - Prepare 2030/2050/2100 horizons

3. **Spatial Join**: Link infrastructure to hazard zones
   - Use IDW (Inverse Distance Weighting) interpolation with k=8 neighbors
   - Apply E-weight scaling (default: 1.0)
   - Generate risk score per infrastructure-hazard combination

4. **Normalize**: Scale risk scores by horizon and hazard
   - Apply min-max normalization within each scenario
   - Generate color mapping (green→yellow→red)

5. **Output**: Export GeoJSON files
   - One file per scenario-hazard combination
   - Include all attributes (geom, risk score, infrastructure ID, etc.)
   - Served as static files by backend

### 5.2 Backend API (`app/backend/main.py`)

**Purpose**: Serve data endpoints and provide real-time risk analysis.

#### Endpoints

| Endpoint | Method | Purpose | Response |
|----------|--------|---------|----------|
| `/api/health` | GET | Health check | `{"status": "ok"}` |
| `/api/networks` | GET | List available network layers | `[{id, name, geojson_url, ...}]` |
| `/api/infrastructure?type={type}` | GET | Get infrastructure by type | GeoJSON FeatureCollection |
| `/api/hazards` | GET | List available hazards | `[{id, name, scenarios, ...}]` |
| `/api/risk-analysis` | POST | Compute risk for threshold | `{at_risk: [...], safe: [...]}` |

#### Key Features

- **Async handling** via FastAPI
- **GeoJSON validation** via Pydantic models
- **CORS enabled** for frontend
- **Graceful error handling** with user-friendly messages

### 5.3 Frontend (`app/frontend/src/`)

**Purpose**: Interactive mapping UI for hazard visualization and analysis.

#### Component Structure

```
frontend/src/
├─ components/
│  ├─ MapCanvas.jsx           # Leaflet map container
│  ├─ ControlPanel.jsx        # Left sidebar controls
│  ├─ NetworkToggle.jsx       # Show/hide network layer
│  ├─ InfraTypeFilter.jsx     # Infrastructure category selector
│  ├─ HazardSelector.jsx      # Climate hazard dropdown
│  ├─ ScenarioSelector.jsx    # Time horizon selector
│  ├─ ThresholdInput.jsx      # Risk threshold slider/input
│  ├─ AnalysisButton.jsx      # Trigger risk calculation
│  ├─ ClearButton.jsx         # Reset to initial state
│  └─ ErrorBoundary.jsx       # Error handling wrapper
├─ hooks/
│  ├─ useMapState.js          # Map & layer state management
│  ├─ useAPI.js               # API fetching & caching
│  └─ useGeoJSON.js           # GeoJSON loading & rendering
├─ utils/
│  ├─ colorScale.js           # Risk-to-color mapping
│  ├─ validation.js           # Input validation rules
│  └─ constants.js            # App-wide constants
├─ App.jsx                    # Root component
└─ App.css                    # Global styles
```

#### Key Features

- **Interactive Leaflet Map** with zoom, pan, layer controls
- **Real-time layer toggling** (network, hazards)
- **Threshold-based filtering** for risk visualization
- **Color-coded risk display** (green/yellow/red by hazard intensity)
- **Responsive design** for desktop and tablet
- **Accessibility**: ARIA labels, keyboard navigation

---

## 6. Data Model & Concepts

### Infrastructure Categories

| Type | Examples | Geometry | Key Attribute |
|------|----------|----------|---|
| **Lines** | Freight, passenger routes | LineString | code_ligne |
| **Stations** | Major/minor stations | Point | mnemo |
| **Bridges** | Railway bridges | Point/LineString | structure_id |
| **Tunnels** | Underground sections | LineString | tunnel_id |
| **Substations** | Electrical infrastructure | Point | substation_id |

### Climate Hazards (5 Total)

| Hazard | Unit | Threshold Rule | Visual |
|--------|------|---|---|
| **Flooding** | Depth (m) or Probability | >0.5m = HIGH | Blue gradient |
| **Wildfire** | Danger Index | >3 = HIGH | Orange gradient |
| **Heat** | Temperature (°C) anomaly | >4°C = HIGH | Red gradient |
| **Wind** | Speed (m/s) | >20 m/s = HIGH | Purple gradient |
| **Landslide** | Susceptibility (0-1) | >0.6 = HIGH | Brown gradient |

### Time Horizons

1. **Reference** (2015-2020 baseline)
2. **2030** (Near-term)
3. **2050** (Mid-term)
4. **2100** (Long-term)

---

## 7. Sprint Plan & Roadmap

### Sprint 0 — Technical Foundation ✅ COMPLETE

**Duration**: ~2 days  
**Objective**: Set up environment, validate data sources, prepare configuration

**Deliverables**:
- [x] Data source inspection & validation
- [x] `config.py` with absolute paths
- [x] Dependency installation confirmed
- [x] GeoPackage and CEREMA file readability verified

**Acceptance Criteria** (all PASS):
- S0-01: GeoPackage readable, expected columns present
- S0-02: CEREMA file readable, >100 rows, climate columns exist
- S0-03: RFN ZIP contains valid GeoPackage
- S0-04: `config.py` with all valid paths

---

### Sprint 1 — Complete MVP Application (In Progress)

**Duration**: ~3 days  
**Objective**: Deliver end-to-end application with network visualization, hazard overlay, and risk filtering

**User Stories Included**:
- US-001: Show/hide railway network layer
- US-002: Map navigation (zoom, pan, drag)
- US-003: Infrastructure type filtering
- US-004: Hazard selection dropdown
- US-005: Time horizon/scenario selection
- US-006: Risk threshold input & visualization
- US-007: Analysis trigger button
- US-008: Map reset/clear
- US-009: Error messages & guidance

**Deliverables**:
- Complete GeoJSON files (all 5 hazards × 3 horizons)
- FastAPI backend with 4+ endpoints
- React frontend with full UI
- Integration testing (happy path)

**Acceptance Criteria**:
- S1-01: Network layer renders on map
- S1-02: Infrastructure types filter correctly
- S1-03: Hazard selection changes layer display
- S1-04: Risk threshold highlights at-risk assets
- S1-05: All error cases handled gracefully
- S1-06: No console errors or warnings
- S1-07: Map performance acceptable (< 2s load time)

---

### Sprint 2 — Infrastructure Details & Export (Planned)

**Focus**: Detailed infrastructure lookup, export capability

**Tentative Stories**:
- US-101: Infrastructure attribute panel (click to show details)
- US-102: Spatial search (draw/search area)
- US-103: CSV export of at-risk assets
- US-104: Scenario comparison (side-by-side view)

---

### Sprint 3+ — Admin & Advanced Features (Backlog)

- Role-based access control
- Data administration UI
- Performance optimization (tile-based rendering)
- Mobile responsiveness

---

## 8. Agents & Team Roles

### Available Agents

Each agent has a specific domain and activation trigger:

#### **tracc-data** (`_bmad/.agents/tracc-data.agent.md`)
**Role**: Data pipeline architect  
**Expertise**: GeoPandas, spatial joins, IDW interpolation, GeoJSON generation  
**Activate when**: 
- Regenerating GeoJSON from sources
- Debugging hazard calculations
- Validating spatial data transformations
- Adjusting normalization or weighting

**Typical command**: *"Generate complete GeoJSON with 5 hazards (E=1.0), IDW k=8, normalize by horizon"*

---

#### **tracc-backend** (`_bmad/.agents/tracc-backend.agent.md`)
**Role**: API architect  
**Expertise**: FastAPI, async/await, GeoJSON validation, REST design  
**Activate when**:
- Creating or modifying endpoints
- Debugging API errors or performance
- Adding schema validation
- Implementing error handling

**Typical command**: *"Create FastAPI backend with /api/networks, /api/hazards, /api/infrastructure, /api/risk-analysis endpoints"*

---

#### **tracc-frontend** (`_bmad/.agents/tracc-frontend.agent.md`)
**Role**: UI/UX developer  
**Expertise**: React, Leaflet, responsive design, accessibility  
**Activate when**:
- Building or modifying UI components
- Implementing map interactions
- Styling and layout work
- Accessibility improvements

**Typical command**: *"Create React control panel with network toggle, infrastructure filter, hazard selector, scenario dropdown, threshold input"*

---

#### **tracc-qa** (`_bmad/.agents/tracc-qa.agent.md`)
**Role**: QA & acceptance tester  
**Expertise**: Test scenario design, acceptance criteria validation, user story verification  
**Activate when**:
- End of sprint (before closure)
- Validating user story completion
- Producing acceptance report
- Identifying test gaps

**Typical command**: *"Launch acceptance testing for Sprint 1 — verify all US criteria"*

---

### Team Workflow

```
┌──────────────────────────────────────────────────────────┐
│  SPRINT CYCLE                                            │
│                                                          │
│  1. DEVELOPMENT (Parallel)                              │
│     tracc-data    → Build GeoJSON pipeline              │
│     tracc-backend → Implement API endpoints              │
│     tracc-frontend → Build React UI components           │
│                                                          │
│  2. LOCAL INTEGRATION                                    │
│     Developer runs: npm run dev + python -m uvicorn     │
│     Quick manual smoke test                             │
│                                                          │
│  3. QA & ACCEPTANCE (tracc-qa)                          │
│     Run test scenarios for all user stories             │
│     Produce PASS/FAIL report per criterion              │
│                                                          │
│  4. CLOSURE / CORRECTION                                │
│     If PASS → Sprint closed, move to next               │
│     If FAIL → Assign to domain agent for fix, retest    │
└──────────────────────────────────────────────────────────┘
```

---

## 9. Development Environment Setup

### Prerequisites

- **Python**: 3.10+
- **Node.js**: 18+
- **Git**: Latest stable
- **VS Code** or similar (with Python & JavaScript extensions recommended)

### Quick Start

#### 1. Clone & Navigate
```bash
cd c:\AppsIA\tracc-view-sncf
```

#### 2. Set Up Backend
```bash
cd app/backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

#### 3. Set Up Pipeline
```bash
cd ../pipeline
pip install -r requirements.txt
```

#### 4. Set Up Frontend
```bash
cd ../frontend
npm install
```

#### 5. Start Development Servers (in separate terminals)

**Terminal 1 — Backend (FastAPI)**:
```bash
cd app/backend
python -m uvicorn main:app --reload --port 8000
```

**Terminal 2 — Frontend (Vite + React)**:
```bash
cd app/frontend
npm run dev
```

Frontend will be available at: `http://localhost:5173`  
Backend API: `http://localhost:8000`  
API docs: `http://localhost:8000/docs` (Swagger UI)

#### 6. Regenerate GeoJSON (as needed)
```bash
cd app/pipeline
python build_geojson.py
```

---

## 10. Key Decisions & Design Rationale

### Why GeoPandas?
**Decision**: Use GeoPandas for spatial data processing  
**Rationale**:
- Native support for spatial operations (buffer, intersect, spatial join)
- Seamless integration with Shapely for geometry
- Pandas-compatible API for data manipulation
- Pre-processing to GeoJSON eliminates runtime computation

### Why Leaflet?
**Decision**: Use Leaflet.js instead of Mapbox or Cesium  
**Rationale**:
- Open-source, no API keys required
- Lightweight (smaller JS bundle)
- Excellent plugin ecosystem (layer controls, draw, clustering)
- Sufficient for 2D visualization at MVP scope

### Why File-Based Data (MVP)?
**Decision**: Serve pre-computed GeoJSON from static files  
**Rationale**:
- Eliminates database complexity for MVP
- Fast, predictable performance
- Easy to version control and audit
- Transition to database simple when scale requires

### Why FastAPI?
**Decision**: Use FastAPI for REST API  
**Rationale**:
- Async-first, excellent performance
- Automatic interactive API docs (Swagger)
- Pydantic validation out-of-the-box
- Python ecosystem aligns with data pipeline

---

## 11. Common Tasks & How to Invoke Agents

### Task: Generate/Regenerate GeoJSON Files

**Invoke**: `tracc-data` agent  
**Command**: *"Regenerate all GeoJSON files for 5 hazards and 3 horizons with IDW k=8, E=1.0, min-max normalization"*

**Expected Output**:
- GeoJSON files in `/app/data/geojson/`
- Validation summary (row counts, coordinate ranges)
- Color mapping legend

---

### Task: Add New API Endpoint

**Invoke**: `tracc-backend` agent  
**Command**: *"Add endpoint GET /api/infrastructure-by-id?id={id} that returns full attributes for a single infrastructure object"*

**Expected Output**:
- Updated `main.py` with new route
- Pydantic schema for response
- Integration test example
- API docs (auto-generated)

---

### Task: Create UI Component

**Invoke**: `tracc-frontend` agent  
**Command**: *"Create a React component `<HazardLegend />` that displays the color scale mapping (0-100 → green to red) and current hazard description"*

**Expected Output**:
- New `HazardLegend.jsx` component
- Styling (CSS module or Tailwind)
- Integration into `ControlPanel.jsx`
- Accessibility annotations (ARIA labels)

---

### Task: Run Acceptance Tests

**Invoke**: `tracc-qa` agent  
**Command**: *"Launch Sprint 1 acceptance testing — verify all 9 user stories against criteria"*

**Expected Output**:
- Test execution log
- PASS/FAIL matrix per story
- Screenshots (optional)
- Recommendation (Ready for Production / Needs Fixes)

---

## 12. Troubleshooting & Common Issues

| Issue | Root Cause | Resolution |
|-------|-----------|---|
| **GeoPackage not found** | Path in `config.py` incorrect | Run `validate_sources.py` to debug; update config with absolute path |
| **CORS error in browser** | Backend CORS middleware missing | Ensure `CORSMiddleware` in `main.py` allows frontend origin |
| **Map doesn't load** | API endpoint 404 or timeout | Check backend is running; verify endpoint URL matches frontend fetch calls |
| **Slow map rendering** | GeoJSON file too large | Use tracc-data agent to simplify geometries or increase zoom threshold |
| **Infrastructure not visible** | Layer not added to map or wrong CRS | Confirm GeoJSON has valid geometries; check Leaflet projection (EPSG:4326) |

---

## 13. Resources & Links

### Documentation
- [ROADMAP.md](../ROADMAP.md) — Sprint roadmap & acceptance criteria
- [Detailed User Stories](../stories/user_stories_detaillees.md)
- [Wireframe & UI Mockups](../stories/wireframe.md)
- [Acceptance Tests](../stories/tests_acceptance.md)
- [MVP Backlog](../stories/backlog_mvp.md)

### External References
- [Leaflet.js Docs](https://leafletjs.com/)
- [FastAPI Guide](https://fastapi.tiangolo.com/)
- [GeoPandas Docs](https://geopandas.org/)
- [React Hooks](https://react.dev/reference/react/hooks)
- [Vite Documentation](https://vitejs.dev/)

### Internal Agents
- `.github/agents/tracc-*.agent.md` — Domain-specific agent definitions
- `.github/instructions/tracc-view-sncf.instructions.md` — Global project rules

---

## 14. Getting Help

### How to Ask for Help

1. **Clearly identify the domain**:
   - Data/pipeline issue → Invoke `tracc-data`
   - API/backend issue → Invoke `tracc-backend`
   - UI/frontend issue → Invoke `tracc-frontend`
   - Testing/QA issue → Invoke `tracc-qa`

2. **Be specific**:
   - "Create a component that..." (not "Make it pretty")
   - "Fix the risk calculation for..." (not "It's broken")
   - "Verify that user story X meets criteria Y" (not "Test it")

3. **Provide context**:
   - What did you try?
   - What error or behavior did you observe?
   - Which files/endpoints are involved?

### Communication Channels
- **In-agent**: Describe the task and expected output directly
- **Sprint planning**: Use `tracc-qa` agent to review user stories
- **Escalation**: If an agent needs clarification, it will ask follow-up questions

---

## 15. Next Steps

### Immediate (This Sprint)
1. [ ] Confirm all Sprint 1 user stories are clear
2. [ ] Invoke `tracc-data` to regenerate GeoJSON
3. [ ] Invoke `tracc-backend` to complete API
4. [ ] Invoke `tracc-frontend` to build UI
5. [ ] Run local integration test
6. [ ] Invoke `tracc-qa` for acceptance testing

### Before Next Sprint
- [ ] Review test results with team
- [ ] Document any data assumptions or limitations found
- [ ] Prepare backlog for Sprint 2 (infrastructure details, export)

---

## Summary

**TRACC View SNCF** is a focused climate vulnerability tool for SNCF. The MVP delivers:
- ✅ Interactive map of French railway network
- ✅ 5 climate hazards overlaid across 4 time horizons
- ✅ Infrastructure type filtering
- ✅ Risk threshold-based highlighting
- ✅ Intuitive control panel UI

The project uses **Python + React + FastAPI + Leaflet** with a **team of 4 specialized agents** managing data, backend, frontend, and QA. Each agent has clear ownership and activation triggers.

**Next**: Invoke the domain agents to complete Sprint 1 development.

---

*Generated: 2026-08-07 | Project: tracc-view-sncf | Phase: Planning*
