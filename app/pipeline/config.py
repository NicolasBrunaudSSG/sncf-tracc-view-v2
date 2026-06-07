# config.py — Chemins absolus vers les données sources TRACC View SNCF
from pathlib import Path

BASE_INPUT = Path(r"c:\AppsIA\tracc-view-sncf\inputs\Données_modélisation\Jeux de données")
BASE_CONST = Path(r"c:\AppsIA\tracc-view-sncf\inputs\Construction des indicateurs")

# ─── Fichier pivot carroyage (source principale depuis Sprint 2) ─────────────
PIVOT_GPKG = (
    BASE_CONST
    / "Carroyage du réseau ferré français"
    / "version sans lignes fermées (v2)"
    / "DERNIERE VERSION (nouvelles formules).gpkg"
)
PIVOT_LAYER = "HEV"

# Réseau ferroviaire (pour géométrie des segments + code_ligne)
GPKG_TRAFIC = BASE_INPUT / "Couche de ligne découpée" / "Lignes découpées avec Trafic.gpkg"
GPKG_POINTS = BASE_INPUT / "Couche de ligne découpée" / "Points_Assembles_Final.gpkg"

# ICV (conservé pour référence / fallback)
ICV_ZIP  = BASE_INPUT / "Données réseau SNCF" / "ICV" / "rfn_caracteristiques.zip"
ICV_DIR  = BASE_INPUT / "Données réseau SNCF" / "ICV"

# CEREMA — projections climatiques (conservé pour fallback et vérification)
CEREMA_2050 = BASE_INPUT / "CEREMA" / "donnes 2050.txt"
CEREMA_2065 = BASE_INPUT / "CEREMA" / "donnes 2065.txt"
CEREMA_2100 = BASE_INPUT / "CEREMA" / "donnes_2100.txt"

# Rayonnement solaire
RAY_2050_DIR = BASE_INPUT / "Rayonnement" / "2050"
RAY_2065_DIR = BASE_INPUT / "Rayonnement" / "2065"
RAY_2100_DIR = BASE_INPUT / "Rayonnement" / "2100"
RAY_HIST_DIR = BASE_INPUT / "Rayonnement" / "2000-2005 (historique)"

# TRI — données inondations
TRI_SHP = BASE_INPUT / "Donnes inondations" / "tri_2020_sig_di" / "n_carte_inond_s.shp"

# Réseau hydrographique
HYDRO_GPKG = BASE_INPUT / "Réseau hydrographique" / "TronconHydrographique_FXX.gpkg"

# Corine Land Cover
CLC_DIR   = BASE_INPUT / "Corine Land Cover" / "CLC12_FR_RGF_SHP"
CLC_TABLE = BASE_INPUT / "Corine Land Cover" / "Table de correspondance CN-CLC.xlsm"

# Données réseau SNCF
TRAFIC_DIR     = BASE_INPUT / "Données réseau SNCF" / "Données trafic"
SECHERESSE_DIR = BASE_INPUT / "Données réseau SNCF" / "Donnes secheresse"

# Masque forêt
FORET_DIR = BASE_INPUT / "MASQUE-FORET_1-0_2021-2023_GPKG_LAMB93_FXX_2025-09-25" / "MASQUE-FORET"

# Outputs
OUTPUT_DIR = Path(r"c:\AppsIA\tracc-view-sncf\app\data")

# Paramètres IDW (conservés pour fallback CEREMA)
IDW_K        = 8
IDW_POWER    = 2
IDW_MIN_DIST = 1e-10

# Scénarios et aléas
SCENARIOS = ["reference", "2050", "2065", "2100"]
ALEAS     = ["canicule", "inondation", "incendie", "secheresse", "glissement"]

# Mapping colonnes pivot → aléas, par horizon
PIVOT_COL_MAP = {
    # (H, E, V, R) pour chaque aléa × horizon
    # canicule : H_flamb pré-calculé, E_can, V_rail, R_can
    "canicule": {
        "2050": ("H_flamb_2050", "E_can",        "V_rail", "R_can_2050"),
        "2065": ("H_flamb_2065", "E_can",        "V_rail", "R_can_2065"),
        "2100": ("H_flamb_2100", "E_can",        "V_rail", "R_can_2100"),
    },
    # inondation : H/E/V/R pré-calculés pour les 3 horizons
    "inondation": {
        "2050": ("H_inond_2050", "E_inond_2050", "V_inond_2050", "R_inond_2050"),
        "2065": ("H_inond_2065", "E_inond_2065", "V_inond_2065", "R_inond_2065"),
        "2100": ("H_inond_2100", "E_inond_2100", "V_inond_2100", "R_inond_2100"),
    },
    # incendie : H à partir de IFM40, E = S_lulc, V = V_rail
    "incendie": {
        "2050": ("IFM40_2050",   "S_lulc",       "V_rail", None),
        "2065": ("IFM40_2065",   "S_lulc",       "V_rail", None),
        "2100": ("IFM40_2100",   "S_lulc",       "V_rail", None),
    },
    # sécheresse : H à partir de SWI04, E = 1.0, V = V_rail
    "secheresse": {
        "2050": ("SWI04_2050",   None,            "V_rail", None),
        "2065": ("SWI04_2065",   None,            "V_rail", None),
        "2100": ("SWI04_2100",   None,            "V_rail", None),
    },
    # glissement : pas de données → H=0.5 majorant, E=1.0, V=V_rail
    "glissement": {
        "2050": (None,           None,            "V_rail", None),
        "2065": (None,           None,            "V_rail", None),
        "2100": (None,           None,            "V_rail", None),
    },
}


def validate_paths():
    """Vérifier que les chemins critiques existent."""
    critical = [PIVOT_GPKG, GPKG_TRAFIC]
    errors = []
    for p in critical:
        if not p.exists():
            errors.append(str(p))
    if errors:
        raise FileNotFoundError(f"Fichiers manquants :\n" + "\n".join(errors))
    print("[OK] Chemins valides")
