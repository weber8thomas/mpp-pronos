"""Modele generique pour un tour a elimination directe de la CDM 2026.

Generalisation de model_r32.py : au lieu de coder en dur "poule -> 16es",
on rejoue sequentiellement l'Elo sur TOUS les matchs deja joues (72 de poule
+ chaque tour KO deja termine, dans l'ordre chronologique, avec les vrais
scores lus dans data/rXX_results.json), puis on genere les pronostics du
tour demande (dont le bracket + cotes sont lus dans data/mpp_knockout_raw.json).

Usage : python scripts_r32/model_ko.py r16
  -> genere data/predictions_r16.csv et data/elo_post_r32.csv
     (elo_post_r32.csv = etat de l'Elo apres le dernier tour KO termine
      avant r16, ici r32 ; s'il n'y avait aucun tour KO termine, on
      ecrirait data/elo_post_poule.csv, comme model_r32.py).

Tours KO consecutifs (ordre = nombre d'equipes engagees dans le tour) :
    r32 (16 matchs, 32->16) -> r16 (8 matchs, 16->8) -> r8 (4 matchs, 8->4)
    -> r4 (2 matchs, 4->2) -> r2 (finale)
"""
import json
import math
import sys

import numpy as np
import pandas as pd

from model_pronos import lambdas, matrice_scores, HOTES, AVANTAGE_HOTE_ELO

K_WC = 60.0
HOST_ELO = AVANTAGE_HOTE_ELO

KO_SEQUENCE = ["r32", "r16", "r8", "r4", "r2"]


def g_mult(gd):
    gd = abs(gd)
    if gd <= 1:
        return 1.0
    if gd == 2:
        return 1.5
    return (11.0 + gd) / 8.0


def expected(ra, rb):
    return 1.0 / (1.0 + 10 ** ((rb - ra) / 400.0))


def split_nul(dr):
    return 0.5 + 0.15 * math.tanh(dr / 200.0)


# Poids du signal "forme reelle en tournoi" (buts marques/encaisses) par rapport
# a l'Elo seul. L'Elo capture la force relative + sa dynamique (K=60 par resultat),
# mais deux equipes a Elo egal peuvent avoir un profil tres different (attaque
# prolifique vs defense hermetique) que le seul delta Elo ne rend pas toujours
# assez vite. Ces indices, normalises par la moyenne du tournoi, corrigent lambda
# dans ce sens sans jamais dominer l'Elo (poids borne + indices plafonnes).
FORM_WEIGHT = 0.30
IDX_MIN, IDX_MAX = 0.35, 2.5


def form_indices(historique):
    """Indices d'attaque / de solidite defensive bases sur les buts REELLEMENT
    marques et encaisses en tournoi (poule + tours KO deja joues), normalises
    par la moyenne du tournoi (indice 1.0 = dans la moyenne, >1 = au-dessus)."""
    gf_avg, ga_avg = {}, {}
    for t, matches in historique.items():
        if not matches:
            continue
        gf_avg[t] = sum(x[1] for x in matches) / len(matches)
        ga_avg[t] = sum(x[2] for x in matches) / len(matches)
    league_gf = sum(gf_avg.values()) / len(gf_avg)
    league_ga = sum(ga_avg.values()) / len(ga_avg)
    attack = {t: max(IDX_MIN, min(IDX_MAX, gf_avg[t] / league_gf)) for t in gf_avg}
    solidity = {t: max(IDX_MIN, min(IDX_MAX, ga_avg[t] / league_ga)) for t in ga_avg}
    return attack, solidity


def apply_round(elo, historique, matches, results, club2name):
    """Met a jour elo/historique en place, sequentiellement (ordre chrono)."""
    matches = sorted(matches, key=lambda m: m["date"])
    for m in matches:
        res = results[m["id"]]
        h = club2name[m["h"]["c"]]
        a = club2name[m["a"]["c"]]
        hs, as_ = res["hs"], res["as"]
        ra = elo[h] + (HOST_ELO if h in HOTES else 0)
        rb = elo[a] + (HOST_ELO if a in HOTES else 0)
        ea = expected(ra, rb)
        sa = 1.0 if hs > as_ else (0.5 if hs == as_ else 0.0)
        delta = K_WC * g_mult(hs - as_) * (sa - ea)
        elo[h] += delta
        elo[a] -= delta
        historique[h].append((a, hs, as_, +delta))
        historique[a].append((h, as_, hs, -delta))


def parcours_str(historique, team):
    pts = bp = bc = 0
    seq = []
    for opp, gf, ga, dlt in historique[team]:
        bp += gf
        bc += ga
        if gf > ga:
            pts += 3
            seq.append("V")
        elif gf == ga:
            pts += 1
            seq.append("N")
        else:
            seq.append("D")
    return pts, bp, bc, "".join(seq)


def main():
    if len(sys.argv) != 2 or sys.argv[1] not in KO_SEQUENCE:
        sys.exit(f"Usage: python scripts_r32/model_ko.py <{'|'.join(KO_SEQUENCE)}>")
    target = sys.argv[1]
    target_idx = KO_SEQUENCE.index(target)
    prior_rounds = KO_SEQUENCE[:target_idx]

    club2name = json.load(open("data/club2name.json"))
    mpp = json.load(open("data/mpp_knockout_raw.json"))
    if target not in mpp:
        sys.exit(f"data/mpp_knockout_raw.json ne contient pas la cle '{target}'.")
    ratings = pd.read_csv("data/team_ratings.csv")
    elo0 = dict(zip(ratings.equipe, ratings.elo.astype(float)))

    elo = dict(elo0)
    elo_pre_poule = dict(elo0)
    historique = {t: [] for t in elo}

    # --- 1. Phase de groupes (72 matchs) ---
    gs = sorted(mpp["gs"], key=lambda m: m["date"])
    for m in gs:
        h = club2name[m["h"]]
        a = club2name[m["a"]]
        hs, as_ = m["hs"], m["as"]
        ra = elo[h] + (HOST_ELO if h in HOTES else 0)
        rb = elo[a] + (HOST_ELO if a in HOTES else 0)
        ea = expected(ra, rb)
        sa = 1.0 if hs > as_ else (0.5 if hs == as_ else 0.0)
        delta = K_WC * g_mult(hs - as_) * (sa - ea)
        elo[h] += delta
        elo[a] -= delta
        historique[h].append((a, hs, as_, +delta))
        historique[a].append((h, as_, hs, -delta))

    last_completed_label = "poule"
    elo_pre_target = dict(elo)  # Elo au moment ou l'on entre dans le tour precedent le plus recent

    # --- 2. Tours KO deja termines, dans l'ordre chronologique du tournoi ---
    for i, rnd in enumerate(prior_rounds):
        if rnd not in mpp:
            sys.exit(f"Tour prealable '{rnd}' absent de data/mpp_knockout_raw.json.")
        results_path = f"data/{rnd}_results.json"
        try:
            results = json.load(open(results_path))
        except FileNotFoundError:
            sys.exit(f"{results_path} introuvable : le tour '{rnd}' doit etre termine avant de generer '{target}'.")
        match_ids = {m["id"] for m in mpp[rnd]}
        missing = match_ids - set(results.keys())
        if missing:
            sys.exit(f"{results_path} incomplet (match_id manquants : {sorted(missing)}) : "
                      f"le tour '{rnd}' doit etre entierement termine avant de generer '{target}'.")
        elo_pre_target = dict(elo)
        apply_round(elo, historique, mpp[rnd], results, club2name)
        last_completed_label = rnd

    elo_post = dict(elo)
    attack_idx, solidity_idx = form_indices(historique)

    def proba_ko(team_dom, team_ext):
        ed = elo_post[team_dom] + (HOST_ELO if team_dom in HOTES else 0)
        ee = elo_post[team_ext] + (HOST_ELO if team_ext in HOTES else 0)
        lam_d, lam_e = lambdas(ed, ee, team_dom, team_ext)
        # Ajustement "forme reelle" : une attaque prolifique face a une defense
        # qui encaisse beaucoup gonfle lambda ; l'inverse le degonfle. Poids
        # borne (FORM_WEIGHT) pour que l'Elo reste le signal dominant.
        lam_d *= (attack_idx[team_dom] * solidity_idx[team_ext]) ** FORM_WEIGHT
        lam_e *= (attack_idx[team_ext] * solidity_idx[team_dom]) ** FORM_WEIGHT
        M = matrice_scores(lam_d, lam_e)
        p_d = np.tril(M, -1).sum()
        p_n = np.trace(M)
        p_e = np.triu(M, 1).sum()
        i, j = np.unravel_index(np.argmax(M), M.shape)
        f = split_nul(ed - ee)
        q_d = p_d + f * p_n
        q_e = p_e + (1 - f) * p_n
        return dict(xg_dom=lam_d, xg_ext=lam_e, score=f"{i}-{j}",
                    p_dom=p_d, p_nul=p_n, p_ext=p_e, q_dom=q_d, q_ext=q_e)

    rows = []
    for m in mpp[target]:
        h = club2name[m["h"]["c"]]
        a = club2name[m["a"]["c"]]
        pr = proba_ko(h, a)
        fav = h if pr["q_dom"] >= pr["q_ext"] else a
        ph, bph, bch, sqh = parcours_str(historique, h)
        pa, bpa, bca, sqa = parcours_str(historique, a)
        q = m["q"]
        cotes_absentes = not all(q.get(k) for k in ("home", "draw", "away"))
        if cotes_absentes:
            mpp_imp = {"home": float("nan"), "draw": float("nan"), "away": float("nan")}
        else:
            inv = {k: 100.0 / q[k] for k in ("home", "draw", "away")}
            s = sum(inv.values())
            mpp_imp = {k: inv[k] / s for k in inv}
        rows.append(dict(
            match_id=m["id"], date=m["date"], dom=h, ext=a, rk_dom=m["h"]["rk"], rk_ext=m["a"]["rk"],
            elo_pre_dom=round(elo_pre_target[h]), elo_pre_ext=round(elo_pre_target[a]),
            elo_post_dom=round(elo_post[h]), elo_post_ext=round(elo_post[a]),
            d_elo_dom=round(elo_post[h] - elo_pre_target[h]), d_elo_ext=round(elo_post[a] - elo_pre_target[a]),
            parc_dom=f"{ph}pts {bph}:{bch} [{sqh}]", parc_ext=f"{pa}pts {bpa}:{bca} [{sqa}]",
            score_modele=pr["score"], xg_dom=round(pr["xg_dom"], 2), xg_ext=round(pr["xg_ext"], 2),
            p_dom=round(pr["p_dom"], 3), p_nul=round(pr["p_nul"], 3), p_ext=round(pr["p_ext"], 3),
            q_dom=round(pr["q_dom"], 3), q_ext=round(pr["q_ext"], 3),
            favori=fav, p_favori=round(max(pr["q_dom"], pr["q_ext"]), 3),
            cote_dom=(q["home"] or ""), cote_nul=(q["draw"] or ""), cote_ext=(q["away"] or ""),
            mpp_dom=("" if cotes_absentes else round(mpp_imp["home"], 3)),
            mpp_nul=("" if cotes_absentes else round(mpp_imp["draw"], 3)),
            mpp_ext=("" if cotes_absentes else round(mpp_imp["away"], 3)),
            att_idx_dom=round(attack_idx[h], 2), def_idx_dom=round(solidity_idx[h], 2),
            att_idx_ext=round(attack_idx[a], 2), def_idx_ext=round(solidity_idx[a], 2),
        ))

    df = pd.DataFrame(rows)
    out_csv = f"data/predictions_{target}.csv"
    df.to_csv(out_csv, index=False)

    elo_tab = sorted(((t, round(elo_pre_target[t]), round(elo_post[t]), round(elo_post[t] - elo_pre_target[t]))
                      for t in elo_post), key=lambda x: -x[2])
    elo_out = f"data/elo_post_{last_completed_label}.csv"
    pd.DataFrame(elo_tab, columns=["equipe", "elo_pre", "elo_post", "delta"]).to_csv(elo_out, index=False)

    pd.set_option("display.width", 200)
    pd.set_option("display.max_columns", 30)
    print(f"=== ELO POST-{last_completed_label.upper()} (mouvement le plus marquant) ===")
    mv = pd.DataFrame(elo_tab, columns=["equipe", "elo_pre", "elo_post", "delta"])
    print("  + montees:")
    print(mv.sort_values("delta", ascending=False).head(6).to_string(index=False))
    print("  - chutes:")
    print(mv.sort_values("delta").head(6).to_string(index=False))

    print(f"\n=== {target.upper()} : prediction modele (dynamique integree) ===")
    for _, r in df.iterrows():
        print(f'\n{r.date[:10]}  {r.dom} ({r.rk_dom}) vs {r.ext} ({r.rk_ext})')
        print(f'   Elo {r.elo_pre_dom}->{r.elo_post_dom} ({r.d_elo_dom:+d}) | {r.elo_pre_ext}->{r.elo_post_ext} ({r.d_elo_ext:+d})')
        print(f'   parcours : {r.dom} {r.parc_dom}  /  {r.ext} {r.parc_ext}')
        print(f'   forme (indices att/def, 1.0=moyenne) : {r.dom} att {r.att_idx_dom}/def {r.def_idx_dom}  |  {r.ext} att {r.att_idx_ext}/def {r.def_idx_ext}')
        print(f'   modele 90min  {r.dom} {int(r.p_dom*100)}% / nul {int(r.p_nul*100)}% / {r.ext} {int(r.p_ext*100)}%  -> score probable {r.score_modele}')
        if r.mpp_dom == "":
            print(f'   QUALIF : {r.favori} {int(r.p_favori*100)}%   (MPP marche : cotes pas encore publiees)')
        else:
            print(f'   QUALIF : {r.favori} {int(r.p_favori*100)}%   (MPP marche : {r.dom} {int(r.mpp_dom*100)}/{int(r.mpp_nul*100)}/{int(r.mpp_ext*100)} {r.ext})')

    print(f"\n-> {out_csv}")
    print(f"-> {elo_out}")


if __name__ == "__main__":
    main()
