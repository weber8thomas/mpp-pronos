# 🏆 Pronostics — Quarts de finale, Coupe du Monde 2026

> 8es de finale **terminés** (8 matchs joués, dont 1 décidé aux tirs au but :
> Suisse–Colombie 0-0 a.p., 4-3 t.a.b.). 8 équipes qualifiées. Modèle
> **ré-évalué après les 8es** : les Elo post-16es sont mis à jour match par
> match sur les 8 rencontres du tour précédent (dynamique + résultat réel, y
> compris la qualification aux t.a.b.), puis réinjectés dans le moteur
> Poisson avec les indices de forme réelle (attaque/défense).

## 🔬 Comment la dynamique des 8es est intégrée

Chaque équipe arrive en quart avec un **Elo post-8es** = Elo post-16es corrigé
par son résultat du tour précédent (K = 60, multiplicateur d'écart de buts).
Le nul de la Suisse contre la Colombie (0-0 a.p., qualifiée aux tirs au but)
compte comme un match nul pour l'Elo — c'est le score de fin de temps
réglementaire/prolongation qui est retenu, jamais la séance de t.a.b. Les
indices de forme réelle (buts marqués/encaissés en tournoi, normalisés par la
moyenne) continuent de moduler les λ Poisson en plus de l'écart d'Elo, avec un
poids borné pour que l'Elo reste le signal dominant.

| 📈 Plus fortes hausses Elo (8es) | Δ Elo | | 📉 Plus fortes baisses Elo (8es) | Δ Elo |
|---|---|---|---|---|
| **Belgique** (renversant, qualifiée 4-1 face aux USA) | **+57** | | **États-Unis** (sortis, lourde défaite) | −57 |
| **Norvège** (qualifiée 2-1 face au Brésil) | **+42** | | **Brésil** (sorti, défaite 1-2 contre la Norvège) | −42 |
| Maroc (qualifié 3-0 sur le Canada) | +35 | | Canada (sorti, lourde défaite) | −35 |
| Angleterre (qualifiée 3-2 sur le Mexique) | +21 | | Mexique (sorti sur le fil) | −21 |
| Espagne (qualifiée 1-0 sur le Portugal) | +16 | | Portugal (sorti) | −16 |
| Suisse (qualifiée aux t.a.b. face à la Colombie) | +10 | | Colombie (sortie aux t.a.b.) | −10 |

> ⚠️ Un pronostic n'est pas une certitude. En K.-O., un match nul à la 90e se
> joue aux prolongations puis aux tirs au but (quasi pile-ou-face) : les
> probabilités de **qualification** ci-dessous intègrent ce facteur.

---

## 📅 Les 4 affiches (ordre chronologique)

Légende : `(n)` = place dans le groupe · *Elo pré→post (Δ)* · parcours cumulé
poule + 16es + 8es `Pts BP:BC [V/N/D]` · **att/déf** = indices de forme réelle
(1,0 = moyenne du tournoi) · **modèle** = proba sur 90 min + score le plus
probable · **Qualif** = proba de passer le tour · *MPP* = probabilités
implicites des cotes du marché (quand disponibles).

### 1 — 🇫🇷 France (1) vs Maroc (2) 🇲🇦 · 9 juillet, 20h UTC
*Elo 2129→2136 (+7) · 1931→1966 (+35)* — France `15pts 14:2 [VVVVV]` att 2,07/déf 0,35 · Maroc `11pts 10:4 [NVVNV]` att 1,48/déf 0,51
**Modèle** : France **77 %** / nul 15 % / Maroc 7 % — score probable **2-0** · **Qualif : France 86 %** · *MPP 56/23/20*

La France reste la meilleure attaque du tournoi (2,07) avec la défense la plus
hermétique encore en lice (0,35), un profil de champion sans faille sur 5
matchs (15 points sur 15 possibles). Le Maroc a validé son billet en dominant
le Canada (3-0) et progresse fort (+35 d'Elo, meilleure hausse du tour), avec
une attaque au-dessus de la moyenne (1,48). L'écart de classe et de forme
reste toutefois très large. **France largement favorite.**

### 2 — 🇪🇸 Espagne (1) vs Belgique (1) 🇧🇪 · 10 juillet, 19h UTC
*Elo 2170→2187 (+16) · 1873→1930 (+57)* — Espagne `13pts 9:0 [NVVVV]` att 1,33/déf 0,35 · Belgique `11pts 13:5 [NNVVV]` att 1,92/déf 0,63
**Modèle** : Espagne **83 %** / nul 12 % / Belgique 4 % — score probable **2-0** · **Qualif : Espagne 91 %** · *MPP 52/25/21*

L'Espagne n'a toujours pas encaissé le moindre but en 5 matchs (déf 0,35,
meilleure défense encore en lice avec la France) et reste sur une série
irréprochable. La Belgique a réalisé le plus gros bond du tour (+57 d'Elo)
après un net succès sur les États-Unis, et affiche même l'attaque la plus
prolifique des deux (1,92) — mais sa défense reste nettement plus friable
(0,63). Le modèle installe l'Espagne largement favorite malgré la dynamique
belge. **Espagne, en net contrôle.**

### 3 — 🇳🇴 Norvège (2) vs Angleterre (1) 🏴 · 11 juillet, 21h UTC
*Elo 1889→1931 (+42) · 2065→2086 (+21)* — Norvège `12pts 12:9 [VVDVV]` att 1,78/déf 1,14 · Angleterre `13pts 11:5 [VNVVV]` att 1,63/déf 0,63
**Modèle** : Norvège 8 % / nul 13 % / Angleterre **77 %** — score probable **0-2** · **Qualif : Angleterre 86 %** · *MPP 27/28/43*

La Norvège de Haaland–Ødegaard reste sur la meilleure progression Elo du tour
(+42) et une attaque solide (1,78), mais conserve la défense la plus friable
des équipes encore qualifiées (indice 1,14, seule au-dessus de la moyenne du
top 8) — un point faible que l'Angleterre, qui cumule un net avantage Elo
(+155) et une défense nettement plus fiable (0,63), est bien placée pour
exploiter. **Angleterre nettement favorite.**

### 4 — 🇦🇷 Argentine (1) vs Suisse (1) 🇨🇭 · 12 juillet, 1h UTC (soit 11 juillet, 21h locale Kansas City)
*Elo 2145→2149 (+5) · 1906→1916 (+10)* — Argentine `15pts 14:5 [VVVVV]` att 2,07/déf 0,63 · Suisse `11pts 9:3 [NVVVN]` att 1,33/déf 0,38
**Modèle** : Argentine **79 %** / nul 14 % / Suisse 6 % — score probable **2-0** · **Qualif : Argentine 88 %** · *MPP : cotes pas encore publiées sur mpp.football (match le plus lointain du tour)*

La championne du monde en titre reste sur un sans-faute total (15 points sur
15) et la meilleure attaque du tournoi ex æquo avec la France (2,07). La
Suisse, qualifiée aux tirs au but face à la Colombie, affiche la meilleure
défense encore en lice (0,38) mais une attaque nettement plus modeste (1,33).
Les cotes du marché MPP ne sont pas encore publiées pour ce match (le plus
éloigné du tour) — probabilités calculées ici uniquement par le modèle Elo +
forme. **Argentine large favorite, cotes MPP à surveiller d'ici le coup
d'envoi.**

---

## 🎯 Synthèse des pronostics

| # | Affiche | Pronostic qualifié | Confiance | Score probable |
|---|---|---|:--:|:--:|
| 1 | France – Maroc | **France** | 86 % | 2-0 |
| 2 | Espagne – Belgique | **Espagne** | 91 % | 2-0 |
| 3 | Norvège – Angleterre | **Angleterre** | 86 % | 0-2 |
| 4 | Argentine – Suisse | **Argentine** | 88 % | 2-0 |

Tour sans match vraiment équilibré au modèle cette fois (toutes les
confiances ≥ 86 %) — la hiérarchie Elo + forme est nette sur les 4 affiches.

### ⚠️ Divergences avec mes pronos déjà saisis sur mpp.football

D'après `data/mpp_export.json`, 2 des 4 matchs ont déjà un prono enregistré
(modifiable jusqu'à la deadline de chaque match) :

| Affiche | Mon prono saisi | Recommandation du modèle | Écart |
|---|:--:|:--:|---|
| Norvège – Angleterre | 2-1 (Norvège) | **Angleterre** 86 % | Écart important : le modèle donne l'Angleterre largement favorite (avantage Elo +155 et défense bien plus solide), à l'opposé du prono Norvège déjà saisi. **À reconsidérer avant le coup d'envoi du 11 juillet, 21h UTC.** |
| France – Maroc | 2-0 (France) | **France** 86 % | Aligné avec le modèle, aucun changement nécessaire. |

Espagne–Belgique et Argentine–Suisse n'ont pas encore de prono saisi.

> Données : API officielle mpp.football (résultats, bracket, cotes quand
> disponibles). Modèle : Elo post-8es + indices de forme réelle
> (attaque/défense) → Poisson (`scripts_r32/model_ko.py r8`). Détail chiffré
> dans `data/predictions_r8.csv` et `data/elo_post_r16.csv`.
