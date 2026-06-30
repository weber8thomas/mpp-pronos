#!/usr/bin/env python3
"""update_from_mpp.py — transforme l'export mpp.football (data/mpp_export.json,
produit par scripts/auto_login.py en headless OU par scripts/browser_export.js)
en fichiers de données locaux, puis reconstruit le site.

Structure attendue de l'export :
  {
    "championship_id": 8,
    "history_matches": [ {matchId, date, period, quotations, home:{clubId,score,
        shootOutScore?}, away:{...}, userForecast:{homeScore,awayScore,
        points:{base,exact,extra,total,rarityLevel}} | null }, ... ],
    "standings": {"standings": [{user:{id,username,...}, ranking:{points,
        calculatedForecasts, goodForecasts, exactForecasts, rank}}, ...]},
  }

Usage : python scripts/update_from_mpp.py [chemin_export.json]
"""
import json
import os
import subprocess
import sys
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")
DOCS = os.path.join(ROOT, "docs")

CHALLENGE_ID = "mpp_challenge_UE11P8GT"
LEAGUE_NAME  = "Viva Italia 🇮🇹🍊"
MY_USER_ID   = "user_3761834"

MATCH_PREFIX = "mpp_championship_match_"
CLUB_PREFIX  = "mpp_championship_club_"


def load(name):
    with open(os.path.join(DATA, name), encoding="utf-8") as f:
        return json.load(f)


def save(name, obj, *, indent=None):
    with open(os.path.join(DATA, name), "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=indent)
    print(f"  → {name} écrit")


def strip(prefix, s):
    s = str(s)
    return s[len(prefix):] if s.startswith(prefix) else s


def avatar_path(user_id):
    if os.path.isfile(os.path.join(DOCS, "avatars", f"{user_id}.jpg")):
        return f"avatars/{user_id}.jpg"
    return "avatars/default.png"


# ---------------------------------------------------------------------------
# user_forecasts.json
# ---------------------------------------------------------------------------

def build_user_forecasts(matches):
    print("\n[user_forecasts.json]")
    out = []
    for m in matches:
        uf_raw = m.get("userForecast")
        pts = (uf_raw or {}).get("points", {}) if uf_raw else {}
        uf = None
        if uf_raw:
            uf = {
                "hs":    uf_raw["homeScore"],
                "as":    uf_raw["awayScore"],
                "pts":   int(pts.get("total", 0)),
                "exact": int(pts.get("exact", 0)),
                "base":  int(pts.get("base", 0)),
            }
        out.append({
            "id":     strip(MATCH_PREFIX, m["matchId"]),
            "date":   m["date"],
            "period": m.get("period", "fullTime"),
            "h":      strip(CLUB_PREFIX, m["home"]["clubId"]),
            "hs":     m["home"].get("score", 0),
            "a":      strip(CLUB_PREFIX, m["away"]["clubId"]),
            "as":     m["away"].get("score", 0),
            "q":      m.get("quotations", {}),
            "uf":     uf,
            "mpts":   int(((m.get("points") or {}).get("total", 0))),
        })
    out.sort(key=lambda e: e["date"])
    n_uf = sum(1 for e in out if e["uf"])
    print(f"  {len(out)} matchs ({n_uf} pronostiqués).")
    save("user_forecasts.json", out)
    return out


# ---------------------------------------------------------------------------
# league_viva_italia.json
# ---------------------------------------------------------------------------

def build_league(standings_raw):
    print("\n[league_viva_italia.json]")
    rows = standings_raw.get("standings") if isinstance(standings_raw, dict) else standings_raw
    if not rows:
        print("  ⚠️  Pas de classement dans l'export — fichier inchangé.")
        return
    standings = []
    for s in rows:
        u, r = s["user"], s["ranking"]
        standings.append({
            "rank":     int(r["rank"]),
            "username": u["username"],
            "id":       u["id"],
            "points":   int(r["points"]),
            "calc":     int(r["calculatedForecasts"]),
            "exact":    int(r["exactForecasts"]),
            "good":     int(r["goodForecasts"]),
            "avatar":   avatar_path(u["id"]),
        })
    standings.sort(key=lambda x: x["rank"])
    for s in standings:
        flag = " ← toi" if s["id"] == MY_USER_ID else ""
        print(f"    #{s['rank']} {s['username']:18s} {s['points']:5d} pts "
              f"({s['exact']} exact, {s['good']} bons){flag}")
    # Écriture compacte : une ligne par joueur (format historique du fichier).
    rows = ",\n".join("    " + json.dumps(s, ensure_ascii=False) for s in standings)
    body = (
        "{\n"
        f'  "name": {json.dumps(LEAGUE_NAME, ensure_ascii=False)},\n'
        f'  "challengeId": "{CHALLENGE_ID}",\n'
        f'  "snapshot": "{date.today().isoformat()}",\n'
        f'  "me": "{MY_USER_ID}",\n'
        '  "standings": [\n'
        f"{rows}\n"
        "  ]\n"
        "}\n"
    )
    with open(os.path.join(DATA, "league_viva_italia.json"), "w", encoding="utf-8") as f:
        f.write(body)
    print("  → league_viva_italia.json écrit")


# ---------------------------------------------------------------------------
# exact_bonus.json  (FUSION : on n'écrase jamais les bonus déjà connus,
# dérivés des pronos des autres joueurs de la ligue)
# ---------------------------------------------------------------------------

def merge_exact_bonus(matches):
    print("\n[exact_bonus.json]")
    eb = load("exact_bonus.json")
    matches_map = eb.setdefault("matches", {})
    added = updated = 0
    for m in matches:
        uf = m.get("userForecast")
        if not uf:
            continue
        pts = uf.get("points", {})
        extra  = int(pts.get("extra", 0))
        rarity = pts.get("rarityLevel")
        if extra <= 0 or not rarity:
            continue  # le joueur n'a pas eu le score exact ici
        mid = strip(MATCH_PREFIX, m["matchId"])
        entry = {
            "h":  strip(CLUB_PREFIX, m["home"]["clubId"]),
            "a":  strip(CLUB_PREFIX, m["away"]["clubId"]),
            "hs": m["home"].get("score", 0),
            "as": m["away"].get("score", 0),
            "bonus": extra, "rarity": int(rarity),
        }
        if mid not in matches_map:
            matches_map[mid] = entry; added += 1
        elif matches_map[mid].get("bonus") != extra:
            matches_map[mid] = entry; updated += 1
    print(f"  {len(matches_map)} matchs au total (+{added} nouveaux, {updated} mis à jour).")
    save("exact_bonus.json", eb)


# ---------------------------------------------------------------------------

def main():
    path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(DATA, "mpp_export.json")
    if not os.path.isfile(path):
        print(f"❌ Export introuvable : {path}")
        sys.exit(1)
    print(f"📂 Lecture de {path}")
    export = json.load(open(path, encoding="utf-8"))
    matches = export.get("history_matches") or []
    print(f"  championnat {export.get('championship_id')} — {len(matches)} matchs")

    build_user_forecasts(matches)
    build_league(export.get("standings"))
    merge_exact_bonus(matches)

    print("\n[build_site.py]")
    r = subprocess.run(["python", "build_site.py"], cwd=ROOT, capture_output=True, text=True)
    print(r.stdout.strip())
    if r.returncode != 0:
        print("⚠️  ERREUR build_site.py :\n", r.stderr)
        sys.exit(1)
    print("\n✅ Mise à jour terminée.")


if __name__ == "__main__":
    main()
