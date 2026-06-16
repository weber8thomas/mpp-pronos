# mpp-pronos — Pronostics Coupe du Monde 2026 (phase de groupes)

Pronostics de scores des **72 matchs de phase de groupes** de la CDM 2026 (48 équipes,
12 groupes), avec classements et qualifiés déduits. Méthodologie **hybride** : un modèle
quantitatif (Poisson sur base Elo) ajusté et challengé par une dizaine d'**agents experts**
(prédicteurs + critiques) s'appuyant sur la forme récente, les effectifs, les blessures et
les compétitions précédentes.

> 📅 Le tournoi a débuté le 11/06/2026. **J1 = résultats réels** (groupes A–H),
> **J2/J3 = pronostics**. Groupes I–L : entièrement pronostiqués (non joués au 16/06/2026).

## 📂 Contenu

| Fichier | Rôle |
|---|---|
| `rapport/pronostics_cdm2026.md` | **Rapport principal** : scores des 72 matchs, classements, 32 qualifiés |
| `notebooks/analyse_pronos.ipynb` | **Notebook explorable** : modèle Poisson, validation J1, classements, visualisations |
| `data/groups.json` | Composition des 12 groupes |
| `data/team_ratings.csv` | Notes de force (Elo, classement FIFA, forme) des 48 équipes + sources |
| `data/fixtures.csv` | Calendrier des 72 matchs (+ résultats réels J1) |
| `data/predictions.csv` | Pronostics finaux : score, probabilités V/N/D, xG du modèle |
| `data/predictions_baseline.csv` | Sortie brute du modèle Poisson (avant ajustement experts) |
| `model_pronos.py` | Modèle de Poisson (Elo → buts attendus → score + probas) |
| `standings.py` | Calcul des classements (départages FIFA) et des qualifiés |
| `build_predictions.py` | Assemble `predictions.csv` (source de vérité des scores finaux) |
| `research/notes_agents.md` | Traçabilité : analyses des agents prédicteurs + synthèse des critiques |

## 🔬 Méthodologie

1. **Modèle quantitatif** (`model_pronos.py`) — pour chaque match, la différence Elo (avec
   avantage hôte pour Mexique/USA/Canada) donne une *supremacy* bornée
   (`3.6·tanh(Δelo/350)`) et un volume de buts croissant avec le déséquilibre, d'où
   `λ_dom`/`λ_ext` et une matrice de scores Poisson → score le plus probable + P(V/N/D).
2. **Agents prédicteurs** (12, un par groupe) — recherche web (forme 2024-2026, effectifs,
   blessures) pour ajuster le baseline.
3. **Agents critiques** (4) — review adverse : réalisme des scores, biais, cohérence interne
   (différences de buts, départages), excès de nuls.
4. **Synthèse** — scores finaux dans `predictions.csv`, classements et qualifiés calculés.

Validation : confronté à la J1 réelle, le modèle Elo pur a anticipé ~38 % des issues — une J1
très nulle et surprenante (8 nuls/16), ce qui justifie la couche experts.

## ▶️ Reproduire / explorer

```bash
pip install numpy pandas scipy matplotlib jupyter nbformat nbconvert

python3 build_predictions.py        # (re)génère data/predictions.csv
python3 standings.py                # affiche classements + qualifiés
jupyter notebook notebooks/analyse_pronos.ipynb   # exploration interactive
```

Pour explorer la sensibilité : modifiez un Elo dans `data/team_ratings.csv` ou un paramètre
de `model_pronos.py`, relancez `build_predictions.py`, puis le notebook.

## ⚠️ Limites

Un pronostic n'est pas une prédiction certaine. La course aux meilleurs 3es se joue à un but
près et plusieurs départages sont des quasi-pile-ou-face. La phase à élimination directe est
hors périmètre.
