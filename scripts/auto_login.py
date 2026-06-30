#!/usr/bin/env python3
"""auto_login.py — connexion headless à mpp.football (Ligue1 Connect / Auth0),
récupération du classement de la ligue + de l'historique complet des pronostics,
et écriture dans data/mpp_export.json (consommé par scripts/update_from_mpp.py).

Identifiants lus depuis l'environnement (jamais en dur, jamais commités) :
    MPP_EMAIL, MPP_PASSWORD

Notes d'environnement (proxy d'egress avec MITM TLS) :
  - Chromium DOIT passer par HTTPS_PROXY.
  - Le proxy MITM ne supporte pas le ClientHello TLS 1.3 de Chromium :
    on force --ssl-version-max=tls1.2 (sinon ERR_CONNECTION_CLOSED).
  - Le CA du proxy doit être dans le magasin NSS (~/.pki/nssdb) :
        certutil -d sql:$HOME/.pki/nssdb -A -n ccr -t "C,," -i /root/.ccr/agent-proxy-ca.crt

Usage : MPP_EMAIL=... MPP_PASSWORD=... python scripts/auto_login.py
"""
import os, json, sys
from playwright.sync_api import sync_playwright

CHROMIUM = os.environ.get("MPP_CHROMIUM", "/opt/pw-browsers/chromium-1194/chrome-linux/chrome")
PROXY = os.environ.get("HTTPS_PROXY")
EMAIL = os.environ["MPP_EMAIL"]
PASSWORD = os.environ["MPP_PASSWORD"]
CLIENT_ID = "grX5jWGWWQ4Uq91oe7KPNDZ96FS3jr0X"
TOKEN_KEY = f"@@auth0spajs@@::{CLIENT_ID}::https://mpp.ligue1.fr::openid profile email offline_access"
CHALLENGE_ID = "mpp_challenge_UE11P8GT"
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "mpp_export.json")

ARGS = ["--no-sandbox", "--disable-dev-shm-usage", "--disable-quic", "--ssl-version-max=tls1.2",
        "--disable-features=PostQuantumKyber,X25519MLKEM768,EncryptedClientHello,UseDnsHttpsSvcb,AsyncDns"]


def main():
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

        data = pg.evaluate("""async (args) => {
            const [cid, key] = args;
            const API='https://api.mpp.football';
            const tok = JSON.parse(window.localStorage.getItem(key)||'null')?.body?.access_token;
            const H={Authorization:`Bearer ${tok}`,'Content-Type':'application/json'};
            const out={};
            const s = await fetch(`${API}/challenge-standings/users-standings?challengeId=${cid}&limit=100`,{headers:H});
            out.standings = s.ok ? await s.json() : {error:s.status};
            const c = await fetch(`${API}/user-contests/all`,{headers:H});
            out.contests = c.ok ? await c.json() : {error:c.status};
            return out;
        }""", [CHALLENGE_ID, TOKEN_KEY])

        contests = data.get("contests")
        contest_list = contests.get("contests") if isinstance(contests, dict) else contests
        championship_id = None
        if isinstance(contest_list, list):
            for c in contest_list:
                if c.get("contestId") == CHALLENGE_ID:
                    championship_id = c.get("championshipId"); break
            if championship_id is None and contest_list:
                championship_id = contest_list[0].get("championshipId")

        history_matches = []
        if championship_id is not None:
            history_matches = pg.evaluate("""async (args) => {
                const [cid, key] = args;
                const tok = JSON.parse(window.localStorage.getItem(key)||'null')?.body?.access_token;
                const H={Authorization:`Bearer ${tok}`};
                const all=[]; let before=null;
                for (let i=0;i<40;i++){
                    const url=`https://api.mpp.football/user-match-forecasts/championship/${cid}/history`+(before?`?beforeDate=${before}`:'');
                    const r=await fetch(url,{headers:H}); if(!r.ok) break;
                    const j=await r.json(); const byDate=j.matchesByDate||{};
                    for(const d of Object.keys(byDate)) for(const m of byDate[d]) all.push(m);
                    if(!j.nextDate||j.nextDate===before) break; before=j.nextDate;
                }
                return all;
            }""", [championship_id, TOKEN_KEY])

        export = {
            "championship_id": championship_id,
            "history_matches": history_matches,
            "standings": data.get("standings"),
            "contests_raw": contest_list,
            "exported_at": "headless",
        }
        with open(OUT, "w", encoding="utf-8") as f:
            json.dump(export, f, ensure_ascii=False, indent=2)
        n_std = len(data["standings"].get("standings", [])) if isinstance(data.get("standings"), dict) else "?"
        print(f"✅ Export écrit : {OUT}")
        print(f"   championnat {championship_id} — {n_std} joueurs, {len(history_matches)} matchs")
        b.close()


if __name__ == "__main__":
    main()
