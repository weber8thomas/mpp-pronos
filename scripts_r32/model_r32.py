"""Modele des 16es de finale (round of 32) CDM 2026.

Integre la DYNAMIQUE / le PARCOURS de poule via une mise a jour Elo sequentielle
sur les 72 matchs de groupe (systeme World Football Elo : K=60, multiplicateur
d'ecart de buts G). L'Elo post-poule sert ensuite d'entree au pipeline Poisson
(model_pronos) pour chaque 16e, avec resolution du nul (prolongation/t.a.b.).
"""
import json
import math
import pandas as pd
import numpy as np
from model_pronos import lambdas, matrice_scores, HOTES, AVANTAGE_HOTE_ELO

K_WC = 60.0          # poids "phase finale CDM" dans le systeme Elo
HOST_ELO = AVANTAGE_HOTE_ELO  # avantage hote (Mexique/USA/Canada)

club2name = json.load(open("data/club2name.json"))
mpp = json.load(open("data/mpp_knockout_raw.json"))
ratings = pd.read_csv("data/team_ratings.csv")
elo0 = dict(zip(ratings.equipe, ratings.elo.astype(float)))

# --- 1. Elo de depart (pre-tournoi) ---
elo = dict(elo0)
elo_pre = dict(elo0)

def g_mult(gd):
    gd = abs(gd)
    if gd <= 1:
        return 1.0
    if gd == 2:
        return 1.5
    return (11.0 + gd) / 8.0

def expected(ra, rb):
    return 1.0 / (1.0 + 10 ** ((rb - ra) / 400.0))

# --- 2. Mise a jour sequentielle sur les 72 matchs de poule (ordre chrono) ---
gs = sorted(mpp["gs"], key=lambda m: m["date"])
historique = {t: [] for t in elo}  # parcours par equipe
for m in gs:
    h = club2name[m["h"]]; a = club2name[m["a"]]
    hs, as_ = m["hs"], m["as"]
    # avantage hote applique a l'expected
    ra = elo[h] + (HOST_ELO if h in HOTES else 0)
    rb = elo[a] + (HOST_ELO if a in HOTES else 0)
    ea = expected(ra, rb)
    sa = 1.0 if hs > as_ else (0.5 if hs == as_ else 0.0)
    delta = K_WC * g_mult(hs - as_) * (sa - ea)
    elo[h] += delta
    elo[a] -= delta
    historique[h].append((a, hs, as_, +delta))
    historique[a].append((h, as_, hs, -delta))

elo_post = dict(elo)

# --- 3. Resolution du nul en KO : part de la masse de nul attribuee a chaque camp ---
def split_nul(dr):
    # tirs au but ~ pile-ou-face avec leger biais selon Elo effectif
    return 0.5 + 0.15 * math.tanh(dr / 200.0)

def proba_ko(team_dom, team_ext):
    ed = elo_post[team_dom] + (HOST_ELO if team_dom in HOTES else 0)
    ee = elo_post[team_ext] + (HOST_ELO if team_ext in HOTES else 0)
    lam_d, lam_e = lambdas(ed, ee, team_dom, team_ext)
    M = matrice_scores(lam_d, lam_e)
    p_d = np.tril(M, -1).sum()
    p_n = np.trace(M)
    p_e = np.triu(M, 1).sum()
    i, j = np.unravel_index(np.argmax(M), M.shape)
    f = split_nul(ed - ee)
    q_d = p_d + f * p_n          # proba de qualification (apres prolong./tab)
    q_e = p_e + (1 - f) * p_n
    return dict(xg_dom=lam_d, xg_ext=lam_e, score=f"{i}-{j}",
                p_dom=p_d, p_nul=p_n, p_ext=p_e, q_dom=q_d, q_ext=q_e)

# --- 4. Table des 16es ---
def parcours_str(team):
    pts = 0; bp = 0; bc = 0; seq = []
    for opp, gf, ga, dlt in historique[team]:
        bp += gf; bc += ga
        if gf > ga: pts += 3; seq.append("V")
        elif gf == ga: pts += 1; seq.append("N")
        else: seq.append("D")
    return pts, bp, bc, "".join(seq)

rows = []
for m in mpp["r32"]:
    h = club2name[m["h"]["c"]]; a = club2name[m["a"]["c"]]
    pr = proba_ko(h, a)
    fav = h if pr["q_dom"] >= pr["q_ext"] else a
    ph, bph, bch, sqh = parcours_str(h)
    pa, bpa, bca, sqa = parcours_str(a)
    # cotes MPP -> probas implicites (inverse, renormalise)
    q = m["q"]
    inv = {k: 100.0 / q[k] for k in ("home", "draw", "away")}
    s = sum(inv.values())
    mpp_imp = {k: inv[k] / s for k in inv}
    rows.append(dict(
        match_id=m["id"], date=m["date"], dom=h, ext=a, rk_dom=m["h"]["rk"], rk_ext=m["a"]["rk"],
        elo_pre_dom=round(elo_pre[h]), elo_pre_ext=round(elo_pre[a]),
        elo_post_dom=round(elo_post[h]), elo_post_ext=round(elo_post[a]),
        d_elo_dom=round(elo_post[h]-elo_pre[h]), d_elo_ext=round(elo_post[a]-elo_pre[a]),
        parc_dom=f"{ph}pts {bph}:{bch} [{sqh}]", parc_ext=f"{pa}pts {bpa}:{bca} [{sqa}]",
        score_modele=pr["score"], xg_dom=round(pr["xg_dom"],2), xg_ext=round(pr["xg_ext"],2),
        p_dom=round(pr["p_dom"],3), p_nul=round(pr["p_nul"],3), p_ext=round(pr["p_ext"],3),
        q_dom=round(pr["q_dom"],3), q_ext=round(pr["q_ext"],3),
        favori=fav, p_favori=round(max(pr["q_dom"],pr["q_ext"]),3),
        cote_dom=q["home"], cote_nul=q["draw"], cote_ext=q["away"],
        mpp_dom=round(mpp_imp["home"],3), mpp_nul=round(mpp_imp["draw"],3), mpp_ext=round(mpp_imp["away"],3),
    ))

df = pd.DataFrame(rows)
df.to_csv("data/predictions_r32.csv", index=False)

# export Elo post-poule (les 32 qualifies) pour tracage
elo_tab = sorted(((t, round(elo_pre[t]), round(elo_post[t]), round(elo_post[t]-elo_pre[t]))
                  for t in elo_post), key=lambda x: -x[2])
pd.DataFrame(elo_tab, columns=["equipe","elo_pre","elo_post","delta"]).to_csv(
    "data/elo_post_poule.csv", index=False)

# --- 5. Affichage lisible ---
pd.set_option("display.width", 200); pd.set_option("display.max_columns", 30)
print("=== ELO POST-POULE (mouvement le plus marquant) ===")
mv = pd.DataFrame(elo_tab, columns=["equipe","elo_pre","elo_post","delta"])
print("  + montees:"); print(mv.sort_values("delta",ascending=False).head(6).to_string(index=False))
print("  - chutes:");  print(mv.sort_values("delta").head(6).to_string(index=False))

print("\n=== 16es DE FINALE : prediction modele (dynamique integree) ===")
for _, r in df.iterrows():
    print(f'\n{r.date[:10]}  {r.dom} ({r.rk_dom}) vs {r.ext} ({r.rk_ext})')
    print(f'   Elo {r.elo_pre_dom}->{r.elo_post_dom} ({r.d_elo_dom:+d}) | {r.elo_pre_ext}->{r.elo_post_ext} ({r.d_elo_ext:+d})')
    print(f'   parcours : {r.dom} {r.parc_dom}  /  {r.ext} {r.parc_ext}')
    print(f'   modele 90min  {r.dom} {int(r.p_dom*100)}% / nul {int(r.p_nul*100)}% / {r.ext} {int(r.p_ext*100)}%  -> score probable {r.score_modele}')
    print(f'   QUALIF : {r.favori} {int(r.p_favori*100)}%   (MPP marche : {r.dom} {int(r.mpp_dom*100)}/{int(r.mpp_nul*100)}/{int(r.mpp_ext*100)} {r.ext})')
