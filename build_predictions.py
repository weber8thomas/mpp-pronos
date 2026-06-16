"""
Assemble les pronostics finaux (scores + probabilités V/N/D) issus de la synthèse
modèle Poisson + agents prédicteurs (+ critiques). Source unique de vérité pour
data/predictions.csv. Réexécuter après tout ajustement de PRONOS.

Convention : J1 = résultats réels (tournoi commencé) pour les groupes A-H ;
I-L : J1 non jouée au 16/06/2026 -> pronostic. Le champ 'statut' distingue les deux.
"""
import csv
import unicodedata
import pandas as pd


def _norm(s):
    """Normalise un nom d'équipe (sans accents, minuscule) pour le matching mpp."""
    s = "".join(c for c in unicodedata.normalize("NFD", str(s))
                if unicodedata.category(c) != "Mn").lower().strip()
    return {"bosnie": "bosnie-herzegovine"}.get(s, s)

# (groupe, journee, dom, ext) -> (but_dom, but_ext, pV, pN, pD)
# pV/pN/pD = proba victoire dom / nul / victoire ext (synthèse agents, normalisées).
PRONOS = {
 # ---- A ----
 ("A",1,"Mexique","Afrique du Sud"):(2,0,.86,.10,.04),
 ("A",1,"Corée du Sud","Tchéquie"):(2,1,.48,.25,.27),
 ("A",2,"Tchéquie","Afrique du Sud"):(1,0,.58,.27,.15),
 ("A",2,"Mexique","Corée du Sud"):(1,1,.40,.30,.30),
 ("A",3,"Tchéquie","Mexique"):(1,1,.24,.31,.45),
 ("A",3,"Afrique du Sud","Corée du Sud"):(0,2,.12,.22,.66),
 # ---- B ----
 ("B",1,"Canada","Bosnie-Herzégovine"):(1,1,.30,.40,.30),
 ("B",1,"Qatar","Suisse"):(1,1,.18,.40,.42),
 ("B",2,"Suisse","Bosnie-Herzégovine"):(2,0,.74,.16,.10),
 ("B",2,"Canada","Qatar"):(2,0,.78,.15,.07),
 ("B",3,"Suisse","Canada"):(2,1,.50,.27,.23),
 ("B",3,"Bosnie-Herzégovine","Qatar"):(2,1,.50,.26,.24),
 # ---- C ----
 ("C",1,"Brésil","Maroc"):(1,1,.40,.32,.28),
 ("C",1,"Haïti","Écosse"):(0,1,.12,.22,.66),
 ("C",2,"Écosse","Maroc"):(1,2,.18,.22,.60),
 ("C",2,"Brésil","Haïti"):(3,0,.91,.07,.02),
 ("C",3,"Écosse","Brésil"):(0,2,.06,.14,.80),
 ("C",3,"Maroc","Haïti"):(2,0,.85,.11,.04),
 # ---- D ----
 ("D",1,"États-Unis","Paraguay"):(4,1,.61,.22,.17),
 ("D",1,"Australie","Turquie"):(2,0,.19,.23,.58),
 ("D",2,"États-Unis","Australie"):(2,0,.66,.21,.13),
 ("D",2,"Turquie","Paraguay"):(2,1,.54,.25,.21),
 ("D",3,"Turquie","États-Unis"):(1,1,.29,.27,.44),
 ("D",3,"Paraguay","Australie"):(1,1,.45,.27,.28),
 # ---- E ----
 ("E",1,"Allemagne","Curaçao"):(7,1,.93,.06,.01),
 ("E",1,"Côte d'Ivoire","Équateur"):(1,0,.40,.30,.30),
 ("E",2,"Allemagne","Côte d'Ivoire"):(2,1,.60,.24,.16),
 ("E",2,"Équateur","Curaçao"):(2,0,.78,.16,.06),
 ("E",3,"Curaçao","Côte d'Ivoire"):(0,2,.08,.17,.75),
 ("E",3,"Équateur","Allemagne"):(1,1,.26,.38,.36),
 # ---- F ----
 ("F",1,"Pays-Bas","Japon"):(2,2,.45,.30,.25),
 ("F",1,"Suède","Tunisie"):(5,1,.59,.22,.19),
 ("F",2,"Pays-Bas","Suède"):(2,2,.35,.30,.35),
 ("F",2,"Tunisie","Japon"):(0,2,.18,.27,.55),
 ("F",3,"Japon","Suède"):(1,2,.30,.26,.44),
 ("F",3,"Tunisie","Pays-Bas"):(0,2,.14,.26,.60),
 # ---- G ----
 ("G",1,"Belgique","Égypte"):(1,1,.45,.30,.25),
 ("G",1,"Iran","Nouvelle-Zélande"):(2,2,.55,.25,.20),
 ("G",2,"Belgique","Iran"):(2,1,.55,.25,.20),
 ("G",2,"Nouvelle-Zélande","Égypte"):(1,2,.18,.24,.58),
 ("G",3,"Égypte","Iran"):(1,1,.38,.35,.27),
 ("G",3,"Nouvelle-Zélande","Belgique"):(0,2,.12,.20,.68),
 # ---- H ----
 ("H",1,"Espagne","Cap-Vert"):(0,0,.85,.12,.03),
 ("H",1,"Arabie saoudite","Uruguay"):(1,1,.18,.30,.52),
 ("H",2,"Espagne","Arabie saoudite"):(3,0,.80,.14,.06),
 ("H",2,"Uruguay","Cap-Vert"):(1,0,.58,.27,.15),
 ("H",3,"Cap-Vert","Arabie saoudite"):(1,1,.33,.34,.33),
 ("H",3,"Uruguay","Espagne"):(1,2,.22,.26,.52),
 # ---- I ----
 ("I",1,"France","Sénégal"):(2,1,.58,.24,.18),
 ("I",1,"Irak","Norvège"):(0,1,.12,.24,.64),
 ("I",2,"France","Irak"):(3,0,.86,.10,.04),
 ("I",2,"Norvège","Sénégal"):(1,1,.32,.30,.38),
 ("I",3,"Norvège","France"):(1,2,.22,.24,.54),
 ("I",3,"Sénégal","Irak"):(2,0,.78,.15,.07),
 # ---- J ----
 ("J",1,"Argentine","Algérie"):(2,0,.72,.18,.10),
 ("J",1,"Autriche","Jordanie"):(2,0,.64,.24,.12),
 ("J",2,"Argentine","Autriche"):(2,1,.66,.21,.13),
 ("J",2,"Jordanie","Algérie"):(0,2,.14,.26,.60),
 ("J",3,"Jordanie","Argentine"):(1,2,.12,.20,.68),
 ("J",3,"Algérie","Autriche"):(1,1,.33,.30,.37),
 # ---- K ----
 ("K",1,"Portugal","RD Congo"):(2,0,.66,.20,.14),
 ("K",1,"Ouzbékistan","Colombie"):(0,2,.12,.22,.66),
 ("K",2,"Portugal","Ouzbékistan"):(3,0,.78,.15,.07),
 ("K",2,"Colombie","RD Congo"):(2,1,.56,.24,.20),
 ("K",3,"Colombie","Portugal"):(1,1,.32,.36,.32),
 ("K",3,"RD Congo","Ouzbékistan"):(2,1,.50,.27,.23),
 # ---- L ----
 ("L",1,"Angleterre","Croatie"):(2,0,.68,.22,.10),
 ("L",1,"Ghana","Panama"):(1,1,.38,.32,.30),
 ("L",2,"Angleterre","Ghana"):(2,0,.78,.16,.06),
 ("L",2,"Panama","Croatie"):(1,2,.16,.24,.60),
 ("L",3,"Panama","Angleterre"):(0,2,.06,.14,.80),
 ("L",3,"Croatie","Ghana"):(2,1,.60,.24,.16),
}

def main():
    fx = pd.read_csv("data/fixtures.csv")
    base = pd.read_csv("data/predictions_baseline.csv")
    bidx = {(r.groupe, r.journee, r.equipe_dom, r.equipe_ext): r for _, r in base.iterrows()}

    # Probas mpp.football (export utilisateur) : 1/N/2 en %, par (dom, ext) normalisés.
    MPP = {}
    try:
        mpp = pd.read_csv("data/mpp_probs.csv")
        for _, m in mpp.iterrows():
            MPP[(_norm(m.Domicile), _norm(m.Exterieur))] = (
                m.Proba_1_pct, m.Proba_N_pct, m.Proba_2_pct)
    except FileNotFoundError:
        pass

    rows = []
    for _, r in fx.iterrows():
        key = (r.groupe, r.journee, r.equipe_dom, r.equipe_ext)
        if key not in PRONOS:
            raise SystemExit(f"Pronostic manquant pour {key}")
        bd, be, pv, pn, pd_ = PRONOS[key]
        s = pv + pn + pd_
        pv, pn, pd_ = round(pv/s, 3), round(pn/s, 3), round(pd_/s, 3)
        b = bidx[key]
        mk = MPP.get((_norm(r.equipe_dom), _norm(r.equipe_ext)))
        if mk:
            t = sum(mk)
            mpp_dom, mpp_nul, mpp_ext = round(mk[0]/t, 3), round(mk[1]/t, 3), round(mk[2]/t, 3)
        else:
            mpp_dom = mpp_nul = mpp_ext = ""
        rows.append({
            "groupe": r.groupe, "journee": r.journee, "date": r.date,
            "kickoff_utc": r.kickoff_utc, "kickoff_cest": r.kickoff_cest,
            "equipe_dom": r.equipe_dom, "equipe_ext": r.equipe_ext,
            "statut": r.statut,
            "score_pronostic": f"{bd}-{be}",
            "buts_dom": bd, "buts_ext": be,
            "p_victoire_dom": pv, "p_nul": pn, "p_victoire_ext": pd_,
            "p_mpp_dom": mpp_dom, "p_mpp_nul": mpp_nul, "p_mpp_ext": mpp_ext,
            "xg_dom_modele": b.xg_dom, "xg_ext_modele": b.xg_ext,
            "score_modele": b.score_modele,
        })
    out = pd.DataFrame(rows)
    out.to_csv("data/predictions.csv", index=False)
    print(f"predictions.csv : {len(out)} matchs écrits.")

if __name__ == "__main__":
    main()
