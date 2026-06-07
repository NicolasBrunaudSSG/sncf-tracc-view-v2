import geopandas as gpd, warnings, numpy as np, pandas as pd
warnings.filterwarnings('ignore')
path = (r'c:\AppsIA\tracc-view-sncf\inputs\Construction des indicateurs'
        r'\Carroyage du réseau ferré français\version sans lignes fermées (v2)'
        r'\DERNIERE VERSION (nouvelles formules).gpkg')
pivot = gpd.read_file(path, layer='HEV', engine='pyogrio')

print('=== FORMULE OFFICIELLE (formules_HEV_v2.docx) ===')
print('R_can = H_flamb × E_can × V_rail + H_cat × E_cat × V_cat')
print('Normalisation commune sur le max global des 3 horizons (2050, 2065, 2100)')
print()

# Calcul R_raw pour les 3 horizons
for hz in ['2050', '2065', '2100']:
    pivot[f'R_raw_{hz}'] = (
        pivot[f'H_flamb_{hz}'] * pivot['E_can'] * pivot['V_rail'] +
        pivot[f'H_cat_{hz}']   * pivot['E_cat'] * pivot['V_cat']
    )
    print(f'  R_raw_{hz}: min={pivot[f"R_raw_{hz}"].min():.4f} max={pivot[f"R_raw_{hz}"].max():.4f}')

# Max global des 3 horizons
max_global = max(pivot['R_raw_2050'].max(), pivot['R_raw_2065'].max(), pivot['R_raw_2100'].max())
print(f'\n  Max global (3 horizons) = {max_global:.4f}')

# Reconstruction normalisée
for hz in ['2050', '2065', '2100']:
    pivot[f'R_reco_{hz}'] = pivot[f'R_raw_{hz}'] / max_global
    diff = (pivot[f'R_reco_{hz}'] - pivot[f'R_can_{hz}']).abs()
    print(f'\n  Horizon {hz}:')
    print(f'    Diff max  : {diff.max():.4f}')
    print(f'    Diff mean : {diff.mean():.6f}')
    n_match = (diff < 0.001).sum()
    print(f'    Match <0.001 : {n_match}/{len(pivot)} ({100*n_match/len(pivot):.1f}%)')

# Détail sur quelques cellules à fort signal
print('\n=== Détail cellules 2050 à fort signal ===')
sample = pivot[pivot['H_flamb_2050'] > 0.4].head(5)
for _, row in sample.iterrows():
    R_reco = row['R_reco_2050']
    R_stock = row['R_can_2050']
    print(f'  H_f={row["H_flamb_2050"]:.3f} H_c={row["H_cat_2050"]:.3f} Ec={row["E_can"]:.2f} Et={row["E_cat"]:.2f} '
          f'Vr={row["V_rail"]:.3f} Vc={row["V_cat"]:.3f} | R_reco={R_reco:.4f} R_stock={R_stock:.4f} '
          f'diff={abs(R_reco-R_stock):.4f}')

# ---- Hypothèse 2 : normalisation per-horizon ----
print('\n=== Hypothèse : normalisation par le max de CHAQUE horizon ===')
for hz in ['2050', '2065', '2100']:
    max_hz = pivot[f'R_raw_{hz}'].max()
    pivot[f'R_perHz_{hz}'] = pivot[f'R_raw_{hz}'] / max_hz
    diff = (pivot[f'R_perHz_{hz}'] - pivot[f'R_can_{hz}']).abs()
    n_match = (diff < 0.001).sum()
    print(f'  Horizon {hz}: max_hz={max_hz:.4f} | Diff max={diff.max():.4f} | Match={n_match}/{len(pivot)} ({100*n_match/len(pivot):.1f}%)')
