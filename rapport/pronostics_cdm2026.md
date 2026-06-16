# 🏆 Pronostics — Phase de groupes, Coupe du Monde 2026

> Pronostics de scores des **72 matchs** de la phase de groupes (48 équipes, 12 groupes), produits par une méthodologie **hybride** : modèle de Poisson basé sur l'Elo, ajusté et critiqué par une dizaine d'agents experts (forme récente, effectifs, blessures, compétitions précédentes).

**Convention** : le tournoi ayant débuté le 11/06/2026, **J1 = résultats réels** (groupes A–H) et **J2/J3 = pronostics**. Les groupes I–L n'avaient pas encore joué au moment de l'analyse (16/06/2026) et sont entièrement pronostiqués.

Données : `data/predictions.csv` · Modèle : `model_pronos.py` · Classements : `standings.py` · Analyse explorable : `notebooks/analyse_pronos.ipynb` · Traçabilité agents : `research/notes_agents.md`


## 📅 Calendrier chronologique des 72 pronostics

Trié par coup d'envoi. Heure en **CEST** (Europe/Paris, UTC+2) — *indicative, à confirmer*. Type : ✅ résultat réel · 🔮 pronostic. `P(V/N/D)` = probabilités victoire / nul / défaite (modèle).

> ℹ️ La colonne **mpp** (`1/N/2`) provient de l'export mpp.football fourni — disponible pour les 56 matchs à venir (les 16 matchs de J1 déjà joués des groupes A–H n'y figurent pas). Comparez `P(V/N/D)` (notre modèle) et `mpp` (cotes/communauté mpp).


| Date (CEST) | Heure | Gr. | Match | Prono | P(V/N/D) | mpp |
|:--|:--:|:--:|:--|:--:|:--:|:--:|
| Jeu 11/06 | 21h00 | A | Mexique – Afrique du Sud | **2-0** ✅ | 0.86/0.10/0.04 | — |
| Ven 12/06 | 04h00 | A | Corée du Sud – Tchéquie | **2-1** ✅ | 0.48/0.25/0.27 | — |
| Ven 12/06 | 21h00 | B | Canada – Bosnie-Herzégovine | **1-1** ✅ | 0.30/0.40/0.30 | — |
| Ven 12/06 | 21h00 | D | États-Unis – Paraguay | **4-1** ✅ | 0.61/0.22/0.17 | — |
| Sam 13/06 | 21h00 | B | Qatar – Suisse | **1-1** ✅ | 0.18/0.40/0.42 | — |
| Dim 14/06 | 00h00 | C | Brésil – Maroc | **1-1** ✅ | 0.40/0.32/0.28 | — |
| Dim 14/06 | 03h00 | D | Australie – Turquie | **2-0** ✅ | 0.19/0.23/0.58 | — |
| Dim 14/06 | 03h00 | C | Haïti – Écosse | **0-1** ✅ | 0.12/0.22/0.66 | — |
| Dim 14/06 | 19h00 | E | Allemagne – Curaçao | **7-1** ✅ | 0.93/0.06/0.01 | — |
| Dim 14/06 | 22h00 | F | Pays-Bas – Japon | **2-2** ✅ | 0.45/0.30/0.25 | — |
| Lun 15/06 | 01h00 | E | Côte d'Ivoire – Équateur | **1-0** ✅ | 0.40/0.30/0.30 | — |
| Lun 15/06 | 04h00 | F | Suède – Tunisie | **5-1** ✅ | 0.59/0.22/0.19 | — |
| Lun 15/06 | 18h00 | H | Espagne – Cap-Vert | **0-0** ✅ | 0.85/0.12/0.03 | — |
| Lun 15/06 | 21h00 | G | Belgique – Égypte | **1-1** ✅ | 0.45/0.30/0.25 | — |
| Mar 16/06 | 00h00 | H | Arabie saoudite – Uruguay | **1-1** ✅ | 0.18/0.30/0.52 | — |
| Mar 16/06 | 03h00 | G | Iran – Nouvelle-Zélande | **2-2** ✅ | 0.55/0.25/0.20 | — |
| Mar 16/06 | 21h00 | I | France – Sénégal | **2-1** 🔮 | 0.58/0.24/0.18 | 0.88/0.09/0.03 |
| Mer 17/06 | 00h00 | I | Irak – Norvège | **0-1** 🔮 | 0.12/0.24/0.64 | 0.02/0.06/0.92 |
| Mer 17/06 | 03h00 | J | Argentine – Algérie | **2-0** 🔮 | 0.72/0.18/0.10 | 0.80/0.14/0.06 |
| Mer 17/06 | 06h00 | J | Autriche – Jordanie | **2-0** 🔮 | 0.64/0.24/0.12 | 0.83/0.14/0.03 |
| Mer 17/06 | 19h00 | K | Portugal – RD Congo | **2-0** 🔮 | 0.66/0.20/0.14 | 0.95/0.04/0.01 |
| Mer 17/06 | 22h00 | L | Angleterre – Croatie | **2-0** 🔮 | 0.68/0.22/0.10 | 0.57/0.35/0.08 |
| Jeu 18/06 | 01h00 | L | Ghana – Panama | **1-1** 🔮 | 0.38/0.32/0.30 | 0.60/0.33/0.07 |
| Jeu 18/06 | 04h00 | K | Ouzbékistan – Colombie | **0-2** 🔮 | 0.12/0.22/0.66 | 0.03/0.07/0.90 |
| Jeu 18/06 | 18h00 | A | Tchéquie – Afrique du Sud | **1-0** 🔮 | 0.58/0.27/0.15 | 0.58/0.27/0.15 |
| Jeu 18/06 | 21h00 | B | Suisse – Bosnie-Herzégovine | **2-0** 🔮 | 0.74/0.16/0.10 | 0.73/0.21/0.06 |
| Ven 19/06 | 00h00 | B | Canada – Qatar | **2-0** 🔮 | 0.78/0.15/0.07 | 0.76/0.17/0.07 |
| Ven 19/06 | 03h00 | A | Mexique – Corée du Sud | **1-1** 🔮 | 0.40/0.30/0.30 | 0.57/0.30/0.13 |
| Ven 19/06 | 21h00 | D | États-Unis – Australie | **2-0** 🔮 | 0.66/0.21/0.13 | 0.70/0.21/0.09 |
| Sam 20/06 | 00h00 | C | Écosse – Maroc | **1-2** 🔮 | 0.18/0.22/0.60 | 0.06/0.19/0.75 |
| Sam 20/06 | 03h00 | C | Brésil – Haïti | **3-0** 🔮 | 0.91/0.07/0.02 | 0.97/0.02/0.01 |
| Sam 20/06 | 06h00 | D | Turquie – Paraguay | **2-1** 🔮 | 0.54/0.25/0.21 | 0.59/0.30/0.11 |
| Sam 20/06 | 19h00 | F | Pays-Bas – Suède | **2-2** 🔮 | 0.35/0.30/0.35 | 0.63/0.28/0.09 |
| Sam 20/06 | 22h00 | E | Allemagne – Côte d'Ivoire | **2-1** 🔮 | 0.60/0.24/0.16 | 0.81/0.13/0.06 |
| Dim 21/06 | 02h00 | E | Équateur – Curaçao | **2-0** 🔮 | 0.78/0.16/0.06 | 0.83/0.13/0.04 |
| Dim 21/06 | 06h00 | F | Tunisie – Japon | **0-2** 🔮 | 0.18/0.27/0.55 | 0.13/0.24/0.63 |
| Dim 21/06 | 18h00 | H | Espagne – Arabie saoudite | **3-0** 🔮 | 0.80/0.14/0.06 | 0.97/0.02/0.01 |
| Dim 21/06 | 21h00 | G | Belgique – Iran | **2-1** 🔮 | 0.55/0.25/0.20 | 0.93/0.05/0.02 |
| Lun 22/06 | 00h00 | H | Uruguay – Cap-Vert | **1-0** 🔮 | 0.58/0.27/0.15 | 0.85/0.11/0.04 |
| Lun 22/06 | 03h00 | G | Nouvelle-Zélande – Égypte | **1-2** 🔮 | 0.18/0.24/0.58 | 0.10/0.20/0.70 |
| Lun 22/06 | 19h00 | J | Argentine – Autriche | **2-1** 🔮 | 0.66/0.21/0.13 | 0.87/0.10/0.03 |
| Lun 22/06 | 23h00 | I | France – Irak | **3-0** 🔮 | 0.86/0.10/0.04 | 0.98/0.01/0.01 |
| Mar 23/06 | 02h00 | I | Norvège – Sénégal | **1-1** 🔮 | 0.32/0.30/0.38 | 0.32/0.42/0.26 |
| Mar 23/06 | 05h00 | J | Jordanie – Algérie | **0-2** 🔮 | 0.14/0.26/0.60 | 0.04/0.13/0.83 |
| Mar 23/06 | 19h00 | K | Portugal – Ouzbékistan | **3-0** 🔮 | 0.78/0.15/0.07 | 0.97/0.02/0.01 |
| Mar 23/06 | 22h00 | L | Angleterre – Ghana | **2-0** 🔮 | 0.78/0.16/0.06 | 0.89/0.08/0.03 |
| Mer 24/06 | 01h00 | L | Panama – Croatie | **1-2** 🔮 | 0.16/0.24/0.60 | 0.03/0.08/0.89 |
| Mer 24/06 | 04h00 | K | Colombie – RD Congo | **2-1** 🔮 | 0.56/0.24/0.20 | 0.71/0.23/0.06 |
| Mer 24/06 | 21h00 | B | Suisse – Canada | **2-1** 🔮 | 0.50/0.27/0.23 | 0.52/0.39/0.09 |
| Mer 24/06 | 21h00 | B | Bosnie-Herzégovine – Qatar | **2-1** 🔮 | 0.50/0.26/0.24 | 0.56/0.32/0.12 |
| Jeu 25/06 | 00h00 | C | Maroc – Haïti | **2-0** 🔮 | 0.85/0.11/0.04 | 0.94/0.04/0.02 |
| Jeu 25/06 | 00h00 | C | Écosse – Brésil | **0-2** 🔮 | 0.06/0.14/0.80 | 0.04/0.08/0.88 |
| Jeu 25/06 | 03h00 | A | Afrique du Sud – Corée du Sud | **0-2** 🔮 | 0.12/0.22/0.66 | 0.14/0.30/0.56 |
| Jeu 25/06 | 03h00 | A | Tchéquie – Mexique | **1-1** 🔮 | 0.24/0.31/0.45 | 0.08/0.38/0.54 |
| Jeu 25/06 | 22h00 | E | Curaçao – Côte d'Ivoire | **0-2** 🔮 | 0.08/0.17/0.75 | 0.03/0.07/0.90 |
| Jeu 25/06 | 22h00 | E | Équateur – Allemagne | **1-1** 🔮 | 0.26/0.38/0.36 | 0.04/0.11/0.85 |
| Ven 26/06 | 01h00 | F | Tunisie – Pays-Bas | **0-2** 🔮 | 0.14/0.26/0.60 | 0.05/0.13/0.82 |
| Ven 26/06 | 01h00 | F | Japon – Suède | **1-2** 🔮 | 0.30/0.26/0.44 | 0.34/0.47/0.20 |
| Ven 26/06 | 04h00 | D | Paraguay – Australie | **1-1** 🔮 | 0.45/0.27/0.28 | 0.50/0.33/0.17 |
| Ven 26/06 | 04h00 | D | Turquie – États-Unis | **1-1** 🔮 | 0.29/0.27/0.44 | 0.30/0.40/0.30 |
| Ven 26/06 | 21h00 | I | Norvège – France | **1-2** 🔮 | 0.22/0.24/0.54 | 0.04/0.17/0.79 |
| Ven 26/06 | 21h00 | I | Sénégal – Irak | **2-0** 🔮 | 0.78/0.15/0.07 | 0.91/0.07/0.02 |
| Sam 27/06 | 02h00 | H | Uruguay – Espagne | **1-2** 🔮 | 0.22/0.26/0.52 | 0.03/0.14/0.83 |
| Sam 27/06 | 02h00 | H | Cap-Vert – Arabie saoudite | **1-1** 🔮 | 0.33/0.34/0.33 | 0.14/0.55/0.31 |
| Sam 27/06 | 05h00 | G | Nouvelle-Zélande – Belgique | **0-2** 🔮 | 0.12/0.20/0.68 | 0.03/0.06/0.91 |
| Sam 27/06 | 05h00 | G | Égypte – Iran | **1-1** 🔮 | 0.38/0.35/0.27 | 0.66/0.28/0.06 |
| Sam 27/06 | 23h00 | L | Panama – Angleterre | **0-2** 🔮 | 0.06/0.14/0.80 | 0.02/0.04/0.94 |
| Sam 27/06 | 23h00 | L | Croatie – Ghana | **2-1** 🔮 | 0.60/0.24/0.16 | 0.74/0.20/0.06 |
| Dim 28/06 | 01h30 | K | Colombie – Portugal | **1-1** 🔮 | 0.32/0.36/0.32 | 0.05/0.18/0.77 |
| Dim 28/06 | 01h30 | K | RD Congo – Ouzbékistan | **2-1** 🔮 | 0.50/0.27/0.23 | 0.63/0.30/0.07 |
| Dim 28/06 | 04h00 | J | Jordanie – Argentine | **1-2** 🔮 | 0.12/0.20/0.68 | 0.02/0.03/0.95 |
| Dim 28/06 | 04h00 | J | Algérie – Autriche | **1-1** 🔮 | 0.33/0.30/0.37 | 0.37/0.44/0.19 |

---


## Groupe A

Corée du Sud et Mexique se détachent ; la victoire coréenne en J1 (2-1) propulse les hommes de Son en tête. La Tchéquie accroche la 3e place (qualifiable). L'Afrique du Sud, dépassée et indisciplinée, ferme la marche.


| Journée | Match | Score | Type | P(V/N/D) modèle | mpp (1/N/2) |
|:--:|:--|:--:|:--:|:--:|:--:|
| J1 | Mexique – Afrique du Sud | **2-0** | réel ✅ | 0.86/0.10/0.04 | — |
| J1 | Corée du Sud – Tchéquie | **2-1** | réel ✅ | 0.48/0.25/0.27 | — |
| J2 | Tchéquie – Afrique du Sud | **1-0** | prono 🔮 | 0.58/0.27/0.15 | 0.58/0.27/0.15 |
| J2 | Mexique – Corée du Sud | **1-1** | prono 🔮 | 0.40/0.30/0.30 | 0.57/0.30/0.13 |
| J3 | Tchéquie – Mexique | **1-1** | prono 🔮 | 0.24/0.31/0.45 | 0.08/0.38/0.54 |
| J3 | Afrique du Sud – Corée du Sud | **0-2** | prono 🔮 | 0.12/0.22/0.66 | 0.14/0.30/0.56 |

**Classement final pronostiqué**

| Rang | Équipe | Pts | J | G | N | P | BP | BC | Diff | Statut |
|:--:|:--|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--|
| 1 | Corée du Sud | **7** | 3 | 2 | 1 | 0 | 5 | 2 | +3 | 🟢 1er — qualifié |
| 2 | Mexique | **5** | 3 | 1 | 2 | 0 | 4 | 2 | +2 | 🟢 2e — qualifié |
| 3 | Tchéquie | **4** | 3 | 1 | 1 | 1 | 3 | 3 | +0 | 🟡 3e — qualifié |
| 4 | Afrique du Sud | **0** | 3 | 0 | 0 | 3 | 0 | 5 | -5 | 🔴 éliminé |


## Groupe B

La Suisse confirme son statut de favori malgré son nul d'entrée concédé au Qatar. Le Canada profite de son avantage co-hôte. La Bosnie de Dzeko arrache une 3e place qualifiable ; le Qatar termine dernier malgré son point historique.


| Journée | Match | Score | Type | P(V/N/D) modèle | mpp (1/N/2) |
|:--:|:--|:--:|:--:|:--:|:--:|
| J1 | Canada – Bosnie-Herzégovine | **1-1** | réel ✅ | 0.30/0.40/0.30 | — |
| J1 | Qatar – Suisse | **1-1** | réel ✅ | 0.18/0.40/0.42 | — |
| J2 | Suisse – Bosnie-Herzégovine | **2-0** | prono 🔮 | 0.74/0.16/0.10 | 0.73/0.21/0.06 |
| J2 | Canada – Qatar | **2-0** | prono 🔮 | 0.78/0.15/0.07 | 0.76/0.17/0.07 |
| J3 | Suisse – Canada | **2-1** | prono 🔮 | 0.50/0.27/0.23 | 0.52/0.39/0.09 |
| J3 | Bosnie-Herzégovine – Qatar | **2-1** | prono 🔮 | 0.50/0.26/0.24 | 0.56/0.32/0.12 |

**Classement final pronostiqué**

| Rang | Équipe | Pts | J | G | N | P | BP | BC | Diff | Statut |
|:--:|:--|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--|
| 1 | Suisse | **7** | 3 | 2 | 1 | 0 | 5 | 2 | +3 | 🟢 1er — qualifié |
| 2 | Canada | **4** | 3 | 1 | 1 | 1 | 4 | 3 | +1 | 🟢 2e — qualifié |
| 3 | Bosnie-Herzégovine | **4** | 3 | 1 | 1 | 1 | 3 | 4 | -1 | 🟡 3e — qualifié |
| 4 | Qatar | **1** | 3 | 0 | 1 | 2 | 2 | 5 | -3 | 🔴 éliminé |


## Groupe C

Choc au sommet : Brésil et Maroc (1-1 en J1) terminent tous deux qualifiés, le Brésil 1er à la différence de buts. L'Écosse prend la 3e place mais son calendrier (Maroc puis Brésil) la laisse hors des meilleurs 3es. Haïti termine sans point.


| Journée | Match | Score | Type | P(V/N/D) modèle | mpp (1/N/2) |
|:--:|:--|:--:|:--:|:--:|:--:|
| J1 | Brésil – Maroc | **1-1** | réel ✅ | 0.40/0.32/0.28 | — |
| J1 | Haïti – Écosse | **0-1** | réel ✅ | 0.12/0.22/0.66 | — |
| J2 | Écosse – Maroc | **1-2** | prono 🔮 | 0.18/0.22/0.60 | 0.06/0.19/0.75 |
| J2 | Brésil – Haïti | **3-0** | prono 🔮 | 0.91/0.07/0.02 | 0.97/0.02/0.01 |
| J3 | Écosse – Brésil | **0-2** | prono 🔮 | 0.06/0.14/0.80 | 0.04/0.08/0.88 |
| J3 | Maroc – Haïti | **2-0** | prono 🔮 | 0.85/0.11/0.04 | 0.94/0.04/0.02 |

**Classement final pronostiqué**

| Rang | Équipe | Pts | J | G | N | P | BP | BC | Diff | Statut |
|:--:|:--|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--|
| 1 | Brésil | **7** | 3 | 2 | 1 | 0 | 6 | 1 | +5 | 🟢 1er — qualifié |
| 2 | Maroc | **7** | 3 | 2 | 1 | 0 | 5 | 2 | +3 | 🟢 2e — qualifié |
| 3 | Écosse | **3** | 3 | 1 | 0 | 2 | 2 | 4 | -2 | 🔴 éliminé |
| 4 | Haïti | **0** | 3 | 0 | 0 | 3 | 0 | 6 | -6 | 🔴 éliminé |


## Groupe D

Les États-Unis impressionnent (4-1 d'entrée) et filent en tête. L'Australie et la Turquie se disputent la 2e place ; la Turquie, plus dangereuse, prend la 3e qualifiable. Le Paraguay est plombé par sa lourde défaite inaugurale.


| Journée | Match | Score | Type | P(V/N/D) modèle | mpp (1/N/2) |
|:--:|:--|:--:|:--:|:--:|:--:|
| J1 | États-Unis – Paraguay | **4-1** | réel ✅ | 0.61/0.22/0.17 | — |
| J1 | Australie – Turquie | **2-0** | réel ✅ | 0.19/0.23/0.58 | — |
| J2 | États-Unis – Australie | **2-0** | prono 🔮 | 0.66/0.21/0.13 | 0.70/0.21/0.09 |
| J2 | Turquie – Paraguay | **2-1** | prono 🔮 | 0.54/0.25/0.21 | 0.59/0.30/0.11 |
| J3 | Turquie – États-Unis | **1-1** | prono 🔮 | 0.29/0.27/0.44 | 0.30/0.40/0.30 |
| J3 | Paraguay – Australie | **1-1** | prono 🔮 | 0.45/0.27/0.28 | 0.50/0.33/0.17 |

**Classement final pronostiqué**

| Rang | Équipe | Pts | J | G | N | P | BP | BC | Diff | Statut |
|:--:|:--|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--|
| 1 | États-Unis | **7** | 3 | 2 | 1 | 0 | 7 | 2 | +5 | 🟢 1er — qualifié |
| 2 | Australie | **4** | 3 | 1 | 1 | 1 | 3 | 3 | +0 | 🟢 2e — qualifié |
| 3 | Turquie | **4** | 3 | 1 | 1 | 1 | 3 | 4 | -1 | 🟡 3e — qualifié |
| 4 | Paraguay | **1** | 3 | 0 | 1 | 2 | 3 | 7 | -4 | 🔴 éliminé |


## Groupe E

L'Allemagne, lancée par son 7-1, domine. La Côte d'Ivoire s'appuie sur sa défense pour la 2e place. L'Équateur, miné par son manque de réalisme offensif, est éliminé malgré une défense solide. Curaçao termine logiquement dernier.


| Journée | Match | Score | Type | P(V/N/D) modèle | mpp (1/N/2) |
|:--:|:--|:--:|:--:|:--:|:--:|
| J1 | Allemagne – Curaçao | **7-1** | réel ✅ | 0.93/0.06/0.01 | — |
| J1 | Côte d'Ivoire – Équateur | **1-0** | réel ✅ | 0.40/0.30/0.30 | — |
| J2 | Allemagne – Côte d'Ivoire | **2-1** | prono 🔮 | 0.60/0.24/0.16 | 0.81/0.13/0.06 |
| J2 | Équateur – Curaçao | **2-0** | prono 🔮 | 0.78/0.16/0.06 | 0.83/0.13/0.04 |
| J3 | Curaçao – Côte d'Ivoire | **0-2** | prono 🔮 | 0.08/0.17/0.75 | 0.03/0.07/0.90 |
| J3 | Équateur – Allemagne | **1-1** | prono 🔮 | 0.26/0.38/0.36 | 0.04/0.11/0.85 |

**Classement final pronostiqué**

| Rang | Équipe | Pts | J | G | N | P | BP | BC | Diff | Statut |
|:--:|:--|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--|
| 1 | Allemagne | **7** | 3 | 2 | 1 | 0 | 10 | 3 | +7 | 🟢 1er — qualifié |
| 2 | Côte d'Ivoire | **6** | 3 | 2 | 0 | 1 | 4 | 2 | +2 | 🟢 2e — qualifié |
| 3 | Équateur | **4** | 3 | 1 | 1 | 1 | 3 | 2 | +1 | 🟡 3e — qualifié |
| 4 | Curaçao | **0** | 3 | 0 | 0 | 3 | 1 | 11 | -10 | 🔴 éliminé |


## Groupe F

Surprise du groupe : la Suède, portée par le duo Isak-Gyökeres (5-1 en J1), prend la tête. Les Pays-Bas, accrochés deux fois, terminent 2es. Le Japon (privé de Mitoma) sauve une 3e place qualifiable. La Tunisie s'effondre.


| Journée | Match | Score | Type | P(V/N/D) modèle | mpp (1/N/2) |
|:--:|:--|:--:|:--:|:--:|:--:|
| J1 | Pays-Bas – Japon | **2-2** | réel ✅ | 0.45/0.30/0.25 | — |
| J1 | Suède – Tunisie | **5-1** | réel ✅ | 0.59/0.22/0.19 | — |
| J2 | Pays-Bas – Suède | **2-2** | prono 🔮 | 0.35/0.30/0.35 | 0.63/0.28/0.09 |
| J2 | Tunisie – Japon | **0-2** | prono 🔮 | 0.18/0.27/0.55 | 0.13/0.24/0.63 |
| J3 | Japon – Suède | **1-2** | prono 🔮 | 0.30/0.26/0.44 | 0.34/0.47/0.20 |
| J3 | Tunisie – Pays-Bas | **0-2** | prono 🔮 | 0.14/0.26/0.60 | 0.05/0.13/0.82 |

**Classement final pronostiqué**

| Rang | Équipe | Pts | J | G | N | P | BP | BC | Diff | Statut |
|:--:|:--|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--|
| 1 | Suède | **7** | 3 | 2 | 1 | 0 | 9 | 4 | +5 | 🟢 1er — qualifié |
| 2 | Pays-Bas | **5** | 3 | 1 | 2 | 0 | 6 | 4 | +2 | 🟢 2e — qualifié |
| 3 | Japon | **4** | 3 | 1 | 1 | 1 | 5 | 4 | +1 | 🟡 3e — qualifié |
| 4 | Tunisie | **0** | 3 | 0 | 0 | 3 | 1 | 9 | -8 | 🔴 éliminé |


## Groupe G

Groupe le plus ouvert : la Belgique finit par s'imposer, l'Égypte de Salah prend la 2e place. L'Iran, trop nul (3 nuls puis défaite), manque la qualification de justesse. La Nouvelle-Zélande, valeureuse, termine dernière.


| Journée | Match | Score | Type | P(V/N/D) modèle | mpp (1/N/2) |
|:--:|:--|:--:|:--:|:--:|:--:|
| J1 | Belgique – Égypte | **1-1** | réel ✅ | 0.45/0.30/0.25 | — |
| J1 | Iran – Nouvelle-Zélande | **2-2** | réel ✅ | 0.55/0.25/0.20 | — |
| J2 | Belgique – Iran | **2-1** | prono 🔮 | 0.55/0.25/0.20 | 0.93/0.05/0.02 |
| J2 | Nouvelle-Zélande – Égypte | **1-2** | prono 🔮 | 0.18/0.24/0.58 | 0.10/0.20/0.70 |
| J3 | Égypte – Iran | **1-1** | prono 🔮 | 0.38/0.35/0.27 | 0.66/0.28/0.06 |
| J3 | Nouvelle-Zélande – Belgique | **0-2** | prono 🔮 | 0.12/0.20/0.68 | 0.03/0.06/0.91 |

**Classement final pronostiqué**

| Rang | Équipe | Pts | J | G | N | P | BP | BC | Diff | Statut |
|:--:|:--|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--|
| 1 | Belgique | **7** | 3 | 2 | 1 | 0 | 5 | 2 | +3 | 🟢 1er — qualifié |
| 2 | Égypte | **5** | 3 | 1 | 2 | 0 | 4 | 3 | +1 | 🟢 2e — qualifié |
| 3 | Iran | **2** | 3 | 0 | 2 | 1 | 4 | 5 | -1 | 🔴 éliminé |
| 4 | Nouvelle-Zélande | **1** | 3 | 0 | 1 | 2 | 3 | 6 | -3 | 🔴 éliminé |


## Groupe H

Après son 0-0 surprise contre le Cap-Vert, l'Espagne se reprend et domine. L'Uruguay de Bielsa, diminué par les blessures, assure la 2e place. Le Cap-Vert devance l'Arabie saoudite pour la 3e place mais ne se qualifie pas.


| Journée | Match | Score | Type | P(V/N/D) modèle | mpp (1/N/2) |
|:--:|:--|:--:|:--:|:--:|:--:|
| J1 | Espagne – Cap-Vert | **0-0** | réel ✅ | 0.85/0.12/0.03 | — |
| J1 | Arabie saoudite – Uruguay | **1-1** | réel ✅ | 0.18/0.30/0.52 | — |
| J2 | Espagne – Arabie saoudite | **3-0** | prono 🔮 | 0.80/0.14/0.06 | 0.97/0.02/0.01 |
| J2 | Uruguay – Cap-Vert | **1-0** | prono 🔮 | 0.58/0.27/0.15 | 0.85/0.11/0.04 |
| J3 | Cap-Vert – Arabie saoudite | **1-1** | prono 🔮 | 0.33/0.34/0.33 | 0.14/0.55/0.31 |
| J3 | Uruguay – Espagne | **1-2** | prono 🔮 | 0.22/0.26/0.52 | 0.03/0.14/0.83 |

**Classement final pronostiqué**

| Rang | Équipe | Pts | J | G | N | P | BP | BC | Diff | Statut |
|:--:|:--|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--|
| 1 | Espagne | **7** | 3 | 2 | 1 | 0 | 5 | 1 | +4 | 🟢 1er — qualifié |
| 2 | Uruguay | **4** | 3 | 1 | 1 | 1 | 3 | 3 | +0 | 🟢 2e — qualifié |
| 3 | Cap-Vert | **2** | 3 | 0 | 2 | 1 | 1 | 2 | -1 | 🔴 éliminé |
| 4 | Arabie saoudite | **2** | 3 | 0 | 2 | 1 | 2 | 5 | -3 | 🔴 éliminé |


## Groupe I

La France, intraitable (9 pts), survole un groupe relevé. Le Sénégal, champion d'Afrique en titre, prend la 2e place devant la Norvège de Haaland (3e qualifiable). L'Irak termine sans point.


| Journée | Match | Score | Type | P(V/N/D) modèle | mpp (1/N/2) |
|:--:|:--|:--:|:--:|:--:|:--:|
| J1 | France – Sénégal | **2-1** | prono 🔮 | 0.58/0.24/0.18 | 0.88/0.09/0.03 |
| J1 | Irak – Norvège | **0-1** | prono 🔮 | 0.12/0.24/0.64 | 0.02/0.06/0.92 |
| J2 | France – Irak | **3-0** | prono 🔮 | 0.86/0.10/0.04 | 0.98/0.01/0.01 |
| J2 | Norvège – Sénégal | **1-1** | prono 🔮 | 0.32/0.30/0.38 | 0.32/0.42/0.26 |
| J3 | Norvège – France | **1-2** | prono 🔮 | 0.22/0.24/0.54 | 0.04/0.17/0.79 |
| J3 | Sénégal – Irak | **2-0** | prono 🔮 | 0.78/0.15/0.07 | 0.91/0.07/0.02 |

**Classement final pronostiqué**

| Rang | Équipe | Pts | J | G | N | P | BP | BC | Diff | Statut |
|:--:|:--|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--|
| 1 | France | **9** | 3 | 3 | 0 | 0 | 7 | 2 | +5 | 🟢 1er — qualifié |
| 2 | Sénégal | **4** | 3 | 1 | 1 | 1 | 4 | 3 | +1 | 🟢 2e — qualifié |
| 3 | Norvège | **4** | 3 | 1 | 1 | 1 | 3 | 3 | +0 | 🟡 3e — qualifié |
| 4 | Irak | **0** | 3 | 0 | 0 | 3 | 0 | 6 | -6 | 🔴 éliminé |


## Groupe J

L'Argentine déroule (9 pts). L'Autriche (2e) et l'Algérie (meilleur 3e) se qualifient toutes deux avec 4 points ; leur hiérarchie reste très serrée (point ouvert signalé par la critique). La Jordanie termine dernière.


| Journée | Match | Score | Type | P(V/N/D) modèle | mpp (1/N/2) |
|:--:|:--|:--:|:--:|:--:|:--:|
| J1 | Argentine – Algérie | **2-0** | prono 🔮 | 0.72/0.18/0.10 | 0.80/0.14/0.06 |
| J1 | Autriche – Jordanie | **2-0** | prono 🔮 | 0.64/0.24/0.12 | 0.83/0.14/0.03 |
| J2 | Argentine – Autriche | **2-1** | prono 🔮 | 0.66/0.21/0.13 | 0.87/0.10/0.03 |
| J2 | Jordanie – Algérie | **0-2** | prono 🔮 | 0.14/0.26/0.60 | 0.04/0.13/0.83 |
| J3 | Jordanie – Argentine | **1-2** | prono 🔮 | 0.12/0.20/0.68 | 0.02/0.03/0.95 |
| J3 | Algérie – Autriche | **1-1** | prono 🔮 | 0.33/0.30/0.37 | 0.37/0.44/0.19 |

**Classement final pronostiqué**

| Rang | Équipe | Pts | J | G | N | P | BP | BC | Diff | Statut |
|:--:|:--|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--|
| 1 | Argentine | **9** | 3 | 3 | 0 | 0 | 6 | 2 | +4 | 🟢 1er — qualifié |
| 2 | Autriche | **4** | 3 | 1 | 1 | 1 | 4 | 3 | +1 | 🟢 2e — qualifié |
| 3 | Algérie | **4** | 3 | 1 | 1 | 1 | 3 | 3 | +0 | 🟡 3e — qualifié |
| 4 | Jordanie | **0** | 3 | 0 | 0 | 3 | 1 | 6 | -5 | 🔴 éliminé |


## Groupe K

Portugal et Colombie, au coude-à-coude (nul 1-1 décisif), se qualifient tous deux, le Portugal 1er à la différence de buts. La RD Congo arrache une 3e place qualifiable de justesse. L'Ouzbékistan, pour sa 1ère CDM, termine dernier.


| Journée | Match | Score | Type | P(V/N/D) modèle | mpp (1/N/2) |
|:--:|:--|:--:|:--:|:--:|:--:|
| J1 | Portugal – RD Congo | **2-0** | prono 🔮 | 0.66/0.20/0.14 | 0.95/0.04/0.01 |
| J1 | Ouzbékistan – Colombie | **0-2** | prono 🔮 | 0.12/0.22/0.66 | 0.03/0.07/0.90 |
| J2 | Portugal – Ouzbékistan | **3-0** | prono 🔮 | 0.78/0.15/0.07 | 0.97/0.02/0.01 |
| J2 | Colombie – RD Congo | **2-1** | prono 🔮 | 0.56/0.24/0.20 | 0.71/0.23/0.06 |
| J3 | Colombie – Portugal | **1-1** | prono 🔮 | 0.32/0.36/0.32 | 0.05/0.18/0.77 |
| J3 | RD Congo – Ouzbékistan | **2-1** | prono 🔮 | 0.50/0.27/0.23 | 0.63/0.30/0.07 |

**Classement final pronostiqué**

| Rang | Équipe | Pts | J | G | N | P | BP | BC | Diff | Statut |
|:--:|:--|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--|
| 1 | Portugal | **7** | 3 | 2 | 1 | 0 | 6 | 1 | +5 | 🟢 1er — qualifié |
| 2 | Colombie | **7** | 3 | 2 | 1 | 0 | 5 | 2 | +3 | 🟢 2e — qualifié |
| 3 | RD Congo | **3** | 3 | 1 | 0 | 2 | 3 | 5 | -2 | 🟡 3e — qualifié |
| 4 | Ouzbékistan | **0** | 3 | 0 | 0 | 3 | 1 | 7 | -6 | 🔴 éliminé |


## Groupe L

L'Angleterre est démonstrative (9 pts, +6). La Croatie, vieillissante mais expérimentée, prend la 2e place. Ghana et Panama, à égalité au fond du classement, sont tous deux éliminés.


| Journée | Match | Score | Type | P(V/N/D) modèle | mpp (1/N/2) |
|:--:|:--|:--:|:--:|:--:|:--:|
| J1 | Angleterre – Croatie | **2-0** | prono 🔮 | 0.68/0.22/0.10 | 0.57/0.35/0.08 |
| J1 | Ghana – Panama | **1-1** | prono 🔮 | 0.38/0.32/0.30 | 0.60/0.33/0.07 |
| J2 | Angleterre – Ghana | **2-0** | prono 🔮 | 0.78/0.16/0.06 | 0.89/0.08/0.03 |
| J2 | Panama – Croatie | **1-2** | prono 🔮 | 0.16/0.24/0.60 | 0.03/0.08/0.89 |
| J3 | Panama – Angleterre | **0-2** | prono 🔮 | 0.06/0.14/0.80 | 0.02/0.04/0.94 |
| J3 | Croatie – Ghana | **2-1** | prono 🔮 | 0.60/0.24/0.16 | 0.74/0.20/0.06 |

**Classement final pronostiqué**

| Rang | Équipe | Pts | J | G | N | P | BP | BC | Diff | Statut |
|:--:|:--|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--|
| 1 | Angleterre | **9** | 3 | 3 | 0 | 0 | 6 | 0 | +6 | 🟢 1er — qualifié |
| 2 | Croatie | **6** | 3 | 2 | 0 | 1 | 4 | 4 | +0 | 🟢 2e — qualifié |
| 3 | Ghana | **1** | 3 | 0 | 1 | 2 | 2 | 5 | -3 | 🔴 éliminé |
| 4 | Panama | **1** | 3 | 0 | 1 | 2 | 2 | 5 | -3 | 🔴 éliminé |


---


## 🎟️ Les 32 qualifiés pour les 1/16 de finale

Format 2026 : 12 premiers + 12 deuxièmes + **8 meilleurs troisièmes**.


| # | 1ers de groupe | 2es de groupe | Meilleurs 3es |
|:--:|:--|:--|:--|
| 1 | A · Corée du Sud | A · Mexique | F · Japon |
| 2 | B · Suisse | B · Canada | E · Équateur |
| 3 | C · Brésil | C · Maroc | J · Algérie |
| 4 | D · États-Unis | D · Australie | I · Norvège |
| 5 | E · Allemagne | E · Côte d'Ivoire | A · Tchéquie |
| 6 | F · Suède | F · Pays-Bas | B · Bosnie-Herzégovine |
| 7 | G · Belgique | G · Égypte | D · Turquie |
| 8 | H · Espagne | H · Uruguay | K · RD Congo |
| 9 | I · France | I · Sénégal |  |
| 10 | J · Argentine | J · Autriche |  |
| 11 | K · Portugal | K · Colombie |  |
| 12 | L · Angleterre | L · Croatie |  |

**Course aux meilleurs 3es (très serrée)** — les 8 premiers passent :


| Rang 3es | Groupe | Équipe | Pts | Diff | BP | Qualifié |
|:--:|:--:|:--|:--:|:--:|:--:|:--:|
| 1 | F | Japon | 4 | +1 | 5 | ✅ |
| 2 | E | Équateur | 4 | +1 | 3 | ✅ |
| 3 | J | Algérie | 4 | +0 | 3 | ✅ |
| 4 | I | Norvège | 4 | +0 | 3 | ✅ |
| 5 | A | Tchéquie | 4 | +0 | 3 | ✅ |
| 6 | B | Bosnie-Herzégovine | 4 | -1 | 3 | ✅ |
| 7 | D | Turquie | 4 | -1 | 3 | ✅ |
| 8 | K | RD Congo | 3 | -2 | 3 | ✅ |
| 9 | C | Écosse | 3 | -2 | 2 | ❌ |
| 10 | G | Iran | 2 | -1 | 4 | ❌ |
| 11 | H | Cap-Vert | 2 | -1 | 1 | ❌ |
| 12 | L | Ghana | 1 | -3 | 2 | ❌ |

---


## 🔬 Méthodologie & limites

- **Modèle Poisson** : `λ` (buts attendus) dérivés de l'Elo via une *supremacy* bornée (`3.6·tanh(Δelo/350)`) et un volume de buts croissant avec le déséquilibre ; avantage hôte pour le Mexique, les USA et le Canada. Détails et sensibilité : `notebooks/analyse_pronos.ipynb`.

- **Multi-agents** : 12 agents prédicteurs (1/groupe, recherche web sur forme, effectifs, blessures, compétitions 2024-2026) ont ajusté le baseline ; 4 agents critiques ont challengé réalisme, biais et cohérence (départages, excès de nuls).

- **Validation** : confronté aux résultats réels de la J1, le modèle Elo pur n'a anticipé que **~38 % des issues** — une J1 exceptionnellement nulle et surprenante (8 nuls sur 16, dont Espagne 0-0 Cap-Vert), ce qui rappelle l'imprévisibilité du football et justifie la couche experts.

- **Limites** : un pronostic n'est pas une prédiction certaine. La course aux meilleurs 3es se joue à un but près ; plusieurs départages (Autriche/Algérie, Norvège/Sénégal) sont des quasi-pile-ou-face. Hors périmètre : la phase à élimination directe.
