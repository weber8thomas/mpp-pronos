/* Dashboard Pronostics CDM 2026 — rendu 100% client à partir de window.DATA */
const D = window.DATA;
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
/* Infos équipe (entraîneur + lien effectif Transfermarkt), depuis window.DATA.teams */
const TEAMS = D.teams || {};
const tmUrl = t => (TEAMS[t] && TEAMS[t].tm) || ("https://www.transfermarkt.com/schnellsuche/ergebnis/schnellsuche?query="+encodeURIComponent(t));
/* nom d'équipe : lien vers l'effectif Transfermarkt (s'ouvre dans un nouvel onglet) */
const team = t => `${flag(t)}<a class="tn" href="${tmUrl(t)}" target="_blank" rel="noopener noreferrer" title="Effectif de ${esc(t)} sur Transfermarkt">${esc(t)}</a>`;
const coachLine = t => { const c = TEAMS[t] && TEAMS[t].coach; return c?`<small class="coach"><i class="mdi mdi-account-tie"></i>${esc(c)}</small>`:""; };

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
  document.getElementById("accueil").innerHTML=`
   <div class="hero">
     <img class="hero-emblem" src="emblem.svg" alt="Emblème Coupe du Monde 2026" />
     <div class="eyebrow">FIFA World Cup · USA · Canada · Mexique</div>
     <h1>Pronostics de la phase de groupes</h1>
     <p class="lead">Les <strong>72 matchs</strong> des 12 groupes, pronostiqués via une méthode hybride :
     un modèle de <strong>Poisson</strong> (basé sur l'Elo) ajusté et critiqué par une dizaine d'<strong>agents experts</strong>.
     J1 = résultats réels · J2/J3 = pronostics. Probas <strong>mpp</strong> issues de mpp.football.</p>
   </div>
   <div class="kpis">
     <div class="kpi"><i class="mdi mdi-soccer-field"></i><div class="v">72</div><div class="l">matchs pronostiqués</div></div>
     <div class="kpi"><i class="mdi mdi-check-decagram-outline"></i><div class="v">${m.n_joues}</div><div class="l">déjà joués (réels)</div></div>
     <div class="kpi"><i class="mdi mdi-trophy-outline"></i><div class="v">32</div><div class="l">qualifiés (12+12+8)</div></div>
     <div class="kpi"><i class="mdi mdi-target"></i><div class="v">${m.j1_accuracy!=null?Math.round(m.j1_accuracy*100)+"%":"–"}</div><div class="l">précision sur matchs joués (${m.n_joues})</div></div>
   </div>
   <div class="card"><h3><i class="mdi mdi-trophy"></i> Vainqueurs de groupe pronostiqués</h3><div class="winners">${vain}</div></div>`;
   document.getElementById("accueil").innerHTML+=`
   <div class="grid2" style="margin-top:16px">
     <div class="card"><h3>Comment lire</h3>
       <p class="muted">Chaque match affiche le <strong>score pronostiqué</strong> et les probabilités
       Victoire / Nul / Défaite (barre verte / grise / rouge). La colonne <strong>mpp</strong> donne
       les probas 1/N/2 de mpp.football pour les 56 matchs à venir.</p></div>
     <div class="card"><h3>Navigation</h3>
       <p class="muted"><a href="#calendrier" data-jump="calendrier">Calendrier</a> complet ·
       <a href="#groupes" data-jump="groupes">Groupes</a> (scores + classements) ·
       <a href="#qualifies" data-jump="qualifies">Qualifiés</a> ·
       <a href="#analyses" data-jump="analyses">Analyses</a> interactives ·
       <a href="#rapport" data-jump="rapport">Rapport</a> complet.</p></div>
   </div>`;
}

/* ---------- Calendrier ---------- */
function matchRow(p){
  const typ = p.statut==="joue"?`<span class="pill real">réel</span>`:`<span class="pill prono">prono</span>`;
  const mpp = p.mpp_v==null?'<span class="muted">—</span>':`${Math.round(p.mpp_v*100)}/${Math.round(p.mpp_n*100)}/${Math.round(p.mpp_d*100)}`;
  const dt = p.kickoff_cest.replace(/-/g,"/").slice(5,16);
  return `<tr data-g="${p.groupe}" data-s="${p.statut}" data-t="${esc(p.dom+' '+p.ext)}">
    <td>${dt}</td><td class="c"><span class="grouptag">${p.groupe}</span></td>
    <td><span class="vs">${team(p.dom)}<span class="muted">–</span>${team(p.ext)}</span></td>
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
      return `<tr><td class="c">J${p.journee}</td>
        <td><span class="vs">${team(p.dom)}<span class="muted">–</span>${team(p.ext)}</span></td>
        <td class="c">${scoreBadge(p.bd,p.be)}</td>
        <td style="min-width:120px">${probBar(p.pv,p.pn,p.pd)}</td>
        <td class="c num">${mpp}</td></tr>`;
    }).join("");
    const stand=D.standings[g].map(r=>`<tr>
        <td class="c num">${r.rang}</td>
        <td><span class="vs">${team(r.equipe)}</span> ${stPill(r.statut)}${coachLine(r.equipe)}</td>
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

/* ---------- Analyses (Plotly) ---------- */
const LAYOUT = extra => {
  const t = THEME[curTheme()]; extra = extra || {};
  const ax = base => Object.assign({gridcolor:t.grid, zerolinecolor:t.grid, linecolor:t.grid,
    tickfont:{color:t.font}, titlefont:{color:t.font}}, base||{});
  return Object.assign({
    paper_bgcolor:t.paper, plot_bgcolor:t.paper,
    font:{color:t.font, size:12, family:"Inter, system-ui, sans-serif"},
    margin:{l:10,r:10,t:54,b:40}, legend:{orientation:"h",y:1.12,x:0},
    title:{font:{family:"Sora, Inter, sans-serif", size:15}}
  }, extra, {xaxis:ax(extra.xaxis), yaxis:ax(extra.yaxis)});
};
const CFG={responsive:true,displayModeBar:false};

function renderAnalyses(){
  document.getElementById("analyses").innerHTML=`
    <h1>Analyses</h1>
    <p class="lead">Graphiques interactifs : survol pour le détail, zoom, légende cliquable. Thème clair/sombre pris en charge.</p>

    <h2>Niveau des groupes</h2>
    <p class="an-intro">Elo moyen des 4 équipes — quels groupes sont les plus relevés (barres = min→max du groupe).</p>
    <div class="chart" id="chartGroupStrength"></div>

    <h2>Attaque vs défense (pronostiqué)</h2>
    <p class="an-intro">Buts <strong>marqués</strong> (axe X) contre <strong>encaissés</strong> (axe Y, inversé) sur les 3 matchs.
    En haut à droite = marque beaucoup ET encaisse peu. Couleur = sort final, taille = points.</p>
    <div class="chart" id="chartAttDef"></div>

    <h2>Points & qualification</h2>
    <p class="an-intro">Total de points pronostiqués des 48 équipes (vert = 1er/2e, or = 3e qualifié, rouge = éliminé).</p>
    <div class="chart" id="chartPoints"></div>

    <h2>Notre modèle vs mpp.football</h2>
    <p class="an-intro" id="mppNote">Proba de victoire à domicile : notre modèle (X) vs mpp (Y). Points sur la diagonale = accord.</p>
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
/* Poisson (client) pour la matrice des scores */
function pois(k,l){let p=Math.exp(-l);for(let i=1;i<=k;i++)p*=l/i;return p;}
function scoreMatrix(ld,le,n){
  const z=[],txt=[];
  for(let i=0;i<=n;i++){const row=[],tr=[];for(let j=0;j<=n;j++){const v=pois(i,ld)*pois(j,le)*100;row.push(v);tr.push(v>=1?v.toFixed(0):"");}z.push(row);txt.push(tr);}
  return {z,txt};
}
const drawn={analyses:false,thirds:false};
function resizeIn(sec){document.querySelectorAll("#"+sec+" .js-plotly-plot").forEach(el=>Plotly.Plots.resize(el));}

function drawThirds(){
  if(drawn.thirds) return; drawn.thirds=true;
  const t3=D.qualifiers.troisiemes;
  Plotly.newPlot("chartThirds",[{
    type:"bar",orientation:"h",x:t3.map(t=>t.pts).reverse(),y:t3.map(t=>t.groupe+" · "+t.equipe).reverse(),
    marker:{color:t3.map(t=>t.qualifie?"#2ecc71":"#ef5350").reverse()},
    text:t3.map(t=>t.pts+" pts, "+(t.diff>=0?'+':'')+t.diff).reverse(),textposition:"outside",
    hovertemplate:"%{y}<extra></extra>"
  }],LAYOUT({height:420,title:"Course aux 8 meilleurs 3es (vert = qualifié)"}),CFG);
}

function drawAnalyses(){
  if(drawn.analyses) return; drawn.analyses=true;
  const ACC=THEME[curTheme()].accent;

  // 1) Niveau des groupes (Elo moyen + min/max)
  const gs=D.meta.groupes.map(g=>{
    const es=D.ratings.filter(t=>t.groupe===g).map(t=>t.elo);
    const mean=es.reduce((a,b)=>a+b,0)/es.length;
    return {g,mean,min:Math.min(...es),max:Math.max(...es)};
  }).sort((a,b)=>b.mean-a.mean);
  Plotly.newPlot("chartGroupStrength",[{
    type:"bar",x:gs.map(d=>"Groupe "+d.g),y:gs.map(d=>Math.round(d.mean)),
    marker:{color:gs.map(d=>d.mean),colorscale:[[0,"#9fb2c6"],[1,ACC]],line:{width:0}},
    error_y:{type:"data",symmetric:false,array:gs.map(d=>d.max-d.mean),arrayminus:gs.map(d=>d.mean-d.min),color:"#8a98a8",thickness:1.2,width:4},
    text:gs.map(d=>Math.round(d.mean)),textposition:"outside",
    hovertemplate:"%{x}<br>Elo moyen %{y}<extra></extra>"
  }],LAYOUT({height:420,title:"Elo moyen par groupe (barre d'erreur = min→max)",
     yaxis:{title:"Elo",range:[1550,1950]}}),CFG);

  // 2) Attaque vs défense (buts marqués / encaissés pronostiqués)
  const agg={};
  D.predictions.forEach(p=>{
    (agg[p.dom]=agg[p.dom]||{f:0,a:0}); (agg[p.ext]=agg[p.ext]||{f:0,a:0});
    agg[p.dom].f+=p.bd; agg[p.dom].a+=p.be; agg[p.ext].f+=p.be; agg[p.ext].a+=p.bd;
  });
  const stMap={},ptMap={};
  D.ratings.forEach(t=>stMap[t.equipe]=t.statut);
  Object.values(D.standings).forEach(arr=>arr.forEach(t=>ptMap[t.equipe]=t.pts));
  const ad=Object.keys(agg).map(t=>({t,f:agg[t].f,a:agg[t].a,st:stMap[t],pts:ptMap[t]||0}));
  const adTrace=st=>({type:"scatter",mode:"markers",name:ST_LABEL[st]==="Élim."?"Éliminé":ST_LABEL[st],
    x:ad.filter(d=>d.st===st).map(d=>d.f), y:ad.filter(d=>d.st===st).map(d=>d.a),
    text:ad.filter(d=>d.st===st).map(d=>d.t),
    marker:{size:ad.filter(d=>d.st===st).map(d=>8+d.pts*1.4),color:ST_COLOR[st],line:{color:"#fff",width:.5},opacity:.9},
    hovertemplate:"%{text}<br>marqués %{x} · encaissés %{y}<extra></extra>"});
  Plotly.newPlot("chartAttDef",["1er","2e","3e","out"].map(adTrace),
    LAYOUT({height:520,title:"Attaque vs défense — buts marqués (x) / encaissés (y)",
      xaxis:{title:"Buts marqués (3 matchs)"},yaxis:{title:"Buts encaissés",autorange:"reversed"}}),CFG);

  // 3) Points & qualification
  const teams=[]; Object.values(D.standings).forEach(g=>g.forEach(t=>teams.push(t)));
  teams.sort((a,b)=>a.pts-b.pts || a.diff-b.diff);
  Plotly.newPlot("chartPoints",[{
    type:"bar",orientation:"h",x:teams.map(t=>t.pts),y:teams.map(t=>t.equipe),
    marker:{color:teams.map(t=>ST_COLOR[t.statut])},text:teams.map(t=>t.pts),textposition:"outside",
    hovertemplate:"%{y}<br>%{x} pts<extra></extra>"
  }],LAYOUT({height:1050,title:"Points pronostiqués (48 équipes)"}),CFG);

  // 4) Modèle vs mpp
  const mp=D.predictions.filter(p=>p.mpp_v!=null);
  const same=p=>Math.sign(p.pv-p.pd)===Math.sign(p.mpp_v-p.mpp_d);
  const agree=mp.filter(same).length;
  const note=document.getElementById("mppNote");
  if(note) note.innerHTML=`Proba de victoire à domicile : notre modèle (X) vs mpp (Y). Même favori dans <strong>${agree}/${mp.length}</strong> matchs.`;
  const mk=(cond,col,name)=>({type:"scatter",mode:"markers",name,
     x:mp.filter(cond).map(p=>p.pv),y:mp.filter(cond).map(p=>p.mpp_v),
     text:mp.filter(cond).map(p=>p.dom+" – "+p.ext),
     marker:{size:10,color:col,line:{color:"#fff",width:.5}},
     hovertemplate:"%{text}<br>modèle %{x:.0%} · mpp %{y:.0%}<extra></extra>"});
  Plotly.newPlot("chartMpp",[
     mk(p=>same(p),ST_COLOR["1er"],"Même favori"),
     mk(p=>!same(p),ST_COLOR.out,"Favori différent"),
     {type:"scatter",mode:"lines",x:[0,1],y:[0,1],line:{dash:"dash",color:"#8a98a8"},hoverinfo:"skip",showlegend:false}
  ],LAYOUT({height:520,title:"P(victoire domicile) — modèle vs mpp",
     xaxis:{range:[0,1],title:"modèle",tickformat:".0%"},yaxis:{range:[0,1],title:"mpp",tickformat:".0%"}}),CFG);

  // 5) Distribution des buts par match
  const goals={};
  D.predictions.forEach(p=>{const tot=p.bd+p.be;goals[tot]=(goals[tot]||0)+1;});
  const gk=Object.keys(goals).map(Number).sort((a,b)=>a-b);
  Plotly.newPlot("chartGoals",[{
    type:"bar",x:gk.map(k=>k+" but"+(k>1?"s":"")),y:gk.map(k=>goals[k]),
    marker:{color:ACC},text:gk.map(k=>goals[k]),textposition:"outside",
    hovertemplate:"%{x} : %{y} matchs<extra></extra>"
  }],LAYOUT({height:380,title:"Nombre de buts par match (72 matchs)",yaxis:{title:"matchs"}}),CFG);

  // 6) Validation J1 : issues réelles vs modèle (groupé V/N/D)
  const iss=s=>{const[a,b]=s.split("-").map(Number);return a>b?"V":a<b?"N":"D";};
  const cntReal={V:0,N:0,D:0},cntMod={V:0,N:0,D:0};
  D.j1.forEach(m=>{cntReal[iss(m.reel)]++;cntMod[iss(m.modele)]++;});
  const order=["V","N","D"],lab={V:"Victoire dom",N:"Nul",D:"Victoire ext"};
  Plotly.newPlot("chartJ1",[
    {type:"bar",name:"Réel",x:order.map(k=>lab[k]),y:order.map(k=>cntReal[k]),marker:{color:ST_COLOR["1er"]},text:order.map(k=>cntReal[k]),textposition:"outside"},
    {type:"bar",name:"Modèle Elo",x:order.map(k=>lab[k]),y:order.map(k=>cntMod[k]),marker:{color:"#8a98a8"},text:order.map(k=>cntMod[k]),textposition:"outside"}
  ],LAYOUT({height:380,barmode:"group",
     title:`J1 réelle vs modèle — ${Math.round(D.meta.j1_accuracy*100)}% d'issues correctes (8 nuls sur 16)`}),CFG);

  // 7) Explorateur de match -> matrice Poisson
  const sel=document.getElementById("matchSel");
  if(sel){
    sel.innerHTML=D.predictions.map((p,i)=>`<option value="${i}">${p.groupe} · ${esc(p.dom)} – ${esc(p.ext)}</option>`).join("");
    const drawMatrix=i=>{
      const p=D.predictions[i],n=6,m=scoreMatrix(p.xg_dom,p.xg_ext,n);
      Plotly.newPlot("chartMatrix",[{
        type:"heatmap",z:m.z,text:m.txt,texttemplate:"%{text}",textfont:{size:10},
        x:[...Array(n+1).keys()],y:[...Array(n+1).keys()],
        colorscale:[[0,THEME[curTheme()].paper],[1,ACC]],showscale:false,
        hovertemplate:"score %{y}-%{x} : %{z:.1f}%<extra></extra>"
      }],LAYOUT({height:460,
         title:`${esc(p.dom)} ${p.bd}-${p.be} ${esc(p.ext)} — λ ${p.xg_dom.toFixed(2)} / ${p.xg_ext.toFixed(2)}`,
         xaxis:{title:"Buts "+esc(p.ext),dtick:1},yaxis:{title:"Buts "+esc(p.dom),dtick:1}}),CFG);
    };
    const def=D.predictions.findIndex(p=>p.dom==="France");
    sel.value=def>=0?def:0; drawMatrix(sel.value);
    sel.onchange=()=>drawMatrix(sel.value);
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

/* ---------- Navigation ---------- */
function show(sec){
  document.querySelectorAll(".sec").forEach(s=>s.classList.toggle("active",s.id===sec));
  document.querySelectorAll("#nav a").forEach(a=>a.classList.toggle("active",a.dataset.sec===sec));
  // Dessin différé : la section vient d'être affichée, on attend le layout (largeur réelle)
  if(sec==="analyses") requestAnimationFrame(()=>{drawAnalyses(); resizeIn("analyses"); setTimeout(()=>resizeIn("analyses"),80);});
  if(sec==="qualifies") requestAnimationFrame(()=>{drawThirds(); resizeIn("qualifies"); setTimeout(()=>resizeIn("qualifies"),80);});
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
  ["chartGroupStrength","chartAttDef","chartPoints","chartMpp","chartGoals","chartJ1","chartMatrix","chartThirds"].forEach(id=>{
    const el=document.getElementById(id); if(el&&el.data&&window.Plotly) Plotly.purge(el);
  });
  drawn.analyses=false; drawn.thirds=false;
  const active=document.querySelector(".sec.active");
  requestAnimationFrame(()=>{
    if(active&&active.id==="analyses"){drawAnalyses(); resizeIn("analyses");}
    if(active&&active.id==="qualifies"){drawThirds(); resizeIn("qualifies");}
  });
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
/* ResizeObserver : redimensionne chaque plot quand son conteneur change de taille.
   Couvre nativement le passage display:none -> block (navigation) et le responsive,
   sans dépendre de timings : c'est le correctif de positionnement des graphiques. */
if(window.ResizeObserver){
  const ro=new ResizeObserver(entries=>{
    for(const e of entries){
      if(e.contentRect.width<=0||!window.Plotly) continue;
      const plot=e.target.querySelector(".js-plotly-plot");
      if(plot) Plotly.Plots.resize(plot);
    }
  });
  document.querySelectorAll(".chart").forEach(c=>ro.observe(c));
}else{
  window.addEventListener("resize",()=>{if(drawn.analyses)resizeIn("analyses");if(drawn.thirds)resizeIn("qualifies");});
}
