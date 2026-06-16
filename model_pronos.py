"""
Modèle de pronostics — Coupe du Monde 2026.

Cœur quantitatif : un modèle de Poisson dont les buts attendus (lambda) sont
dérivés des notes Elo des équipes. Ce module est importé à la fois par le
script de génération du baseline et par le notebook d'analyse, afin que la
logique reste unique et reproductible.

Pipeline :
  Elo -> différence effective (avec avantage hôte)
       -> "supremacy" (différence de buts attendue, bornée par tanh)
       -> buts totaux attendus (croît avec le déséquilibre)
       -> lambda_dom, lambda_ext
       -> matrice de scores (Poisson indépendant) -> score le plus probable,
          probabilités Victoire/Nul/Défaite, buts attendus.
"""
from __future__ import annotations

import numpy as np
from scipy.stats import poisson

# Nations hôtes : avantage à domicile sur tous leurs matchs de groupe.
HOTES = {"Mexique", "États-Unis", "Canada"}
AVANTAGE_HOTE_ELO = 65.0

# Paramètres calibrés (voir notebook pour la justification / sensibilité).
SUP_MAX = 3.6      # supremacy maximale (mismatch extrême)
SUP_PENTE = 350.0  # échelle Elo de la tangente hyperbolique
TG_BASE = 2.5      # buts totaux attendus pour un match équilibré
TG_GAIN = 0.35     # hausse des buts totaux avec le déséquilibre
LAMBDA_MIN = 0.18  # plancher pour éviter des lambda nuls
MAX_BUTS = 10      # taille de la matrice de scores


def elo_effectif(elo_dom: float, elo_ext: float, equipe_dom: str, equipe_ext: str):
    """Renvoie (elo_dom_eff, elo_ext_eff) en appliquant l'avantage hôte."""
    e_dom, e_ext = elo_dom, elo_ext
    if equipe_dom in HOTES:
        e_dom += AVANTAGE_HOTE_ELO
    if equipe_ext in HOTES:
        e_ext += AVANTAGE_HOTE_ELO
    return e_dom, e_ext


def lambdas(elo_dom: float, elo_ext: float, equipe_dom: str, equipe_ext: str):
    """Calcule (lambda_dom, lambda_ext) = buts attendus pour chaque équipe."""
    e_dom, e_ext = elo_effectif(elo_dom, elo_ext, equipe_dom, equipe_ext)
    dr = e_dom - e_ext
    sup = SUP_MAX * np.tanh(dr / SUP_PENTE)
    tg = TG_BASE + TG_GAIN * abs(sup)
    lam_dom = max((tg + sup) / 2.0, LAMBDA_MIN)
    lam_ext = max((tg - sup) / 2.0, LAMBDA_MIN)
    return lam_dom, lam_ext


def matrice_scores(lam_dom: float, lam_ext: float, n: int = MAX_BUTS):
    """Matrice (n+1)x(n+1) des probabilités P(score = i-j)."""
    p_dom = poisson.pmf(np.arange(n + 1), lam_dom)
    p_ext = poisson.pmf(np.arange(n + 1), lam_ext)
    return np.outer(p_dom, p_ext)


def pronostic(elo_dom: float, elo_ext: float, equipe_dom: str, equipe_ext: str):
    """
    Renvoie un dict complet : buts attendus, score le plus probable,
    probabilités V/N/D (du point de vue de l'équipe à domicile).
    """
    lam_dom, lam_ext = lambdas(elo_dom, elo_ext, equipe_dom, equipe_ext)
    m = matrice_scores(lam_dom, lam_ext)
    i, j = np.unravel_index(np.argmax(m), m.shape)
    p_dom_win = np.tril(m, -1).sum()   # i > j
    p_nul = np.trace(m)                # i == j
    p_ext_win = np.triu(m, 1).sum()    # j > i
    return {
        "xg_dom": round(float(lam_dom), 2),
        "xg_ext": round(float(lam_ext), 2),
        "score_modele": f"{i}-{j}",
        "buts_dom_modele": int(i),
        "buts_ext_modele": int(j),
        "p_victoire_dom": round(float(p_dom_win), 3),
        "p_nul": round(float(p_nul), 3),
        "p_victoire_ext": round(float(p_ext_win), 3),
    }


if __name__ == "__main__":
    # Démonstration rapide
    for d, e, td, te in [
        ("Espagne", "Cap-Vert", "Espagne", "Cap-Vert"),
        ("France", "Sénégal", "France", "Sénégal"),
    ]:
        pass
