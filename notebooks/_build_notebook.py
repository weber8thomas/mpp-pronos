"""Génère notebooks/analyse_pronos.ipynb (modèle Poisson + classements + viz)."""
import nbformat as nbf
from nbformat.v4 import new_notebook, new_markdown_cell, new_code_cell

cells = []
md = lambda s: cells.append(new_markdown_cell(s))
co = lambda s: cells.append(new_code_cell(s))

md("""# 🏆 Pronostics CDM 2026 — Phase de groupes (analyse explorable)

Notebook d'analyse des pronostics de scores des **72 matchs de phase de groupes**
de la Coupe du Monde 2026 (48 équipes, 12 groupes).

**Méthodologie hybride :**
1. **Modèle quantitatif** — un modèle de **Poisson** dont les buts attendus dérivent
   des notes **Elo** des équipes (+ avantage hôte) → score de base + probabilités V/N/D.
2. **Couche multi-agents** — 12 agents *prédicteurs* (recherche forme/effectif/blessures)
   ajustent le baseline, puis 4 agents *critiques* challengent réalisme et cohérence.
3. **Synthèse** — `data/predictions.csv` (scores finaux), classements et qualifiés calculés ici.

> ⏱️ Contexte : le tournoi a débuté le 11/06/2026. **J1 = résultats réels** (groupes A–H),
> **J2/J3 = pronostics**. Les groupes I–L n'avaient pas encore joué au 16/06/2026.

Ce notebook est **rejouable** : modifiez les paramètres du modèle et tout se recalcule.""")

co("""import sys, os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

# Se placer à la racine du dépôt (le notebook vit dans notebooks/)
if os.path.basename(os.getcwd()) == "notebooks":
    os.chdir("..")
sys.path.insert(0, os.getcwd())

import model_pronos as mp
import standings as S

pd.set_option("display.max_rows", 100)
plt.rcParams["figure.figsize"] = (9, 4)
print("Dossier de travail :", os.getcwd())""")

md("## 1. Données : groupes, notes de force, calendrier")

co("""import json
groupes = json.load(open("data/groups.json"))["groupes"]
ratings = pd.read_csv("data/team_ratings.csv")
fixtures = pd.read_csv("data/fixtures.csv")
predictions = pd.read_csv("data/predictions.csv")

print(f"{len(ratings)} équipes, {len(fixtures)} matchs, {len(predictions)} pronostics.")
ratings.sort_values("elo", ascending=False).head(12)""")

md("""### Notes de force (Elo) par groupe

L'Elo est le moteur du modèle. Les valeurs proviennent de eloratings.net / classement FIFA
(juin 2026), complétées par les agents de recherche. Voir `data/team_ratings.csv` pour les sources.""")

co("""fig, ax = plt.subplots(figsize=(11, 6))
order = ratings.sort_values(["groupe", "elo"], ascending=[True, False])
colors = plt.cm.tab20(np.linspace(0, 1, 12))
gmap = {g: colors[i] for i, g in enumerate(sorted(ratings.groupe.unique()))}
ax.barh(range(len(order)), order.elo, color=[gmap[g] for g in order.groupe])
ax.set_yticks(range(len(order)))
ax.set_yticklabels([f"{r.groupe} · {r.equipe}" for _, r in order.iterrows()], fontsize=7)
ax.invert_yaxis(); ax.set_xlabel("Elo"); ax.set_xlim(1450, 2200)
ax.set_title("Notes Elo des 48 équipes (groupées)")
plt.tight_layout(); plt.show()""")

md("""## 2. Le modèle de Poisson (cœur quantitatif)

Pour un match, on calcule les buts attendus de chaque équipe :

- différence Elo effective `dr = elo_dom - elo_ext (+ avantage hôte)`
- **supremacy** (différence de buts attendue) : `sup = 3.6 · tanh(dr / 350)` (bornée)
- **buts totaux** attendus : `TG = 2.5 + 0.35 · |sup|` (croît avec le déséquilibre)
- `λ_dom = (TG + sup)/2`, `λ_ext = (TG - sup)/2`

Puis on suppose deux lois de **Poisson indépendantes** pour obtenir la matrice des scores,
le score le plus probable et les probabilités Victoire / Nul / Défaite.

Les paramètres sont dans `model_pronos.py` — modifiez-les et réexécutez pour explorer la sensibilité.""")

co("""# Exemple : matrice des scores d'un match
elo = dict(zip(ratings.equipe, ratings.elo))
dom, ext = "France", "Sénégal"
lam_d, lam_e = mp.lambdas(elo[dom], elo[ext], dom, ext)
M = mp.matrice_scores(lam_d, lam_e, n=6)

fig, ax = plt.subplots(figsize=(6, 5))
im = ax.imshow(M, cmap="viridis", origin="lower")
for i in range(7):
    for j in range(7):
        ax.text(j, i, f"{M[i,j]*100:.0f}", ha="center", va="center",
                color="white" if M[i,j] < M.max()*0.6 else "black", fontsize=7)
ax.set_xlabel(f"Buts {ext}"); ax.set_ylabel(f"Buts {dom}")
ax.set_title(f"{dom} vs {ext} — P(score) en %  (λ {lam_d:.2f}-{lam_e:.2f})")
plt.colorbar(im, label="probabilité"); plt.tight_layout(); plt.show()
print(mp.pronostic(elo[dom], elo[ext], dom, ext))""")

md("""## 3. Validation : le modèle face aux résultats réels de la J1

Le modèle « avant-match » (qui ne connaît que l'Elo) a-t-il bien anticipé la J1 déjà jouée ?
On compare le **baseline Poisson** aux **scores réels** (groupes A–H).""")

co("""base = pd.read_csv("data/predictions_baseline.csv")
joues = fixtures[fixtures.statut == "joue"].copy()
bcols = ["groupe", "journee", "equipe_dom", "equipe_ext",
         "score_modele", "buts_dom_modele", "buts_ext_modele"]
val = joues.merge(base[bcols], on=["groupe", "journee", "equipe_dom", "equipe_ext"])
def issue(a, b):
    return "V" if a > b else ("D" if a < b else "N")
rows = []
for _, r in val.iterrows():
    ra, rb = map(int, str(r.score_reel).split("-"))
    rows.append({
        "match": f"{r.equipe_dom}-{r.equipe_ext}", "réel": r.score_reel,
        "modèle": r.score_modele,
        "issue_ok": issue(ra, rb) == issue(r.buts_dom_modele, r.buts_ext_modele),
    })
vdf = pd.DataFrame(rows)
taux = vdf.issue_ok.mean()
print(f"Issue (V/N/D) correctement prédite par le modèle : {vdf.issue_ok.sum()}/{len(vdf)} = {taux:.0%}")
vdf""")

md("""La J1 a livré plusieurs **surprises** (Espagne 0-0 Cap-Vert, Belgique 1-1 Égypte,
Iran 2-2 Nouvelle-Zélande…) que le modèle Elo pur ne pouvait pas anticiper — d'où l'intérêt
de la couche d'experts. C'est le rappel classique que le football reste imprévisible à court terme.""")

md("## 4. Pronostics finaux des 72 matchs")

co("""def fmt(r):
    tag = "✅ réel" if r.statut == "joue" else "🔮 prono"
    return f"J{r.journee}  {r.equipe_dom} {r.buts_dom}-{r.buts_ext} {r.equipe_ext}   [{tag}]  P(V/N/D)={r.p_victoire_dom:.2f}/{r.p_nul:.2f}/{r.p_victoire_ext:.2f}"
for g in sorted(predictions.groupe.unique()):
    print(f"=== Groupe {g} ===")
    for _, r in predictions[predictions.groupe == g].iterrows():
        print("  " + fmt(r))
    print()""")

md("## 5. Classements de groupe (départages FIFA)")

co("""classements = S.tous_classements(predictions)
for g in sorted(classements):
    print(f"=== Groupe {g} ===")
    print(classements[g].to_string())
    print()""")

md("""## 6. Qualifiés pour les 1/16 de finale

Format 2026 : **32 qualifiés** = 12 premiers + 12 deuxièmes + **8 meilleurs troisièmes**.""")

co("""premiers, deuxiemes, meilleurs3, df3 = S.qualifies(classements)
print("MEILLEURS 3es (classés) — les 8 premiers sont qualifiés :")
df3_aff = df3.copy(); df3_aff["qualifié"] = ["✅"]*8 + ["❌"]*(len(df3)-8)
print(df3_aff.to_string(index=False))""")

co("""tab = pd.DataFrame({
    "1ers (groupe gagné)": [f"{g}: {e}" for g, e in premiers],
    "2es": [f"{g}: {e}" for g, e in deuxiemes],
})
m3 = meilleurs3.reset_index(drop=True)
tab["meilleurs 3es"] = [f"{r.groupe}: {r.equipe}" for _, r in m3.iterrows()] + [""]*(12-len(m3))
tab.index = [f"#{i+1}" for i in range(12)]
print("LES 32 QUALIFIÉS"); tab""")

co("""# Visualisation : points finaux, 1ers / 2es / 3es qualifiés / éliminés
q1 = {e for _, e in premiers}; q2 = {e for _, e in deuxiemes}
q3 = set(meilleurs3.equipe)
def statut(eq):
    if eq in q1: return ("1er", "#1a9850")
    if eq in q2: return ("2e", "#91cf60")
    if eq in q3: return ("3e qualifié", "#fee08b")
    return ("éliminé", "#d73027")
allt = pd.concat(classements.values())
allt = allt.sort_values("pts")
labels, vals, cols = [], [], []
for _, r in allt.iterrows():
    s, c = statut(r.equipe); labels.append(r.equipe); vals.append(r.pts); cols.append(c)
fig, ax = plt.subplots(figsize=(10, 11))
ax.barh(range(len(labels)), vals, color=cols)
ax.set_yticks(range(len(labels))); ax.set_yticklabels(labels, fontsize=7)
ax.set_xlabel("Points pronostiqués"); ax.set_title("Points finaux et qualification (vert=1er/2e, jaune=3e qualifié, rouge=éliminé)")
plt.tight_layout(); plt.show()""")

md("""## 7. Pour aller plus loin

- Modifiez un Elo dans `data/team_ratings.csv` ou un paramètre dans `model_pronos.py`,
  réexécutez `build_predictions.py` puis ce notebook pour voir l'impact.
- Le départage des **meilleurs 3es** est extrêmement serré (plusieurs équipes à 4 pts) :
  un seul but change un qualifié. C'est le principal facteur d'incertitude des pronostics.
- Hors périmètre ici : la phase à élimination directe (1/16 et au-delà).""")

nb = new_notebook(cells=cells)
nb.metadata = {"kernelspec": {"name": "python3", "display_name": "Python 3", "language": "python"},
               "language_info": {"name": "python"}}
nbf.write(nb, "notebooks/analyse_pronos.ipynb")
print("Notebook écrit : notebooks/analyse_pronos.ipynb")
