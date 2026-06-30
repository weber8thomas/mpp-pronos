#!/usr/bin/env python3
"""update_from_mpp.py — transforme l'export du navigateur (browser_export.js) en
fichiers de données locaux, puis reconstruit le site.

Usage :
  python scripts/update_from_mpp.py [chemin_export.json]

  Si aucun chemin n'est fourni, lit data/mpp_export.json.
  Après transformation, lance automatiquement build_site.py.
"""
import json
import os
import subprocess
import sys
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")
DOCS = os.path.join(ROOT, "docs")

CHALLENGE_ID  = "mpp_challenge_UE11P8GT"
LEAGUE_NAME   = "Viva Italia 🇮🇹🍊"
MY_USER_ID    = "user_3761834"

RARITY_BONUS = {1: 20, 2: 30, 3: 50}
BONUS_RARITY = {20: 1, 30: 2, 50: 3}

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def load(name):
    with open(os.path.join(DATA, name), encoding="utf-8") as f:
        return json.load(f)


def save(name, obj, *, indent=None):
    path = os.path.join(DATA, name)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=indent)
    print(f"  → {name} écrit")


def avatar_path(user_id):
    """Retourne le chemin local de l'avatar si le fichier existe."""
    local = os.path.join(DOCS, "avatars", f"{user_id}.jpg")
    if os.path.isfile(local):
        return f"avatars/{user_id}.jpg"
    return "avatars/default.png"


# ---------------------------------------------------------------------------
# Parsing de l'historique des pronostics
# ---------------------------------------------------------------------------

def normalize_forecast_entry(raw):
    """Normalise un objet brut de l'API en entrée user_forecasts.json."""
    # L'API peut utiliser camelCase ou des noms courts (h, a, hs, as, q, uf, mpts)
    def pick(*keys, d=raw, default=None):
        for k in keys:
            if k in d:
                return d[k]
        return default

    mid   = str(pick("id", "matchId", "match_id"))
    date_ = pick("date", "matchDate", "kickoff", default="")
    period = pick("period", default="fullTime")

    # Identifiants de club (home/away)
    h = str(pick("h", "homeClubId", "home_club_id", default=""))
    a = str(pick("a", "awayClubId", "away_club_id", default=""))

    # Scores réels
    hs = pick("hs", "homeScore", "home_score", default=0)
    as_ = pick("as", "awayScore", "away_score", default=0)

    # Si l'API renvoie des objets imbriqués (h.id / a.id / h.score / a.score)
    if not h and isinstance(raw.get("h"), dict):
        h  = str(raw["h"].get("id", raw["h"].get("c", raw["h"].get("clubId", ""))))
        hs = raw["h"].get("score", raw["h"].get("sc", hs))
    if not a and isinstance(raw.get("a"), dict):
        a  = str(raw["a"].get("id", raw["a"].get("c", raw["a"].get("clubId", ""))))
        as_ = raw["a"].get("score", raw["a"].get("sc", as_))

    # Cotes (1/N/2)
    q = pick("q", "quotes", "odds", default={})

    # Pronostic du joueur
    uf = pick("uf", "userForecast", "user_forecast", default=None)
    if uf and isinstance(uf, dict):
        # Normalise les clés internes
        uf = {
            "hs":    uf.get("hs", uf.get("homeScore", uf.get("home", 0))),
            "as":    uf.get("as", uf.get("awayScore", uf.get("away", 0))),
            "pts":   uf.get("pts", uf.get("points", 0)),
            "exact": uf.get("exact", uf.get("exactPoints", uf.get("pts_exact", 0))),
            "base":  uf.get("base", uf.get("basePoints", uf.get("pts_base", 0))),
        }

    mpts = pick("mpts", "modelPoints", "model_pts", default=0) or 0

    return {
        "id":     mid,
        "date":   date_,
        "period": period,
        "h":      h,
        "hs":     int(hs) if hs is not None else 0,
        "a":      a,
        "as":     int(as_) if as_ is not None else 0,
        "q":      q,
        "uf":     uf,
        "mpts":   int(mpts),
    }


# ---------------------------------------------------------------------------
# Mise à jour de user_forecasts.json
# ---------------------------------------------------------------------------

def update_user_forecasts(history_raw):
    print("\n[user_forecasts.json]")
    if not isinstance(history_raw, list):
        print("  ⚠️  L'historique n'est pas une liste — format API inattendu.")
        print("  Type reçu :", type(history_raw))
        print("  Aperçu :", str(history_raw)[:500])
        return None

    entries = [normalize_forecast_entry(m) for m in history_raw]
    entries.sort(key=lambda e: e["date"])

    print(f"  {len(entries)} matchs dans l'historique API.")

    # Charge l'existant pour comparer
    existing = load("user_forecasts.json")
    existing_ids = {e["id"] for e in existing}
    new_ids = {e["id"] for e in entries}
    added   = new_ids - existing_ids
    missing = existing_ids - new_ids
    if added:
        print(f"  Nouveaux matchs : {sorted(added)}")
    if missing:
        print(f"  Matchs absents de l'API (conservés) : {sorted(missing)}")

    # Fusionne : API est source de vérité pour les matchs qu'elle retourne
    merged_map = {e["id"]: e for e in existing}
    for e in entries:
        merged_map[e["id"]] = e
    merged = sorted(merged_map.values(), key=lambda e: e["date"])

    save("user_forecasts.json", merged)
    return entries


# ---------------------------------------------------------------------------
# Mise à jour de league_viva_italia.json
# ---------------------------------------------------------------------------

def update_league(standings_raw):
    print("\n[league_viva_italia.json]")
    if not standings_raw:
        print("  ⚠️  Aucune donnée de classement reçue.")
        return

    # L'API peut retourner {"standings": [...]} ou directement [...]
    rows_raw = []
    if isinstance(standings_raw, list):
        rows_raw = standings_raw
    elif isinstance(standings_raw, dict):
        rows_raw = (
            standings_raw.get("standings") or
            standings_raw.get("users") or
            standings_raw.get("data") or
            []
        )

    if not rows_raw:
        print("  ⚠️  Format inattendu :")
        print("  ", str(standings_raw)[:500])
        return

    standings = []
    for i, s in enumerate(rows_raw, 1):
        uid = str(s.get("id", s.get("userId", s.get("user_id", ""))))
        standings.append({
            "rank":     i,
            "username": s.get("username", s.get("name", uid)),
            "id":       uid,
            "points":   int(s.get("points", s.get("pts", 0))),
            "calc":     int(s.get("calc", s.get("nbCalc", s.get("nb_calc", 0)))),
            "exact":    int(s.get("exact", s.get("nbExact", s.get("nb_exact", 0)))),
            "good":     int(s.get("good", s.get("nbGood", s.get("nb_good", 0)))),
            "avatar":   avatar_path(uid),
        })

    league = {
        "name":        LEAGUE_NAME,
        "challengeId": CHALLENGE_ID,
        "snapshot":    date.today().isoformat(),
        "me":          MY_USER_ID,
        "standings":   standings,
    }

    print(f"  {len(standings)} joueurs dans la ligue.")
    for s in standings:
        me_flag = " ← toi" if s["id"] == MY_USER_ID else ""
        print(f"    #{s['rank']} {s['username']:20s}  {s['points']:5d} pts  "
              f"({s['exact']} exact, {s['good']} bons){me_flag}")

    save("league_viva_italia.json", league, indent=2)


# ---------------------------------------------------------------------------
# Mise à jour de exact_bonus.json
# ---------------------------------------------------------------------------

def update_exact_bonus(entries):
    """Dérive les bonus de score exact depuis l'historique du joueur."""
    print("\n[exact_bonus.json]")
    if not entries:
        print("  Aucune entrée — exact_bonus.json inchangé.")
        return

    eb = load("exact_bonus.json")
    matches = eb.get("matches", {})
    added = 0

    for e in entries:
        uf = e.get("uf")
        if not uf:
            continue
        exact = int(uf.get("exact", 0))
        base  = int(uf.get("base",  0))
        if exact <= 0 or base <= 0 or exact <= base:
            continue   # pas de score exact bonus
        bonus = exact - base
        if bonus not in BONUS_RARITY:
            print(f"  ⚠️  Bonus inattendu {bonus} pour match {e['id']} — ignoré.")
            continue
        mid = e["id"]
        if mid not in matches:
            matches[mid] = {
                "h":      e["h"],
                "a":      e["a"],
                "hs":     e["hs"],
                "as":     e["as"],
                "bonus":  bonus,
                "rarity": BONUS_RARITY[bonus],
            }
            added += 1
            print(f"  + match {mid} : {e['hs']}-{e['as']}  bonus={bonus}  rarity={BONUS_RARITY[bonus]}")
        else:
            # Met à jour si le bonus a changé
            if matches[mid]["bonus"] != bonus:
                print(f"  ~ match {mid} : bonus {matches[mid]['bonus']} → {bonus}")
                matches[mid]["bonus"]  = bonus
                matches[mid]["rarity"] = BONUS_RARITY[bonus]

    if added == 0:
        print("  Aucun nouveau score exact bonus détecté.")

    eb["matches"] = matches
    save("exact_bonus.json", eb)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    export_path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(DATA, "mpp_export.json")

    if not os.path.isfile(export_path):
        print(f"❌ Fichier introuvable : {export_path}")
        print("   Lance d'abord browser_export.js dans la console de mpp.football,")
        print("   puis sauvegarde le JSON dans data/mpp_export.json.")
        sys.exit(1)

    print(f"📂 Lecture de {export_path}...")
    with open(export_path, encoding="utf-8") as f:
        export = json.load(f)

    history_raw  = export.get("history")
    standings_raw = export.get("standings")
    cid = export.get("championship_id", "?")
    print(f"  Championnat : {cid}")
    print(f"  Exporté le  : {export.get('exported_at', '?')}")

    entries = update_user_forecasts(history_raw)
    update_league(standings_raw)
    if entries:
        update_exact_bonus(entries)

    # Reconstruction du site
    print("\n[build_site.py]")
    result = subprocess.run(
        ["python", "build_site.py"],
        cwd=ROOT,
        capture_output=True,
        text=True,
    )
    print(result.stdout.strip())
    if result.returncode != 0:
        print("⚠️  ERREUR build_site.py :")
        print(result.stderr)
        sys.exit(1)

    print("\n✅ Mise à jour terminée.")
    print("   Lance ensuite : git add -A && git commit -m 'data: MAJ pronostics mpp.football' && git push")


if __name__ == "__main__":
    main()
