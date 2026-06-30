#!/usr/bin/env bash
# setup_headless.sh — prépare l'environnement (neuf à chaque session) pour la
# connexion headless à mpp.football. Idempotent : peut être relancé sans risque.
#
#  1. Playwright (module Python ; Chromium est déjà pré-installé dans /opt/pw-browsers)
#  2. certutil (libnss3-tools)
#  3. Import du CA du proxy d'egress dans le magasin NSS que Chromium utilise
#
# Le contournement TLS (forcer TLS 1.2) est géré côté scripts/auto_login.py.
set -u

echo "▸ Playwright…"
python -c "import playwright" 2>/dev/null || pip install --quiet playwright

echo "▸ certutil…"
command -v certutil >/dev/null 2>&1 || (apt-get install -y libnss3-tools >/dev/null 2>&1)

CA="/root/.ccr/agent-proxy-ca.crt"
if command -v certutil >/dev/null 2>&1 && [ -f "$CA" ]; then
  echo "▸ Import du CA proxy dans ~/.pki/nssdb…"
  mkdir -p "$HOME/.pki/nssdb"
  # Crée la base NSS si absente
  [ -f "$HOME/.pki/nssdb/cert9.db" ] || certutil -N -d "sql:$HOME/.pki/nssdb" --empty-password >/dev/null 2>&1
  certutil -d "sql:$HOME/.pki/nssdb" -A -n "ccr-agent-proxy" -t "C,," -i "$CA" 2>/dev/null \
    && echo "  CA importé." || echo "  (CA déjà présent ou import ignoré.)"
else
  echo "  ⚠️ certutil ou CA introuvable — le proxy n'est peut-être pas en mode MITM (OK si réseau direct)."
fi

echo "✓ Setup headless terminé."
