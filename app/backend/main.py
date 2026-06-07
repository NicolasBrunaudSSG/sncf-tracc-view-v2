"""
main.py — Backend FastAPI TRACC View SNCF
4 endpoints : /api/reseau, /api/hev/{scenario}, /api/hev/{scenario}/risk, /api/metadata
GeoJSON chargé en mémoire au démarrage (lifespan).
"""
import json
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

DATA_DIR  = Path(__file__).parent.parent / "data"
INFRA_DIR = DATA_DIR / "infra"

VALID_SCENARIOS = {"reference", "2050", "2065", "2100"}
VALID_ALEAS     = {"canicule", "incendie", "secheresse", "inondation", "glissement"}
VALID_INFRA     = {"gares", "passerelles", "ponts-route", "ouvrages"}
INFRA_FILES     = {
    "gares":       "liste-des-gares.geojson",
    "passerelles": "liste-des-passerelles.geojson",
    "ponts-route": "liste-des-ponts-route.geojson",
    "ouvrages":    "liste-ouvrages-en-terre.geojson",
}

# Cache in-memory
_cache: dict = {}


def _load_geojson(path: Path) -> dict:
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def _quantile(values: list, q: float) -> float:
    """Percentile q ∈ [0,1] par méthode nearest-rank."""
    if not values:
        return 0.0
    sorted_vals = sorted(values)
    idx = min(int(q * len(sorted_vals)), len(sorted_vals) - 1)
    return sorted_vals[idx]


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Charge tous les GeoJSON au démarrage."""
    print("Chargement des GeoJSON en mémoire...")
    try:
        _cache["reseau"] = _load_geojson(DATA_DIR / "reseau_national.geojson")
        print(f"  reseau_national.geojson : {len(_cache['reseau']['features'])} features")
    except FileNotFoundError:
        print("  WARN : reseau_national.geojson absent — lancer build_geojson.py")
        _cache["reseau"] = {"type": "FeatureCollection", "features": []}

    for scenario in VALID_SCENARIOS:
        path = DATA_DIR / f"hev_{scenario}.geojson"
        try:
            _cache[f"hev_{scenario}"] = _load_geojson(path)
            n = len(_cache[f"hev_{scenario}"]["features"])
            print(f"  hev_{scenario}.geojson : {n} features")
        except FileNotFoundError:
            print(f"  WARN : hev_{scenario}.geojson absent")
            _cache[f"hev_{scenario}"] = {"type": "FeatureCollection", "features": []}

    try:
        with open(DATA_DIR / "metadata.json", encoding="utf-8") as f:
            _cache["metadata"] = json.load(f)
        print("  metadata.json : OK")
    except FileNotFoundError:
        print("  WARN : metadata.json absent")
        _cache["metadata"] = {}

    for key, fname in INFRA_FILES.items():
        path = INFRA_DIR / fname
        try:
            _cache[f"infra_{key}"] = _load_geojson(path)
            n = len(_cache[f"infra_{key}"]["features"])
            print(f"  infra/{fname} : {n} features")
        except FileNotFoundError:
            print(f"  WARN : infra/{fname} absent")
            _cache[f"infra_{key}"] = {"type": "FeatureCollection", "features": []}
    carroyage_path = DATA_DIR / "carroyage_light.geojson"
    try:
        _cache["carroyage"] = _load_geojson(carroyage_path)
        n = len(_cache["carroyage"]["features"])
        print(f"  carroyage_light.geojson : {n} features")
    except FileNotFoundError:
        print("  WARN : carroyage_light.geojson absent -- lancer build_geojson.py")
        _cache["carroyage"] = {"type": "FeatureCollection", "features": []}
    yield
    _cache.clear()


app = FastAPI(
    title="TRACC View SNCF",
    description="API de visualisation des risques climatiques sur le réseau ferroviaire",
    version="1.0.0-sprint1",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://nicolasbrunaudssg.github.io",
    ],
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)


# ─── GET /api/reseau ─────────────────────────────────────────────────────────

@app.get("/api/reseau")
def get_reseau():
    """Réseau ferroviaire national complet."""
    return JSONResponse(content=_cache.get("reseau", {"type": "FeatureCollection", "features": []}))


# ─── GET /api/hev/{scenario} ─────────────────────────────────────────────────

@app.get("/api/hev/{scenario}")
def get_hev(scenario: str):
    """Réseau avec indices HEV pour le scénario donné."""
    if scenario not in VALID_SCENARIOS:
        raise HTTPException(
            status_code=400,
            detail=f"Scénario '{scenario}' invalide. Valeurs acceptées : {sorted(VALID_SCENARIOS)}",
        )
    data = _cache.get(f"hev_{scenario}")
    if data is None or not data.get("features"):
        raise HTTPException(
            status_code=404,
            detail=f"Données HEV pour le scénario '{scenario}' non disponibles. Lancer build_geojson.py.",
        )
    return JSONResponse(content=data)


# ─── GET /api/hev/{scenario}/risk ────────────────────────────────────────────

@app.get("/api/hev/{scenario}/risk")
def get_risk(
    scenario: str,
    alea: str = Query(..., description="Aléa climatique"),
    threshold: float = Query(0.0, ge=0.0, le=1.0, description="Seuil de risque [0-1]"),
):
    """Segments filtrés au-dessus du seuil pour un aléa et un scénario."""
    if scenario not in VALID_SCENARIOS:
        raise HTTPException(
            status_code=400,
            detail=f"Scénario '{scenario}' invalide. Valeurs acceptées : {sorted(VALID_SCENARIOS)}",
        )
    if alea not in VALID_ALEAS:
        raise HTTPException(
            status_code=400,
            detail=f"Aléa '{alea}' invalide. Valeurs acceptées : {sorted(VALID_ALEAS)}",
        )
    data = _cache.get(f"hev_{scenario}")
    if data is None or not data.get("features"):
        raise HTTPException(
            status_code=404,
            detail=f"Données HEV pour le scénario '{scenario}' non disponibles.",
        )

    risk_key = f"R_{alea}"
    filtered = [
        f for f in data["features"]
        if f.get("properties", {}).get(risk_key, 0.0) >= threshold
    ]
    return JSONResponse(content={"type": "FeatureCollection", "features": filtered})


# ─── GET /api/metadata ───────────────────────────────────────────────────────

@app.get("/api/metadata")
def get_metadata():
    """Listes des scénarios, aléas et métadonnées de génération."""
    return JSONResponse(content=_cache.get("metadata", {}))


# ─── GET /api/infra/{infra_type} ─────────────────────────────────────────────

@app.get("/api/infra/{infra_type}")
def get_infra(infra_type: str):
    """GeoJSON d'une couche d'infrastructure ponctuelle SNCF."""
    if infra_type not in VALID_INFRA:
        raise HTTPException(
            status_code=400,
            detail=f"Type '{infra_type}' invalide. Valeurs acceptées : {sorted(VALID_INFRA)}",
        )
    data = _cache.get(f"infra_{infra_type}")
    if data is None:
        raise HTTPException(status_code=404, detail=f"Données infra '{infra_type}' non disponibles.")
    return JSONResponse(content=data)


# --- GET /api/carroyage -------------------------------------------------------

@app.get("/api/carroyage")
def get_carroyage():
    """Carroyage 1km² allégé : géométries simplifiées + indices R canicule/inondation."""
    data = _cache.get("carroyage")
    if not data or not data.get("features"):
        raise HTTPException(
            status_code=404,
            detail="carroyage_light.geojson absent. Lancer build_geojson.py.",
        )
    return JSONResponse(content=data)


# ─── GET /api/hev/{scenario}/cross ────────────────────────────────────────────

@app.get("/api/hev/{scenario}/cross")
def get_cross(
    scenario: str,
    alea1: str = Query(..., description="Premier aléa"),
    alea2: str = Query(..., description="Second aléa"),
    q1: float = Query(0.75, ge=0.0, le=1.0, description="Quantile aléa 1"),
    q2: float = Query(0.75, ge=0.0, le=1.0, description="Quantile aléa 2"),
):
    """Segments où R_alea1 ≥ quantile(q1) ET R_alea2 ≥ quantile(q2)."""
    if scenario not in VALID_SCENARIOS:
        raise HTTPException(
            status_code=400,
            detail=f"Scénario '{scenario}' invalide. Valeurs acceptées : {sorted(VALID_SCENARIOS)}",
        )
    for alea in (alea1, alea2):
        if alea not in VALID_ALEAS:
            raise HTTPException(
                status_code=400,
                detail=f"Aléa '{alea}' invalide. Valeurs acceptées : {sorted(VALID_ALEAS)}",
            )
    data = _cache.get(f"hev_{scenario}")
    if data is None or not data.get("features"):
        raise HTTPException(
            status_code=404,
            detail=f"Données HEV scénario '{scenario}' non disponibles.",
        )
    features = data["features"]
    key1, key2 = f"R_{alea1}", f"R_{alea2}"
    vals1 = [f["properties"].get(key1, 0.0) for f in features]
    vals2 = [f["properties"].get(key2, 0.0) for f in features]
    t1 = _quantile(vals1, q1)
    t2 = _quantile(vals2, q2)
    filtered = [
        f for f in features
        if f["properties"].get(key1, 0.0) >= t1
        and f["properties"].get(key2, 0.0) >= t2
    ]
    return JSONResponse(content={
        "type": "FeatureCollection",
        "features": filtered,
        "metadata": {"threshold1": round(t1, 4), "threshold2": round(t2, 4), "n_cross": len(filtered)},
    })


# ─── Lancement direct ────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
