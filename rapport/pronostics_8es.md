# 🏆 Pronostics — 8es de finale, Coupe du Monde 2026

> 16es de finale **terminés** (16 matchs joués, dont 3 décidés aux tirs au but).
> 16 équipes qualifiées. Modèle **ré-évalué après les 16es** : les Elo post-poule
> sont mis à jour match par match sur les 16 rencontres du tour précédent (dynamique
> + résultat réel, y compris les qualifications aux t.a.b.), puis réinjectés dans le
> moteur Poisson, avec résolution du nul (prolongation / t.a.b.).

## 🔬 Comment la dynamique des 16es est intégrée

Chaque équipe arrive en 8e avec un **Elo post-16es** = Elo post-poule corrigé par
son résultat du tour précédent (système *World Football Elo* : K = 60, multiplicateur
d'écart de buts). Un nul suivi d'une qualification aux tirs au but compte comme un
match nul pour l'Elo (le score retenu est celui de la fin du temps réglementaire /
prolongation, pas la séance de t.a.b.) : la Suisse ou le Mexique, qui ont validé leur
qualification avec des victoires nettes, gagnent gros ; l'Algérie ou l'Équateur,
sortis sur des défaites, reculent.

**Nouveau : l'Elo n'est plus le seul indicateur.** Deux équipes à Elo quasi identique
peuvent avoir un profil très différent (attaque prolifique vs défense hermétique) que
le seul delta Elo ne capture pas toujours assez vite. Le modèle ajoute donc deux
**indices de forme réelle**, calculés sur les buts effectivement marqués/encaissés en
tournoi (poule + 16es) et normalisés par la moyenne du tournoi (indice 1,0 = dans la
moyenne) : un indice **d'attaque** et un indice **de solidité défensive** (plus il est
bas, moins l'équipe encaisse). Ils viennent moduler les buts attendus (λ) du moteur
Poisson en plus de l'écart d'Elo, avec un poids borné pour que l'Elo reste le signal
dominant. Exemple frappant : le Mexique et l'Espagne affichent le même indice défensif
record (**0,35**, soit ~35 % de la moyenne du tournoi) après 4 matchs à 0 but encaissé —
un signal que l'Elo seul, plus lent à réagir, ne reflétait pas encore pleinement.

| 📈 Plus fortes hausses Elo (16es) | Δ Elo | | 📉 Plus fortes baisses Elo (16es) | Δ Elo |
|---|---|---|---|---|
| **Suisse** (victoire nette sur l'Algérie) | **+34** | | **Algérie** (sortie, défense friable) | −34 |
| **Mexique** (2-0 à l'Équateur, hôte impérial) | **+32** | | Équateur (sorti, 3e défaite) | −32 |
| **Belgique** (renversant, 3-2 sur le Sénégal) | +30 | | Sénégal (sorti, mène puis craque) | −30 |
| Portugal (victoire sur la Croatie) | +26 | | Croatie (sortie, Modrić stoppé) | −26 |
| Norvège (victoire sur la Côte d'Ivoire) | +25 | | Côte d'Ivoire (sortie) | −25 |
| Brésil (victoire sur le Japon) | +23 | | Japon (sorti, bloc percé) | −23 |

> ⚠️ Un pronostic n'est pas une certitude. En K.-O., un match nul à la 90e se
> joue aux prolongations puis aux tirs au but (quasi pile-ou-face) : les
> probabilités de **qualification** ci-dessous intègrent ce facteur.

---

## 📅 Les 8 affiches (ordre chronologique)

Légende : `(n)` = place dans le groupe · *Elo pré→post (Δ)* · parcours cumulé
poule + 16es `Pts BP:BC [V/N/D]` · **att/déf** = indices de forme réelle (1,0 =
moyenne du tournoi) · **modèle** = proba sur 90 min + score le plus probable ·
**Qualif** = proba de passer le tour · *MPP* = probabilités implicites des cotes
du marché.

### 1 — 🇨🇦 Canada (2) vs Maroc (2) 🇲🇦 · 4 juillet, 17h UTC
*Elo 1728→1743 (+15) · 1924→1931 (+7)* — Canada `7pts 9:3 [NVDV]` att 1,61/déf 0,49 · Maroc `8pts 7:4 [NVVN]` att 1,26/déf 0,65
**Modèle** : Canada 28 % / nul 27 % / Maroc **45 %** — score probable **1-1** · **Qualif : Maroc 60 %** · *MPP 24/28/48*

Le Canada a validé son billet en battant l'Afrique du Sud (1-0) et son indice
défensif (0,49, deux fois moins d'encaissés que la moyenne) tempère l'écart avec
le Maroc. Les Lions de l'Atlas sont sortis des 16es sur un scénario à suspense
(1-1 face aux Pays-Bas, qualifiés aux tirs au but) mais restent invaincus et
possèdent le collectif le plus huilé du bas de tableau, avec une attaque (1,26)
et une défense (0,65) toutes deux au-dessus de la moyenne. Le modèle les voit
repartir devant, sans certitude absolue. **Légère préférence Maroc, prolongations
possibles.**

### 2 — 🇵🇾 Paraguay (3) vs France (1) 🇫🇷 · 4 juillet, 21h UTC
*Elo 1755→1768 (+13) · 2116→2129 (+14)* — Paraguay `5pts 3:5 [DVNN]` att 0,54/déf 0,81 · France `12pts 13:2 [VVVV]` att 2,33/déf 0,35
**Modèle** : Paraguay 1 % / nul 4 % / France **96 %** — score probable **0-3** · **Qualif : France 97 %** · *MPP 11/13/76*

Le Paraguay n'a passé les 16es qu'aux tirs au but face à l'Allemagne (1-1 a.p.) et
reste la nation la moins prolifique encore en lice (indice d'attaque 0,54, environ
moitié moins que la moyenne). En face, la France cumule **la meilleure attaque
(2,33) et l'une des meilleures défenses (0,35)** du tournoi après son sans-faute
total (4/4, 13 buts marqués, 2 encaissés). L'écart est désormais écrasant sur les
deux indicateurs. **France sans discussion.**

### 3 — 🇧🇷 Brésil (1) vs Norvège (2) 🇳🇴 · 5 juillet, 20h UTC
*Elo 2010→2033 (+23) · 1865→1889 (+25)* — Brésil `10pts 9:2 [NVVV]` att 1,61/déf 0,35 · Norvège `9pts 10:8 [VVDV]` att 1,79/déf 1,3
**Modèle** : Brésil **80 %** / nul 12 % / Norvège 6 % — score probable **2-0** · **Qualif : Brésil 87 %** · *MPP 46/28/25*

Le Brésil a passé son tour sans trembler (2-1 au Japon) et conjugue attaque
solide (1,61) et **la meilleure défense encore en lice avec la France (0,35)**.
La Norvège de Haaland–Ødegaard a livré un 16e nerveux (2-1 sur la Côte d'Ivoire) ;
son attaque est même supérieure à celle du Brésil (1,79) mais sa défense est **la
plus friable des équipes encore qualifiées (indice 1,3, 30 % au-dessus de la
moyenne)** — un profil qui peut faire très mal face à une attaque brésilienne
retrouvée. Le modèle installe la Seleção largement favorite. **Brésil, en net
contrôle.**

### 4 — 🇲🇽 Mexique (1) vs Angleterre (1) 🏴 · 6 juillet, 0h UTC
*Elo 1860→1891 (+32) · 2057→2065 (+8)* — Mexique `12pts 8:0 [VVVV]` att 1,43/déf 0,35 · Angleterre `10pts 8:3 [VNVV]` att 1,43/déf 0,49
**Modèle** : Mexique 29 % / nul 28 % / Angleterre **42 %** — score probable **0-1** — **Qualif : Angleterre 58 %** · *MPP 32/31/36*

Le pays hôte reste sur un parcours parfait et une défense hermétique : **4
victoires, 0 but encaissé**, un indice défensif record (0,35, à égalité avec
l'Espagne) que l'Elo seul ne traduisait pas encore complètement (+32 seulement).
L'Angleterre affiche exactement la même intensité offensive (1,43) mais une
défense un cran moins solide (0,49) et conserve l'écart de classe Elo le plus
large de l'affiche. Les deux indicateurs (Elo et forme) convergent désormais vers
un match très serré, où l'Angleterre ne l'emporte que d'une courte tête sur le
modèle. **Angleterre légèrement favorite, match fermé et à haut risque de
prolongations.**

### 5 — 🇵🇹 Portugal (2) vs Espagne (1) 🇪🇸 · 6 juillet, 19h UTC
*Elo 1975→2001 (+26) · 2159→2170 (+12)* — Portugal `8pts 8:2 [NVNV]` att 1,43/déf 0,35 · Espagne `10pts 8:0 [NVVV]` att 1,43/déf 0,35
**Modèle** : Portugal 11 % / nul 21 % / Espagne **69 %** — score probable **0-1** · **Qualif : Espagne 81 %** · *MPP 26/28/46*

Fait rare : les deux équipes affichent **exactement les mêmes indices de forme**
(attaque 1,43, défense 0,35 — le meilleur du tournoi à égalité avec le Mexique).
Le duel se joue donc presque intégralement sur l'Elo, où l'Espagne conserve la
marge la plus large de tout le tableau restant (+169). Le modèle penche
nettement pour la Roja, sans la certitude qu'affichait l'Elo seul (le pronostic
recule légèrement une fois la forme intégrée). **Espagne, en toute logique.**

### 6 — 🇺🇸 États-Unis (1) vs Belgique (1) 🇧🇪 · 7 juillet, 0h UTC
*Elo 1817→1836 (+19) · 1843→1873 (+30)* — États-Unis `9pts 10:4 [VVDV]` att 1,79/déf 0,65 · Belgique `8pts 9:4 [NNVV]` att 1,61/déf 0,65
**Modèle** : États-Unis **61 %** / nul 21 % / Belgique 18 % — score probable **1-0** · **Qualif : USA 72 %** · *MPP 36/29/34*

Les États-Unis, co-hôtes, ont validé leur 16e sans trembler (2-0 sur la Bosnie) et
gardent l'attaque la plus prolifique des deux (1,79). La Belgique a dû revenir de
loin pour l'emporter 3-2 face au Sénégal — même indice défensif que les USA
(0,65) mais une intensité offensive un cran en dessous (1,61). Avantage terrain,
Elo et forme convergent vers un avantage américain, sans marge de sécurité
confortable. **États-Unis, courte tête.**

### 7 — 🇦🇷 Argentine (1) vs Égypte (2) 🇪🇬 · 7 juillet, 16h UTC
*Elo 2142→2145 (+3) · 1707→1710 (+3)* — Argentine `12pts 11:3 [VVVV]` att 1,97/déf 0,49 · Égypte `6pts 6:4 [NVNN]` att 1,08/déf 0,65
**Modèle** : Argentine **94 %** / nul 4 % / Égypte 0 % — score probable **3-0** · **Qualif : Argentine 97 %** · *MPP 64/20/16*

La championne du monde en titre a rendu sa copie parfaite (4 victoires sur 4) et
possède **la meilleure attaque encore en lice avec la France (1,97)**. L'Égypte
de Salah n'a validé sa place qu'aux tirs au but face à l'Australie (1-1 a.p.) et
reste dans la moyenne basse offensivement (1,08) — la nation la moins prolifique
du top 8 après le Paraguay. Le fossé Elo (+435) est le plus large du tableau et
les indices de forme confirment l'écart. **Argentine, sans débat possible.**

### 8 — 🇨🇭 Suisse (1) vs Colombie (1) 🇨🇴 · 7 juillet, 20h UTC
*Elo 1873→1906 (+34) · 2013→2023 (+10)* — Suisse `10pts 9:3 [NVVV]` att 1,61/déf 0,49 · Colombie `10pts 5:1 [VVNV]` att 0,9/déf 0,35
**Modèle** : Suisse 17 % / nul 25 % / Colombie **58 %** — score probable **0-1** · **Qualif : Colombie 72 %** · *MPP 30/30/40*

La Suisse est la nation qui progresse le plus après ce tour (+34 d'Elo, 2-0 net
sur l'Algérie) et affiche une attaque nettement supérieure à celle de la
Colombie (1,61 contre 0,9, la plus faible du top 8 hors Paraguay). Mais les
Cafeteros de James Rodríguez ont **la meilleure défense encore en lice avec
l'Espagne et le Mexique (0,35)**, un but encaissé en 4 matchs. Le modèle garde
donc la Colombie favorite malgré la dynamique suisse, la solidité défensive
pesant plus lourd que le regain offensif dans le calcul. **Colombie, mais la
Nati peut créer la surprise.**

---

## 🎯 Synthèse des pronostics

| # | Affiche | Pronostic qualifié | Confiance | Score probable |
|---|---|---|:--:|:--:|
| 1 | Canada – Maroc | **Maroc** | 60 % | 1-1 (a.p.) |
| 2 | Paraguay – France | **France** | 97 % | 0-3 |
| 3 | Brésil – Norvège | **Brésil** | 87 % | 2-0 |
| 4 | Mexique – Angleterre | **Angleterre** | 58 % | 0-1 (a.p.) |
| 5 | Portugal – Espagne | **Espagne** | 81 % | 0-1 |
| 6 | États-Unis – Belgique | **États-Unis** | 72 % | 1-0 |
| 7 | Argentine – Égypte | **Argentine** | 97 % | 3-0 |
| 8 | Suisse – Colombie | **Colombie** | 72 % | 0-1 |

**2 affiches vraiment ouvertes** (Canada–Maroc, Mexique–Angleterre, toutes deux
proches de 50/50 avec un scénario à prolongations plausible) ; le reste suit la
hiérarchie Elo + forme post-16es, la plus nette étant Argentine–Égypte (97 %).

### ⚠️ Divergences avec mes pronos déjà saisis sur mpp.football

D'après `data/mpp_export.json`, 6 des 8 matchs ont déjà un prono enregistré (le
dernier avant deadline reste modifiable) :

| Affiche | Mon prono saisi | Recommandation du modèle | Écart |
|---|:--:|:--:|---|
| Brésil – Norvège | 2-2 (nul) | **Brésil** 87 % | Le modèle donne le Brésil largement favori (meilleure défense du tournoi vs pire défense encore qualifiée en face) ; un nul semble sous-estimer l'écart. |
| Mexique – Angleterre | 3-2 (Mexique) | **Angleterre** 58 % | Match très serré au modèle (0-1) ; l'Angleterre garde l'avantage Elo mais le Mexique a la meilleure défense du tournoi — écart mince, à surveiller. |
| États-Unis – Belgique | 1-1 (nul) | **États-Unis** 72 % | Le modèle voit les USA nettement devant (attaque plus prolifique, avantage terrain). |

Les 3 autres pronos déjà saisis (Canada–Maroc, Paraguay–France, Portugal–Espagne)
sont **alignés** avec le modèle. Argentine–Égypte et Suisse–Colombie n'ont pas
encore de prono saisi.

> Données : API officielle mpp.football (résultats, cotes, bracket). Modèle : Elo
> post-16es + indices de forme réelle (attaque/défense) → Poisson
> (`scripts_r32/model_ko.py r16`). Détail chiffré dans `data/predictions_r16.csv`
> et `data/elo_post_r32.csv`.
