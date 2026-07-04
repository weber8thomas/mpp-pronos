/* Dashboard Pronostics CDM 2026 — rendu 100% client à partir de window.DATA */
const D = window.DATA;
D.predictions.forEach((p,i)=>p._i=i);              // index stable pour ouvrir le détail
const DETAILS = D.teamDetails || {};               // résultats récents + blessés par équipe
// Prochain match selon l'heure réelle (timestamp UTC)
const NEXT_I = (()=>{const now=Date.now();let best=-1,bt=Infinity;
  D.predictions.forEach(p=>{const t=Date.parse(p.kickoff_utc+":00Z"); if(t>now&&t<bt){bt=t;best=p._i;}});
  return best;})();
const ST_COLOR = {"1er":"#12b886","2e":"#63c9a3","3e":"#e0a338","out":"#e5484d"};
const ST_LABEL = {"1er":"1er","2e":"2e","3e":"3e","out":"Élim."};
const THEME = {
  light:{paper:"#ffffff",grid:"#e5e9ef",font:"#0f1720",accent:"#0f9d76"},
  dark:{paper:"#11171f",grid:"#1b2430",font:"#eaf0f6",accent:"#1ce0a5"}
};
const curTheme = () => document.body.dataset.theme || "light";
const pct = x => (x==null?"–":Math.round(x*100)+"%");
const esc = s => String(s).replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));

/* Drapeaux ronds (flagcdn) — mapping équipe -> code pays ISO */
const FLAG={
 "Mexique":"mx","Afrique du Sud":"za","Corée du Sud":"kr","Tchéquie":"cz",
 "Canada":"ca","Suisse":"ch","Qatar":"qa","Bosnie-Herzégovine":"ba",
 "Brésil":"br","Maroc":"ma","Écosse":"gb-sct","Haïti":"ht",
 "États-Unis":"us","Australie":"au","Paraguay":"py","Turquie":"tr",
 "Allemagne":"de","Équateur":"ec","Côte d'Ivoire":"ci","Curaçao":"cw",
 "Pays-Bas":"nl","Japon":"jp","Tunisie":"tn","Suède":"se",
 "Belgique":"be","Iran":"ir","Égypte":"eg","Nouvelle-Zélande":"nz",
 "Espagne":"es","Uruguay":"uy","Arabie saoudite":"sa","Cap-Vert":"cv",
 "France":"fr","Sénégal":"sn","Norvège":"no","Irak":"iq",
 "Argentine":"ar","Autriche":"at","Algérie":"dz","Jordanie":"jo",
 "Portugal":"pt","Colombie":"co","Ouzbékistan":"uz","RD Congo":"cd",
 "Angleterre":"gb-eng","Croatie":"hr","Panama":"pa","Ghana":"gh"};
const flag = t => FLAG[t]?`<span class="flag"><img loading="lazy" src="https://flagcdn.com/w40/${FLAG[t]}.png" alt=""></span>`:`<span class="flag flag--none"></span>`;
const team = t => `${flag(t)}<span class="tn">${esc(t)}</span>`;
/* Infos équipe (entraîneur + lien effectif Transfermarkt direct), depuis window.DATA.teams */
const TEAMS = D.teams || {};
const tmUrl = t => (TEAMS[t]&&TEAMS[t].tm) || ("https://www.transfermarkt.fr/schnellsuche/ergebnis/schnellsuche?query="+encodeURIComponent(t));
const teamCoach = t => (TEAMS[t]&&TEAMS[t].coach)||null;
const coachLine = t => { const c=teamCoach(t); return c?`<small class="coach"><i class="mdi mdi-account-tie"></i>${esc(c)}</small>`:""; };
/* nom d'équipe cliquable -> effectif Transfermarkt (à n'utiliser que hors lignes-match cliquables) */
const teamLink = t => `${flag(t)}<a class="tn" href="${tmUrl(t)}" target="_blank" rel="noopener noreferrer" title="Effectif de ${esc(t)} sur Transfermarkt">${esc(t)}</a>`;
/* slug équipe (sans accents) -> URL confrontations AiScore */
const slugTeam = t => t.normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/['’]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const h2hUrl = (dom,ext) => `https://m.aiscore.com/fr/head-to-head/soccer-${slugTeam(dom)}-vs-${slugTeam(ext)}`;
/* abrège les noms de compétitions (ex. "Coupe du Monde" -> "CDM") */
const compShort = c => String(c||"").replace(/coupe du monde/ig,"CDM");

function probBar(pv,pn,pd){
  const w=x=>Math.round(x*100);
  return `<div class="probrow"><div class="bar" title="V ${pct(pv)} · N ${pct(pn)} · D ${pct(pd)}">
    <i class="v" style="width:${w(pv)}%"></i><i class="n" style="width:${w(pn)}%"></i><i class="d" style="width:${w(pd)}%"></i>
  </div><small>${w(pv)}/${w(pn)}/${w(pd)}</small></div>`;
}
const stPill = s => `<span class="pill ${s==='1er'?'r1':s==='2e'?'r2':s==='3e'?'r3':'out'}">${ST_LABEL[s]}</span>`;
// Badge de score coloré selon l'issue : vert = victoire dom, gris = nul, rouge = victoire ext
const outcome = (bd,be) => bd>be ? "V" : bd<be ? "D" : "N";
const scoreBadge = (bd,be) => {
  const c = bd>be ? "sc-win" : bd<be ? "sc-loss" : "sc-draw";
  const t = bd>be ? "Victoire domicile" : bd<be ? "Victoire extérieur" : "Match nul";
  return `<span class="scoreb ${c}" title="${t}">${bd}-${be}</span>`;
};
// Pronostic figé (ppd/ppe = score_pronostic) vs résultat réel (bd/be une fois le match joué).
const hasProno = p => p.ppd!=null && p.ppe!=null;
const hasReel  = p => p.statut==="joue";
// Accord prono ↔ résultat : ✓✓ score exact, ✓ bonne issue (1/N/2), ✗ issue manquée, — pas de résultat
function accordRank(p){
  if(!hasReel(p) || !hasProno(p)) return -1;
  if(p.ppd===p.bd && p.ppe===p.be) return 3;          // score exact
  return outcome(p.ppd,p.ppe)===outcome(p.bd,p.be) ? 2 : 1;
}
function accordBadge(p){
  const r=accordRank(p);
  if(r<0) return '<span class="muted">—</span>';
  if(r===3) return '<span class="acc acc-exact" title="Score exact pronostiqué">✓✓</span>';
  if(r===2) return '<span class="acc acc-ok" title="Bonne issue (1/N/2)">✓</span>';
  return '<span class="acc acc-no" title="Issue manquée">✗</span>';
}
// Points pris (cote mpp de l'issue, si bien pronostiquée). Affiche moi · modèle · mpp.
function ptsCell(p){
  if(p.pts_mod==null && p.u_pts==null) return '<span class="muted">—</span>';
  const dash='<span class="muted">—</span>';
  const moi = p.u_pts==null ? dash : `<b class="pu">${p.u_pts}</b>`;
  const mod = p.pts_mod==null ? dash : `<b class="pm">${p.pts_mod}</b>`;
  const mpp = p.pts_mpp==null ? dash : `<b class="pp">${p.pts_mpp}</b>`;
  return `<span class="pts" title="Points pris — moi · notre modèle · mpp">${moi}<span class="muted">·</span>${mod}<span class="muted">·</span>${mpp}</span>`;
}

// Carte « score total » : MOI (score réel MPP) vs notre modèle.
function scoreDuelCard(m){
  if(!m.n_scored || m.pts_user==null) return '';
  const best = Math.max(m.pts_mod, m.pts_user);
  const side=(name,val,ico,sub)=>`<div class="sd-side${val===best?' sd-win':''}">
      <div class="sd-name">${ico}${name}</div>
      <div class="sd-pts">${val}<span class="sd-u">pts</span></div>
      <div class="sd-sub">${sub}</div>
      ${val===best?'<div class="sd-tag">en tête</div>':''}</div>`;
  return `<div class="card scoreduel-card">
    <h3><i class="mdi mdi-scale-balance"></i> Mon score vs notre modèle</h3>
    <p class="muted sd-explain"><strong>Moi</strong> = mon score réel sur mon compte MPP (${m.n_user} pronos) ;
      <strong>modèle</strong> = pronostic figé du modèle sur les <strong>${m.n_scored}</strong> matchs joués
      (cote de l'issue si bien pronostiquée).</p>
    <div class="scoreduel">
      ${side('Moi',m.pts_user,'<i class="mdi mdi-account-circle-outline sd-ico"></i>',`${m.n_user} pronos`)}
      <div class="sd-vs">vs</div>
      ${side('Notre modèle',m.pts_mod,'<i class="mdi mdi-robot-happy-outline sd-ico"></i>','modèle Poisson')}
    </div>
  </div>`;
}

/* ---------- Accueil ---------- */
function renderAccueil(){
  const m=D.meta;
  const koRounds = D.koRounds||[];
  const koCount = koRounds.reduce((s,r)=>s+(r.matches?r.matches.length:0),0);
  const koLabel = koRounds.map(r=>`${r.matches.length} ${r.title}`).join(" + ");
  const vain=D.qualifiers.premiers.map(x=>`<div class="winrow"><span class="grouptag">${x.groupe}</span>${flag(x.equipe)}<span>${esc(x.equipe)}</span></div>`).join("");
  const tiles=[
    ["calendrier","mdi-calendar-month-outline","Calendrier","72 matchs, triables"],
    ["groupes","mdi-soccer","Groupes","Scores & classements"],
    ["qualifies","mdi-trophy-outline","Qualifiés","Les 32 qualifiés"],
    ["analyses","mdi-chart-box-outline","Analyses","Graphiques interactifs"],
    ["rapport","mdi-file-document-outline","Rapport","Le détail complet"],
    ["methodo","mdi-flask-outline","Méthodo","Comment ça marche"],
  ].map(([s,i,t,d])=>`<a class="navtile" data-jump="${s}"><i class="mdi ${i}"></i><span class="nt-t">${t}</span><span class="nt-d">${d}</span></a>`).join("");
  document.getElementById("accueil").innerHTML=`
   <div class="hero">
     <div class="hero-top">
       <img src="emblem.svg" alt="Emblème Coupe du Monde 2026" class="hero-logo hero-emblem"/>
       <div>
         <div class="eyebrow">FIFA World Cup 2026 · USA · Canada · Mexique</div>
         <h1>Pronostics — Coupe du Monde 2026</h1>
         <div class="cover"><b>${m.n_poule} matchs de poule</b>${koCount?` + <b>${koLabel}</b>`:""} · sur <b>104</b> au total (phase finale en cours)</div>
       </div>
     </div>
     <p class="lead">Pronostics via une méthode hybride : un modèle de <strong>Poisson</strong> (basé sur l'Elo)
     ajusté et critiqué par une dizaine d'<strong>agents experts</strong>.
     Phase de groupes <strong>terminée</strong> (résultats réels) ; place à la <strong>phase finale</strong>. Probas <strong>mpp</strong> issues de
     <a class="mpp-link" href="https://mpp.football" target="_blank" rel="noopener"><img class="mpp-logo" src="mpp-logo.png" alt="mpp.football"></a>.
     <em>Astuce : cliquez un match pour ouvrir sa fiche détaillée.</em></p>
   </div>
   <div class="kpis">
     <div class="kpi"><i class="mdi mdi-soccer-field"></i><div class="v">${m.n_predites}</div><div class="l">matchs pronostiqués (${m.n_poule} poule${koCount?` + ${koCount} phase finale`:""})</div></div>
     <div class="kpi kpi-progress"><i class="mdi mdi-check-decagram-outline"></i><div class="v">${m.n_joues_total}<span class="kpi-total">/${m.n_total_matchs_cdm}</span></div><div class="l">matchs joués (CDM)</div>
       <div class="kpi-bar"><i style="width:${Math.round(m.n_joues_total/m.n_total_matchs_cdm*100)}%"></i></div></div>
     <div class="kpi"><i class="mdi mdi-trophy-outline"></i><div class="v">${m.n_encore_en_lice}</div><div class="l">équipes encore en lice</div></div>
     <div class="kpi"><i class="mdi mdi-target"></i><div class="v">${m.accuracy!=null?Math.round(m.accuracy*100)+"%":"–"}</div><div class="l">précision sur les ${m.n_accuracy} matchs joués</div></div>
   </div>
   ${scoreDuelCard(m)}
   ${leagueCard()}
   <h2>Explorer</h2>
   <div class="navtiles">${tiles}</div>
   <div class="card" style="margin-top:18px"><h3><i class="mdi mdi-trophy"></i> Vainqueurs de groupe pronostiqués</h3><div class="winners">${vain}</div></div>`;
}

// Classement de la ligue (Viva Italia) avec notre modèle inséré.
function leagueCard(){
  const L = D.league;
  if(!L || !L.rows) return '';
  const av = r => r.avatar ? `<img class="lg-av" src="${esc(r.avatar)}" alt="" width="26" height="26">` : '<span class="lg-av lg-av--none"></span>';
  const rows = L.rows.map(r=>`<tr class="${r.isModel?'lg-model':''}${r.isMe?' lg-me':''}">
    <td class="c">${r.rank}</td>
    <td><div class="lg-name">${av(r)}<span class="lg-uname">${esc(r.username)}</span>${r.isMe?'<span class="lg-tag">moi</span>':''}${r.isModel?'<span class="lg-tag lg-tag--m">modèle</span>':''}</div></td>
    <td class="c"><b>${r.points}</b></td>
    <td class="c">${r.good}</td>
    <td class="c">${r.exact}</td></tr>`).join("");
  return `<div class="card lg-card">
    <h3><i class="mdi mdi-trophy-variant-outline"></i> Ligue ${esc(L.name)}</h3>
    <p class="muted sd-explain">Classement de la ligue avec <strong>notre modèle inséré</strong> pour situer ses performances.</p>
    <div class="tablewrap"><table class="lg-table">
      <thead><tr><th class="c">#</th><th>Joueur</th><th class="c">Pts</th><th class="c" title="Bonnes issues 1/N/2">Bons</th><th class="c" title="Scores exacts">Exacts</th></tr></thead>
      <tbody>${rows}</tbody></table></div>
    <div class="note" style="margin-top:10px">${esc(L.modelNote||"")}${L.snapshot?` · Classement au ${esc(L.snapshot)}.`:""}</div>
  </div>`;
}

/* ---------- Calendrier ---------- */
function matchRow(p){
  const mpp = p.mpp_v==null?'<span class="muted">—</span>':`${Math.round(p.mpp_v*100)}/${Math.round(p.mpp_n*100)}/${Math.round(p.mpp_d*100)}`;
  const dt = p.kickoff_cest.replace(/-/g,"/").slice(5,16);
  const nx = p._i===NEXT_I;
  return `<tr class="clik${nx?' isnext':''}"${nx?' id="cal-next"':''} data-match="${p._i}" data-g="${p.groupe}" data-s="${p.statut}" data-t="${esc(p.dom+' '+p.ext)}">
    <td class="cal-date" data-label="Coup d'envoi">${dt}</td>
    <td class="c cal-gr" data-label="Groupe"><span class="grouptag">${p.groupe}</span></td>
    <td class="cal-match" data-label="Match"><div class="matchcell"><span class="vs">${team(p.dom)}<span class="muted">–</span>${team(p.ext)}</span>${nx?'<span class="nextbadge">à suivre</span>':''}</div></td>
    <td class="c" data-label="Prono">${hasProno(p)?scoreBadge(p.ppd,p.ppe):'<span class="muted">—</span>'}</td>
    <td class="c" data-label="Résultat">${hasReel(p)?scoreBadge(p.bd,p.be):'<span class="muted">—</span>'}</td>
    <td class="c" data-label="Accord">${accordBadge(p)}</td>
    <td class="c" data-label="Points">${ptsCell(p)}</td>
    <td data-label="P(V/N/D) modèle">${probBar(p.pv,p.pn,p.pd)}</td><td class="c" data-label="mpp 1/N/2">${mpp}</td></tr>`;
}
const CAL_COLS=[
  {k:"date",   l:"Date · h (CEST)", cls:""},
  {k:"groupe", l:"Gr.",            cls:"c"},
  {k:"match",  l:"Match",          cls:""},
  {k:"prono",  l:"Prono",          cls:"c"},
  {k:"reel",   l:"Résultat",       cls:"c"},
  {k:"accord", l:"Accord",         cls:"c"},
  {k:"points", l:"Pts moi·mod·mpp", cls:"c"},
  {k:"pv",     l:"P(V/N/D) modèle",cls:""},
  {k:"mpp",    l:"mpp 1/N/2",      cls:"c"},
];
const CAL_KEY={
  date:p=>p.kickoff_utc,
  groupe:p=>p.groupe+"|"+p.kickoff_utc,
  match:p=>p.dom.toLowerCase(),
  prono:p=>hasProno(p)?p.ppd+p.ppe:-1,
  reel:p=>hasReel(p)?p.bd+p.be:-1,
  accord:p=>accordRank(p),
  points:p=>p.pts_mod==null?-1:p.pts_mod,
  pv:p=>p.pv,
  mpp:p=>p.mpp_v==null?-1:p.mpp_v,
};
function renderCalendrier(){
  const koRounds = D.koRounds||[];
  const opts=["<option value=''>Tous les matchs</option>"]
    .concat(D.meta.groupes.map(g=>`<option value="${g}">Groupe ${g}</option>`))
    .concat(koRounds.map(r=>`<option value="${r.label}">${r.title}</option>`)).join("");
  const sec=document.getElementById("calendrier");
  let sortKey="date", sortDir=1;
  const koText = koRounds.length ? ` + ${koRounds.map(r=>`les <strong>${r.title}</strong>`).join(", ")}` : "";
  sec.innerHTML=`
    <h1>Calendrier &amp; pronostics</h1>
    <p class="lead">Les 72 matchs de poule${koText}. <strong>Cliquez un en-tête</strong> pour trier
    (date, groupe, score, proba…) ; filtrez par équipe, groupe/phase ou statut. Heure <strong>CEST</strong> indicative.
    Pour un match joué, <strong>Prono</strong> = pronostic figé avant le match, <strong>Résultat</strong> = score réel,
    <strong>Accord</strong> compare les deux, et <strong>Points</strong> (modèle · mpp) = cote mpp remportée si l'issue est bien pronostiquée.</p>
    <div class="legend">Score : <span class="scoreb sc-win">2-0</span> victoire domicile ·
      <span class="scoreb sc-draw">1-1</span> nul ·
      <span class="scoreb sc-loss">0-2</span> victoire extérieur ·
      Accord : <span class="acc acc-exact">✓✓</span> score exact ·
      <span class="acc acc-ok">✓</span> bonne issue ·
      <span class="acc acc-no">✗</span> manquée</div>
    <div class="controls">
      <input id="calSearch" placeholder="Rechercher une équipe…"/>
      <select id="calGroup">${opts}</select>
      <select id="calType"><option value="">Tous statuts</option><option value="joue">Joués</option><option value="a_venir">À venir</option></select>
      <button id="calNext" type="button" class="btn-next"><i class="mdi mdi-fast-forward-outline"></i> Prochain match</button>
      <span id="calCount" class="faint" style="align-self:center"></span>
    </div>
    <div class="tablewrap caltablewrap"><table class="caltable">
      <thead><tr>${CAL_COLS.map(c=>`<th class="sortable ${c.cls}" data-k="${c.k}">${c.l}<span class="arr"></span></th>`).join("")}</tr></thead>
      <tbody id="calBody"></tbody>
    </table></div>`;
  const tbody=sec.querySelector("#calBody");
  function refresh(){
    const q=sec.querySelector("#calSearch").value.toLowerCase().trim();
    const g=sec.querySelector("#calGroup").value, t=sec.querySelector("#calType").value;
    let arr=D.predictions.filter(p=>(!g||p.groupe===g)&&(!t||p.statut===t)&&
      (!q||(p.dom+" "+p.ext).toLowerCase().includes(q)));
    const key=CAL_KEY[sortKey];
    arr.sort((a,b)=>{const x=key(a),y=key(b);return (x>y?1:x<y?-1:0)*sortDir;});
    tbody.innerHTML=arr.length?arr.map(matchRow).join(""):
      `<tr><td colspan="9" class="c muted" style="padding:18px">Aucun match.</td></tr>`;
    sec.querySelector("#calCount").textContent=`${arr.length} match${arr.length>1?"s":""}`;
    sec.querySelectorAll("th.sortable").forEach(th=>{
      th.querySelector(".arr").textContent = th.dataset.k===sortKey ? (sortDir>0?" ▲":" ▼") : "";
      th.classList.toggle("active",th.dataset.k===sortKey);
    });
  }
  sec.querySelectorAll("th.sortable").forEach(th=>th.addEventListener("click",()=>{
    const k=th.dataset.k;
    if(k===sortKey) sortDir=-sortDir; else {sortKey=k; sortDir=(k==="pv"||k==="prono"||k==="reel"||k==="accord"||k==="points"||k==="mpp")?-1:1;}
    refresh();
  }));
  ["calSearch","calGroup","calType"].forEach(id=>sec.querySelector("#"+id).addEventListener("input",refresh));
  const jumpNext=()=>{
    sec.querySelector("#calSearch").value=""; sec.querySelector("#calGroup").value=""; sec.querySelector("#calType").value="";
    sortKey="date"; sortDir=1; refresh();
    const row=sec.querySelector("#cal-next");
    if(row){row.scrollIntoView({behavior:"smooth",block:"center"});
      row.classList.add("flash"); setTimeout(()=>row.classList.remove("flash"),1200);}
  };
  sec.querySelector("#calNext").addEventListener("click",jumpNext);
  if(NEXT_I<0) sec.querySelector("#calNext").style.display="none";
  sec._jumpNext=jumpNext;
  refresh();
}

/* ---------- Groupes ---------- */
function renderGroupes(){
  const jump=D.meta.groupes.map(g=>`<a href="#g-${g}" class="grouptag" style="text-decoration:none">${g}</a>`).join(" ");
  let html=`<h1>Pronostics par groupe</h1>
    <p class="lead">Classement final projeté et les 6 matchs de chaque groupe.</p>
    <div class="controls">${jump}</div>`;
  D.meta.groupes.forEach(g=>{
    const ms=D.predictions.filter(p=>p.groupe===g);
    const scores=ms.map(p=>{
      const mpp=p.mpp_v==null?'<span class="muted">—</span>':`${Math.round(p.mpp_v*100)}/${Math.round(p.mpp_n*100)}/${Math.round(p.mpp_d*100)}`;
      return `<tr class="clik" data-match="${p._i}"><td class="c">J${p.journee}</td>
        <td><span class="vs">${team(p.dom)}<span class="muted">–</span>${team(p.ext)}</span></td>
        <td class="c">${scoreBadge(p.bd,p.be)}</td>
        <td style="min-width:120px">${probBar(p.pv,p.pn,p.pd)}</td>
        <td class="c num">${mpp}</td></tr>`;
    }).join("");
    const stand=D.standings[g].map(r=>`<tr>
        <td class="c num">${r.rang}</td>
        <td><span class="vs">${teamLink(r.equipe)}</span> ${stPill(r.statut)}${coachLine(r.equipe)}</td>
        <td class="c num"><strong>${r.pts}</strong></td><td class="c num">${r.g}-${r.n}-${r.p}</td>
        <td class="c num">${r.bp}:${r.bc}</td><td class="c num">${r.diff>=0?'+':''}${r.diff}</td></tr>`).join("");
    html+=`<div class="group-block">
      <div class="group-head"><span class="grouptag">${g}</span><h2 id="g-${g}">Groupe ${g}</h2></div>
      <p class="group-an">${esc(D.analyses[g])}</p>
      <div class="grid2">
        <div><h3>Classement final</h3><div class="tablewrap"><table>
          <thead><tr><th class="c">#</th><th>Équipe</th><th class="c">Pts</th><th class="c">V-N-D</th><th class="c">Buts</th><th class="c">Diff</th></tr></thead>
          <tbody>${stand}</tbody></table></div></div>
        <div><h3>Matchs</h3><div class="tablewrap"><table>
          <thead><tr><th class="c">J</th><th>Match</th><th class="c">Score</th><th>P(V/N/D)</th><th class="c">mpp</th></tr></thead>
          <tbody>${scores}</tbody></table></div></div>
      </div>
    </div>`;
  });
  document.getElementById("groupes").innerHTML=html;
}

/* ---------- Qualifiés ---------- */
function renderQualifies(){
  const col=(icon,title,arr)=>`<div class="card"><h3><i class="mdi ${icon}"></i> ${title}</h3>
     ${arr.map(x=>`<div class="winrow"><span class="grouptag">${x.groupe}</span>${flag(x.equipe)}<span>${esc(x.equipe)}</span></div>`).join("")}</div>`;
  const t3=D.qualifiers.troisiemes.map(r=>`<tr style="opacity:${r.qualifie?1:.5}">
     <td class="c"><span class="grouptag">${r.groupe}</span></td><td><span class="vs">${team(r.equipe)}</span></td>
     <td class="c">${r.pts}</td><td class="c">${r.diff>=0?'+':''}${r.diff}</td><td class="c">${r.bp}</td>
     <td class="c">${r.qualifie?'✅':'❌'}</td></tr>`).join("");
  document.getElementById("qualifies").innerHTML=`
    <h1>Les 32 qualifiés</h1>
    <p class="lead">Format 2026 : 12 premiers + 12 deuxièmes + <strong>8 meilleurs troisièmes</strong>.</p>
    <div class="cards">
      ${col("mdi-medal","1ers de groupe",D.qualifiers.premiers)}
      ${col("mdi-medal-outline","2es de groupe",D.qualifiers.deuxiemes)}
      ${col("mdi-numeric-3-circle-outline","Meilleurs 3es",D.qualifiers.meilleurs3)}
    </div>
    <div class="note" style="margin-top:16px">La course aux meilleurs 3es est très serrée (7 équipes à 4 pts).
    Après revue des agents critiques, la <strong>Bosnie</strong> se qualifie et l'<strong>Iran</strong> sort.</div>
    <h2>Classement des troisièmes</h2>
    <div class="tablewrap"><table>
      <thead><tr><th class="c">Gr.</th><th>Équipe</th><th class="c">Pts</th><th class="c">Diff</th><th class="c">BP</th><th class="c">Qualifié</th></tr></thead>
      <tbody>${t3}</tbody></table></div>
    <div class="chart" id="chartThirds"></div>`;
}

/* ---------- Phase finale (tours à élimination directe, un bloc par tour) ---------- */
function renderSeiziemes(){
  const el=document.getElementById("seiziemes");
  if(!el) return;
  const rounds=D.koRounds||[];
  if(!rounds.length){ el.innerHTML=`<h1>Phase finale</h1><p class="lead">Données indisponibles.</p>`; return; }
  const dfmt=iso=>{const d=new Date(iso);return d.toLocaleDateString("fr-FR",{day:"numeric",month:"long"});};
  const delo=v=>`<span class="delo ${v>=0?'up':'down'}">${v>=0?'▲':'▼'} ${v>=0?'+':''}${v} Elo</span>`;
  const bar=(a,n,b)=>`<div class="pbar"><span style="width:${(a*100).toFixed(1)}%" class="pb pb-w"></span>`+
      `<span style="width:${(n*100).toFixed(1)}%" class="pb pb-n"></span><span style="width:${(b*100).toFixed(1)}%" class="pb pb-l"></span></div>`;
  const blocks=rounds.map(rnd=>{
    const cards=(rnd.matches||[]).map(m=>{
      const domFav=m.qDom>=m.qExt;
      const fav=domFav?m.dom:m.ext, pf=domFav?m.qDom:m.qExt;
      return `<div class="r32card">
        <div class="r32head"><span class="r32date"><i class="mdi mdi-calendar-blank-outline"></i> ${dfmt(m.date)}</span>
          <span class="r32qual">Qualif : <b>${esc(fav)}</b> ${pct(pf)}</span></div>
        <div class="r32teams">
          <div class="r32t ${domFav?'fav':''}">${team(m.dom)}<small>${m.rkDom}<sup>e</sup> · ${delo(m.dEloDom)}</small></div>
          <span class="r32score">${esc(m.score)}</span>
          <div class="r32t r32t--r ${!domFav?'fav':''}">${team(m.ext)}<small>${m.rkExt}<sup>e</sup> · ${delo(m.dEloExt)}</small></div>
        </div>
        <div class="r32row"><span class="r32lab">Modèle 90′</span>${bar(m.pDom,m.pNul,m.pExt)}
          <span class="r32num">${pct(m.pDom)}/${pct(m.pNul)}/${pct(m.pExt)}</span></div>
        <div class="r32row"><span class="r32lab">Marché MPP</span>${bar(m.mppDom,m.mppNul,m.mppExt)}
          <span class="r32num">${pct(m.mppDom)}/${pct(m.mppNul)}/${pct(m.mppExt)}</span></div>
        <div class="r32parc"><span><span class="grouptag">${esc(m.dom)}</span> ${esc(m.parcDom)}</span>
          <span><span class="grouptag">${esc(m.ext)}</span> ${esc(m.parcExt)}</span></div>
      </div>`;
    }).join("");
    const report = rnd.reportMarkdown ?
      `<div class="report" style="margin-top:26px">${window.marked?marked.parse(rnd.reportMarkdown):esc(rnd.reportMarkdown)}</div>` : "";
    return `<h1>${esc(rnd.title)}</h1>
      <div class="r32grid">${cards}</div>
      ${report}`;
  }).join(`<hr style="margin:34px 0"/>`);
  el.innerHTML=`
    <p class="lead">Modèle <strong>ré-évalué après chaque tour</strong> : l'Elo de chaque équipe est mis à jour
    match par match (dynamique + parcours réel), puis injecté dans le moteur Poisson, avec résolution du
    nul (prolongation / t.a.b.). Barres = Victoire / Nul / Défaite sur 90′.</p>
    ${blocks}`;
}

/* ---------- Analyses : structure HTML (les graphes SVG sont injectés par drawAnalyses) ---------- */
function renderAnalyses(){
  document.getElementById("analyses").innerHTML=`
    <h1>Analyses</h1>
    <p class="lead">Graphiques interactifs (survol pour le détail). Thème clair/sombre pris en charge.</p>

    <h2>Niveau des groupes</h2>
    <p class="an-intro">Elo moyen des 4 équipes — quels groupes sont les plus relevés (moustache = min→max du groupe).</p>
    <div class="chart" id="chartGroupStrength"></div>

    <h2>Attaque vs défense (pronostiqué)</h2>
    <p class="an-intro">Buts <strong>marqués</strong> (axe X) contre <strong>encaissés</strong> (axe Y, inversé) sur les 3 matchs.
    En haut à droite = marque beaucoup ET encaisse peu. Couleur = sort final, taille = points.</p>
    <div class="chart" id="chartAttDef"></div>

    <h2>Points &amp; qualification</h2>
    <p class="an-intro">Total de points pronostiqués des 48 équipes (vert = 1er/2e, or = 3e qualifié, rouge = éliminé).</p>
    <div class="chart" id="chartPoints"></div>

    <h2>Notre modèle vs <a class="mpp-link" href="https://mpp.football" target="_blank" rel="noopener"><img class="mpp-logo" src="mpp-logo.png" alt="mpp.football"></a></h2>
    <p class="an-intro" id="mppNote">Proba de victoire à domicile : notre modèle (axe X) vs mpp (axe Y). Points sur la diagonale = accord.</p>
    <div class="chart" id="chartMpp"></div>

    <h2>Distribution des buts par match</h2>
    <p class="an-intro">Nombre total de buts pronostiqués par match. Beaucoup de matchs à 2 buts → scores serrés (souvent 1-1).</p>
    <div class="chart" id="chartGoals"></div>

    <h2>Validation sur la J1 réelle</h2>
    <p class="an-intro">Répartition des issues (V / N / D) réelles vs prédites par le modèle Elo « avant-match ».</p>
    <div class="chart" id="chartJ1"></div>

    <h2>Explorateur de match — matrice des scores (Poisson)</h2>
    <p class="an-intro">Choisissez un match : probabilité de chaque score exact selon le modèle (buts attendus λ).</p>
    <div class="selrow"><label for="matchSel">Match :</label><select id="matchSel"></select></div>
    <div class="cv-cap" id="matrixCap"></div>
    <div class="chart" id="chartMatrix"></div>`;
}

/* ---------- Graphiques interactifs (ECharts) ---------- */
/* ECharts gère le hover/tooltip/légende/zoom. Robustesse conteneur : hauteur explicite +
   instance.resize() au show, au resize fenêtre et via ResizeObserver (couvre display:none -> block). */
function pois(k,l){let p=Math.exp(-l);for(let i=1;i<=k;i++)p*=l/i;return p;}
function scoreMatrix(ld,le,n){const z=[];for(let i=0;i<=n;i++){const row=[];for(let j=0;j<=n;j++)row.push(pois(i,ld)*pois(j,le)*100);z.push(row);}return {z};}

const drawn={analyses:false,thirds:false};
let _calJumped=false;
const ECH={};                              // id -> instance ECharts
function ecInit(id,height){
  const el=document.getElementById(id); if(!el||!window.echarts) return null;
  el.style.height=(height||360)+"px"; el.style.width="100%";
  let c=ECH[id]; if(!c){ c=echarts.init(el,null,{renderer:"svg"}); ECH[id]=c; }
  return c;
}
function ecSet(id,height,opt){ const c=ecInit(id,height); if(c){ c.setOption(opt,true); c.resize(); } return c; }
function ecResizeIn(sec){ document.querySelectorAll("#"+sec+" .chart").forEach(el=>{const c=ECH[el.id]; if(c) c.resize();}); }
let _ecRO=null;
function ecObserve(sec){
  if(window.ResizeObserver){ if(!_ecRO) _ecRO=new ResizeObserver(es=>{for(const e of es){const c=ECH[e.target.id]; if(c) c.resize();}});
    document.querySelectorAll("#"+sec+" .chart").forEach(el=>_ecRO.observe(el)); }
}
function ecTheme(){ const t=THEME[curTheme()]; return {
  font:t.font, grid:t.grid, paper:t.paper, accent:t.accent, muted:"#8a98a8" }; }
function ecBase(extra){
  const t=ecTheme();
  return Object.assign({
    textStyle:{color:t.font,fontFamily:'Inter, system-ui, sans-serif'},
    grid:{left:6,right:18,top:34,bottom:10,containLabel:true},
    tooltip:{trigger:'item',confine:true,backgroundColor:t.paper,borderColor:t.grid,textStyle:{color:t.font}},
    legend:{top:4,textStyle:{color:t.font},inactiveColor:t.muted}
  },extra||{});
}
const ecCat=()=>{const t=ecTheme();return {axisLine:{lineStyle:{color:t.grid}},axisLabel:{color:t.font},axisTick:{show:false},splitLine:{show:false}};};
const ecVal=()=>{const t=ecTheme();return {axisLine:{show:false},axisLabel:{color:t.font},splitLine:{lineStyle:{color:t.grid}}};};

/* --- 1) Elo moyen par groupe (barre = moyenne, points = 4 équipes) --- */
function drawGroupStrength(){
  const t=ecTheme();
  const gs=D.meta.groupes.map(g=>{const es=D.ratings.filter(x=>x.equipe&&x.groupe===g);
    const vals=es.map(x=>x.elo); const mean=vals.reduce((a,b)=>a+b,0)/vals.length;
    return {g,mean,es};}).sort((a,b)=>b.mean-a.mean);
  const cats=gs.map(d=>"Gr. "+d.g);
  const scatter=[]; gs.forEach((d,i)=>d.es.forEach(x=>scatter.push([i,x.elo,x.equipe])));
  ecSet("chartGroupStrength",420,ecBase({
    legend:{show:false},
    tooltip:{trigger:'axis',axisPointer:{type:'shadow'},backgroundColor:t.paper,borderColor:t.grid,textStyle:{color:t.font}},
    xAxis:Object.assign({type:'category',data:cats},ecCat()),
    yAxis:Object.assign({type:'value',min:1550,max:1950,name:'Elo'},ecVal()),
    series:[
      {type:'bar',name:'Elo moyen',data:gs.map(d=>Math.round(d.mean)),itemStyle:{color:t.accent,borderRadius:[4,4,0,0]},barWidth:'52%',
       label:{show:true,position:'top',color:t.font,fontSize:11}},
      {type:'scatter',name:'Équipes',data:scatter,symbolSize:7,itemStyle:{color:t.muted,opacity:.8},
       tooltip:{trigger:'item',formatter:p=>`${p.data[2]} · Elo ${p.data[1]}`}}
    ]
  }));
}

/* --- 2) Attaque vs défense (scatter par statut) --- */
function drawAttDef(){
  const t=ecTheme();
  const agg={};D.predictions.forEach(p=>{(agg[p.dom]=agg[p.dom]||{f:0,a:0});(agg[p.ext]=agg[p.ext]||{f:0,a:0});
    agg[p.dom].f+=p.bd;agg[p.dom].a+=p.be;agg[p.ext].f+=p.be;agg[p.ext].a+=p.bd;});
  const stMap={},ptMap={};D.ratings.forEach(x=>stMap[x.equipe]=x.statut);
  Object.values(D.standings).forEach(arr=>arr.forEach(x=>ptMap[x.equipe]=x.pts));
  const byst={"1er":[],"2e":[],"3e":[],out:[]};
  Object.keys(agg).forEach(tm=>{const st=stMap[tm]||'out';byst[st].push([agg[tm].f,agg[tm].a,ptMap[tm]||0,tm]);});
  const nm={"1er":"1er","2e":"2e","3e":"3e qualifié",out:"Éliminé"};
  ecSet("chartAttDef",500,ecBase({
    tooltip:{trigger:'item',backgroundColor:t.paper,borderColor:t.grid,textStyle:{color:t.font},
      formatter:p=>`${p.data[3]}<br>marqués ${p.data[0]} · encaissés ${p.data[1]} · ${p.data[2]} pts`},
    xAxis:Object.assign({type:'value',name:'Buts marqués →'},ecVal()),
    yAxis:Object.assign({type:'value',name:'Buts encaissés',inverse:true},ecVal()),
    series:["1er","2e","3e","out"].map(st=>({type:'scatter',name:nm[st],
      data:byst[st],itemStyle:{color:ST_COLOR[st],borderColor:'#fff',borderWidth:.5,opacity:.88},
      symbolSize:d=>6+d[2]*1.2}))
  }));
}

/* --- 3) Points pronostiqués (barres horizontales, 48) --- */
function drawPoints(){
  const t=ecTheme();const teams=[];Object.values(D.standings).forEach(g=>g.forEach(x=>teams.push(x)));
  teams.sort((a,b)=>a.pts-b.pts||a.diff-b.diff);
  ecSet("chartPoints",1020,ecBase({
    legend:{show:false},grid:{left:6,right:40,top:10,bottom:10,containLabel:true},
    tooltip:{trigger:'item',backgroundColor:t.paper,borderColor:t.grid,textStyle:{color:t.font},formatter:p=>`${p.name} · ${p.value} pts`},
    xAxis:Object.assign({type:'value',name:'Points'},ecVal()),
    yAxis:Object.assign({type:'category',data:teams.map(x=>x.equipe)},ecCat(),{axisLabel:{color:t.font,fontSize:10}}),
    series:[{type:'bar',data:teams.map(x=>({value:x.pts,itemStyle:{color:ST_COLOR[x.statut],borderRadius:[0,3,3,0]}})),
      label:{show:true,position:'right',color:t.font,fontSize:10}}]
  }));
}

/* --- 4) Modèle vs mpp (scatter + diagonale) --- */
function drawMpp(){
  const t=ecTheme();const mp=D.predictions.filter(p=>p.mpp_v!=null);
  const same=p=>Math.sign(p.pv-p.pd)===Math.sign(p.mpp_v-p.mpp_d);
  const agree=mp.filter(same).length;
  const note=document.getElementById("mppNote");
  if(note)note.innerHTML=`Proba de victoire à domicile : notre modèle (axe X) vs mpp (axe Y). Même favori dans <strong>${agree}/${mp.length}</strong> matchs.`;
  const mk=cond=>mp.filter(cond).map(p=>[+(p.pv).toFixed(3),+(p.mpp_v).toFixed(3),p.dom+" – "+p.ext]);
  ecSet("chartMpp",500,ecBase({
    tooltip:{trigger:'item',backgroundColor:t.paper,borderColor:t.grid,textStyle:{color:t.font},
      formatter:p=>p.seriesName==='Diagonale'?'':`${p.data[2]}<br>modèle ${Math.round(p.data[0]*100)}% · mpp ${Math.round(p.data[1]*100)}%`},
    xAxis:Object.assign({type:'value',min:0,max:1,name:'modèle',axisLabel:{formatter:v=>Math.round(v*100)+'%',color:t.font}},ecVal()),
    yAxis:Object.assign({type:'value',min:0,max:1,name:'mpp',axisLabel:{formatter:v=>Math.round(v*100)+'%',color:t.font}},ecVal()),
    series:[
      {type:'line',name:'Diagonale',data:[[0,0],[1,1]],showSymbol:false,lineStyle:{type:'dashed',color:t.muted},silent:true},
      {type:'scatter',name:'Même favori',data:mk(p=>same(p)),symbolSize:10,itemStyle:{color:ST_COLOR['1er'],borderColor:'#fff',borderWidth:.5}},
      {type:'scatter',name:'Favori différent',data:mk(p=>!same(p)),symbolSize:10,itemStyle:{color:ST_COLOR.out,borderColor:'#fff',borderWidth:.5}}
    ]
  }));
}

/* --- 5) Distribution des buts par match (barres) --- */
function drawGoals(){
  const t=ecTheme();const goals={};D.predictions.forEach(p=>{const tot=p.bd+p.be;goals[tot]=(goals[tot]||0)+1;});
  const gk=Object.keys(goals).map(Number).sort((a,b)=>a-b);
  ecSet("chartGoals",360,ecBase({
    legend:{show:false},tooltip:{trigger:'axis',axisPointer:{type:'shadow'},backgroundColor:t.paper,borderColor:t.grid,textStyle:{color:t.font}},
    xAxis:Object.assign({type:'category',data:gk.map(k=>k+(k>1?' buts':' but'))},ecCat()),
    yAxis:Object.assign({type:'value',name:'matchs'},ecVal()),
    series:[{type:'bar',data:gk.map(k=>goals[k]),itemStyle:{color:t.accent,borderRadius:[4,4,0,0]},barWidth:'56%',
      label:{show:true,position:'top',color:t.font,fontSize:11}}]
  }));
}

/* --- 6) Validation J1 : réel vs modèle (barres groupées) --- */
function drawJ1(){
  const t=ecTheme();const iss=s=>{const a=s.split("-").map(Number);return a[0]>a[1]?"V":a[0]<a[1]?"N":"D";};
  const cR={V:0,N:0,D:0},cM={V:0,N:0,D:0};D.j1.forEach(m=>{cR[iss(m.reel)]++;cM[iss(m.modele)]++;});
  const order=["V","N","D"],lab={V:"Victoire dom",N:"Nul",D:"Victoire ext"};
  ecSet("chartJ1",360,ecBase({
    tooltip:{trigger:'axis',axisPointer:{type:'shadow'},backgroundColor:t.paper,borderColor:t.grid,textStyle:{color:t.font}},
    xAxis:Object.assign({type:'category',data:order.map(k=>lab[k])},ecCat()),
    yAxis:Object.assign({type:'value'},ecVal()),
    series:[
      {type:'bar',name:'Réel',data:order.map(k=>cR[k]),itemStyle:{color:ST_COLOR['1er'],borderRadius:[3,3,0,0]},label:{show:true,position:'top',color:t.font,fontSize:11}},
      {type:'bar',name:'Modèle Elo',data:order.map(k=>cM[k]),itemStyle:{color:t.muted,borderRadius:[3,3,0,0]},label:{show:true,position:'top',color:t.font,fontSize:11}}
    ]
  }));
}

/* --- 7) Matrice des scores (heatmap) --- */
function matrixOption(p,n){
  const t=ecTheme();n=n||6;const m=scoreMatrix(p.xg_dom,p.xg_ext,n);
  const data=[];let maxz=0;for(let i=0;i<=n;i++)for(let j=0;j<=n;j++){const v=+m.z[i][j].toFixed(1);if(v>maxz)maxz=v;data.push([j,i,v]);}
  const ax=[...Array(n+1).keys()];
  return ecBase({
    legend:{show:false},grid:{left:6,right:14,top:14,bottom:46,containLabel:true},
    tooltip:{position:'top',backgroundColor:t.paper,borderColor:t.grid,textStyle:{color:t.font},
      formatter:p2=>`score ${p2.data[1]}-${p2.data[0]} : ${p2.data[2]}%`},
    xAxis:Object.assign({type:'category',data:ax,name:'Buts '+p.ext,nameLocation:'middle',nameGap:26,splitArea:{show:true}},ecCat()),
    yAxis:Object.assign({type:'category',data:ax,name:'Buts '+p.dom,nameLocation:'middle',nameGap:24,inverse:true,splitArea:{show:true}},ecCat()),
    visualMap:{min:0,max:maxz||1,show:false,inRange:{color:[t.paper,t.accent]}},
    series:[{type:'heatmap',data:data,label:{show:true,formatter:p2=>p2.data[2]>=5?Math.round(p2.data[2]):'',color:t.font,fontSize:9},
      itemStyle:{borderColor:t.grid,borderWidth:.5},emphasis:{itemStyle:{borderColor:t.accent,borderWidth:2}}}]
  });
}

/* --- Comparaison (fiche match) : barres groupées --- */
function compareOption(p){
  const t=ecTheme();const agg={};D.predictions.forEach(q=>{(agg[q.dom]=agg[q.dom]||{f:0,a:0});(agg[q.ext]=agg[q.ext]||{f:0,a:0});
    agg[q.dom].f+=q.bd;agg[q.dom].a+=q.be;agg[q.ext].f+=q.be;agg[q.ext].a+=q.bd;});
  const ptsOf=tm=>{for(const g of Object.values(D.standings)){const r=g.find(x=>x.equipe===tm);if(r)return r.pts;}return 0;};
  const cats=["Points","Buts marqués","Buts encaissés"];
  const vy=tm=>[ptsOf(tm),(agg[tm]||{}).f||0,(agg[tm]||{}).a||0];
  return ecBase({
    grid:{left:6,right:14,top:34,bottom:10,containLabel:true},
    tooltip:{trigger:'axis',axisPointer:{type:'shadow'},backgroundColor:t.paper,borderColor:t.grid,textStyle:{color:t.font}},
    xAxis:Object.assign({type:'category',data:cats},ecCat()),
    yAxis:Object.assign({type:'value'},ecVal()),
    series:[
      {type:'bar',name:p.dom,data:vy(p.dom),itemStyle:{color:t.accent,borderRadius:[3,3,0,0]},label:{show:true,position:'top',color:t.font,fontSize:10}},
      {type:'bar',name:p.ext,data:vy(p.ext),itemStyle:{color:t.muted,borderRadius:[3,3,0,0]},label:{show:true,position:'top',color:t.font,fontSize:10}}
    ]
  });
}

function drawThirds(){
  if(drawn.thirds)return;drawn.thirds=true;const t=ecTheme();
  const t3=D.qualifiers.troisiemes.slice().reverse();   // meilleur en haut
  ecSet("chartThirds",460,ecBase({
    legend:{show:false},grid:{left:6,right:60,top:10,bottom:10,containLabel:true},
    tooltip:{trigger:'item',backgroundColor:t.paper,borderColor:t.grid,textStyle:{color:t.font},formatter:p=>`${p.name} · ${p.value} pts`},
    xAxis:Object.assign({type:'value',name:'Points'},ecVal()),
    yAxis:Object.assign({type:'category',data:t3.map(x=>x.groupe+" · "+x.equipe)},ecCat(),{axisLabel:{color:t.font,fontSize:10}}),
    series:[{type:'bar',data:t3.map(x=>({value:x.pts,itemStyle:{color:x.qualifie?'#2ecc71':'#ef5350',borderRadius:[0,3,3,0]}})),
      label:{show:true,position:'right',color:t.font,fontSize:10,formatter:p=>`${t3[p.dataIndex].pts} pts, ${t3[p.dataIndex].diff>=0?'+':''}${t3[p.dataIndex].diff}`}}]
  }));
}

function drawAnalyses(){
  if(drawn.analyses)return;drawn.analyses=true;
  drawGroupStrength(); drawAttDef(); drawPoints(); drawMpp(); drawGoals(); drawJ1();
  const sel=document.getElementById("matchSel");
  if(sel){ sel.innerHTML=D.predictions.map((p,i)=>`<option value="${i}">${esc(p.groupe)} · ${esc(p.dom)} – ${esc(p.ext)}</option>`).join("");
    const cap=document.getElementById("matrixCap");
    const draw=i=>{const p=D.predictions[i]; if(cap)cap.textContent=`${p.dom} ${p.bd}-${p.be} ${p.ext} — λ ${p.xg_dom.toFixed(2)} / ${p.xg_ext.toFixed(2)}`;
      ecSet("chartMatrix",440,matrixOption(p,6));};
    const def=D.predictions.findIndex(p=>p.dom==="France");sel.value=def>=0?def:0;draw(+sel.value);
    sel.onchange=()=>draw(+sel.value);
  }
}

/* ---------- Rapport & Méthodo ---------- */
function renderRapport(){
  const body = window.marked ? marked.parse(D.reportMarkdown) : `<pre style="white-space:pre-wrap">${esc(D.reportMarkdown)}</pre>`;
  document.getElementById("rapport").innerHTML=`<div class="report">${body}</div>`;
}
function renderMethodo(){
  const acc=Math.round(D.meta.j1_accuracy*100);
  document.getElementById("methodo").innerHTML=`
    <h1>Méthodologie détaillée</h1>
    <p class="lead">Une approche <strong>hybride</strong> : un modèle statistique objectif (Poisson sur base Elo)
    sert de socle, puis une dizaine d'<strong>agents experts</strong> l'ajustent et le critiquent. Voici chaque étape.</p>

    <div class="method">

      <div class="card"><h3><span class="step">1</span> Forces des équipes (Elo)</h3>
        <p class="muted">Chaque équipe reçoit une note <strong>Elo</strong> (eloratings.net + classement FIFA de juin 2026),
        affinée par les agents selon la forme récente. L'Elo encode le niveau relatif : un écart de ~100 points
        correspond à un favori net, ~300+ à une domination probable.</p></div>

      <div class="card"><h3><span class="step">2</span> Du Elo aux buts attendus (λ)</h3>
        <p class="muted">Pour un match, on transforme la différence Elo en <strong>buts attendus</strong> de chaque équipe :</p>
        <div class="formula">dr = Elo_dom − Elo_ext (+ avantage hôte pour 🇲🇽 🇺🇸 🇨🇦)
supremacy = 3.6 · tanh(dr / 350)        ← écart de buts attendu (borné)
buts_totaux = 2.5 + 0.35 · |supremacy|  ← un match déséquilibré produit plus de buts
λ_dom = (buts_totaux + supremacy) / 2
λ_ext = (buts_totaux − supremacy) / 2</div>
        <p class="muted">La fonction <span class="kbd">tanh</span> <em>borne</em> la supremacy (un mismatch extrême ne donne pas
        20 buts), et l'avantage hôte ajoute ~65 points d'Elo aux nations organisatrices à domicile.</p></div>

      <div class="card"><h3><span class="step">3</span> Loi de Poisson → score & probabilités</h3>
        <p class="muted">On suppose que les buts de chaque équipe suivent une <strong>loi de Poisson</strong> de moyenne λ.
        Le produit des deux lois donne la probabilité de <em>chaque score exact</em> (matrice visible dans
        <a href="#analyses" data-jump="analyses">Analyses → Explorateur de match</a>). On en tire :</p>
        <ul>
          <li><strong>le score le plus probable</strong> (case de plus forte probabilité) — c'est le pronostic affiché ;</li>
          <li><strong>P(V/N/D)</strong> en sommant les cases « victoire dom », « nul », « victoire ext ».</li>
        </ul></div>

      <div class="card"><h3><span class="step">4</span> Pourquoi des matchs nuls ? (score modal ≠ issue)</h3>
        <p class="muted">Le modèle sort le <strong>score exact le plus probable</strong>, pas l'issue 1/N/2 la plus probable.
        Le mode d'une loi de Poisson est <span class="kbd">⌊λ⌋</span> : quand les deux λ sont entre 1 et 2 (match serré/fermé),
        le score le plus probable est <strong>1-1</strong>, même si « victoire » reste l'issue agrégée la plus probable
        (ces victoires sont éparpillées sur 2-0, 2-1, 3-1…). C'est pourquoi on voit des 1-1 alors que les cotes mpp
        donnent un favori — et c'est la stratégie qui maximise le taux de <em>score exact</em>.</p></div>

      <div class="card"><h3><span class="step">5</span> Couche multi-agents (génération + critique)</h3>
        <ul>
          <li><strong>12 agents prédicteurs</strong> (1 par groupe) : recherche web de la forme 2024-2026 (amicaux,
          qualifs, Ligue des Nations, Copa América, Euro, CAN, Coupe d'Asie), des <strong>effectifs</strong> et des
          <strong>blessures/absences</strong>, pour ajuster le baseline (ex. buteur blessé, équipe déjà qualifiée à la J3, style défensif).</li>
          <li><strong>4 agents critiques</strong> : revue adverse du réalisme (majorité de scores 0-3), des biais
          (excès de nuls, favoritisme), de la cohérence interne (différences de buts, départages plausibles).</li>
          <li><strong>Réconciliation</strong> : arbitrage des divergences prédicteur/critique, puis gel des pronostics finaux.</li>
        </ul></div>

      <div class="card"><h3><span class="step">6</span> Classements & qualifiés</h3>
        <p class="muted">Les classements appliquent les <strong>départages FIFA</strong> (points → diff. de buts →
        buts marqués → confrontation directe). Format 2026 : <strong>32 qualifiés</strong> = 12 premiers + 12 deuxièmes
        + <strong>8 meilleurs troisièmes</strong>.</p></div>

      <div class="card"><h3><span class="step">7</span> Données & validation</h3>
        <p class="muted">Le tournoi ayant débuté, la <strong>J1 = résultats réels</strong> ; <strong>J2/J3 = pronostics</strong>.
        Confronté à la J1, le modèle Elo « avant-match » n'a anticipé que <strong>${acc}%</strong> des issues
        (J1 exceptionnellement nulle : 8 nuls sur 16) — ce qui justifie la couche d'experts. Les probas <strong>mpp</strong>
        proviennent de l'export mpp.football (56 matchs à venir).</p></div>

    </div>

    <div class="note" style="margin-top:16px">⚠️ <strong>Limites</strong> : un pronostic n'est pas une certitude.
    La course aux meilleurs 3es se joue à un but près ; plusieurs départages sont des quasi-pile-ou-face.
    Hors périmètre : la phase à élimination directe. Horaires CEST indicatifs.</div>`;
}

/* ---------- Détail d'un match (modale) ---------- */
function recentLine(r){
  const c=r.res==="V"?"rl-w":r.res==="N"?"rl-d":"rl-l";
  return `<div class="rl"><span class="rl-b ${c}">${r.res}</span>
    <span class="rl-meta">${esc(r.date)} · ${esc(compShort(r.comp))}</span>
    <span class="rl-m">${esc(r.match)}</span></div>`;
}
function teamPanel(name){
  const det=DETAILS[name]||null;
  const rt=D.ratings.find(t=>t.equipe===name)||{};
  let h=`<div class="card tp"><div class="tp-head">${flag(name)}<strong>${esc(name)}</strong>
    <span class="faint">Elo ${rt.elo||"–"} · FIFA ${rt.fifa_rank||"–"}</span></div>`;
  const coach=teamCoach(name);
  if(coach) h+=`<p class="muted tp-coach"><i class="mdi mdi-account-tie"></i> Sélectionneur : <strong>${esc(coach)}</strong></p>`;
  if(det){
    if(det.note) h+=`<p class="muted tp-note">${esc(det.note)}</p>`;
    h+=`<div class="tp-sub">Forme récente (12 mois)</div>`;
    h+=(det.recent&&det.recent.length)?det.recent.map(recentLine).join(""):'<span class="faint">—</span>';
    h+=`<div class="tp-sub">Blessés / absents</div>`;
    h+=(det.injuries&&det.injuries.length)?`<ul class="inj">${det.injuries.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`
      :'<span class="faint">Aucun absent notable connu.</span>';
  } else h+=`<p class="faint">Données détaillées indisponibles pour cette équipe.</p>`;
  h+=`<div class="extlinks">
    <a class="extlink" target="_blank" rel="noopener" href="${tmUrl(name)}"><i class="mdi mdi-account-group"></i>Effectif (Transfermarkt)</a>
  </div>`;
  return h+`</div>`;
}
/* Confrontations directes (H2H) rendues dans l'app à partir de window.DATA.h2h */
function h2hCard(p){
  const rec=(D.h2h||{})[p.dom+" | "+p.ext];
  const more=`<div class="extlinks"><a class="extlink" target="_blank" rel="noopener" href="${h2hUrl(p.dom,p.ext)}"><i class="mdi mdi-open-in-new"></i>Voir le détail (AiScore)</a></div>`;
  let inner;
  if(rec&&rec.meetings&&rec.meetings.length){
    let w=0,n=0,l=0;
    const rows=rec.meetings.map(m=>{
      const ds=m.home===p.dom?m.hs:m.as, xs=m.home===p.dom?m.as:m.hs;   // score vu côté p.dom
      if(ds>xs)w++; else if(ds<xs)l++; else n++;
      const cls=m.hs>m.as?"sc-win":m.hs<m.as?"sc-loss":"sc-draw";
      return `<tr><td class="faint" style="white-space:nowrap">${esc(m.date||"")}</td>
        <td class="faint">${esc(compShort(m.comp))}</td>
        <td class="c"><span class="vs">${flag(m.home)}<span class="tn">${esc(m.home)}</span></span></td>
        <td class="c"><span class="scoreb ${cls}">${m.hs}-${m.as}</span></td>
        <td class="c"><span class="vs">${flag(m.away)}<span class="tn">${esc(m.away)}</span></span></td></tr>`;
    }).join("");
    inner=`<div class="h2h-tally">${rec.meetings.length} dernière${rec.meetings.length>1?"s":""} confrontation${rec.meetings.length>1?"s":""} ·
      <b style="color:var(--green)">${w} V</b> · <b>${n} N</b> · <b style="color:var(--red)">${l} D</b>
      <span class="faint">(côté ${esc(p.dom)})</span></div>
      <div class="tablewrap"><table><tbody>${rows}</tbody></table></div>`;
  } else {
    inner=`<p class="faint">Aucune confrontation directe récente connue entre ${esc(p.dom)} et ${esc(p.ext)}.</p>`;
  }
  return `<div class="card" style="margin-top:14px"><h3><i class="mdi mdi-history"></i> Confrontations directes</h3>${inner}${more}</div>`;
}
let _modal=null;
function ensureModal(){
  if(_modal) return _modal;
  _modal=document.createElement("div"); _modal.id="matchModal"; _modal.className="modal"; _modal.hidden=true;
  _modal.innerHTML=`<div class="modal-bg"></div><div class="modal-card">
    <button class="modal-x" aria-label="Fermer">✕</button><div id="mBody"></div></div>`;
  document.body.appendChild(_modal);
  const close=()=>{_modal.hidden=true;document.body.style.overflow="";};
  _modal.querySelector(".modal-bg").onclick=close;
  _modal.querySelector(".modal-x").onclick=close;
  document.addEventListener("keydown",e=>{if(e.key==="Escape")close();});
  return _modal;
}
function openMatch(i){
  const p=D.predictions[i]; if(!p) return;
  const m=ensureModal();
  const typ=p.statut==="joue"?'<span class="pill real">résultat réel</span>':'<span class="pill prono">pronostic</span>';
  const mpp=p.mpp_v==null?'<span class="faint">indisponible</span>'
    :`${Math.round(p.mpp_v*100)} / ${Math.round(p.mpp_n*100)} / ${Math.round(p.mpp_d*100)}`;
  document.getElementById("mBody").innerHTML=`
    <div class="mm-head">
      <div class="mm-teams">${team(p.dom)} ${scoreBadge(p.bd,p.be)} ${team(p.ext)}</div>
      <div class="faint">Groupe ${p.groupe} · J${p.journee} · ${esc(p.kickoff_cest)} CEST · ${typ}</div>
    </div>
    <div class="mm-grid">
      <div class="card">
        <h3><i class="mdi mdi-chart-donut"></i> Probabilités</h3>
        <div style="margin:6px 0 10px">${probBar(p.pv,p.pn,p.pd)}</div>
        <div class="mm-kv"><span>Victoire ${esc(p.dom)}</span><b>${Math.round(p.pv*100)}%</b></div>
        <div class="mm-kv"><span>Match nul</span><b>${Math.round(p.pn*100)}%</b></div>
        <div class="mm-kv"><span>Victoire ${esc(p.ext)}</span><b>${Math.round(p.pd*100)}%</b></div>
        <div class="mm-kv"><span>mpp.football (1/N/2)</span><b>${mpp}</b></div>
        ${p.pts_mod!=null?`<div class="mm-kv"><span>Points pris — cote mpp (modèle · mpp)</span><b>${p.pts_mod} · ${p.pts_mpp==null?'—':p.pts_mpp}</b></div>`:''}
      </div>
      <div class="card">
        <h3><i class="mdi mdi-soccer"></i> Buts attendus (modèle)</h3>
        <div class="mm-kv"><span>λ ${esc(p.dom)}</span><b>${p.xg_dom.toFixed(2)}</b></div>
        <div class="mm-kv"><span>λ ${esc(p.ext)}</span><b>${p.xg_ext.toFixed(2)}</b></div>
        <div class="mm-kv"><span>Score le plus probable</span><b>${p.bd}-${p.be}</b></div>
        <div class="mm-kv"><span>Total de buts attendu</span><b>${(p.xg_dom+p.xg_ext).toFixed(2)}</b></div>
      </div>
    </div>
    ${h2hCard(p)}
    <div class="card" style="margin-top:14px"><h3><i class="mdi mdi-scale-balance"></i> Comparaison (phase de groupes)</h3>
      <div class="chart" id="mCompare"></div></div>
    <div class="card" style="margin-top:14px"><h3><i class="mdi mdi-grid"></i> Matrice des scores (Poisson)</h3>
      <div class="chart" id="mMatrix"></div></div>
    <div class="grid2" style="margin-top:14px">${teamPanel(p.dom)}${teamPanel(p.ext)}</div>`;
  m.hidden=false; document.body.style.overflow="hidden";
  m.querySelector(".modal-card").scrollTop=0;
  // ECharts : la modale est désormais visible -> init + resize dans le frame suivant
  if(ECH.mCompare){ECH.mCompare.dispose();delete ECH.mCompare;} if(ECH.mMatrix){ECH.mMatrix.dispose();delete ECH.mMatrix;}
  requestAnimationFrame(()=>{ ecSet("mCompare",300,compareOption(p)); ecSet("mMatrix",420,matrixOption(p,6)); });
}
document.addEventListener("click",e=>{
  const tr=e.target.closest("[data-match]");
  if(tr){e.preventDefault(); openMatch(+tr.dataset.match);}
});

/* ---------- Navigation ---------- */
function show(sec){
  document.querySelectorAll(".sec").forEach(s=>s.classList.toggle("active",s.id===sec));
  document.querySelectorAll("#nav a").forEach(a=>a.classList.toggle("active",a.dataset.sec===sec));
  // Dessin différé : la section vient d'être affichée -> draw + resize ECharts sur la largeur réelle
  if(sec==="analyses") requestAnimationFrame(()=>{drawAnalyses(); ecObserve("analyses"); ecResizeIn("analyses"); setTimeout(()=>ecResizeIn("analyses"),120);});
  if(sec==="qualifies") requestAnimationFrame(()=>{drawThirds(); ecObserve("qualifies"); ecResizeIn("qualifies"); setTimeout(()=>ecResizeIn("qualifies"),120);});
  if(sec==="calendrier" && !_calJumped && NEXT_I>=0){_calJumped=true;
    const s=document.getElementById("calendrier");
    requestAnimationFrame(()=>{ if(s&&s._jumpNext) s._jumpNext(); });
    return;
  }
  window.scrollTo({top:0,behavior:"smooth"});
}
document.addEventListener("click",e=>{
  const a=e.target.closest("[data-sec],[data-jump]");
  if(!a) return;
  const sec=a.dataset.sec||a.dataset.jump;
  if(sec){e.preventDefault(); location.hash=sec; show(sec);}
});

/* ---------- Init ---------- */
/* ---------- Thème clair / sombre ---------- */
function applyTheme(t){
  document.body.dataset.theme=t;
  try{localStorage.setItem("cdm-theme",t);}catch(e){}
  const lbl=document.getElementById("themeLbl"); if(lbl) lbl.textContent = t==="dark"?"Clair":"Sombre";
  // ECharts : on dispose les instances et on redessine la section active avec les couleurs du thème
  Object.keys(ECH).forEach(id=>{try{ECH[id].dispose();}catch(e){} delete ECH[id];});
  drawn.analyses=false; drawn.thirds=false;
  const active=document.querySelector(".sec.active");
  if(active&&active.id==="analyses") requestAnimationFrame(()=>{drawAnalyses(); ecResizeIn("analyses");});
  if(active&&active.id==="qualifies") requestAnimationFrame(()=>{drawThirds(); ecResizeIn("qualifies");});
}
(function initTheme(){
  let t="light"; try{t=localStorage.getItem("cdm-theme")||"light";}catch(e){}
  document.body.dataset.theme=t;
  document.getElementById("themeBtn").addEventListener("click",()=>applyTheme(curTheme()==="dark"?"light":"dark"));
  const lbl=document.getElementById("themeLbl"); if(lbl) lbl.textContent=t==="dark"?"Clair":"Sombre";
})();

renderAccueil(); renderCalendrier(); renderGroupes(); renderQualifies();
renderSeiziemes(); renderAnalyses(); renderRapport(); renderMethodo();
const SECS=["accueil","calendrier","groupes","qualifies","seiziemes","analyses","rapport","methodo"];
const start=(location.hash||"#accueil").slice(1);
show(SECS.includes(start)?start:"accueil");
/* ECharts : recalage des graphes au redimensionnement de la fenêtre */
window.addEventListener("resize",()=>{const a=document.querySelector(".sec.active"); if(a) ecResizeIn(a.id);});
