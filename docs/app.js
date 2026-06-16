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
const scoreBadge = (bd,be) => {
  const c = bd>be ? "sc-win" : bd<be ? "sc-loss" : "sc-draw";
  const t = bd>be ? "Victoire domicile" : bd<be ? "Victoire extérieur" : "Match nul";
  return `<span class="scoreb ${c}" title="${t}">${bd}-${be}</span>`;
};

/* ---------- Accueil ---------- */
function renderAccueil(){
  const m=D.meta;
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
         <div class="cover">Phase de groupes <b>72 matchs</b> couverts · sur <b>104</b> au total (élimination directe à venir)</div>
       </div>
     </div>
     <p class="lead">Pronostics via une méthode hybride : un modèle de <strong>Poisson</strong> (basé sur l'Elo)
     ajusté et critiqué par une dizaine d'<strong>agents experts</strong>.
     J1 = résultats réels · J2/J3 = pronostics. Probas <strong>mpp</strong> issues de
     <a class="mpp-link" href="https://mpp.football" target="_blank" rel="noopener"><img class="mpp-logo" src="mpp-logo.png" alt="mpp.football"></a>.
     <em>Astuce : cliquez un match pour ouvrir sa fiche détaillée.</em></p>
   </div>
   <div class="kpis">
     <div class="kpi"><i class="mdi mdi-soccer-field"></i><div class="v">72</div><div class="l">matchs pronostiqués</div></div>
     <div class="kpi"><i class="mdi mdi-check-decagram-outline"></i><div class="v">${m.n_joues}</div><div class="l">déjà joués (réels)</div></div>
     <div class="kpi"><i class="mdi mdi-trophy-outline"></i><div class="v">32</div><div class="l">qualifiés (12+12+8)</div></div>
     <div class="kpi"><i class="mdi mdi-target"></i><div class="v">${m.j1_accuracy!=null?Math.round(m.j1_accuracy*100)+"%":"–"}</div><div class="l">précision sur matchs joués (${m.n_joues})</div></div>
   </div>
   <h2>Explorer</h2>
   <div class="navtiles">${tiles}</div>
   <div class="card" style="margin-top:18px"><h3><i class="mdi mdi-trophy"></i> Vainqueurs de groupe pronostiqués</h3><div class="winners">${vain}</div></div>`;
}

/* ---------- Calendrier ---------- */
function matchRow(p){
  const typ = p.statut==="joue"?`<span class="pill real">réel</span>`:`<span class="pill prono">prono</span>`;
  const mpp = p.mpp_v==null?'<span class="muted">—</span>':`${Math.round(p.mpp_v*100)}/${Math.round(p.mpp_n*100)}/${Math.round(p.mpp_d*100)}`;
  const dt = p.kickoff_cest.replace(/-/g,"/").slice(5,16);
  const nx = p._i===NEXT_I;
  return `<tr class="clik${nx?' isnext':''}"${nx?' id="cal-next"':''} data-match="${p._i}" data-g="${p.groupe}" data-s="${p.statut}" data-t="${esc(p.dom+' '+p.ext)}">
    <td>${dt}</td><td class="c"><span class="grouptag">${p.groupe}</span></td>
    <td><div class="matchcell"><span class="vs">${team(p.dom)}<span class="muted">–</span>${team(p.ext)}</span>${nx?'<span class="nextbadge">à suivre</span>':''}</div></td>
    <td class="c">${scoreBadge(p.bd,p.be)}</td><td class="c">${typ}</td>
    <td>${probBar(p.pv,p.pn,p.pd)}</td><td class="c">${mpp}</td></tr>`;
}
const CAL_COLS=[
  {k:"date",  l:"Date · h (CEST)", cls:""},
  {k:"groupe",l:"Gr.",            cls:"c"},
  {k:"match", l:"Match",          cls:""},
  {k:"prono", l:"Prono",          cls:"c"},
  {k:"type",  l:"Type",           cls:"c"},
  {k:"pv",    l:"P(V/N/D) modèle",cls:""},
  {k:"mpp",   l:"mpp 1/N/2",      cls:"c"},
];
const CAL_KEY={
  date:p=>p.kickoff_utc,
  groupe:p=>p.groupe+"|"+p.kickoff_utc,
  match:p=>p.dom.toLowerCase(),
  prono:p=>p.bd+p.be,
  type:p=>p.statut,
  pv:p=>p.pv,
  mpp:p=>p.mpp_v==null?-1:p.mpp_v,
};
function renderCalendrier(){
  const opts=["<option value=''>Tous les groupes</option>"].concat(D.meta.groupes.map(g=>`<option value="${g}">Groupe ${g}</option>`)).join("");
  const sec=document.getElementById("calendrier");
  let sortKey="date", sortDir=1;
  sec.innerHTML=`
    <h1>Calendrier &amp; pronostics</h1>
    <p class="lead">Les 72 matchs. <strong>Cliquez un en-tête</strong> pour trier (date, groupe, score, proba…) ;
    filtrez par équipe, groupe ou statut. Heure <strong>CEST</strong> indicative.</p>
    <div class="legend">Score : <span class="scoreb sc-win">2-0</span> victoire domicile ·
      <span class="scoreb sc-draw">1-1</span> nul ·
      <span class="scoreb sc-loss">0-2</span> victoire extérieur</div>
    <div class="controls">
      <input id="calSearch" placeholder="Rechercher une équipe…"/>
      <select id="calGroup">${opts}</select>
      <select id="calType"><option value="">Tous statuts</option><option value="joue">Joués</option><option value="a_venir">À venir</option></select>
      <button id="calNext" type="button" class="btn-next"><i class="mdi mdi-fast-forward-outline"></i> Prochain match</button>
      <span id="calCount" class="faint" style="align-self:center"></span>
    </div>
    <div class="tablewrap"><table>
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
      `<tr><td colspan="7" class="c muted" style="padding:18px">Aucun match.</td></tr>`;
    sec.querySelector("#calCount").textContent=`${arr.length} match${arr.length>1?"s":""}`;
    sec.querySelectorAll("th.sortable").forEach(th=>{
      th.querySelector(".arr").textContent = th.dataset.k===sortKey ? (sortDir>0?" ▲":" ▼") : "";
      th.classList.toggle("active",th.dataset.k===sortKey);
    });
  }
  sec.querySelectorAll("th.sortable").forEach(th=>th.addEventListener("click",()=>{
    const k=th.dataset.k;
    if(k===sortKey) sortDir=-sortDir; else {sortKey=k; sortDir=(k==="pv"||k==="prono"||k==="mpp")?-1:1;}
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
    <div class="chart" id="chartMatrix"></div>`;
}

/* ---------- Graphiques : rendu SVG maison (responsive via viewBox, sans dépendance) ---------- */
/* Un <svg viewBox> en width:100% s'adapte tout seul à la largeur du conteneur :
   plus aucun problème de positionnement/overlap/affichage lié à Plotly. */
function svgWrap(w,h,inner,cls){
  return `<svg class="cv ${cls||''}" viewBox="0 0 ${w} ${h}" width="100%" preserveAspectRatio="xMidYMin meet" role="img">${inner}</svg>`;
}
function svT(x,y,s,o){o=o||{};const f=o.cls?'':` fill="${o.fill||'currentColor'}"`;
  return `<text x="${(+x).toFixed(1)}" y="${(+y).toFixed(1)}" font-size="${o.fs||13}"${f}${o.cls?` class="${o.cls}"`:''} text-anchor="${o.anchor||'start'}"${o.weight?` font-weight="${o.weight}"`:''}${o.op!=null?` opacity="${o.op}"`:''}>${esc(s)}</text>`;}
function svR(x,y,w,h,o){o=o||{};const f=o.cls?'':` fill="${o.fill||'currentColor'}"`;
  return `<rect x="${(+x).toFixed(1)}" y="${(+y).toFixed(1)}" width="${Math.max(0,w).toFixed(1)}" height="${Math.max(0,h).toFixed(1)}" rx="${o.rx==null?2:o.rx}"${f}${o.cls?` class="${o.cls}"`:''}${o.op!=null?` opacity="${o.op}"`:''}>${o.title?`<title>${esc(o.title)}</title>`:''}</rect>`;}
function svL(x1,y1,x2,y2,o){o=o||{};
  return `<line x1="${(+x1).toFixed(1)}" y1="${(+y1).toFixed(1)}" x2="${(+x2).toFixed(1)}" y2="${(+y2).toFixed(1)}"${o.cls?` class="${o.cls}"`:` stroke="${o.stroke||'currentColor'}"`} stroke-width="${o.sw||1}"${o.dash?` stroke-dasharray="${o.dash}"`:''}${o.op!=null?` opacity="${o.op}"`:''}/>`;}
function svC(cx,cy,r,o){o=o||{};
  return `<circle cx="${(+cx).toFixed(1)}" cy="${(+cy).toFixed(1)}" r="${(+r).toFixed(1)}"${o.cls?` class="${o.cls}"`:` fill="${o.fill||'currentColor'}"`}${o.stroke?` stroke="${o.stroke}" stroke-width="${o.sw||1}"`:''}${o.op!=null?` opacity="${o.op}"`:''}>${o.title?`<title>${esc(o.title)}</title>`:''}</circle>`;}
function cvLegend(items){return `<div class="cv-legend">${items.map(it=>`<span><i style="background:${it.c}"></i>${esc(it.l)}</span>`).join("")}</div>`;}
function lerp(a,b,t){const pa=[1,3,5].map(i=>parseInt(a.substr(i,2),16)),pb=[1,3,5].map(i=>parseInt(b.substr(i,2),16));
  const p=pa.map((v,i)=>Math.round(v+(pb[i]-v)*Math.max(0,Math.min(1,t))));return `rgb(${p[0]},${p[1]},${p[2]})`;}

/* Poisson (client) pour la matrice des scores */
function pois(k,l){let p=Math.exp(-l);for(let i=1;i<=k;i++)p*=l/i;return p;}
function scoreMatrix(ld,le,n){const z=[];for(let i=0;i<=n;i++){const row=[];for(let j=0;j<=n;j++)row.push(pois(i,ld)*pois(j,le)*100);z.push(row);}return {z};}

const drawn={analyses:false,thirds:false};
let _calJumped=false;

/* --- 1) Elo moyen par groupe (barres + moustache min/max) --- */
function svgGroupStrength(){
  const gs=D.meta.groupes.map(g=>{const es=D.ratings.filter(t=>t.groupe===g).map(t=>t.elo);
    const mean=es.reduce((a,b)=>a+b,0)/es.length;return {g,mean,min:Math.min(...es),max:Math.max(...es)};}).sort((a,b)=>b.mean-a.mean);
  const W=720,H=360,xL=52,xR=706,yT=22,yB=312,vmin=1550,vmax=1950,Y=v=>yB-(v-vmin)/(vmax-vmin)*(yB-yT);
  let s="";
  for(let v=vmin;v<=vmax;v+=100){const y=Y(v);s+=svL(xL,y,xR,y,{cls:'cv-grid'});s+=svT(xL-6,y+4,v,{anchor:'end',fs:11,cls:'cv-mut'});}
  const n=gs.length,slot=(xR-xL)/n,bw=slot*0.56;
  gs.forEach((d,i)=>{const cx=xL+slot*(i+0.5),x=cx-bw/2,y=Y(d.mean);
    s+=svR(x,y,bw,yB-y,{cls:'cv-acc',rx:3,title:`Groupe ${d.g} · Elo moyen ${Math.round(d.mean)}`});
    s+=svL(cx,Y(d.min),cx,Y(d.max),{stroke:'#8a98a8',sw:1.4});
    s+=svL(cx-5,Y(d.max),cx+5,Y(d.max),{stroke:'#8a98a8',sw:1.4});
    s+=svL(cx-5,Y(d.min),cx+5,Y(d.min),{stroke:'#8a98a8',sw:1.4});
    s+=svT(cx,y-6,Math.round(d.mean),{anchor:'middle',fs:11,weight:700});
    s+=svT(cx,yB+17,'Gr. '+d.g,{anchor:'middle',fs:11,cls:'cv-mut'});});
  return svgWrap(W,H,s);
}

/* --- 2) Attaque vs défense (scatter) --- */
function svgAttDef(){
  const agg={};D.predictions.forEach(p=>{(agg[p.dom]=agg[p.dom]||{f:0,a:0});(agg[p.ext]=agg[p.ext]||{f:0,a:0});
    agg[p.dom].f+=p.bd;agg[p.dom].a+=p.be;agg[p.ext].f+=p.be;agg[p.ext].a+=p.bd;});
  const stMap={},ptMap={};D.ratings.forEach(t=>stMap[t.equipe]=t.statut);
  Object.values(D.standings).forEach(arr=>arr.forEach(t=>ptMap[t.equipe]=t.pts));
  const ad=Object.keys(agg).map(t=>({t,f:agg[t].f,a:agg[t].a,st:stMap[t]||'out',pts:ptMap[t]||0}));
  const W=720,H=480,xL=46,xR=702,yT=16,yB=436;
  const maxF=Math.max(...ad.map(d=>d.f))+1,maxA=Math.max(...ad.map(d=>d.a))+1;
  const X=v=>xL+v/maxF*(xR-xL),Y=v=>yT+v/maxA*(yB-yT);
  let s="";
  for(let i=0;i<=maxF;i++){const x=X(i);s+=svL(x,yT,x,yB,{cls:'cv-grid'});s+=svT(x,yB+15,i,{anchor:'middle',fs:10,cls:'cv-mut'});}
  const stepA=Math.max(1,Math.ceil(maxA/8));
  for(let j=0;j<=maxA;j+=stepA){const y=Y(j);s+=svL(xL,y,xR,y,{cls:'cv-grid'});s+=svT(xL-5,y+3,j,{anchor:'end',fs:10,cls:'cv-mut'});}
  ad.forEach(d=>{s+=svC(X(d.f),Y(d.a),4+d.pts*0.7,{fill:ST_COLOR[d.st],op:.85,stroke:'#fff',sw:.5,title:`${d.t} · marqués ${d.f} · encaissés ${d.a} · ${d.pts} pts`});});
  s+=svT((xL+xR)/2,H-3,'Buts marqués →',{anchor:'middle',fs:11,cls:'cv-mut'});
  s+=`<text x="13" y="${(yT+yB)/2}" font-size="11" class="cv-mut" text-anchor="middle" transform="rotate(-90 13 ${((yT+yB)/2).toFixed(1)})">← Buts encaissés</text>`;
  return cvLegend([{c:ST_COLOR['1er'],l:'1er'},{c:ST_COLOR['2e'],l:'2e'},{c:ST_COLOR['3e'],l:'3e qualifié'},{c:ST_COLOR.out,l:'Éliminé'}])+svgWrap(W,H,s);
}

/* --- 3) Points pronostiqués (barres horizontales, 48 équipes) --- */
function svgPoints(){
  const teams=[];Object.values(D.standings).forEach(g=>g.forEach(t=>teams.push(t)));
  teams.sort((a,b)=>b.pts-a.pts||b.diff-a.diff);
  const n=teams.length,rowH=18,padT=8,padB=8,xL=140,xR=686,W=720,H=padT+padB+n*rowH;
  const maxP=Math.max(...teams.map(t=>t.pts),1);let s="";
  teams.forEach((t,i)=>{const y=padT+i*rowH,cy=y+rowH/2,bw=(t.pts/maxP)*(xR-xL);
    s+=svT(xL-6,cy+4,t.equipe,{anchor:'end',fs:11});
    s+=svR(xL,y+3,bw,rowH-6,{fill:ST_COLOR[t.statut],rx:2,title:`${t.equipe} · ${t.pts} pts`});
    s+=svT(xL+bw+5,cy+4,t.pts,{fs:11,weight:700});});
  return cvLegend([{c:ST_COLOR['1er'],l:'1er'},{c:ST_COLOR['2e'],l:'2e'},{c:ST_COLOR['3e'],l:'3e qualifié'},{c:ST_COLOR.out,l:'Éliminé'}])+svgWrap(W,H,s);
}

/* --- 4) Modèle vs mpp (scatter + diagonale) --- */
function svgMpp(){
  const mp=D.predictions.filter(p=>p.mpp_v!=null);
  const same=p=>Math.sign(p.pv-p.pd)===Math.sign(p.mpp_v-p.mpp_d);
  const agree=mp.filter(same).length;
  const note=document.getElementById("mppNote");
  if(note)note.innerHTML=`Proba de victoire à domicile : notre modèle (axe X) vs mpp (axe Y). Même favori dans <strong>${agree}/${mp.length}</strong> matchs.`;
  const W=720,H=480,xL=48,xR=702,yT=16,yB=436,X=v=>xL+v*(xR-xL),Y=v=>yB-v*(yB-yT);let s="";
  for(let i=0;i<=10;i+=2){const x=X(i/10),y=Y(i/10);s+=svL(x,yT,x,yB,{cls:'cv-grid'});s+=svL(xL,y,xR,y,{cls:'cv-grid'});
    s+=svT(x,yB+15,i*10+'%',{anchor:'middle',fs:10,cls:'cv-mut'});s+=svT(xL-5,y+3,i*10+'%',{anchor:'end',fs:10,cls:'cv-mut'});}
  s+=svL(X(0),Y(0),X(1),Y(1),{stroke:'#8a98a8',sw:1,dash:'5 4'});
  mp.forEach(p=>{s+=svC(X(p.pv),Y(p.mpp_v),5,{fill:same(p)?ST_COLOR['1er']:ST_COLOR.out,op:.85,stroke:'#fff',sw:.5,title:`${p.dom} – ${p.ext} · modèle ${Math.round(p.pv*100)}% · mpp ${Math.round(p.mpp_v*100)}%`});});
  s+=svT((xL+xR)/2,H-3,'Modèle — P(victoire dom) →',{anchor:'middle',fs:11,cls:'cv-mut'});
  s+=`<text x="13" y="${((yT+yB)/2).toFixed(1)}" font-size="11" class="cv-mut" text-anchor="middle" transform="rotate(-90 13 ${((yT+yB)/2).toFixed(1)})">mpp →</text>`;
  return cvLegend([{c:ST_COLOR['1er'],l:'Même favori'},{c:ST_COLOR.out,l:'Favori différent'}])+svgWrap(W,H,s);
}

/* --- 5) Distribution des buts par match (barres) --- */
function svgGoals(){
  const goals={};D.predictions.forEach(p=>{const tot=p.bd+p.be;goals[tot]=(goals[tot]||0)+1;});
  const gk=Object.keys(goals).map(Number).sort((a,b)=>a-b);
  const W=720,H=340,xL=44,xR=706,yT=20,yB=300,maxV=Math.max(...gk.map(k=>goals[k])),Y=v=>yB-v/maxV*(yB-yT);
  const n=gk.length,slot=(xR-xL)/n,bw=slot*0.6,step=Math.max(1,Math.ceil(maxV/5));let s="";
  for(let i=0;i<=maxV;i+=step){const y=Y(i);s+=svL(xL,y,xR,y,{cls:'cv-grid'});s+=svT(xL-5,y+3,i,{anchor:'end',fs:10,cls:'cv-mut'});}
  gk.forEach((k,i)=>{const cx=xL+slot*(i+0.5),x=cx-bw/2,y=Y(goals[k]);
    s+=svR(x,y,bw,yB-y,{cls:'cv-acc',rx:3,title:`${k} but(s) : ${goals[k]} matchs`});
    s+=svT(cx,y-5,goals[k],{anchor:'middle',fs:11,weight:700});
    s+=svT(cx,yB+16,k+(k>1?' buts':' but'),{anchor:'middle',fs:11,cls:'cv-mut'});});
  return svgWrap(W,H,s);
}

/* --- 6) Validation J1 : réel vs modèle (barres groupées) --- */
function svgJ1(){
  const iss=s=>{const a=s.split("-").map(Number);return a[0]>a[1]?"V":a[0]<a[1]?"N":"D";};
  const cntReal={V:0,N:0,D:0},cntMod={V:0,N:0,D:0};
  D.j1.forEach(m=>{cntReal[iss(m.reel)]++;cntMod[iss(m.modele)]++;});
  const order=["V","N","D"],lab={V:"Victoire dom",N:"Nul",D:"Victoire ext"};
  const W=720,H=340,xL=44,xR=706,yT=20,yB=300,maxV=Math.max(...order.map(k=>Math.max(cntReal[k],cntMod[k])),1),Y=v=>yB-v/maxV*(yB-yT);
  const n=order.length,slot=(xR-xL)/n,bw=slot*0.3,step=Math.max(1,Math.ceil(maxV/5));let s="";
  for(let i=0;i<=maxV;i+=step){const y=Y(i);s+=svL(xL,y,xR,y,{cls:'cv-grid'});s+=svT(xL-5,y+3,i,{anchor:'end',fs:10,cls:'cv-mut'});}
  order.forEach((k,i)=>{const cx=xL+slot*(i+0.5),xr=cx-bw-2,xm=cx+2,yr=Y(cntReal[k]),ym=Y(cntMod[k]);
    s+=svR(xr,yr,bw,yB-yr,{fill:ST_COLOR['1er'],rx:2,title:`Réel ${lab[k]} : ${cntReal[k]}`});
    s+=svR(xm,ym,bw,yB-ym,{fill:'#8a98a8',rx:2,title:`Modèle ${lab[k]} : ${cntMod[k]}`});
    s+=svT(xr+bw/2,yr-4,cntReal[k],{anchor:'middle',fs:10,weight:700});
    s+=svT(xm+bw/2,ym-4,cntMod[k],{anchor:'middle',fs:10,weight:700});
    s+=svT(cx,yB+16,lab[k],{anchor:'middle',fs:11,cls:'cv-mut'});});
  return cvLegend([{c:ST_COLOR['1er'],l:'Réel'},{c:'#8a98a8',l:'Modèle Elo'}])+svgWrap(W,H,s);
}

/* --- 7) Matrice des scores (heatmap) --- */
function svgMatrix(p,n){
  n=n||6;const m=scoreMatrix(p.xg_dom,p.xg_ext,n),th=THEME[curTheme()];
  const W=460,H=440,xL=44,xR=430,yT=24,yB=410,cw=(xR-xL)/(n+1),ch=(yB-yT)/(n+1);
  let maxz=0;m.z.forEach(r=>r.forEach(v=>{if(v>maxz)maxz=v;}));let s="";
  for(let i=0;i<=n;i++)for(let j=0;j<=n;j++){const v=m.z[i][j],x=xL+j*cw,y=yT+i*ch,r=v/(maxz||1);
    const col=lerp(th.paper,th.accent,r),pred=(i===p.bd&&j===p.be);
    s+=`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${cw.toFixed(1)}" height="${ch.toFixed(1)}" fill="${col}" stroke="${pred?th.accent:'rgba(128,128,128,.18)'}" stroke-width="${pred?2:.5}"><title>score ${i}-${j} : ${v.toFixed(1)}%</title></rect>`;
    if(v>=5)s+=svT(x+cw/2,y+ch/2+3,Math.round(v),{anchor:'middle',fs:9,fill:r>0.5?'#fff':th.font});}
  for(let j=0;j<=n;j++)s+=svT(xL+j*cw+cw/2,yB+15,j,{anchor:'middle',fs:10,cls:'cv-mut'});
  for(let i=0;i<=n;i++)s+=svT(xL-6,yT+i*ch+ch/2+3,i,{anchor:'end',fs:10,cls:'cv-mut'});
  s+=svT((xL+xR)/2,H-4,'Buts '+p.ext+' →',{anchor:'middle',fs:11,cls:'cv-mut'});
  s+=`<text x="12" y="${((yT+yB)/2).toFixed(1)}" font-size="11" class="cv-mut" text-anchor="middle" transform="rotate(-90 12 ${((yT+yB)/2).toFixed(1)})">Buts ${esc(p.dom)} →</text>`;
  return svgWrap(W,H,s,'cv-matrix');
}

/* --- Comparaison (fiche match) : barres groupées --- */
function svgCompare(p){
  const agg={};D.predictions.forEach(q=>{(agg[q.dom]=agg[q.dom]||{f:0,a:0});(agg[q.ext]=agg[q.ext]||{f:0,a:0});
    agg[q.dom].f+=q.bd;agg[q.dom].a+=q.be;agg[q.ext].f+=q.be;agg[q.ext].a+=q.bd;});
  const ptsOf=tm=>{for(const g of Object.values(D.standings)){const r=g.find(x=>x.equipe===tm);if(r)return r.pts;}return 0;};
  const cats=[["Points",ptsOf],["Buts marqués",tm=>(agg[tm]||{}).f||0],["Buts encaissés",tm=>(agg[tm]||{}).a||0]];
  const W=560,H=290,xL=40,xR=548,yT=16,yB=244;
  const maxV=Math.max(1,...cats.flatMap(c=>[c[1](p.dom),c[1](p.ext)])),Y=v=>yB-v/maxV*(yB-yT);
  const n=cats.length,slot=(xR-xL)/n,bw=slot*0.28,step=Math.max(1,Math.ceil(maxV/5));let s="";
  for(let i=0;i<=maxV;i+=step){const y=Y(i);s+=svL(xL,y,xR,y,{cls:'cv-grid'});s+=svT(xL-5,y+3,i,{anchor:'end',fs:10,cls:'cv-mut'});}
  cats.forEach((c,i)=>{const cx=xL+slot*(i+0.5),vd=c[1](p.dom),ve=c[1](p.ext),xd=cx-bw-2,xe=cx+2,yd=Y(vd),ye=Y(ve);
    s+=svR(xd,yd,bw,yB-yd,{cls:'cv-acc',rx:2,title:`${p.dom} : ${vd}`});
    s+=svR(xe,ye,bw,yB-ye,{fill:'#8a98a8',rx:2,title:`${p.ext} : ${ve}`});
    s+=svT(xd+bw/2,yd-4,vd,{anchor:'middle',fs:10,weight:700});
    s+=svT(xe+bw/2,ye-4,ve,{anchor:'middle',fs:10,weight:700});
    s+=svT(cx,yB+16,c[0],{anchor:'middle',fs:10,cls:'cv-mut'});});
  return cvLegend([{c:'var(--accent)',l:p.dom},{c:'#8a98a8',l:p.ext}])+svgWrap(W,H,s);
}

function drawThirds(){if(drawn.thirds)return;drawn.thirds=true;
  const el=document.getElementById("chartThirds");if(el)el.innerHTML=svgThirds();}
function svgThirds(){
  const t3=D.qualifiers.troisiemes,n=t3.length,rowH=22,padT=6,padB=6,xL=150,xR=686,W=720,H=padT+padB+n*rowH;
  const maxP=Math.max(...t3.map(t=>t.pts),1);let s="";
  t3.forEach((t,i)=>{const y=padT+i*rowH,cy=y+rowH/2,bw=(t.pts/maxP)*(xR-xL);
    s+=svT(xL-6,cy+4,t.groupe+' · '+t.equipe,{anchor:'end',fs:11});
    s+=svR(xL,y+4,bw,rowH-8,{fill:t.qualifie?'#2ecc71':'#ef5350',rx:2,title:`${t.equipe} · ${t.pts} pts`});
    s+=svT(xL+bw+5,cy+4,`${t.pts} pts, ${t.diff>=0?'+':''}${t.diff}`,{fs:10,weight:700});});
  return cvLegend([{c:'#2ecc71',l:'Qualifié'},{c:'#ef5350',l:'Éliminé'}])+svgWrap(W,H,s);
}

function drawAnalyses(){if(drawn.analyses)return;drawn.analyses=true;
  const set=(id,html)=>{const el=document.getElementById(id);if(el)el.innerHTML=html;};
  set("chartGroupStrength",svgGroupStrength());
  set("chartAttDef",svgAttDef());
  set("chartPoints",svgPoints());
  set("chartMpp",svgMpp());
  set("chartGoals",svgGoals());
  set("chartJ1",svgJ1());
  const sel=document.getElementById("matchSel");
  if(sel){sel.innerHTML=D.predictions.map((p,i)=>`<option value="${i}">${esc(p.groupe)} · ${esc(p.dom)} – ${esc(p.ext)}</option>`).join("");
    const draw=i=>{const p=D.predictions[i],el=document.getElementById("chartMatrix");
      if(el)el.innerHTML=`<div class="cv-cap">${esc(p.dom)} ${p.bd}-${p.be} ${esc(p.ext)} — λ ${p.xg_dom.toFixed(2)} / ${p.xg_ext.toFixed(2)}</div>`+svgMatrix(p,6);};
    const def=D.predictions.findIndex(p=>p.dom==="France");sel.value=def>=0?def:0;draw(+sel.value);
    sel.onchange=()=>draw(+sel.value);}
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
  // rendu SVG immédiat (aucune mesure de conteneur nécessaire)
  const mC=document.getElementById("mCompare"); if(mC) mC.innerHTML=svgCompare(p);
  const mM=document.getElementById("mMatrix"); if(mM) mM.innerHTML=svgMatrix(p,6);
}
document.addEventListener("click",e=>{
  const tr=e.target.closest("[data-match]");
  if(tr){e.preventDefault(); openMatch(+tr.dataset.match);}
});

/* ---------- Navigation ---------- */
function show(sec){
  document.querySelectorAll(".sec").forEach(s=>s.classList.toggle("active",s.id===sec));
  document.querySelectorAll("#nav a").forEach(a=>a.classList.toggle("active",a.dataset.sec===sec));
  // Dessin différé : la section vient d'être affichée, on attend le layout (largeur réelle)
  if(sec==="analyses") drawAnalyses();   // SVG : rendu direct, aucune mesure requise
  if(sec==="qualifies") drawThirds();
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
  // SVG : la plupart des couleurs suivent les variables CSS ; on redessine pour la heatmap (couleurs calculées)
  drawn.analyses=false; drawn.thirds=false;
  const active=document.querySelector(".sec.active");
  if(active&&active.id==="analyses") drawAnalyses();
  if(active&&active.id==="qualifies") drawThirds();
}
(function initTheme(){
  let t="light"; try{t=localStorage.getItem("cdm-theme")||"light";}catch(e){}
  document.body.dataset.theme=t;
  document.getElementById("themeBtn").addEventListener("click",()=>applyTheme(curTheme()==="dark"?"light":"dark"));
  const lbl=document.getElementById("themeLbl"); if(lbl) lbl.textContent=t==="dark"?"Clair":"Sombre";
})();

renderAccueil(); renderCalendrier(); renderGroupes(); renderQualifies();
renderAnalyses(); renderRapport(); renderMethodo();
const SECS=["accueil","calendrier","groupes","qualifies","analyses","rapport","methodo"];
const start=(location.hash||"#accueil").slice(1);
show(SECS.includes(start)?start:"accueil");
/* graphiques SVG responsive (viewBox) : aucun recalcul JS au redimensionnement */
