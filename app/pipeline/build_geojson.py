#!/usr/bin/env python3
"""
build_geojson.py v2 -- Pipeline TRACC View SNCF -- Pivot carroyage
=================================================================
Source principale : DERNIERE VERSION (nouvelles formules).gpkg
- 57 206 cellules de carroyage 1 km², CRS Lambert 93 (EPSG:2154)
- H/E/V/R pré-calculés pour canicule et inondation (2050/2065/2100)
- IFM40/SWI04 bruts pour incendie et sécheresse

Méthode de jointure : sjoin_nearest (centroïde segment -> cellule pivot)
Les 6 090 segments conservent code_ligne, mnemo, Segment_ID.
"""
import sys
import json
import warnings

import numpy as np
import pandas as pd
import geopandas as gpd
from pathlib import Path
from datetime import datetime

warnings.filterwarnings("ignore")

sys.path.insert(0, str(Path(__file__).parent))
from config import (
    PIVOT_GPKG, PIVOT_LAYER,
    GPKG_TRAFIC, OUTPUT_DIR,
    SCENARIOS, ALEAS,
    PIVOT_COL_MAP,
)


# --- Helpers ----------------------------------------------------------------

def minmax(s: pd.Series) -> pd.Series:
    """Normalisation min-max, renvoie 0.5 si la plage est nulle."""
    mn, mx = s.min(), s.max()
    if mx == mn:
        return pd.Series(0.5, index=s.index)
    return ((s - mn) / (mx - mn)).clip(0, 1)


def get_col(joined: pd.DataFrame, col: str, default: float = 0.0) -> pd.Series:
    """Lit une colonne du pivot ou renvoie une série de valeurs par défaut."""
    if col and col in joined.columns:
        return joined[col].fillna(default).clip(0, 1)
    return pd.Series(default, index=joined.index)


# --- 1. Chargement du pivot -------------------------------------------------

print("=" * 62)
print("Pipeline TRACC View SNCF v2 -- Pivot carroyage")
print("=" * 62)
print(f"\nChargement du pivot : {PIVOT_GPKG.name}")
pivot = gpd.read_file(PIVOT_GPKG, layer=PIVOT_LAYER, engine="pyogrio")
print(f"  {len(pivot)} cellules | CRS={pivot.crs}")

# Vérification colonnes clés
required_cols = ["H_flamb_2050", "E_can", "V_rail", "R_can_2050",
                 "H_inond_2050", "IFM40_2050", "SWI04_2050", "S_lulc"]
missing = [c for c in required_cols if c not in pivot.columns]
if missing:
    print(f"  WARN: colonnes manquantes dans le pivot : {missing}")


# --- 2. Chargement segments réseau ------------------------------------------

print("\nChargement réseau ferroviaire...")
gdf = gpd.read_file(GPKG_TRAFIC, engine="pyogrio")
print(f"  {len(gdf)} segments | CRS={gdf.crs}")

gdf["Trafic_2022"] = pd.to_numeric(gdf["Trafic 2022"], errors="coerce").fillna(0)
gdf["Traction"]    = gdf["Traction"].fillna("Autonome")
gdf["mnemo"]       = gdf["mnemo"].fillna("EXPLOITE")
gdf["code_ligne"]  = gdf["code_ligne"].astype(str)
gdf["Segment_ID"]  = gdf["Segment_ID"].astype(str)


# --- 3. Spatial join nearest (centroïde segment -> cellule pivot) -------------

print("\\nSpatial join segments -> pivot...")
# Construire GeoDataFrame des centroïdes (même CRS que le pivot)
seg_pts = gdf.copy()
seg_pts["geometry"] = seg_pts.geometry.centroid   # point = centroïde segment

# Projeter le pivot en WGS84 pour la sortie -- join en Lambert 93
joined = seg_pts.sjoin_nearest(
    pivot[list(pivot.columns)],   # toutes les colonnes du pivot
    how="left",
    distance_col="_pivot_dist_m",
)
# Supprimer les colonnes d'index de jointure
joined = joined.drop(columns=["index_right"], errors="ignore")

n_joined = joined["_pivot_dist_m"].notna().sum()
dist_max = joined["_pivot_dist_m"].max()
print(f"  {n_joined} / {len(gdf)} segments joints | distance max = {dist_max:.0f} m")

# Rattacher la géométrie des segments (polylines, pas les centroïdes)
joined["geometry"] = gdf["geometry"].values


# --- 4. Indices communs ------------------------------------------------------

print("\nCalcul indices communs...")

# train_flow : depuis le pivot (déjà normalisé) ou fallback sur Trafic_2022
if "flow_norm" in joined.columns:
    joined["train_flow"] = joined["flow_norm"].fillna(0).clip(0, 1)
else:
    joined.loc[joined["mnemo"] == "NON EXPLOITE", "Trafic_2022"] = 0
    joined["train_flow"] = minmax(joined["Trafic_2022"])

# catenary_index depuis le pivot
if "cat_idx" in joined.columns:
    joined["catenary_index"] = joined["cat_idx"].fillna(0.3).clip(0, 1)
else:
    joined["catenary_index"] = 0.3

# rail_index depuis le pivot (V_rail = ICV + Age_relatif pondérés)
if "V_rail" in joined.columns:
    joined["rail_index"] = joined["V_rail"].fillna(0.3).clip(0, 1)
else:
    joined["rail_index"] = 0.3

print(f"  train_flow     : [{joined['train_flow'].min():.3f}, {joined['train_flow'].max():.3f}]")
print(f"  catenary_index : [{joined['catenary_index'].min():.3f}, {joined['catenary_index'].max():.3f}]")
print(f"  rail_index     : [{joined['rail_index'].min():.3f}, {joined['rail_index'].max():.3f}]")


# --- 5. Export réseau national -----------------------------------------------

print("\nExport reseau_national.geojson...")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

joined["rg_troncon"] = gdf["rg_troncon"].values

reseau_gdf = gpd.GeoDataFrame(
    joined[["Segment_ID", "code_ligne", "rg_troncon", "mnemo", "Traction",
            "train_flow", "catenary_index", "rail_index"]],
    geometry=gdf["geometry"].values,
    crs=gdf.crs,
).to_crs(epsg=4326)

reseau_gdf.to_file(OUTPUT_DIR / "reseau_national.geojson", driver="GeoJSON")
print(f"  {len(reseau_gdf)} features -> reseau_national.geojson")


# --- 6. Scénarios climatiques (pivot) ----------------------------------------

for scenario in ["2050", "2065", "2100"]:
    print(f"\n{'-'*62}")
    print(f"Scénario {scenario}...")

    out_rows = pd.DataFrame(index=joined.index)

    for alea in ALEAS:
        mapping = PIVOT_COL_MAP.get(alea, {}).get(scenario, (None, None, None, None))
        h_col, e_col, v_col, r_col = mapping

        # -- Hazard --------------------------------------------------
        if h_col is None:
            # glissement : pas de données -> H=0.5 (majorant conservateur)
            H = pd.Series(0.5, index=joined.index)
        elif h_col.startswith("IFM40") or h_col.startswith("SWI04"):
            # incendie / sécheresse : normaliser la valeur brute
            H = minmax(joined[h_col].fillna(0)) if h_col in joined.columns else pd.Series(0.0, index=joined.index)
        else:
            # canicule / inondation : déjà normalisé dans le pivot
            H = get_col(joined, h_col, 0.0)

        # -- Exposure ------------------------------------------------
        if e_col is None:
            # sécheresse / glissement : E=1.0
            E = pd.Series(1.0, index=joined.index)
        else:
            E = get_col(joined, e_col, 0.5)

        # -- Vulnerability -------------------------------------------
        V = get_col(joined, v_col, 0.3)

        # -- Risk ----------------------------------------------------
        if r_col and r_col in joined.columns:
            # Lire le R pré-calculé (canicule + inondation)
            R = get_col(joined, r_col, 0.0)
        else:
            # Calculer H × E × V (incendie, sécheresse, glissement)
            R = (H * E * V).clip(0, 1)

        out_rows[f"H_{alea}"] = H.round(4).values
        out_rows[f"E_{alea}"] = E.round(4).values
        out_rows[f"V_{alea}"] = V.round(4).values
        out_rows[f"R_{alea}"] = R.round(4).values

        rmin, rmax, rmean = R.min(), R.max(), R.mean()
        print(f"  R_{alea:<12} [{rmin:.3f}, {rmax:.3f}] moy={rmean:.3f}")

    # Construire GeoDataFrame en WGS84
    hev_gdf = gpd.GeoDataFrame(
        pd.concat([
            joined[["Segment_ID", "code_ligne", "rg_troncon", "mnemo", "Traction",
                    "train_flow", "catenary_index", "rail_index"]].reset_index(drop=True),
            out_rows.reset_index(drop=True),
        ], axis=1),
        geometry=gdf["geometry"].values,
        crs=gdf.crs,
    ).to_crs(epsg=4326)

    out_file = OUTPUT_DIR / f"hev_{scenario}.geojson"
    hev_gdf.to_file(out_file, driver="GeoJSON")
    print(f"  -> {out_file.name} ({out_file.stat().st_size // 1024} Ko)")


# --- 7. Scénario référence (H=0) --------------------------------------------

print(f"\n{'-'*62}")
print("Scénario reference (H=0 -- période de référence 1976-2005)...")

ref_rows = pd.DataFrame(index=joined.index)
for alea in ALEAS:
    V = get_col(joined, "V_rail", 0.3)
    ref_rows[f"H_{alea}"] = 0.0
    ref_rows[f"E_{alea}"] = 1.0
    ref_rows[f"V_{alea}"] = V.round(4).values
    ref_rows[f"R_{alea}"] = 0.0

ref_gdf = gpd.GeoDataFrame(
    pd.concat([
        joined[["Segment_ID", "code_ligne", "rg_troncon", "mnemo", "Traction",
                "train_flow", "catenary_index", "rail_index"]].reset_index(drop=True),
        ref_rows.reset_index(drop=True),
    ], axis=1),
    geometry=gdf["geometry"].values,
    crs=gdf.crs,
).to_crs(epsg=4326)

ref_gdf.to_file(OUTPUT_DIR / "hev_reference.geojson", driver="GeoJSON")
print(f"  -> hev_reference.geojson ({(OUTPUT_DIR / 'hev_reference.geojson').stat().st_size // 1024} Ko)")


# --- 8. Enrichissement des infras (jointure spatiale infra -> pivot) ---------

print(f"\n{'-'*62}")
print("Enrichissement des GeoJSON infra par jointure spatiale avec le pivot...")

INFRA_FILES_LOCAL = {
    "gares":       "liste-des-gares.geojson",
    "passerelles": "liste-des-passerelles.geojson",
    "ponts-route": "liste-des-ponts-route.geojson",
    "ouvrages":    "liste-ouvrages-en-terre.geojson",
}
# Colonnes du pivot a joindre, renommees selon la convention HEV
PIVOT_R_MAP = {
    "R_can_2050":   "R_canicule_2050",
    "R_can_2065":   "R_canicule_2065",
    "R_can_2100":   "R_canicule_2100",
    "R_inond_2050": "R_inondation_2050",
    "R_inond_2065": "R_inondation_2065",
    "R_inond_2100": "R_inondation_2100",
}
pivot_r_cols = [c for c in PIVOT_R_MAP if c in pivot.columns]
pivot_r = pivot[["geometry"] + pivot_r_cols].copy()

INFRA_DIR = OUTPUT_DIR / "infra"
for key, fname in INFRA_FILES_LOCAL.items():
    infra_path = INFRA_DIR / fname
    if not infra_path.exists():
        print(f"  SKIP {fname} (absent)")
        continue
    gdf_infra = gpd.read_file(infra_path, engine="pyogrio")
    # Reprojeter en Lambert 93 pour la jointure
    gdf_infra_l93 = gdf_infra.to_crs(epsg=2154)
    pts = gdf_infra_l93.copy()
    pts["geometry"] = pts.geometry.centroid   # centroide pour LineString aussi
    pts = pts[["geometry"]].reset_index(drop=True)
    # Jointure spatiale avec le pivot (nearest cell)
    joined_r = pts.sjoin_nearest(pivot_r, how="left", distance_col="_dist")
    joined_r = joined_r[~joined_r.index.duplicated(keep="first")]
    # Attacher les colonnes R renommees a la version WGS84
    for col_src, col_dst in PIVOT_R_MAP.items():
        if col_src in joined_r.columns:
            gdf_infra[col_dst] = joined_r[col_src].fillna(0).round(4).values
    # Re-exporter (ecrase l'original - les fichiers infra viennent de SNCF Open Data)
    gdf_infra.to_file(infra_path, driver="GeoJSON")
    n_r = sum(1 for c in PIVOT_R_MAP.values() if c in gdf_infra.columns)
    r_max = max(gdf_infra.get(c, pd.Series([0])).max() for c in PIVOT_R_MAP.values() if c in gdf_infra.columns)
    print(f"  {fname}: {len(gdf_infra)} infras | {n_r} colonnes R | R_max={r_max:.3f}")


# --- 9. Carroyage allege (geometries simplifiees + colonnes R) ---------------

print(f"\n{'-'*62}")
print("Export carroyage_light.geojson...")
# Colonnes R a inclure dans le carroyage leger
pivot_light_cols = [c for c in PIVOT_R_MAP if c in pivot.columns]
pivot_light = pivot[["geometry"] + pivot_light_cols].copy()
# Simplification 200 m en Lambert 93, puis reprojection WGS84
pivot_light["geometry"] = pivot_light.geometry.simplify(tolerance=200, preserve_topology=True)
pivot_light = gpd.GeoDataFrame(pivot_light, crs="EPSG:2154").to_crs(epsg=4326)
# Renommer les colonnes selon la convention HEV
pivot_light = pivot_light.rename(columns=PIVOT_R_MAP)
carroyage_path = OUTPUT_DIR / "carroyage_light.geojson"
pivot_light.to_file(carroyage_path, driver="GeoJSON")
sz = carroyage_path.stat().st_size // 1024
print(f"  {len(pivot_light)} cellules simplifiees -> carroyage_light.geojson ({sz} Ko)")


# --- 10. metadata.json -------------------------------------------------------

print(f"\n{'-'*62}")
print("Export metadata.json...")
metadata = {
    "scenarios": SCENARIOS,
    "aleas": ALEAS,
    "description": "TRACC View SNCF -- modèle H×E×V, pivot carroyage 1km² VETSD",
    "version": "2.0.0-pivot",
    "generated": datetime.now().isoformat(),
    "n_segments": len(gdf),
    "n_pivot_cells": len(pivot),
    "pivot_source": PIVOT_GPKG.name,
    "methodology": "VETSD",
    "crs_export": "EPSG:4326 (WGS84)",
    "join_method": "sjoin_nearest centroïde segment -> cellule pivot Lambert 93",
    "note": (
        "Canicule/Inondation : H,E,V,R lus depuis le pivot (pré-calculés). "
        "Incendie : H=normalize(IFM40), E=S_lulc, V=V_rail. "
        "Sécheresse : H=normalize(SWI04), E=1.0. "
        "Glissement : H=0.5 (majorant conservateur), E=1.0."
    ),
}
with open(OUTPUT_DIR / "metadata.json", "w", encoding="utf-8") as f:
    json.dump(metadata, f, ensure_ascii=False, indent=2)
print("  -> metadata.json")

print(f"\n{'='*62}")
print("Pipeline v2 termine [OK]")
print(f"Fichiers dans : {OUTPUT_DIR}")
for fpath in sorted(OUTPUT_DIR.glob("*.geojson")):
    print(f"  {fpath.name:40s} {fpath.stat().st_size // 1024:>6} Ko")