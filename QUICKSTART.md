---
title: "TRACC View SNCF — Quick Reference & Cheat Sheet"
date: 2026-08-07
project: tracc-view-sncf
type: cheat-sheet
status: active
---

# TRACC View SNCF — Quick Reference Cheat Sheet

## 🚀 Quick Start (Copy-Paste)

```bash
# Setup (one-time)
cd c:\AppsIA\tracc-view-sncf

# Backend
cd app\backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

# Pipeline  
cd ..\pipeline
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

# Frontend
cd ..\frontend
npm install

# Start development (3 terminals)
# Terminal 1 — Backend
cd app\backend && venv\Scripts\activate && python -m uvicorn main:app --reload --port 8000

# Terminal 2 — Frontend
cd app\frontend && npm run dev

# Terminal 3 — Data (if needed)
cd app\pipeline && python build_geojson.py
```

**Access**: `http://localhost:5173` (app) | `http://localhost:8000/docs` (API)

---

## 📁 Project Structure at a Glance

```
app/
├─ frontend/       React + Leaflet UI
├─ backend/        FastAPI server
├─ pipeline/       GeoPandas ETL
└─ data/geojson/   Generated output

_bmad-output/
├─ planning-artifacts/       PROJECT-CONTEXT.md (you are here!)
└─ implementation-artifacts/ Test results, code outputs

stories/
├─ user_stories_detaillees.md   Requirements
├─ backlog_mvp.md               MVP scope
├─ tests_acceptance.md          Acceptance criteria
└─ wireframe.md                 UI mockups

.github/agents/
├─ tracc-data.agent.md          Data pipeline agent
├─ tracc-backend.agent.md       API agent
├─ tracc-frontend.agent.md      UI agent
└─ tracc-qa.agent.md            QA agent
```

---

## 🎯 Common Tasks

### Frontend Development

**Create a new component:**
```bash
# 1. Create file
touch app/frontend/src/components/MyComponent.jsx

# 2. Write component
# 3. Import in App.jsx or parent component
# 4. See changes at http://localhost:5173
# 5. Check for errors in browser console (F12)
```

**Add a new state slice:**
```javascript
// In app/frontend/src/AppContext.jsx
const initialState = {
  // ... existing state
  myNewState: 'value',
};

function appReducer(state, action) {
  switch(action.type) {
    case 'UPDATE_MY_STATE':
      return { ...state, myNewState: action.payload };
    // ...
  }
}

// In component:
const { state, dispatch } = useContext(AppContext);
dispatch({ type: 'UPDATE_MY_STATE', payload: newValue });
```

**Debug React component:**
```javascript
// Inside component
console.log('Props:', props);
console.log('State:', state);

// Or use React DevTools browser extension
// (Install from Chrome Store or Firefox Add-ons)
```

**Lint and fix code:**
```bash
cd app/frontend
npm run lint                 # Check for issues
npm run lint -- --fix      # Auto-fix issues
```

---

### Backend Development

**Add a new API endpoint:**
```python
# In app/backend/main.py

from fastapi import FastAPI, HTTPException

@app.get("/api/my-new-endpoint")
async def my_endpoint(param: str):
    """
    Description of what this endpoint does.
    """
    try:
        # Your logic here
        result = process_data(param)
        return {"status": "ok", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

**Test endpoint:**
1. Start backend: `python -m uvicorn main:app --reload`
2. Visit: `http://localhost:8000/docs`
3. Find your endpoint in Swagger UI
4. Click "Try it out" → Enter parameters → "Execute"

**Fetch from frontend:**
```javascript
// In app/frontend/src/services/dataService.js
async function fetchMyEndpoint(param) {
  const response = await fetch(`http://localhost:8000/api/my-new-endpoint?param=${param}`);
  return response.json();
}

// In component:
const data = await dataService.fetchMyEndpoint('value');
```

**Debug API request:**
```bash
# Terminal
curl http://localhost:8000/api/networks

# Or use Postman
# POST http://localhost:8000/api/risk-analysis
# Body (JSON): {"infrastructure_type": "stations", "hazard": "flooding", ...}
```

---

### Data Pipeline

**Regenerate GeoJSON files:**
```bash
cd app/pipeline
python build_geojson.py
# Output files appear in app/data/geojson/
```

**Validate data sources:**
```bash
cd app/pipeline
python validate_sources.py
# Reports on GeoPackage, CEREMA, RFN readability
```

**Debug data issues:**
```bash
cd app/pipeline
python _check_rcan.py flooding_2050.geojson
# Shows stats, feature count, risk score distribution
```

**Update configuration:**
```python
# Edit app/pipeline/config.py
CONFIG = {
    'source_paths': {
        'geopackage': r'C:\Path\To\Trafic_2022.gpkg',  # Use raw string r''
        'cerema_2050': r'C:\Path\To\CEREMA_2050.txt',
        # ...
    },
    'processing': {
        'idw_k': 8,           # Number of neighbors for IDW
        'e_weight': 1.0,      # Hazard weight multiplier
    }
}
```

---

## 🧪 Testing & QA

**Run acceptance tests (invoke agent):**
```bash
# Use BMAD command
bmad-qa "Sprint 1 acceptance testing"

# Or manually: Check each user story against criteria
# File: stories/tests_acceptance.md
```

**Manual testing checklist:**
- [ ] Map loads and displays network layer
- [ ] Network layer toggles on/off
- [ ] Infrastructure types filter correctly
- [ ] Hazard selection updates map display
- [ ] Risk threshold slider works
- [ ] Analysis button triggers calculation
- [ ] Risk visualization updates (green→yellow→red)
- [ ] Clear button resets all selections
- [ ] No console errors (F12 → Console)
- [ ] No API errors (Network tab)

---

## 🐛 Common Errors & Fixes

| Error | Fix |
|-------|-----|
| **"Port 5173 in use"** | `netstat -ano \| findstr :5173` → `taskkill /PID <PID> /F` |
| **"CORS blocked"** | Backend not running; check `main.py` CORS middleware |
| **"GeoJSON not found"** | Run `python build_geojson.py` in pipeline directory |
| **"API returns 400"** | Check query parameters; use Swagger at /docs |
| **"Map blank white"** | Check Leaflet CSS in index.html; verify geojson data |
| **"Risk scores all 0"** | Regenerate GeoJSON; check data normalization |
| **"Cannot find module"** | Run `npm install` in frontend; `pip install -r requirements.txt` in backend/pipeline |

---

## 👥 Using BMAD Agents

### When to Invoke Each Agent

| Task | Agent | Command |
|------|-------|---------|
| Regenerate GeoJSON | `tracc-data` | *"Regenerate all GeoJSON with 5 hazards, 3 horizons, IDW k=8"* |
| Create API endpoint | `tracc-backend` | *"Add endpoint GET /api/infrastructure-bounds"* |
| Build UI component | `tracc-frontend` | *"Create RiskSummary component showing at-risk count"* |
| Test sprint | `tracc-qa` | *"Launch Sprint 1 acceptance testing"* |

### How to Invoke

1. Open VS Code command palette (Ctrl+Shift+P)
2. Type: `@tracc-data` (or other agent)
3. Select agent from dropdown
4. Type your task description
5. Press Enter
6. Wait for agent to complete

---

## 🔗 URLs & Endpoints

| URL | Purpose | Example |
|-----|---------|---------|
| `http://localhost:5173` | Frontend app | Click, interact with map |
| `http://localhost:8000` | Backend base | Send requests |
| `http://localhost:8000/docs` | Swagger UI | Test endpoints interactively |
| `http://localhost:8000/redoc` | ReDoc | Read-only API documentation |
| `http://localhost:8000/api/health` | Health check | `{"status": "ok"}` |
| `http://localhost:8000/api/networks` | List networks | Returns network layers |
| `http://localhost:8000/api/infrastructure?type=stations` | Get infrastructure | Returns GeoJSON |
| `http://localhost:8000/api/hazards` | List hazards | Returns 5 hazards metadata |
| `http://localhost:8000/api/risk-analysis` | Analyze risk | POST with parameters |

---

## 📝 Git Workflow

```bash
# Clone
git clone https://github.com/SNCF/tracc-view-sncf.git

# Create feature branch
git checkout -b feature/short-description

# Make changes, commit regularly
git add .
git commit -m "feat: add new component"
# Conventional Commits: feat, fix, refactor, docs, test, chore

# Push
git push origin feature/short-description

# Create Pull Request on GitHub, wait for review, merge
```

---

## 🎓 Key Concepts

### Frontend State Flow
```
User Input → Component dispatches action → AppContext updates state → 
Components re-render → API call (if needed) → Update GeoJSON layers
```

### Backend Request/Response
```
Frontend POST /api/risk-analysis
  ↓
FastAPI validates input (Pydantic)
  ↓
Process hazard data, compute risk scores
  ↓
Return GeoJSON FeatureCollection
  ↓
Frontend updates RiskLayer on map
```

### Data Pipeline Workflow
```
Raw GeoPackage + CEREMA files
  ↓
Load & validate sources
  ↓
Spatial join (infrastructure ← climate)
  ↓
IDW interpolation (smooth values)
  ↓
Normalize & color-map
  ↓
Export 15 GeoJSON files (5 hazards × 3 horizons)
  ↓
Backend serves files to frontend
```

---

## 📚 Documentation Files

| File | Purpose | Read When |
|------|---------|-----------|
| [PROJECT-CONTEXT.md](./\_bmad-output/planning-artifacts/PROJECT-CONTEXT.md) | Architecture & overview | Starting work, need big picture |
| [DEVELOPMENT.md](./DEVELOPMENT.md) | Detailed dev guide | Setting up, debugging, component reference |
| [ROADMAP.md](./ROADMAP.md) | Sprint plan & timeline | Sprint planning, deadline checking |
| [user_stories_detaillees.md](./stories/user_stories_detaillees.md) | Requirements | Understanding acceptance criteria |
| [tests_acceptance.md](./stories/tests_acceptance.md) | QA test cases | Testing before sprint closure |
| [wireframe.md](./stories/wireframe.md) | UI mockups | UI development, design reference |

---

## 💡 Pro Tips

1. **Use Swagger UI** (`http://localhost:8000/docs`) to test API endpoints without coding
2. **Keep 3 terminals open**: One for backend, one for frontend, one for pipeline/git
3. **Invoke agents early** rather than debugging alone; they have full context
4. **Save PROJECT-CONTEXT.md** as a bookmark for quick reference
5. **Run validation before committing**: `npm run lint` (frontend), no backend lint yet
6. **Check ROADMAP.md** before sprint to know deadline and scope
7. **Use BMAD commands** (`bmad-help`, `bmad-qa`) for sprint guidance

---

## 🚨 Emergency Commands

```bash
# Kill all processes on dev ports
netstat -ano | findstr :5173
taskkill /PID <PID> /F

netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Force clear npm cache
npm cache clean --force

# Reset git to last commit (lose local changes!)
git reset --hard HEAD

# Start fresh Python environment
cd app\backend
rmdir venv /s /q
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

---

## 🎯 What to Do Right Now

1. **Clone repo** (if not done):
   ```bash
   cd c:\AppsIA
   git clone https://github.com/SNCF/tracc-view-sncf.git
   ```

2. **Run Quick Start** (see top of this document)

3. **Open 3 terminals** and start dev servers

4. **Visit** `http://localhost:5173` and test the app

5. **For your first task**, invoke the appropriate agent:
   ```bash
   # Example: Want to improve the frontend UI?
   @tracc-frontend
   "Create a detailed legend component showing current hazard, scenario, and threshold"
   ```

6. **End of sprint**: Run acceptance tests
   ```bash
   @tracc-qa
   "Launch Sprint 1 acceptance testing"
   ```

---

## 📞 Getting Help

1. **Check this cheat sheet** (you're reading it!)
2. **Read PROJECT-CONTEXT.md** for architecture overview
3. **Read DEVELOPMENT.md** for detailed troubleshooting
4. **Invoke BMAD agent** for domain-specific help
5. **Check browser console** (F12) for frontend errors
6. **Check terminal output** for backend errors
7. **Use Swagger UI** to test API endpoints

---

*Last updated: 2026-08-07*  
*For full documentation, see DEVELOPMENT.md*
