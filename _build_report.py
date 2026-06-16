# -*- coding: utf-8 -*-
"""Génère rapport/pronostics_cdm2026.md à partir des données + analyses."""
import pandas as pd
import standings as S

pred = pd.read_csv("data/predictions.csv")
cls = S.tous_classements(pred)
premiers, deuxiemes, meilleurs3, df3 = S.qualifies(cls)
q1 = {e for _, e in premiers}; q2 = {e for _, e in deuxiemes}; q3 = set(meilleurs3.equipe)

ANALYSES = {
"A": "Corée du Sud et Mexique se détachent ; la victoire coréenne en J1 (2-1) propulse les hommes de Son en tête. La Tchéquie accroche la 3e place (qualifiable). L'Afrique du Sud, dépassée et indisciplinée, ferme la marche.",
"B": "La Suisse confirme son statut de favori malgré son nul d'entrée concédé au Qatar. Le Canada profite de son avantage co-hôte. La Bosnie de Dzeko arrache une 3e place qualifiable ; le Qatar termine dernier malgré son point historique.",
"C": "Choc au sommet : Brésil et Maroc (1-1 en J1) terminent tous deux qualifiés, le Brésil 1er à la différence de buts. L'Écosse prend la 3e place mais son calendrier (Maroc puis Brésil) la laisse hors des meilleurs 3es. Haïti termine sans point.",
"D": "Les États-Unis impressionnent (4-1 d'entrée) et filent en tête. L'Australie et la Turquie se disputent la 2e place ; la Turquie, plus dangereuse, prend la 3e qualifiable. Le Paraguay est plombé par sa lourde défaite inaugurale.",
"E": "L'Allemagne, lancée par son 7-1, domine. La Côte d'Ivoire s'appuie sur sa défense pour la 2e place. L'Équateur, miné par son manque de réalisme offensif, est éliminé malgré une défense solide. Curaçao termine logiquement dernier.",
"F": "Surprise du groupe : la Suède, portée par le duo Isak-Gyökeres (5-1 en J1), prend la tête. Les Pays-Bas, accrochés deux fois, terminent 2es. Le Japon (privé de Mitoma) sauve une 3e place qualifiable. La Tunisie s'effondre.",
"G": "Groupe le plus ouvert : la Belgique finit par s'imposer, l'Égypte de Salah prend la 2e place. L'Iran, trop nul (3 nuls puis défaite), manque la qualification de justesse. La Nouvelle-Zélande, valeureuse, termine dernière.",
"H": "Après son 0-0 surprise contre le Cap-Vert, l'Espagne se reprend et domine. L'Uruguay de Bielsa, diminué par les blessures, assure la 2e place. Le Cap-Vert devance l'Arabie saoudite pour la 3e place mais ne se qualifie pas.",
"I": "La France, intraitable (9 pts), survole un groupe relevé. Le Sénégal, champion d'Afrique en titre, prend la 2e place devant la Norvège de Haaland (3e qualifiable). L'Irak termine sans point.",
"J": "L'Argentine déroule (9 pts). L'Autriche (2e) et l'Algérie (meilleur 3e) se qualifient toutes deux avec 4 points ; leur hiérarchie reste très serrée (point ouvert signalé par la critique). La Jordanie termine dernière.",
"K": "Portugal et Colombie, au coude-à-coude (nul 1-1 décisif), se qualifient tous deux, le Portugal 1er à la différence de buts. La RD Congo arrache une 3e place qualifiable de justesse. L'Ouzbékistan, pour sa 1ère CDM, termine dernier.",
"L": "L'Angleterre est démonstrative (9 pts, +6). La Croatie, vieillissante mais expérimentée, prend la 2e place. Ghana et Panama, à égalité au fond du classement, sont tous deux éliminés.",
}

NOMS = {"A":"A","B":"B","C":"C","D":"D","E":"E","F":"F","G":"G","H":"H","I":"I","J":"J","K":"K","L":"L"}

def statut_eq(e):
    if e in q1: return "🟢 1er — qualifié"
    if e in q2: return "🟢 2e — qualifié"
    if e in q3: return "🟡 3e — qualifié"
    return "🔴 éliminé"

out = []
W = out.append
W("# 🏆 Pronostics — Phase de groupes, Coupe du Monde 2026\n")
W("> Pronostics de scores des **72 matchs** de la phase de groupes (48 équipes, 12 groupes), "
  "produits par une méthodologie **hybride** : modèle de Poisson basé sur l'Elo, ajusté et "
  "critiqué par une dizaine d'agents experts (forme récente, effectifs, blessures, compétitions précédentes).\n")
W("**Convention** : le tournoi ayant débuté le 11/06/2026, **J1 = résultats réels** (groupes A–H) "
  "et **J2/J3 = pronostics**. Les groupes I–L n'avaient pas encore joué au moment de l'analyse "
  "(16/06/2026) et sont entièrement pronostiqués.\n")
W("Données : `data/predictions.csv` · Modèle : `model_pronos.py` · Classements : `standings.py` · "
  "Analyse explorable : `notebooks/analyse_pronos.ipynb` · Traçabilité agents : `research/notes_agents.md`\n")

# ----- Tableau chronologique en tête -----
JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]
W("\n## 📅 Calendrier chronologique des 72 pronostics\n")
W("Trié par coup d'envoi. Heure en **CEST** (Europe/Paris, UTC+2) — *indicative, à confirmer*. "
  "Type : ✅ résultat réel · 🔮 pronostic. `P(V/N/D)` = probabilités victoire / nul / défaite (modèle).\n")
W("> ℹ️ **Probas mpp.football** : la colonne `mpp` est prête mais non remplie — le site est une "
  "application authentifiée (403) dont les probabilités communautaires ne sont pas accessibles "
  "publiquement. Fournir un export (JSON réseau ou HTML de la page) permet de la compléter automatiquement.\n")
W("\n| Date (CEST) | Heure | Gr. | Match | Prono | P(V/N/D) | mpp |")
W("|:--|:--:|:--:|:--|:--:|:--:|:--:|")
chrono = pred.sort_values("kickoff_utc")
for _, r in chrono.iterrows():
    dt = pd.to_datetime(r.kickoff_cest)
    date_s = f"{JOURS[dt.weekday()]} {dt.strftime('%d/%m')}"
    heure = dt.strftime("%Hh%M")
    typ = "✅" if r.statut == "joue" else "🔮"
    W(f"| {date_s} | {heure} | {r.groupe} | {r.equipe_dom} – {r.equipe_ext} | "
      f"**{r.buts_dom}-{r.buts_ext}** {typ} | "
      f"{r.p_victoire_dom:.2f}/{r.p_nul:.2f}/{r.p_victoire_ext:.2f} | — |")

W("\n---\n")

for g in sorted(cls):
    grp = pred[pred.groupe == g]
    W(f"\n## Groupe {g}\n")
    W(ANALYSES[g] + "\n")
    W("\n| Journée | Match | Score | Type | P(V/N/D) |")
    W("|:--:|:--|:--:|:--:|:--:|")
    for _, r in grp.iterrows():
        typ = "réel ✅" if r.statut == "joue" else "prono 🔮"
        match = f"{r.equipe_dom} – {r.equipe_ext}"
        W(f"| J{r.journee} | {match} | **{r.buts_dom}-{r.buts_ext}** | {typ} | "
          f"{r.p_victoire_dom:.2f}/{r.p_nul:.2f}/{r.p_victoire_ext:.2f} |")
    W("\n**Classement final pronostiqué**\n")
    W("| Rang | Équipe | Pts | J | G | N | P | BP | BC | Diff | Statut |")
    W("|:--:|:--|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--|")
    t = cls[g]
    for rang, r in t.iterrows():
        W(f"| {rang} | {r['equipe']} | **{int(r['pts'])}** | {int(r['J'])} | {int(r['G'])} | "
          f"{int(r['N'])} | {int(r['P'])} | {int(r['bp'])} | {int(r['bc'])} | {int(r['diff']):+d} | "
          f"{statut_eq(r['equipe'])} |")
    W("")

W("\n---\n")
W("\n## 🎟️ Les 32 qualifiés pour les 1/16 de finale\n")
W("Format 2026 : 12 premiers + 12 deuxièmes + **8 meilleurs troisièmes**.\n")
W("\n| # | 1ers de groupe | 2es de groupe | Meilleurs 3es |")
W("|:--:|:--|:--|:--|")
m3 = meilleurs3.reset_index(drop=True)
for i in range(12):
    a = f"{premiers[i][0]} · {premiers[i][1]}"
    b = f"{deuxiemes[i][0]} · {deuxiemes[i][1]}"
    c = f"{m3.iloc[i].groupe} · {m3.iloc[i].equipe}" if i < len(m3) else ""
    W(f"| {i+1} | {a} | {b} | {c} |")

W("\n**Course aux meilleurs 3es (très serrée)** — les 8 premiers passent :\n")
W("\n| Rang 3es | Groupe | Équipe | Pts | Diff | BP | Qualifié |")
W("|:--:|:--:|:--|:--:|:--:|:--:|:--:|")
for i, r in df3.reset_index(drop=True).iterrows():
    W(f"| {i+1} | {r.groupe} | {r.equipe} | {int(r.pts)} | {int(r['diff']):+d} | {int(r.bp)} | "
      f"{'✅' if i < 8 else '❌'} |")

W("\n---\n")
W("\n## 🔬 Méthodologie & limites\n")
W("- **Modèle Poisson** : `λ` (buts attendus) dérivés de l'Elo via une *supremacy* bornée "
  "(`3.6·tanh(Δelo/350)`) et un volume de buts croissant avec le déséquilibre ; avantage hôte "
  "pour le Mexique, les USA et le Canada. Détails et sensibilité : `notebooks/analyse_pronos.ipynb`.\n")
W("- **Multi-agents** : 12 agents prédicteurs (1/groupe, recherche web sur forme, effectifs, "
  "blessures, compétitions 2024-2026) ont ajusté le baseline ; 4 agents critiques ont challengé "
  "réalisme, biais et cohérence (départages, excès de nuls).\n")
W("- **Validation** : confronté aux résultats réels de la J1, le modèle Elo pur n'a anticipé que "
  "**~38 % des issues** — une J1 exceptionnellement nulle et surprenante (8 nuls sur 16, dont "
  "Espagne 0-0 Cap-Vert), ce qui rappelle l'imprévisibilité du football et justifie la couche experts.\n")
W("- **Limites** : un pronostic n'est pas une prédiction certaine. La course aux meilleurs 3es se "
  "joue à un but près ; plusieurs départages (Autriche/Algérie, Norvège/Sénégal) sont des "
  "quasi-pile-ou-face. Hors périmètre : la phase à élimination directe.\n")

open("rapport/pronostics_cdm2026.md", "w").write("\n".join(out))
print("Rapport écrit : rapport/pronostics_cdm2026.md")
