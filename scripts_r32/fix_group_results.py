"""Corrige les resultats reels de poule dans data/predictions.csv a partir de
la donnee MPP autoritaire (data/mpp_knockout_raw.json), en respectant le sens
domicile/exterieur de chaque ligne. Met aussi a jour data/fixtures.csv."""
import json
import pandas as pd

mpp = json.load(open("data/mpp_knockout_raw.json"))
club2name = json.load(open("data/club2name.json"))

# (groupe, frozenset{equipeA, equipeB}) -> dict orient { (dom,ext): (bd,be) }
real = {}
for m in mpp["gs"]:
    h = club2name[m["h"]]; a = club2name[m["a"]]
    real[(m["g"], frozenset((h, a)))] = {(h, a): (m["hs"], m["as"]), (a, h): (m["as"], m["hs"])}

def corrige(path, col_dom, col_ext, g="groupe", d="equipe_dom", e="equipe_ext"):
    df = pd.read_csv(path)
    changes = []
    for i, row in df.iterrows():
        key = (row[g], frozenset((row[d], row[e])))
        if key not in real:
            continue
        bd, be = real[key][(row[d], row[e])]
        old = (row[col_dom], row[col_ext])
        try:
            old = (int(old[0]), int(old[1]))
        except (ValueError, TypeError):
            old = None
        if old != (bd, be):
            changes.append((row[g], row[d], row[e], old, (bd, be)))
        df.at[i, col_dom] = bd
        df.at[i, col_ext] = be
    return df, changes

# predictions.csv : colonnes buts_dom/buts_ext = score reel ; score_pronostic inchange
dfp, chg = corrige("data/predictions.csv", "buts_dom", "buts_ext")
# recompose score reel "x-y" si une colonne le represente ? non : buts_dom/ext suffisent.
dfp.to_csv("data/predictions.csv", index=False)

print(f"=== predictions.csv : {len(chg)} correction(s) ===")
for c in chg:
    print(f"  {c[0]}  {c[1]} vs {c[2]} : {c[3]} -> {c[4]}")

# fixtures.csv : colonne score_reel "x-y"
fx = pd.read_csv("data/fixtures.csv")
fxchg = []
for i, row in fx.iterrows():
    key = (row.groupe, frozenset((row.equipe_dom, row.equipe_ext)))
    if key not in real:
        continue
    bd, be = real[key][(row.equipe_dom, row.equipe_ext)]
    new = f"{bd}-{be}"
    if str(row.get("score_reel")) != new:
        fxchg.append((row.groupe, row.equipe_dom, row.equipe_ext, row.get("score_reel"), new))
    fx.at[i, "score_reel"] = new
    fx.at[i, "statut"] = "joue"
fx.to_csv("data/fixtures.csv", index=False)
print(f"\n=== fixtures.csv : {len(fxchg)} correction(s)/maj ===")
for c in fxchg[:20]:
    print(f"  {c[0]}  {c[1]} vs {c[2]} : {c[3]} -> {c[4]}")
if len(fxchg) > 20:
    print(f"  ... (+{len(fxchg)-20})")
