# -*- coding: utf-8 -*-
"""Génère docs/data.js : toutes les données du site embarquées dans `window.DATA`
(aucun fetch -> fonctionne sur GitHub Pages ET en ouvrant index.html en local)."""
import json
import os
import math
import pandas as pd
import standings as S

os.makedirs("docs", exist_ok=True)

pred = pd.read_csv("data/predictions.csv")
base = pd.read_csv("data/predictions_baseline.csv")
ratings = pd.read_csv("data/team_ratings.csv")

# Résultats réels (matchs joués) : score_reel du baseline -> (buts_dom, buts_ext)
real_idx = {}
for _, r in base.iterrows():
    sr = r.get("score_reel")
    if isinstance(sr, str) and "-" in sr:
        a, b = sr.split("-")
        real_idx[(r.groupe, int(r.journee), r.equipe_dom, r.equipe_ext)] = (int(a), int(b))
analyses = json.load(open("data/group_analyses.json"))
report_md = open("rapport/pronostics_cdm2026.md", encoding="utf-8").read()
try:
    team_details = json.load(open("data/team_details.json", encoding="utf-8"))
except FileNotFoundError:
    team_details = {}
try:
    teams = json.load(open("data/teams.json", encoding="utf-8"))  # équipe -> {coach, tm (lien effectif)}
except FileNotFoundError:
    teams = {}
try:
    h2h = json.load(open("data/h2h.json", encoding="utf-8"))  # "Dom | Ext" -> {meetings:[...]}
except FileNotFoundError:
    h2h = {}

cls = S.tous_classements(pred)
premiers, deuxiemes, meilleurs3, df3 = S.qualifies(cls)
q1 = {e for _, e in premiers}; q2 = {e for _, e in deuxiemes}; q3 = set(meilleurs3.equipe)


def statut(e):
    if e in q1: return "1er"
    if e in q2: return "2e"
    if e in q3: return "3e"
    return "out"


def clean(v):
    if isinstance(v, float) and math.isnan(v):
        return None
    return v


# Pronostics (liste de dicts)
predictions = []
for _, r in pred.iterrows():
    # Résultat réel : score_reel du baseline ; à défaut, pour un match joué, le score affiché.
    rr = real_idx.get((r.groupe, int(r.journee), r.equipe_dom, r.equipe_ext))
    if rr is None and r.statut == "joue":
        rr = (int(r.buts_dom), int(r.buts_ext))
    predictions.append({
        "groupe": r.groupe, "journee": int(r.journee),
        "kickoff_cest": r.kickoff_cest, "kickoff_utc": r.kickoff_utc,
        "dom": r.equipe_dom, "ext": r.equipe_ext, "statut": r.statut,
        "bd": int(r.buts_dom), "be": int(r.buts_ext),
        "rd": rr[0] if rr else None, "re": rr[1] if rr else None,
        "pv": float(r.p_victoire_dom), "pn": float(r.p_nul), "pd": float(r.p_victoire_ext),
        "mpp_v": clean(r.p_mpp_dom), "mpp_n": clean(r.p_mpp_nul), "mpp_d": clean(r.p_mpp_ext),
        "xg_dom": float(r.xg_dom_modele), "xg_ext": float(r.xg_ext_modele),
    })

# Classements par groupe
standings = {}
for g, t in cls.items():
    standings[g] = [{
        "rang": int(rang), "equipe": r["equipe"], "pts": int(r["pts"]),
        "j": int(r["J"]), "g": int(r["G"]), "n": int(r["N"]), "p": int(r["P"]),
        "bp": int(r["bp"]), "bc": int(r["bc"]), "diff": int(r["diff"]),
        "statut": statut(r["equipe"]),
    } for rang, r in t.iterrows()]

# Qualifiés
troisiemes = [{"groupe": r.groupe, "equipe": r.equipe, "pts": int(r.pts),
               "diff": int(r["diff"]), "bp": int(r.bp), "qualifie": i < 8}
              for i, r in df3.reset_index(drop=True).iterrows()]
qualifiers = {
    "premiers": [{"groupe": g, "equipe": e} for g, e in premiers],
    "deuxiemes": [{"groupe": g, "equipe": e} for g, e in deuxiemes],
    "meilleurs3": [{"groupe": r.groupe, "equipe": r.equipe} for _, r in meilleurs3.reset_index(drop=True).iterrows()],
    "troisiemes": troisiemes,
}

# Notes de force
ratings_l = [{"groupe": r.groupe, "equipe": r.equipe, "elo": int(r.elo),
              "fifa_rank": int(r.fifa_rank), "forme": r.forme_note,
              "statut": statut(r.equipe)} for _, r in ratings.iterrows()]

# Validation J1 (modèle baseline vs réel)
bcols = ["groupe", "journee", "equipe_dom", "equipe_ext", "score_modele", "buts_dom_modele", "buts_ext_modele"]
val = pred[pred.statut == "joue"].merge(base[bcols], on=["groupe", "journee", "equipe_dom", "equipe_ext"])
def issue(a, b): return "V" if a > b else ("D" if a < b else "N")
j1 = []
for _, r in val.iterrows():
    j1.append({"match": f"{r.equipe_dom} – {r.equipe_ext}",
               "reel": f"{r.buts_dom}-{r.buts_ext}", "modele": r.score_modele_y,
               "ok": issue(r.buts_dom, r.buts_ext) == issue(r.buts_dom_modele, r.buts_ext_modele)})
j1_acc = round(sum(x["ok"] for x in j1) / len(j1), 3) if j1 else None

meta = {
    "titre": "Pronostics CDM 2026 — Phase de groupes",
    "n_matchs": len(predictions),
    "n_joues": int((pred.statut == "joue").sum()),
    "n_qualifies": 32,
    "vainqueurs": [f"{g} : {e}" for g, e in premiers],
    "j1_accuracy": j1_acc,
    "groupes": sorted(cls.keys()),
}

DATA = {"meta": meta, "predictions": predictions, "standings": standings,
        "qualifiers": qualifiers, "ratings": ratings_l, "analyses": analyses,
        "teams": teams, "h2h": h2h,
        "j1": j1, "reportMarkdown": report_md, "teamDetails": team_details}

with open("docs/data.js", "w", encoding="utf-8") as f:
    f.write("// Généré par build_site.py — ne pas éditer à la main.\n")
    f.write("window.DATA = ")
    json.dump(DATA, f, ensure_ascii=False, indent=1)
    f.write(";\n")

print(f"docs/data.js écrit ({os.path.getsize('docs/data.js')//1024} Ko).")
