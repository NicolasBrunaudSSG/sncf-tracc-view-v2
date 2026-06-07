"""
validate_sources.py — Tests S0-01 à S0-04 du Sprint 0 TRACC View SNCF
"""
import sys
import zipfile

PASS_STR = "PASS"
FAIL_STR = "FAIL"
results = {}

# ---------------------------------------------------------------------------
# S0-01 : GeoPackage trafic lisible
# ---------------------------------------------------------------------------
try:
    import geopandas as gpd
    gdf = gpd.read_file(
        r"c:\AppsIA\tracc-view-sncf\inputs\Données_modélisation\Jeux de données"
        r"\Couche de ligne découpée\Lignes découpées avec Trafic.gpkg"
    )
    cols = list(gdf.columns)
    n = len(gdf)
    status = PASS_STR if n > 0 else FAIL_STR
    print(f"[{status}] S0-01 : {n} features | CRS : {gdf.crs}")
    print(f"         Colonnes ({len(cols)}) : {cols}")
    results["S0-01"] = status
except Exception as e:
    print(f"[{FAIL_STR}] S0-01 : {e}")
    results["S0-01"] = FAIL_STR

# ---------------------------------------------------------------------------
# S0-02 : CEREMA 2050 lisible
# ---------------------------------------------------------------------------
try:
    import pandas as pd
    # Essai avec skiprows=47 d'abord, puis fallback automatique
    cerema_path = (
        r"c:\AppsIA\tracc-view-sncf\inputs\Données_modélisation\Jeux de données"
        r"\CEREMA\donnes 2050.txt"
    )
    df = pd.read_csv(cerema_path, sep=";", skiprows=47, header=0, encoding="latin-1")
    # Supprimer les lignes commentaires résiduelles
    df = df[~df.iloc[:, 0].astype(str).str.startswith("#")].dropna(how="all")
    n = len(df)
    status = PASS_STR if n > 100 else FAIL_STR
    print(f"[{status}] S0-02 : {n} lignes CEREMA 2050")
    print(f"         Colonnes : {list(df.columns[:12])}")
    results["S0-02"] = status
except Exception as e:
    print(f"[{FAIL_STR}] S0-02 : {e}")
    results["S0-02"] = FAIL_STR

# ---------------------------------------------------------------------------
# S0-03 : ZIP rfn_caracteristiques contient des données
# ---------------------------------------------------------------------------
try:
    zip_path = (
        r"c:\AppsIA\tracc-view-sncf\inputs\Données_modélisation\Jeux de données"
        r"\Données réseau SNCF\ICV\rfn_caracteristiques.zip"
    )
    with zipfile.ZipFile(zip_path) as z:
        names = z.namelist()
    has_data = any(n.endswith((".gpkg", ".csv", ".shp", ".xlsx", ".txt")) for n in names)
    status = PASS_STR if has_data else FAIL_STR
    print(f"[{status}] S0-03 : {len(names)} fichier(s) dans le ZIP")
    print(f"         Contenu : {names[:15]}")
    results["S0-03"] = status
except Exception as e:
    print(f"[{FAIL_STR}] S0-03 : {e}")
    results["S0-03"] = FAIL_STR

# ---------------------------------------------------------------------------
# S0-04 : config.py validate_paths() sans erreur
# ---------------------------------------------------------------------------
try:
    sys.path.insert(0, r"c:\AppsIA\tracc-view-sncf\app\pipeline")
    import config
    config.validate_paths()
    print(f"[{PASS_STR}] S0-04 : config.py — tous les fichiers critiques présents")
    results["S0-04"] = PASS_STR
except Exception as e:
    print(f"[{FAIL_STR}] S0-04 : {e}")
    results["S0-04"] = FAIL_STR

# ---------------------------------------------------------------------------
# NR-01 : Pivot carroyage lisible — 57 206 cellules, couche HEV
# ---------------------------------------------------------------------------
try:
    import geopandas as gpd
    sys.path.insert(0, r"c:\AppsIA\tracc-view-sncf\app\pipeline")
    import config
    pivot_nr = gpd.read_file(str(config.PIVOT_GPKG), layer=config.PIVOT_LAYER, engine="pyogrio")
    n_cells = len(pivot_nr)
    crs_ok = pivot_nr.crs is not None
    status = PASS_STR if n_cells == 57206 and crs_ok else FAIL_STR
    print(f"[{status}] NR-01 : {n_cells} cellules pivot | CRS : {pivot_nr.crs}")
    results["NR-01"] = status
except Exception as e:
    print(f"[{FAIL_STR}] NR-01 : {e}")
    results["NR-01"] = FAIL_STR

# ---------------------------------------------------------------------------
# NR-02 : Colonnes requises présentes dans le pivot
# ---------------------------------------------------------------------------
try:
    required_cols = [
        "H_flamb_2050", "H_flamb_2065", "H_flamb_2100",
        "H_cat_2050",   "H_cat_2065",   "H_cat_2100",
        "E_can", "E_cat", "V_rail", "V_cat",
        "R_can_2050",   "R_can_2065",   "R_can_2100",
        "H_inond_2050", "H_inond_2065",
        "E_inond_2050", "E_inond_2065",
        "V_inond_2050", "V_inond_2065",
        "R_inond_2050", "R_inond_2065",
        "flow_norm", "cat_idx",
    ]
    pivot_cols = set(pivot_nr.columns)
    missing = [c for c in required_cols if c not in pivot_cols]
    status = PASS_STR if not missing else FAIL_STR
    print(f"[{status}] NR-02 : {len(required_cols)} colonnes requises vérifiées")
    if missing:
        print(f"         Manquantes : {missing}")
    results["NR-02"] = status
except Exception as e:
    print(f"[{FAIL_STR}] NR-02 : {e}")
    results["NR-02"] = FAIL_STR

# ---------------------------------------------------------------------------
# NR-03 : Formule R_can — (H_flamb×E_can×V_rail + H_cat×E_cat×V_cat) / max_hz
#         Normalisation per-horizon (établie le 2026-06-07 sur 57 206 cellules)
#         Tolérance : diff < 0.001 pour ≥ 99.9 % des cellules par horizon
# ---------------------------------------------------------------------------
try:
    import numpy as np
    TOL = 0.001
    MIN_PCT = 99.9
    nr03_ok = True
    for hz in ["2050", "2065", "2100"]:
        r_raw = (
            pivot_nr[f"H_flamb_{hz}"] * pivot_nr["E_can"] * pivot_nr["V_rail"]
          + pivot_nr[f"H_cat_{hz}"]   * pivot_nr["E_cat"] * pivot_nr["V_cat"]
        )
        max_hz = float(r_raw.max())
        r_reco = r_raw / max_hz
        diff   = (r_reco - pivot_nr[f"R_can_{hz}"]).abs()
        pct    = 100.0 * (diff < TOL).sum() / len(pivot_nr)
        ok_hz  = pct >= MIN_PCT
        nr03_ok = nr03_ok and ok_hz
        marker = PASS_STR if ok_hz else FAIL_STR
        print(f"  [{marker}] NR-03 ({hz}) : {pct:.1f}% match | max_hz={max_hz:.4f}")
    status = PASS_STR if nr03_ok else FAIL_STR
    print(f"[{status}] NR-03 : formule R_can = (H_flamb*E_can*V_rail + H_cat*E_cat*V_cat) / max_hz")
    results["NR-03"] = status
except Exception as e:
    print(f"[{FAIL_STR}] NR-03 : {e}")
    results["NR-03"] = FAIL_STR

# ---------------------------------------------------------------------------
# NR-04 : Facteurs de normalisation per-horizon stables (± 2 %)
#         Références établies le 2026-06-07 : 2050→0.3458, 2065→0.4359, 2100→0.6468
# ---------------------------------------------------------------------------
try:
    REF_MAX      = {"2050": 0.3458, "2065": 0.4359, "2100": 0.6468}
    DRIFT_LIMIT  = 0.02
    nr04_ok = True
    for hz, ref in REF_MAX.items():
        r_raw = (
            pivot_nr[f"H_flamb_{hz}"] * pivot_nr["E_can"] * pivot_nr["V_rail"]
          + pivot_nr[f"H_cat_{hz}"]   * pivot_nr["E_cat"] * pivot_nr["V_cat"]
        )
        max_hz = float(r_raw.max())
        drift  = abs(max_hz - ref) / ref
        ok_hz  = drift <= DRIFT_LIMIT
        nr04_ok = nr04_ok and ok_hz
        marker = PASS_STR if ok_hz else FAIL_STR
        print(f"  [{marker}] NR-04 ({hz}) : max={max_hz:.4f} (réf {ref:.4f}, dérive {drift*100:.2f}%)")
    status = PASS_STR if nr04_ok else FAIL_STR
    print(f"[{status}] NR-04 : facteurs de normalisation stables (tolérance ±{int(DRIFT_LIMIT*100)}%)")
    results["NR-04"] = status
except Exception as e:
    print(f"[{FAIL_STR}] NR-04 : {e}")
    results["NR-04"] = FAIL_STR

# ---------------------------------------------------------------------------
# NR-05 : R_can ∈ [0, 1] pour tous les horizons et toutes les cellules
# ---------------------------------------------------------------------------
try:
    nr05_ok = True
    for hz in ["2050", "2065", "2100"]:
        col           = f"R_can_{hz}"
        out_of_range  = int(((pivot_nr[col] < 0) | (pivot_nr[col] > 1)).sum())
        ok_hz         = out_of_range == 0
        nr05_ok       = nr05_ok and ok_hz
        marker        = PASS_STR if ok_hz else FAIL_STR
        print(f"  [{marker}] NR-05 ({hz}) : {out_of_range} valeur(s) hors [0,1]")
    status = PASS_STR if nr05_ok else FAIL_STR
    print(f"[{status}] NR-05 : R_can dans [0,1] verifie sur les 3 horizons")
    results["NR-05"] = status
except Exception as e:
    print(f"[{FAIL_STR}] NR-05 : {e}")
    results["NR-05"] = FAIL_STR

# ---------------------------------------------------------------------------
# Résumé
# ---------------------------------------------------------------------------
print()
print("=" * 60)
fails  = [k for k, v in results.items() if v == FAIL_STR]
passes = [k for k, v in results.items() if v == PASS_STR]
print(f"{len(passes)}/{len(results)} PASS : {', '.join(passes)}")
if fails:
    print(f"FAIL : {', '.join(fails)}")
    sys.exit(1)
else:
    print("Tous les tests VALIDES [OK]")
