# 🏆 Pronostics — Finale, Coupe du Monde 2026

> Demi-finales **terminées** (2 matchs joués). Espagne et Argentine qualifiées
> pour la finale ; France et Angleterre disputent le match pour la 3e place.
> Modèle **ré-évalué après les demies** : les Elo post-quarts sont mis à jour
> match par match sur les 2 rencontres du tour précédent (dynamique + résultat
> réel), puis réinjectés dans le moteur Poisson avec les indices de forme
> réelle (attaque/défense).

## 🔬 Comment la dynamique des demies est intégrée

Chaque finaliste arrive avec un **Elo post-demies** = Elo post-quarts corrigé
par son résultat du tour précédent (K = 60, multiplicateur d'écart de buts).
Les deux demies se sont jouées en 90 minutes (aucune n'est allée aux
prolongations). Les indices de forme réelle (buts marqués/encaissés en
tournoi, normalisés par la moyenne) continuent de moduler les λ Poisson en
plus de l'écart d'Elo, avec un poids borné pour que l'Elo reste le signal
dominant.

| 📈 Plus fortes hausses Elo (demies) | Δ Elo | | 📉 Plus fortes baisses Elo (demies) | Δ Elo |
|---|---|---|---|---|
| **Espagne** (2-0 sur la France) | **+40** | | **France** (sortie, large défaite) | −40 |
| **Argentine** (2-1 sur l'Angleterre) | **+24** | | **Angleterre** (sortie) | −24 |

> ⚠️ Un pronostic n'est pas une certitude. En finale, un match nul à la 90e se
> joue aux prolongations puis aux tirs au but (quasi pile-ou-face) : les
> probabilités de **victoire** ci-dessous intègrent ce facteur.

---

## 📅 L'affiche

Légende : *Elo pré→post (Δ)* · parcours cumulé poule + 16es + 8es + quarts +
demies `Pts BP:BC [V/N/D]` · **att/déf** = indices de forme réelle (1,0 =
moyenne du tournoi) · **modèle** = proba sur 90 min + score le plus probable ·
**Victoire** = proba de remporter le titre · *MPP* = probabilités implicites
des cotes du marché (quand disponibles).

### 🇪🇸 Espagne (1) vs Argentine (1) 🇦🇷 · 19 juillet, 19h UTC

*Elo 2198→2238 (+40) · 2168→2193 (+24)* — Espagne `19pts 13:1 [NVVVVVV]` att
1,41/déf 0,35 · Argentine `21pts 19:7 [VVVVVVV]` att 2,06/déf 0,62

**Modèle** : Espagne **49 %** / nul 26 % / Argentine 25 % — score probable
**1-0** · **Victoire : Espagne 63 %** · *MPP : cotes pas encore publiées sur
mpp.football*

L'Espagne reste la meilleure défense du tournoi (0,35, un seul but encaissé en
sept matchs) et vient de confirmer sa dynamique en éliminant la France
(2-0). Son Elo post-demies (2238) devient le plus élevé du tableau, porté par
+40 points sur ce tour. L'Argentine affiche un parcours parfait depuis le
début (21 points sur 21, seule équipe increvable du tournoi) et la meilleure
attaque encore en lice (2,06), après avoir dû batailler pour écarter
l'Angleterre (2-1, +24). L'écart d'Elo reste modeste (45 points en faveur de
l'Espagne) mais penche clairement du côté ibérique, la défense hermétique
espagnole contrebalançant l'attaque prolifique argentine. Le marché MPP n'a
pas encore publié de cotes pour cette affiche. **Espagne favorite, finale
plus serrée que l'écart de probabilité ne le suggère face à l'attaque la plus
en forme du tournoi.**

---

## 🎯 Synthèse du pronostic

| Affiche | Pronostic vainqueur | Confiance | Score probable |
|---|---|:--:|:--:|
| Espagne – Argentine | **Espagne** | 63 % | 1-0 |

---

## ⚠️ Divergences avec mes pronos déjà saisis sur mpp.football

D'après `data/mpp_export.json`, **aucun prono n'est encore enregistré** sur
mpp.football pour cette finale (les cotes ne sont pas encore publiées côté
marché, le match n'est pronostiquable que plus près de la deadline). Rien à
ajuster pour l'instant — à saisir avant la deadline du 19 juillet, 19h UTC, en
gardant à l'esprit la légère préférence du modèle pour l'Espagne (63/37 en
probabilité de victoire, score le plus probable 1-0).

> Données : API officielle mpp.football (bracket, cotes quand disponibles).
> Modèle : Elo post-demies + indices de forme réelle (attaque/défense) →
> Poisson (`scripts_r32/model_ko.py r2`). Détail chiffré dans
> `data/predictions_r2.csv` et `data/elo_post_r4.csv`.
