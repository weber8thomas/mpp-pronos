#!/usr/bin/env python3
"""fetch_knockout.py — récupère bracket + cotes d'un nouveau tour KO via le
même login headless que scripts/auto_login.py, en utilisant les endpoints
découverts par exploration réseau (championship-calendar puis
championship-match/summaries), et fusionne le résultat sous une nouvelle clé
(round_key, ex. "r8") dans data/mpp_knockout_raw.json.

Identifiants lus depuis l'environnement (jamais en dur, jamais commités) :
    MPP_EMAIL, MPP_PASSWORD

Usage : MPP_EMAIL=... MPP_PASSWORD=... python scripts/fetch_knockout.py r8 <gameWeekNumber>
"""
import os, json, sys
from playwright.sync_api import sync_playwright

CHROMIUM = os.environ.get("MPP_CHROMIUM", "/opt/pw-browsers/chromium-1194/chrome-linux/chrome")
PROXY = os.environ.get("HTTPS_PROXY")
EMAIL = os.environ["MPP_EMAIL"]
PASSWORD = os.environ["MPP_PASSWORD"]
CHAMPIONSHIP_ID = 8
CLIENT_ID = "grX5jWGWWQ4Uq91oe7KPNDZ96FS3jr0X"
TOKEN_KEY = f"@@auth0spajs@@::{CLIENT_ID}::https://mpp.ligue1.fr::openid profile email offline_access"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_PATH = os.path.join(ROOT, "data", "mpp_knockout_raw.json")

ARGS = ["--no-sandbox", "--disable-dev-shm-usage", "--disable-quic", "--ssl-version-max=tls1.2",
        "--disable-features=PostQuantumKyber,X25519MLKEM768,EncryptedClientHello,UseDnsHttpsSvcb,AsyncDns"]


def main():
    if len(sys.argv) != 3:
        sys.exit("Usage: python scripts/fetch_knockout.py <round-key, ex. r8> <gameWeekNumber>")
    round_key = sys.argv[1]
    gw_number = sys.argv[2]

    with sync_playwright() as p:
        b = p.chromium.launch(executable_path=CHROMIUM, headless=True,
                              proxy={"server": PROXY} if PROXY else None, args=ARGS)
        pg = b.new_context(viewport={"width": 390, "height": 844}).new_page()
        pg.goto("https://mpp.football/", wait_until="networkidle", timeout=60000)
        pg.wait_for_timeout(2500)
        pg.get_by_text("Se connecter", exact=True).first.click()
        pg.wait_for_url("**connect.ligue1.fr**", timeout=30000)
        pg.wait_for_timeout(2000)
        pg.fill("input#username", EMAIL)
        pg.fill("input#password", PASSWORD)
        pg.get_by_role("button", name="Se connecter").click()
        try:
            pg.wait_for_url("**mpp.football/**", timeout=45000)
        except Exception:
            print("⚠️ Pas revenu sur mpp.football :", pg.url); b.close(); sys.exit(2)
        pg.wait_for_timeout(4000)

        token = pg.evaluate(f"() => JSON.parse(window.localStorage.getItem({json.dumps(TOKEN_KEY)})||'null')?.body?.access_token || null")
        if not token:
            print("❌ Token absent après login."); b.close(); sys.exit(2)
        print("✅ Connecté, token récupéré.")

        result = pg.evaluate("""async (args) => {
            const [cid, key] = args;
            const API='https://api.mpp.football';
            const tok = JSON.parse(window.localStorage.getItem(key)||'null')?.body?.access_token;
            const H={Authorization:`Bearer ${tok}`,'Content-Type':'application/json'};
            const out = {};
            const rc = await fetch(`${API}/championship-calendar/${cid}`,{headers:H});
            out.calendar = rc.ok ? await rc.json() : {error:rc.status};
            return out;
        }""", [CHAMPIONSHIP_ID, TOKEN_KEY])

        calendar = result.get("calendar")
        if not isinstance(calendar, dict) or "gameWeeks" not in calendar:
            print("❌ championship-calendar invalide :", json.dumps(calendar)[:1000]); b.close(); sys.exit(2)

        gw = calendar["gameWeeks"].get(gw_number)
        if not gw:
            print(f"❌ gameWeek '{gw_number}' introuvable. Semaines disponibles : {list(calendar['gameWeeks'].keys())}")
            b.close(); sys.exit(2)
        match_ids = gw["matchesIds"]
        print(f"✅ gameWeek {gw_number} : {len(match_ids)} matchs -> {match_ids}")

        summaries = pg.evaluate("""async (args) => {
            const [ids, key] = args;
            const API='https://api.mpp.football';
            const tok = JSON.parse(window.localStorage.getItem(key)||'null')?.body?.access_token;
            const H={Authorization:`Bearer ${tok}`,'Content-Type':'application/json'};
            const r = await fetch(`${API}/championship-match/summaries`,{method:'POST',headers:H,body:JSON.stringify({matchesIds:ids})});
            return r.ok ? await r.json() : {error:r.status, statusText:r.statusText};
        }""", [match_ids, TOKEN_KEY])

        b.close()

    dump_path = os.path.join(ROOT, "data", f"_debug_summaries_{round_key}.json")
    with open(dump_path, "w", encoding="utf-8") as f:
        json.dump({"calendar_gw": gw, "summaries": summaries}, f, ensure_ascii=False, indent=2)
    print(f"📋 Réponse brute écrite dans {dump_path} pour inspection.")

    if isinstance(summaries, dict) and summaries.get("error"):
        print(f"❌ /championship-match/summaries → {summaries}"); sys.exit(2)

    print("Type de réponse summaries :", type(summaries).__name__)
    if isinstance(summaries, list):
        print(f"{len(summaries)} éléments.")
        if summaries:
            print(json.dumps(summaries[0], indent=2, ensure_ascii=False))
    elif isinstance(summaries, dict):
        print("Clés :", list(summaries.keys()))
        first_key = next(iter(summaries), None)
        if first_key:
            print(json.dumps(summaries[first_key], indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
