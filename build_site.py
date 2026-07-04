# -*- coding: utf-8 -*-
"""Génère docs/data.js : toutes les données du site embarquées dans `window.DATA`
(aucun fetch -> fonctionne sur GitHub Pages ET en ouvrant index.html en local)."""
import json
import os
import math
import unicodedata
import pandas as pd
import standings as S

os.makedirs("docs", exist_ok=True)

pred = pd.read_csv("data/predictions.csv")
base = pd.read_csv("data/predictions_baseline.csv")
ratings = pd.read_csv("data/team_ratings.csv")


def _norm(s):
    s = "".join(c for c in unicodedata.normalize("NFD", str(s))
                if unicodedata.category(c) != "Mn").lower().strip().replace("’", "'")
    return {"bosnie": "bosnie-herzegovine"}.get(s, s)


# Cotes mpp.football (1/N/2) = points gagnés si l'issue est bien pronostiquée.
mpp_csv = pd.read_csv("data/mpp_probs.csv")
# Cote indexée par VAINQUEUR (indépendant du sens domicile/extérieur de la ligne) :
# frozenset{normA, normB} -> {normVainqueur: cote, 'N': cote_nul}.
cote_win = {}
for _, m in mpp_csv.iterrows():
    nh, na = _norm(m.Domicile), _norm(m.Exterieur)
    cote_win[frozenset((nh, na))] = {nh: int(m.Cote_1), na: int(m.Cote_2), "N": int(m.Cote_N)}
analyses = json.load(open("data/group_analyses.json"))
report_md = open("rapport/pronostics_cdm2026.md", encoding="utf-8").read()

# Tours à élimination directe déjà générés (dans l'ordre chronologique du tournoi).
# Chaque tour ajoute ses matchs data/predictions_r<key>.csv au calendrier unique
# (colonne "groupe"/"phase" = label) et son propre bloc dans docs (koRounds).
KO_ROUNDS = [
    {"key": "r32", "label": "16e", "title": "16es de finale", "journee": 4,
     "report_path": "rapport/pronostics_16es.md", "results_path": "data/r32_results.json"},
    {"key": "r16", "label": "8e", "title": "8es de finale", "journee": 5,
     "report_path": "rapport/pronostics_8es.md", "results_path": "data/r16_results.json"},
]
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


# --- Pronos & points RÉELS du joueur (compte MPP) ---
# data/user_forecasts.json : par match, userForecast {hs,as,pts} + clubIds.
try:
    _uf = json.load(open("data/user_forecasts.json"))
    _c2n = json.load(open("data/club2name.json"))
except FileNotFoundError:
    _uf, _c2n = [], {}
user_map = {}          # frozenset{normDom,normExt} -> {"o":{(d,e):(hs,as)}, "pts":int}
pts_user_total = 0
for m in _uf:
    uf = m.get("uf")
    if not uf:
        continue
    d, e = _c2n.get(m["h"]), _c2n.get(m["a"])
    if not d or not e:
        continue
    nd, ne = _norm(d), _norm(e)
    user_map[frozenset((nd, ne))] = {
        "o": {(nd, ne): (uf["hs"], uf["as"]), (ne, nd): (uf["as"], uf["hs"])},
        "pts": uf.get("pts", 0),
    }
    pts_user_total += uf.get("pts", 0)


def user_fields(dom, ext):
    """(u_ppd, u_ppe, u_pts) du joueur, orientés sur (dom,ext) ; None si non pronostiqué."""
    nd, ne = _norm(dom), _norm(ext)
    info = user_map.get(frozenset((nd, ne)))
    if not info:
        return None, None, None
    hs, as_ = info["o"][(nd, ne)]
    return int(hs), int(as_), int(info["pts"])


# --- Bonus « score exact » (points.extra MPP) par match, pour noter le modèle
#     comme les joueurs. Barème rarityLevel 1/2/3 -> +20/+30/+50. ---
try:
    _eb = json.load(open("data/exact_bonus.json"))["matches"]
except FileNotFoundError:
    _eb = {}
exact_bonus_map = {}
for _m in _eb.values():
    d, e = _c2n.get(_m["h"]), _c2n.get(_m["a"])
    if d and e:
        exact_bonus_map[frozenset((_norm(d), _norm(e)))] = int(_m["bonus"])
EXACT_BONUS_DEFAULT = 20  # plancher conservateur si la rareté du score est inconnue


def exact_bonus(dom, ext):
    return exact_bonus_map.get(frozenset((_norm(dom), _norm(ext))), EXACT_BONUS_DEFAULT)


# Pronostics (liste de dicts)
predictions = []
for _, r in pred.iterrows():
    # Pronostic figé (colonne score_pronostic, ex. "2-1") : la vraie prédiction d'avant-match,
    # conservée même après le match. buts_dom/buts_ext deviennent le résultat réel une fois joué.
    pp = None
    if isinstance(r.score_pronostic, str) and "-" in r.score_pronostic:
        a, b = r.score_pronostic.split("-")
        pp = (int(a), int(b))
    mpp_v, mpp_n, mpp_d = clean(r.p_mpp_dom), clean(r.p_mpp_nul), clean(r.p_mpp_ext)
    # Points pris (matchs joués) : on remporte la cote mpp de l'issue RÉELLE si l'issue
    # PRONOSTIQUÉE est la bonne, 0 sinon.
    #  - modèle  : issue du pronostic figé (score_pronostic) = ce qui est affiché en colonne « Prono ».
    #  - mpp     : issue la plus probable selon les probas mpp.
    pts_mod = pts_mpp = None
    nd, ne = _norm(r.equipe_dom), _norm(r.equipe_ext)
    cw = cote_win.get(frozenset((nd, ne)))
    if r.statut == "joue" and cw is not None:
        bd, be = int(r.buts_dom), int(r.buts_ext)
        real_win = nd if bd > be else (ne if be > bd else "N")
        real_cote = cw[real_win]
        if pp is not None:
            mod_win = nd if pp[0] > pp[1] else (ne if pp[1] > pp[0] else "N")
            pts_mod = real_cote if mod_win == real_win else 0
            if pp[0] == bd and pp[1] == be:               # score exact -> + bonus rareté
                pts_mod += exact_bonus(r.equipe_dom, r.equipe_ext)
        if mpp_v is not None:
            pk = [mpp_v, mpp_n, mpp_d]
            ai = pk.index(max(pk))
            mpp_win = nd if ai == 0 else (ne if ai == 2 else "N")
            pts_mpp = real_cote if mpp_win == real_win else 0
    u_ppd, u_ppe, u_pts = user_fields(r.equipe_dom, r.equipe_ext)
    predictions.append({
        "groupe": r.groupe, "journee": int(r.journee),
        "kickoff_cest": r.kickoff_cest, "kickoff_utc": r.kickoff_utc,
        "dom": r.equipe_dom, "ext": r.equipe_ext, "statut": r.statut,
        "bd": int(r.buts_dom), "be": int(r.buts_ext),
        "ppd": pp[0] if pp else None, "ppe": pp[1] if pp else None,
        "pv": float(r.p_victoire_dom), "pn": float(r.p_nul), "pd": float(r.p_victoire_ext),
        "mpp_v": mpp_v, "mpp_n": mpp_n, "mpp_d": mpp_d,
        "pts_mod": pts_mod, "pts_mpp": pts_mpp,
        "xg_dom": float(r.xg_dom_modele), "xg_ext": float(r.xg_ext_modele),
        "u_ppd": u_ppd, "u_ppe": u_ppe, "u_pts": u_pts,
    })

# --- Tours KO : intégrés au MÊME tableau (mêmes colonnes que la phase de groupes) ---
from datetime import datetime, timedelta

ko_rounds_data = []   # pour docs (cartes + rapport par tour)
n_ko_by_round = {}    # label -> nb de matchs (pour l'accueil)
for rnd in KO_ROUNDS:
    try:
        rp = pd.read_csv(f"data/predictions_{rnd['key']}.csv")
    except FileNotFoundError:
        continue
    try:
        rres = json.load(open(rnd["results_path"]))
    except FileNotFoundError:
        rres = {}
    try:
        r_report_md = open(rnd["report_path"], encoding="utf-8").read()
    except FileNotFoundError:
        r_report_md = ""

    n_ko_by_round[rnd["label"]] = len(rp)
    matches = []
    for _, r in rp.iterrows():
        dt = datetime.strptime(r.date[:16], "%Y-%m-%dT%H:%M")
        k_utc = dt.strftime("%Y-%m-%dT%H:%M")
        k_cest = (dt + timedelta(hours=2)).strftime("%Y-%m-%d %H:%M")
        a, b = str(r.score_modele).split("-")
        ppd, ppe = int(a), int(b)                       # pronostic figé du modèle
        res = rres.get(str(r.match_id))
        joue = bool(res and res.get("period") == "fullTime")
        bd = int(res["hs"]) if joue else None
        be = int(res["as"]) if joue else None
        mv, mn, md = float(r.mpp_dom), float(r.mpp_nul), float(r.mpp_ext)  # probas mpp (cotes)
        pts_mod = pts_mpp = None
        if joue:
            cotes = [int(r.cote_dom), int(r.cote_nul), int(r.cote_ext)]
            ridx = 0 if bd > be else (2 if bd < be else 1)
            rc = cotes[ridx]
            midx = 0 if ppd > ppe else (2 if ppd < ppe else 1)
            pts_mod = rc if midx == ridx else 0
            if ppd == bd and ppe == be:                   # score exact -> + bonus rareté
                pts_mod += exact_bonus(r.dom, r.ext)
            pk = [mv, mn, md]; aidx = pk.index(max(pk))
            pts_mpp = rc if aidx == ridx else 0
        _u = user_fields(r.dom, r.ext)
        predictions.append({
            "groupe": rnd["label"], "journee": rnd["journee"],
            "kickoff_cest": k_cest, "kickoff_utc": k_utc,
            "dom": r.dom, "ext": r.ext, "statut": "joue" if joue else "a_venir",
            "bd": bd if bd is not None else 0, "be": be if be is not None else 0,
            "ppd": ppd, "ppe": ppe,
            "pv": float(r.p_dom), "pn": float(r.p_nul), "pd": float(r.p_ext),
            "mpp_v": mv, "mpp_n": mn, "mpp_d": md,
            "pts_mod": pts_mod, "pts_mpp": pts_mpp,
            "xg_dom": float(r.xg_dom), "xg_ext": float(r.xg_ext),
            "phase": rnd["label"],
            "u_ppd": _u[0], "u_ppe": _u[1], "u_pts": _u[2],
        })
        domFav = r.q_dom >= r.q_ext
        matches.append({
            "date": r.date, "dom": r.dom, "ext": r.ext,
            "rkDom": int(r.rk_dom), "rkExt": int(r.rk_ext),
            "eloPostDom": int(r.elo_post_dom), "eloPostExt": int(r.elo_post_ext),
            "dEloDom": int(r.d_elo_dom), "dEloExt": int(r.d_elo_ext),
            "parcDom": r.parc_dom, "parcExt": r.parc_ext,
            "score": r.score_modele,
            "pDom": float(r.p_dom), "pNul": float(r.p_nul), "pExt": float(r.p_ext),
            "qDom": float(r.q_dom), "qExt": float(r.q_ext),
            "favori": r.favori, "pFavori": float(r.p_favori),
            "mppDom": float(r.mpp_dom), "mppNul": float(r.mpp_nul), "mppExt": float(r.mpp_ext),
        })
    ko_rounds_data.append({"key": rnd["key"], "label": rnd["label"], "title": rnd["title"],
                           "matches": matches, "reportMarkdown": r_report_md})

# Score total de pronostics (calibrage) : somme des points pris sur les matchs joués,
# comparée à parité (mêmes matchs où les deux ont une proba).
scored = [p for p in predictions if p["pts_mod"] is not None and p["pts_mpp"] is not None]
total_pts_mod = sum(p["pts_mod"] for p in scored)
total_pts_mpp = sum(p["pts_mpp"] for p in scored)

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

# Précision globale du modèle (pronostic figé vs résultat réel) sur TOUS les matchs déjà
# joués à ce jour — groupes + phase à élimination directe — recalculée à chaque run pour
# suivre le tournoi au lieu de rester bloquée aux 72 matchs de poule.
scored_acc = [p for p in predictions if p["statut"] == "joue" and p["ppd"] is not None and p["ppe"] is not None]
accuracy_ok = sum(1 for p in scored_acc if issue(p["bd"], p["be"]) == issue(p["ppd"], p["ppe"]))
accuracy = round(accuracy_ok / len(scored_acc), 3) if scored_acc else None

meta = {
    "titre": "Pronostics CDM 2026 — Phase de groupes",
    "n_matchs": len(predictions),
    "n_joues": int((pred.statut == "joue").sum()),
    "n_poule": int((pred.statut == "joue").sum()),                 # 72 matchs de poule
    "n_seize": n_ko_by_round.get("16e", 0),
    "n_huit": n_ko_by_round.get("8e", 0),
    "n_predites": len(predictions),                                # 72 + tours KO
    "n_joues_total": sum(1 for p in predictions if p["statut"] == "joue"),
    "n_qualifies": 32,
    "vainqueurs": [f"{g} : {e}" for g, e in premiers],
    "j1_accuracy": j1_acc,
    "accuracy": accuracy,
    "n_accuracy": len(scored_acc),
    "pts_mod": total_pts_mod,
    "pts_mpp": total_pts_mpp,
    "n_scored": len(scored),
    "pts_user": pts_user_total,
    "n_user": sum(1 for m in _uf if m.get("uf")),
    "groupes": sorted(cls.keys()),
}

# --- Classement de la ligue « Viva Italia » + insertion de notre modèle ---
MODEL_NAME = "Polpo Paolo 🐙"
MODEL_AVATAR = "avatars/model.svg"
league = None
try:
    lg = json.load(open("data/league_viva_italia.json"))
except FileNotFoundError:
    lg = None
if lg is not None:
    model_good = sum(1 for p in scored if p["pts_mod"] > 0)
    model_exact = sum(1 for p in scored if p["ppd"] == p["bd"] and p["ppe"] == p["be"])
    rows = [{"username": s["username"], "points": int(s["points"]), "calc": int(s["calc"]),
             "exact": int(s["exact"]), "good": int(s["good"]), "avatar": s.get("avatar"),
             "isModel": False, "isMe": s["id"] == lg.get("me")} for s in lg["standings"]]
    rows.append({"username": MODEL_NAME, "points": int(total_pts_mod), "calc": len(scored),
                 "exact": model_exact, "good": model_good, "avatar": MODEL_AVATAR,
                 "isModel": True, "isMe": False})
    rows.sort(key=lambda x: -x["points"])
    for i, x in enumerate(rows, 1):
        x["rank"] = i
    league = {"name": lg["name"], "snapshot": lg.get("snapshot"), "rows": rows,
              "modelNote": "Le modèle est noté avec le même barème que les joueurs : cote de l'issue (1/N/2) + bonus « score exact » (rareté)."}

DATA = {"meta": meta, "predictions": predictions, "standings": standings,
        "qualifiers": qualifiers, "ratings": ratings_l, "analyses": analyses,
        "teams": teams, "h2h": h2h,
        "j1": j1, "reportMarkdown": report_md, "teamDetails": team_details,
        "koRounds": ko_rounds_data, "league": league}

with open("docs/data.js", "w", encoding="utf-8") as f:
    f.write("// Généré par build_site.py — ne pas éditer à la main.\n")
    f.write("window.DATA = ")
    json.dump(DATA, f, ensure_ascii=False, indent=1)
    f.write(";\n")

print(f"docs/data.js écrit ({os.path.getsize('docs/data.js')//1024} Ko).")
