/**
 * browser_export.js — colle ce script dans la console DevTools de mpp.football
 * (F12 → Console) quand tu es connecté. Il lit le token Auth0 depuis le
 * localStorage, appelle l'API mpp.football, et copie le JSON dans le presse-papier.
 * Ensuite passe ce JSON à scripts/update_from_mpp.py.
 */
(async () => {
  'use strict';

  const TOKEN_KEY =
    '@@auth0spajs@@::grX5jWGWWQ4Uq91oe7KPNDZ96FS3jr0X' +
    '::https://mpp.ligue1.fr::openid profile email offline_access';
  const API = 'https://api.mpp.football';
  const CHALLENGE_ID = 'mpp_challenge_UE11P8GT';

  // --- Auth token ---
  const cached = JSON.parse(localStorage.getItem(TOKEN_KEY) || 'null');
  const token = cached?.body?.access_token;
  if (!token) {
    console.error('❌ Token introuvable. Connecte-toi à mpp.football et réessaie.');
    return;
  }
  console.log('✅ Token trouvé.');

  const H = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const get = async (path) => {
    const r = await fetch(`${API}${path}`, { headers: H });
    if (!r.ok) { console.error(`GET ${path} → ${r.status} ${r.statusText}`); return null; }
    return r.json();
  };

  const post = async (path, body) => {
    const r = await fetch(`${API}${path}`, { method: 'POST', headers: H, body: JSON.stringify(body) });
    if (!r.ok) { console.error(`POST ${path} → ${r.status} ${r.statusText}`); return null; }
    return r.json();
  };

  // --- 1. Trouver l'ID du championnat (CDM 2026) ---
  console.log('🔍 Recherche du championnat CDM 2026...');
  const contests = await get('/user-contests/all');
  let championshipId = null;

  if (Array.isArray(contests)) {
    for (const c of contests) {
      // Cherche un championnat avec "Monde" ou "World" dans le nom, ou années 2026
      const name = c?.championship?.name || c?.name || '';
      const cid  = c?.championship?.id   || c?.championshipId || c?.id;
      console.log(`  Championnat trouvé : "${name}" → id=${cid}`);
      if (!championshipId && cid && /2026|Monde|World/i.test(name)) {
        championshipId = cid;
        console.log(`  ✅ Retenu : ${cid}`);
      }
    }
    // Fallback : premier de la liste si rien n'a matché
    if (!championshipId && contests.length > 0) {
      const c = contests[0];
      championshipId = c?.championship?.id || c?.championshipId || c?.id;
      console.warn(`  ⚠️ Aucun match "2026/Monde/World" → fallback premier : ${championshipId}`);
    }
  }

  // Fallback via summaries de matchs connus
  if (!championshipId) {
    console.log('  Tentative via /championship-match/summaries...');
    const summaries = await post('/championship-match/summaries', {
      matchesIds: [2608241, 2608313],
    });
    if (Array.isArray(summaries) && summaries.length > 0) {
      championshipId =
        summaries[0]?.championship?.id ||
        summaries[0]?.championshipId;
      console.log(`  Réponse summaries :`, summaries);
    }
  }

  if (!championshipId) {
    console.error('❌ ID du championnat introuvable. Vérifie la console pour plus de détails.');
    console.log('Réponse /user-contests/all :', contests);
    return;
  }
  console.log(`✅ Championship ID : ${championshipId}`);

  // --- 2. Historique des pronostics du joueur ---
  console.log('📊 Récupération de l\'historique des pronostics...');
  const history = await get(`/user-match-forecasts/championship/${championshipId}/history`);
  if (!history) {
    console.error('❌ Historique introuvable — vérifie l\'ID du championnat.');
    return;
  }
  const n = Array.isArray(history) ? history.length : '?';
  console.log(`  ${n} matchs récupérés.`);

  // --- 3. Classement de la ligue Viva Italia ---
  console.log('🏆 Récupération du classement Viva Italia...');
  const standings = await get(
    `/challenge-standings/users-standings?challengeId=${CHALLENGE_ID}&limit=100`
  );
  if (!standings) console.warn('⚠️ Classement ligue introuvable.');

  // --- Assemblage ---
  const output = {
    championship_id: championshipId,
    history,
    standings,
    contests_raw: contests,
    exported_at: new Date().toISOString(),
  };

  const json = JSON.stringify(output, null, 2);

  try {
    await navigator.clipboard.writeText(json);
    console.log('📋 JSON copié dans le presse-papier !');
  } catch {
    console.log('📋 Copie manuelle du JSON ci-dessous :');
  }
  console.log('=== MPP EXPORT JSON ===');
  console.log(json);
  console.log('=== FIN EXPORT ===');
  console.log('👉 Colle dans data/mpp_export.json puis lance : python scripts/update_from_mpp.py');
  return output;
})();
