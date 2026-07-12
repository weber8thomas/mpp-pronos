# 🏆 Pronostics — Demi-finales, Coupe du Monde 2026

> Quarts de finale **terminés** (4 matchs joués). 4 équipes qualifiées.
> Modèle **ré-évalué après les quarts** : les Elo post-8es sont mis à jour
> match par match sur les 4 rencontres du tour précédent (dynamique +
> résultat réel), puis réinjectés dans le moteur Poisson avec les indices de
> forme réelle (attaque/défense).

## 🔬 Comment la dynamique des quarts est intégrée

Chaque équipe arrive en demie avec un **Elo post-quarts** = Elo post-8es
corrigé par son résultat du tour précédent (K = 60, multiplicateur d'écart de
buts). Les deux quarts décidés après prolongation (Norvège–Angleterre 1-2 a.p.
et Argentine–Suisse 3-1 a.p.) comptent avec le score de fin de prolongation
pour l'Elo. Les indices de forme réelle (buts marqués/encaissés en tournoi,
normalisés par la moyenne) continuent de moduler les λ Poisson en plus de
l'écart d'Elo, avec un poids borné pour que l'Elo reste le signal dominant.

| 📈 Plus fortes hausses Elo (quarts) | Δ Elo | | 📉 Plus fortes baisses Elo (quarts) | Δ Elo |
|---|---|---|---|---|
| **France** (large 2-0 sur le Maroc) | **+25** | | **Maroc** (sorti, large défaite) | −25 |
| **Argentine** (3-1 a.p. face à la Suisse) | **+19** | | **Suisse** (sortie aux prolongations) | −19 |
| Angleterre (2-1 a.p. face à la Norvège) | +17 | | Norvège (sortie aux prolongations) | −17 |
| Espagne (2-1 sur la Belgique) | +11 | | Belgique (sortie) | −11 |

> ⚠️ Un pronostic n'est pas une certitude. En K.-O., un match nul à la 90e se
> joue aux prolongations puis aux tirs au but (quasi pile-ou-face) : les
> probabilités de **qualification** ci-dessous intègrent ce facteur.

---

## 📅 Les 2 affiches (ordre chronologique)

Légende : *Elo pré→post (Δ)* · parcours cumulé poule + 16es + 8es + quarts
`Pts BP:BC [V/N/D]` · **att/déf** = indices de forme réelle (1,0 = moyenne du
tournoi) · **modèle** = proba sur 90 min + score le plus probable · **Qualif**
= proba de passer le tour · *MPP* = probabilités implicites des cotes du
marché (quand disponibles).

### 1 — 🇫🇷 France (1) vs Espagne (1) 🇪🇸 · 14 juillet, 19h UTC
*Elo 2136→2161 (+25) · 2187→2198 (+11)* — France `18pts 16:2 [VVVVVV]` att 2,01/déf 0,35 · Espagne `16pts 11:1 [NVVVVV]` att 1,38/déf 0,35
**Modèle** : France 31 % / nul 29 % / Espagne **41 %** — score probable **1-1** · **Qualif : Espagne 56 %** · *MPP 40/30/30 (France légèrement favorite au marché)*

Les deux meilleures défenses du tournoi se retrouvent (0,35 chacune, aucun but
encaissé en 90 minutes hors la France cette phase) et un choc quasi équilibré
en termes d'Elo (écart de 37 points seulement). La France affiche toujours la
meilleure attaque du tableau (2,01) et un sans-faute total (18 points sur 18),
mais l'Espagne, elle aussi invaincue jusqu'ici (un seul nul), progresse mieux
sur ce tour (+11 contre une base Elo déjà supérieure de +51 avant le
tournoi). Le modèle penche très légèrement pour l'Espagne côté qualification
(56 % contre 44 %), tandis que le marché MPP fait l'inverse et voit la France
un peu favorite (40 % contre 30 % pour l'Espagne). **Match le plus indécis du
tour, France et Espagne quasiment à égalité — MPP et modèle en désaccord.**

### 2 — 🏴 Angleterre (1) vs Argentine (1) 🇦🇷 · 15 juillet, 19h UTC
*Elo 2086→2103 (+17) · 2149→2168 (+19)* — Angleterre `16pts 13:6 [VNVVVV]` att 1,63/déf 0,62 · Argentine `18pts 17:6 [VVVVVV]` att 2,13/déf 0,62
**Modèle** : Angleterre 21 % / nul 22 % / Argentine **56 %** — score probable **1-1** · **Qualif : Argentine 68 %** · *MPP : cotes pas encore publiées sur mpp.football*

L'Argentine reste sur un parcours parfait (18 points sur 18) et possède la
meilleure attaque encore en lice (2,13), en net progrès après sa qualification
mouvementée aux dépens de la Suisse (+19 d'Elo, prolongations et un carton
rouge adverse). L'Angleterre a également validé son billet aux prolongations
face à la Norvège (+17) mais affiche une attaque plus modeste (1,63) pour une
défense comparable (0,62 contre 0,62). L'écart d'Elo (+65 en faveur de
l'Argentine) et la dynamique de forme confortent l'Albiceleste en net
favori. Les cotes du marché MPP ne sont pas encore publiées pour ce match.
**Argentine large favorite.**

---

## 🎯 Synthèse des pronostics

| # | Affiche | Pronostic qualifié | Confiance | Score probable |
|---|---|---|:--:|:--:|
| 1 | France – Espagne | **Espagne** | 56 % | 1-1 |
| 2 | Angleterre – Argentine | **Argentine** | 68 % | 1-1 |

France–Espagne est de loin le match le plus serré du tournoi côté modèle
(56/44) — à surveiller de près, d'autant que le marché MPP penche dans l'autre
sens (France légèrement favorite). Angleterre–Argentine est plus tranché,
l'Albiceleste nettement devant.

### ⚠️ Divergences avec mes pronos déjà saisis sur mpp.football

D'après `data/mpp_export.json`, **aucun des 2 matchs n'a encore de prono
enregistré** sur mpp.football — les deux échéances (14 et 15 juillet) restent
ouvertes. Rien à ajuster pour l'instant ; à saisir avant les deadlines
respectives, en gardant à l'esprit le match nul quasi parfait du modèle sur
France–Espagne (le marché MPP penchant du côté français).

> Données : API officielle mpp.football (résultats, bracket, cotes quand
> disponibles). Modèle : Elo post-quarts + indices de forme réelle
> (attaque/défense) → Poisson (`scripts_r32/model_ko.py r4`). Détail chiffré
> dans `data/predictions_r4.csv` et `data/elo_post_r8.csv`.
