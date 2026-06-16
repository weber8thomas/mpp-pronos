# -*- coding: utf-8 -*-
"""Génère rapport/pronostics_cdm2026.md à partir des données + analyses."""
import json
import pandas as pd
import standings as S

pred = pd.read_csv("data/predictions.csv")

def mpp_str(r):
    if pd.isna(r.get("p_mpp_dom")) or r.get("p_mpp_dom") == "":
        return "—"
    return f"{float(r.p_mpp_dom):.2f}/{float(r.p_mpp_nul):.2f}/{float(r.p_mpp_ext):.2f}"

cls = S.tous_classements(pred)
premiers, deuxiemes, meilleurs3, df3 = S.qualifies(cls)
q1 = {e for _, e in premiers}; q2 = {e for _, e in deuxiemes}; q3 = set(meilleurs3.equipe)

ANALYSES = json.load(open("data/group_analyses.json"))

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
W("> ℹ️ La colonne **mpp** (`1/N/2`) provient de l'export mpp.football fourni — disponible pour les "
  "56 matchs à venir (les 16 matchs de J1 déjà joués des groupes A–H n'y figurent pas). "
  "Comparez `P(V/N/D)` (notre modèle) et `mpp` (cotes/communauté mpp).\n")
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
      f"{r.p_victoire_dom:.2f}/{r.p_nul:.2f}/{r.p_victoire_ext:.2f} | {mpp_str(r)} |")

W("\n---\n")

for g in sorted(cls):
    grp = pred[pred.groupe == g]
    W(f"\n## Groupe {g}\n")
    W(ANALYSES[g] + "\n")
    W("\n| Journée | Match | Score | Type | P(V/N/D) modèle | mpp (1/N/2) |")
    W("|:--:|:--|:--:|:--:|:--:|:--:|")
    for _, r in grp.iterrows():
        typ = "réel ✅" if r.statut == "joue" else "prono 🔮"
        match = f"{r.equipe_dom} – {r.equipe_ext}"
        W(f"| J{r.journee} | {match} | **{r.buts_dom}-{r.buts_ext}** | {typ} | "
          f"{r.p_victoire_dom:.2f}/{r.p_nul:.2f}/{r.p_victoire_ext:.2f} | {mpp_str(r)} |")
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
