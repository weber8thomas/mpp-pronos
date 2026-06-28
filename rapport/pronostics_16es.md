# 🏆 Pronostics — 16es de finale, Coupe du Monde 2026

> Phase de groupes **terminée** (72 matchs joués). 32 équipes qualifiées.
> Modèle **ré-évalué après la phase de poule** : les notes Elo de départ sont
> mises à jour match par match sur les 72 rencontres (dynamique + parcours réels),
> puis injectées dans le moteur Poisson, avec résolution du nul (prolongation / t.a.b.).

## 🔬 Comment la dynamique de poule est intégrée

Chaque équipe arrive en 16e avec un **Elo post-poule** = Elo pré-tournoi corrigé par
ses 3 résultats de groupe (système *World Football Elo* : K = 60, multiplicateur
d'écart de buts). Battre un favori rapporte gros ; sombrer en coûte. L'Elo post-poule
sert d'entrée au modèle, donc **la forme du moment prime sur la réputation**.

| 📈 Plus fortes hausses | Δ Elo | | 📉 Plus fortes baisses | Δ Elo |
|---|---|---|---|---|
| **Norvège** (9 pts, France étrillée 4-1) | **+142** | | **Tunisie** (0 pt, 3 défaites) | −68 |
| Mexique (9 pts, 0 encaissé) | +56 | | Tchéquie (1 pt) | −60 |
| Cap-Vert (invaincu, surprise) | +49 | | **France** (1-4 vs Norvège) | **−59** |
| Égypte (2e de G) | +47 | | Ouzbékistan (0 pt) | −59 |
| RD Congo (3e qualifié) | +45 | | Qatar (1 pt) | −49 |
| Afrique du Sud (2e de A) | +44 | | Uruguay (éliminé) | −48 |

> ⚠️ Un pronostic n'est pas une certitude. En K.-O., un match nul à la 90e se
> joue aux prolongations puis aux tirs au but (quasi pile-ou-face) : les
> probabilités de **qualification** ci-dessous intègrent ce facteur.

---

## 📅 Les 16 affiches (ordre chronologique)

Légende : `(n)` = place dans le groupe · *Elo pré→post (Δ)* · parcours `Pts BP:BC [V/N/D]` ·
**modèle** = proba sur 90 min + score le plus probable · **Qualif** = proba de passer le tour ·
*MPP* = probabilités implicites des cotes du marché.

### 1 — 🇿🇦 Afrique du Sud (2) vs Canada (2) 🇨🇦 · 28 juin
*Elo 1556→1600 (+44) · 1739→1728 (−11)* — AfSud `4 2:3 [DNV]` / Canada `4 8:3 [NVD]`
**Modèle** : AfSud 4 % / nul 11 % / Canada **84 %** — score probable **0-2** · **Qualif : Canada 91 %** · *MPP 22/26/50*

Canada co-hôte a la puissance de feu du groupe (6-0 au Qatar, 8 buts) et le soutien
de son public nord-américain, que le modèle traduit par un avantage terrain. L'Afrique
du Sud a surperformé (défense à 2 buts encaissés, +44 d'Elo) mais marque trop peu
(2 buts) pour inquiéter durablement une équipe qui l'emporte balle au pied. Le marché
MPP est plus prudent (Canada 50 %) car les Bafana Bafana sont accrocheurs ; le modèle,
lui, sanctionne l'écart de niveau. **Canada passe.**

### 2 — 🇧🇷 Brésil (1) vs Japon (2) 🇯🇵 · 29 juin
*Elo 1991→2010 (+19) · 1924→1932 (+8)* — Brésil `7 7:1 [NVV]` / Japon `5 7:3 [NVN]`
**Modèle** : Brésil 56 % / nul 23 % / Japon 20 % — score probable **1-0** · **Qualif : Brésil 68 %** · *MPP 50/26/23*

Le Brésil sort d'une poule maîtrisée (1 seul but encaissé) après un nul de prestige
contre le Maroc, puis deux 3-0. Mais le Japon n'est pas un 2e ordinaire : tenu en échec
les Pays-Bas (2-2) et corrigé la Tunisie 4-0, il possède le bloc et la vitesse pour
piéger une Seleção parfois fébrile en transition. Le modèle donne le Brésil largement
favori sans l'assurer : un scénario à prolongations est crédible. **Brésil, mais sous tension.**

### 3 — 🇩🇪 Allemagne (1) vs Paraguay (3) 🇵🇾 · 29 juin
*Elo 1934→1918 (−16) · 1762→1755 (−7)* — Allemagne `6 10:4 [VVD]` / Paraguay `4 2:4 [DVN]`
**Modèle** : Allemagne 72 % / nul 17 % / Paraguay 10 % — score probable **2-0** · **Qualif : Allemagne 82 %** · *MPP 63/20/16*

L'Allemagne a la meilleure attaque du tour (10 buts) mais s'est fait surprendre par
l'Équateur (1-2) lors d'une 3e journée relâchée — d'où un léger recul d'Elo. Le Paraguay
d'Alfaro est l'antithèse : 2 buts marqués, un jeu de blocs et de transitions taillé pour
le K.-O. Le modèle voit la qualité offensive allemande primer, mais la Mannschaft devra
forcer le verrou. **Allemagne, en travaillant.**

### 4 — 🇳🇱 Pays-Bas (1) vs Maroc (2) 🇲🇦 · 30 juin
*Elo 1976→2011 (+35) · 1887→1924 (+37)* — Pays-Bas `7 10:4 [NVV]` / Maroc `7 6:3 [NVV]`
**Modèle** : Pays-Bas 57 % / nul 22 % / Maroc 19 % — score probable **1-0** · **Qualif : Pays-Bas 70 %** · *MPP 42/29/27*

Le choc du tour. **Les deux équipes montent dans la hiérarchie** (+35 et +37 d'Elo),
finissent sur deux victoires et affichent 7 points. Les Pays-Bas frappent fort
(10 buts, 5-1 à la Suède) ; le Maroc, demi-finaliste sortant de l'esprit, défend haut
et a tenu le Brésil. Le modèle penche Oranje pour la puissance offensive, mais l'écart
réel est mince — c'est l'affiche la plus ouverte parmi les « favoris ». **Pays-Bas d'un souffle.**

### 5 — 🇨🇮 Côte d'Ivoire (2) vs France (2) 🇫🇷 · 30 juin
*Elo 1771→1803 (+32) · 2063→2004 (−59)* — Côte d'Ivoire `6 4:2 [VDV]` / France `8 7:7 [VVD]`
**Modèle** : CIV 7 % / nul 14 % / France **78 %** — score probable **0-2** · **Qualif : France 87 %** · *MPP 27/28/44*

Le grand écart entre réputation et forme. La France reste la 2e force du modèle malgré
**−59 d'Elo** : une défense passoire (7 buts encaissés, **humiliée 1-4 par la Norvège**)
qui a coûté la 1re place. La Côte d'Ivoire, tenante de la CAN, monte (+32) et a la
profondeur pour exister. Le marché MPP le sent (France à 44 % seulement). Le modèle
maintient les Bleus favoris sur le talent brut, **mais c'est la qualifiée la plus
fragile du haut de tableau.** **France — à condition de resserrer derrière.**

### 6 — 🇳🇴 Norvège (1) vs Suède (3) 🇸🇪 · 30 juin
*Elo 1840→1982 (+142) · 1761→1786 (+25)* — Norvège `9 10:2 [VVV]` / Suède `4 7:7 [VDN]`
**Modèle** : Norvège 77 % / nul 14 % / Suède 7 % — score probable **2-0** · **Qualif : Norvège 86 %** · *MPP 68/17/14*

Le derby scandinave tourne à l'avantage de **l'équipe la plus en forme du tournoi**.
La Norvège de Haaland–Ødegaard a tout gagné, marqué 10 buts et **renversé la France 4-1** :
+142 d'Elo, du jamais-vu sur ce tour. La Suède d'Isak et Gyökeres a la qualité offensive
(5-1 à la Tunisie) mais a sombré 1-5 face aux Pays-Bas et n'a fini que 3e. Élan,
hiérarchie et confiance : tout est norvégien. **Norvège nettement.**

### 7 — 🇲🇽 Mexique (1) vs Équateur (3) 🇪🇨 · 1er juillet
*Elo 1804→1860 (+56) · 1833→1821 (−12)* — Mexique `9 6:0 [VVV]` / Équateur `4 2:2 [DNV]`
**Modèle** : Mexique 73 % / nul 16 % / Équateur 9 % — score probable **2-0** · **Qualif : Mexique 83 %** · *MPP 40/31/27*

Le Mexique, pays hôte, a réalisé **le parcours parfait : 9 points, 0 but encaissé**,
porté par ses stades. L'Équateur, lui, a fini 3e en trompe-l'œil mais avec un coup
d'éclat (2-1 sur l'Allemagne) qui rappelle sa solidité. Le modèle additionne avantage
hôte + clean sheets et fait du Tri un favori net ; le marché MPP est plus serré (40 %)
en raison de la rugosité défensive équatorienne. **Mexique, public en fusion.**

### 8 — 🏴 Angleterre (1) vs RD Congo (4) 🇨🇩 · 1er juillet
*Elo 2042→2057 (+15) · 1690→1735 (+45)* — Angleterre `7 6:2 [VNV]` / RD Congo `4 4:3 [NDV]`
**Modèle** : Angleterre 88 % / nul 8 % / RD Congo 2 % — score probable **3-0** · **Qualif : Angleterre 94 %** · *MPP 67/18/14*

L'Angleterre de Tuchel a déroulé (7 pts, 4-2 à la Croatie) et reste un poids lourd Elo.
La RD Congo a fait le plus dur en se qualifiant comme 3e (+45 d'Elo, joli 3-1 final),
mais le fossé de talent est immense. Le modèle ne voit qu'une issue. **Angleterre sans trembler.**

### 9 — 🇧🇪 Belgique (1) vs Sénégal (3) 🇸🇳 · 1er juillet
*Elo 1849→1843 (−6) · 1869→1834 (−35)* — Belgique `5 6:2 [NNV]` / Sénégal `3 8:6 [DDV]`
**Modèle** : Belgique 38 % / nul 26 % / Sénégal 34 % — score probable **1-1** · **Qualif : Belgique 52 %** · *MPP 42/30/27*

**Le 50/50 du tour.** La Belgique a gagné son groupe mais sans convaincre (deux nuls
fermés avant un 5-1 sur la Nouvelle-Zélande) ; son Elo stagne. Le Sénégal, 3e, a la
meilleure attaque des repêchés (8 buts, 5-0 à l'Irak) et n'a perdu que de justesse
contre la Norvège et la France — deux des révélations du tournoi. Le modèle ne départage
quasiment pas (Belgique 52 %). **Pile ou face — léger avantage Belgique, scénario prolongations.**

### 10 — 🇺🇸 États-Unis (1) vs Bosnie-Herzégovine (3) 🇧🇦 · 2 juillet
*Elo 1797→1817 (+20) · 1633→1655 (+22)* — États-Unis `6 8:4 [VVD]` / Bosnie `4 5:6 [NDV]`
**Modèle** : USA 86 % / nul 9 % / Bosnie 3 % — score probable **2-0** · **Qualif : USA 92 %** · *MPP 57/22/19*

Les États-Unis, co-hôtes, ont validé leur 1re place malgré un faux pas final (2-3 vs
Turquie) ; le public et l'attaque (8 buts) font la différence. La Bosnie de Dzeko s'est
qualifiée au mental (3-1 décisif sur le Qatar) mais reste tendre défensivement (6 encaissés).
Avantage terrain + niveau : **USA largement.**

### 11 — 🇪🇸 Espagne (1) vs Autriche (2) 🇦🇹 · 2 juillet
*Elo 2171→2159 (−12) · 1790→1796 (+6)* — Espagne `7 5:0 [NVV]` / Autriche `4 6:6 [VDN]`
**Modèle** : Espagne 90 % / nul 7 % / Autriche 2 % — score probable **3-0** · **Qualif : Espagne 95 %** · *MPP 65/19/14*

L'Espagne, n°1 mondial, a fait ce qu'il fallait : **0 but encaissé**, maîtrise totale,
1re place. L'Autriche de Rangnick presse fort mais a montré ses limites défensives
(6 encaissés, dont un 3-3 face à l'Algérie). Le modèle ne laisse quasiment aucune
chance à la Roja de chuter. **Espagne souveraine.**

### 12 — 🇵🇹 Portugal (2) vs Croatie (2) 🇭🇷 · 2 juillet
*Elo 1976→1975 (−1) · 1933→1928 (−5)* — Portugal `5 6:1 [NVN]` / Croatie `5 5:5 [DVV]`
**Modèle** : Portugal 48 % / nul 25 % / Croatie 26 % — score probable **1-1** · **Qualif : Portugal 62 %** · *MPP 45/29/25*

Duel de nations expérimentées au coude-à-coude (Elo quasi figés). Le Portugal a la
meilleure défense des deux (1 encaissé) mais a calé sur deux 0-0 (Colombie, RD Congo) ;
la Croatie de Modrić a relancé sa campagne après la gifle initiale contre l'Angleterre
(2-4). Le modèle voit le Portugal légèrement devant grâce à sa solidité, sans trancher
nettement. **Portugal aux points, prolongations possibles.**

### 13 — 🇨🇭 Suisse (1) vs Algérie (3) 🇩🇿 · 3 juillet
*Elo 1835→1873 (+38) · 1785→1785 (+0)* — Suisse `7 7:3 [NVV]` / Algérie `4 5:7 [DVN]`
**Modèle** : Suisse 57 % / nul 22 % / Algérie 19 % — score probable **1-0** · **Qualif : Suisse 70 %** · *MPP 52/26/21*

La Suisse a remporté un groupe B piégeux (4-1 à la Bosnie, **2-1 sur le Canada hôte**),
montant de +38 d'Elo : valeur sûre en tournoi. L'Algérie, 3e, a du talent offensif
(Amoura/Mahrez) mais une défense friable (7 encaissés, 3-3 contre l'Autriche). Le modèle
fait de la Nati une favorite raisonnable. **Suisse, sérieuse.**

### 14 — 🇦🇺 Australie (2) vs Égypte (2) 🇪🇬 · 3 juillet
*Elo 1714→1742 (+28) · 1660→1707 (+47)* — Australie `4 2:2 [VDN]` / Égypte `5 5:3 [NVN]`
**Modèle** : Australie 45 % / nul 25 % / Égypte 28 % — score probable **1-1** · **Qualif : Australie 59 %** · *MPP 30/32/37*

Affiche la plus indécise du bas de tableau. **Le modèle penche Australie** (bloc
défensif, Elo 1742) tandis que **le marché MPP voit l'Égypte de Salah favorite** (37 %)
après sa progression (+47 d'Elo, 2e d'un groupe relevé). Les deux ont des attaques
modestes : match fermé, probable prolongation. **Légère préférence Australie, mais c'est un vrai 50/50.**

### 15 — 🇦🇷 Argentine (1) vs Cap-Vert (2) 🇨🇻 · 3 juillet
*Elo 2113→2142 (+29) · 1580→1629 (+49)* — Argentine `9 8:1 [VVV]` / Cap-Vert `3 2:2 [NNN]`
**Modèle** : Argentine 94 % / nul 4 % / Cap-Vert 0 % — score probable **3-0** · **Qualif : Argentine 97 %** · *MPP 78/11/9*

La championne du monde en titre a survolé (9 pts, 1 encaissé) et reste la 2e puissance
Elo du tournoi. Le Cap-Vert signe un parcours héroïque (3 nuls, +49 d'Elo, sorti devant
l'Uruguay) mais change de dimension face à Messi & cie. **Argentine sans débat.**

### 16 — 🇨🇴 Colombie (1) vs Ghana (3) 🇬🇭 · 4 juillet
*Elo 1998→2013 (+15) · 1695→1727 (+32)* — Colombie `7 4:1 [VVN]` / Ghana `4 2:2 [VND]`
**Modèle** : Colombie 86 % / nul 10 % / Ghana 3 % — score probable **2-0** · **Qualif : Colombie 92 %** · *MPP 48/28/23*

La Colombie de James a remporté un groupe K solide (1 seul but encaissé, 0-0 maîtrisé
face au Portugal) et figure dans le top Elo. Le Ghana s'est qualifié comme 3e sans
briller offensivement (2 buts). Le modèle donne les Cafeteros largement devant.
**Colombie, en contrôle.**

---

## 🎯 Synthèse des pronostics

| # | Affiche | Pronostic qualifié | Confiance | Score probable |
|---|---|---|:--:|:--:|
| 1 | AfSud – Canada | **Canada** | 91 % | 0-2 |
| 2 | Brésil – Japon | **Brésil** | 68 % | 1-0 |
| 3 | Allemagne – Paraguay | **Allemagne** | 82 % | 2-0 |
| 4 | Pays-Bas – Maroc | **Pays-Bas** | 70 % | 1-0 |
| 5 | Côte d'Ivoire – France | **France** | 87 % | 0-2 |
| 6 | Norvège – Suède | **Norvège** | 86 % | 2-0 |
| 7 | Mexique – Équateur | **Mexique** | 83 % | 2-0 |
| 8 | Angleterre – RD Congo | **Angleterre** | 94 % | 3-0 |
| 9 | Belgique – Sénégal | **Belgique** | 52 % | 1-1 (t.a.b.) |
| 10 | États-Unis – Bosnie | **États-Unis** | 92 % | 2-0 |
| 11 | Espagne – Autriche | **Espagne** | 95 % | 3-0 |
| 12 | Portugal – Croatie | **Portugal** | 62 % | 1-1 (a.p.) |
| 13 | Suisse – Algérie | **Suisse** | 70 % | 1-0 |
| 14 | Australie – Égypte | **Australie** | 59 % | 1-1 (t.a.b.) |
| 15 | Argentine – Cap-Vert | **Argentine** | 97 % | 3-0 |
| 16 | Colombie – Ghana | **Colombie** | 92 % | 2-0 |

**3 matchs à pile ou face** (Belgique–Sénégal, Australie–Égypte, Portugal–Croatie) et
**1 affiche piège** (Pays-Bas–Maroc) ; le reste suit la hiérarchie post-poule. Désaccord
notable avec le marché : le modèle est plus tranché sur **France** et **Australie** que
les cotes MPP.

> Données : API officielle mpp.football (résultats, cotes). Modèle : Elo post-poule →
> Poisson (`scripts_r32/model_r32.py`). Détail chiffré dans `data/predictions_r32.csv`
> et `data/elo_post_poule.csv`.
