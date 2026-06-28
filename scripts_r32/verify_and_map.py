"""Construit clubId->nom (jointure standings MPP <-> classements calcules),
verifie les resultats de poule MPP vs data/predictions.csv, et decode le
bracket des 16es de finale avec les noms d'equipes."""
import json
import pandas as pd
from standings import tous_classements, qualifies

RAW = "data/mpp_knockout_raw.json"
mpp = json.load(open(RAW))

# 1. Classements calcules a partir des resultats reels (predictions.csv)
pred = pd.read_csv("data/predictions.csv")
cls = tous_classements(pred)

# 2. clubId -> nom : pour chaque groupe, joindre (rank MPP) avec (rank calcule)
club2name = {}
for g, rows in mpp["groups"].items():
    table = cls[g]  # index = rang 1..4
    for r in rows:
        name = table.loc[r["rank"], "equipe"]
        club2name[r["clubId"]] = name

print(f"clubId->nom : {len(club2name)} equipes mappees")

# 3. VERIF resultats de poule : MPP gs vs predictions.csv
# index predictions par (groupe, equipe_dom, equipe_ext)
pmap = {}
for _, row in pred.iterrows():
    pmap[(row.groupe, row.equipe_dom, row.equipe_ext)] = (int(row.buts_dom), int(row.buts_ext))

discrepances = []
for m in mpp["gs"]:
    hd = club2name[m["h"]]; ad = club2name[m["a"]]
    mpp_score = (m["hs"], m["as"])
    key = (m["g"], hd, ad)
    if key in pmap:
        if pmap[key] != mpp_score:
            discrepances.append((m["g"], m["gw"], hd, ad, pmap[key], mpp_score))
    else:
        # peut etre stocke dans l'autre sens
        key2 = (m["g"], ad, hd)
        if key2 in pmap:
            inv = (pmap[key2][1], pmap[key2][0])
            if inv != mpp_score:
                discrepances.append((m["g"], m["gw"], hd, ad, "(inv)"+str(pmap[key2]), mpp_score))
        else:
            discrepances.append((m["g"], m["gw"], hd, ad, "ABSENT", mpp_score))

print(f"\n=== VERIF: {len(mpp['gs'])} matchs MPP confrontes a predictions.csv ===")
if not discrepances:
    print("  Aucun ecart : tous les resultats de poule sont corrects.")
else:
    print(f"  {len(discrepances)} ECART(S) :")
    for d in discrepances:
        print("   ", d)

# 4. Bracket 16es avec noms
print("\n=== BRACKET 16es DE FINALE (ordre chronologique) ===")
for m in mpp["r32"]:
    h = club2name[m["h"]["c"]]; a = club2name[m["a"]["c"]]
    q = m["q"]
    print(f'  {m["date"][:10]}  {h} ({m["h"]["rk"]}) vs {a} ({m["a"]["rk"]})'
          f'   cotes {q["home"]}/{q["draw"]}/{q["away"]}')

# 5. Sauvegarde mapping pour le modele
json.dump(club2name, open("data/club2name.json", "w"), ensure_ascii=False, indent=0)
print("\nclub2name.json ecrit.")
