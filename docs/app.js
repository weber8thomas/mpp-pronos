/* Dashboard Pronostics CDM 2026 — rendu 100% client à partir de window.DATA */
const D = window.DATA;
const ST_COLOR = {"1er":"#2ecc71","2e":"#a8e063","3e":"#f4c430","out":"#ef5350"};
const ST_LABEL = {"1er":"1er (qualifié)","2e":"2e (qualifié)","3e":"3e (meilleur)","out":"Éliminé"};
const pct = x => (x==null?"–":Math.round(x*100)+"%");
const esc = s => String(s).replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));

function probBar(pv,pn,pd){
  const w=x=>Math.round(x*100);
  return `<div class="probrow"><div class="bar" title="V ${pct(pv)} · N ${pct(pn)} · D ${pct(pd)}">
    <i class="v" style="width:${w(pv)}%"></i><i class="n" style="width:${w(pn)}%"></i><i class="d" style="width:${w(pd)}%"></i>
  </div><small>${w(pv)}/${w(pn)}/${w(pd)}</small></div>`;
}
const stPill = s => `<span class="pill ${s==='1er'?'r1':s==='2e'?'r2':s==='3e'?'r3':'out'}">${ST_LABEL[s]}</span>`;

/* ---------- Accueil ---------- */
function renderAccueil(){
  const m=D.meta;
  const vain=D.qualifiers.premiers.map(x=>`<span class="grouptag">${x.groupe}</span> ${esc(x.equipe)}`).join(" · ");
  document.getElementById("accueil").innerHTML=`
   <div class="hero">
     <h1>🏆 Coupe du Monde 2026 — Pronostics de la phase de groupes</h1>
     <p class="lead">Les <strong>72 matchs</strong> des 12 groupes pronostiqués via une méthode hybride :
     un modèle de <strong>Poisson</strong> (basé sur l'Elo) ajusté et critiqué par une dizaine d'<strong>agents experts</strong>.
     J1 = résultats réels · J2/J3 = pronostics. Probas <strong>mpp</strong> issues de mpp.football.</p>
   </div>
   <div class="kpis">
     <div class="kpi"><div class="v">72</div><div class="l">matchs pronostiqués</div></div>
     <div class="kpi"><div class="v">${m.n_joues}</div><div class="l">déjà joués (réels)</div></div>
     <div class="kpi"><div class="v">32</div><div class="l">qualifiés (12+12+8)</div></div>
     <div class="kpi"><div class="v">${m.j1_accuracy!=null?Math.round(m.j1_accuracy*100)+"%":"–"}</div><div class="l">précision modèle sur la J1</div></div>
   </div>
   <div class="card"><h3>🥇 Vainqueurs de groupe pronostiqués</h3><p>${vain}</p></div>
   <div class="grid2" style="margin-top:14px">
     <div class="card"><h3>Comment lire</h3>
       <p class="muted">Chaque match affiche le <strong>score pronostiqué</strong> et les probabilités
       Victoire / Nul / Défaite (barre verte / grise / rouge). La colonne <strong>mpp</strong> donne
       les probas 1/N/2 de mpp.football pour les 56 matchs à venir.</p></div>
     <div class="card"><h3>Navigation</h3>
       <p class="muted">📅 <a href="#calendrier" data-jump="calendrier">Calendrier</a> complet ·
       🅰️ <a href="#groupes" data-jump="groupes">Groupes</a> (scores + classements) ·
       🎟️ <a href="#qualifies" data-jump="qualifies">Qualifiés</a> ·
       📊 <a href="#analyses" data-jump="analyses">Analyses</a> interactives ·
       📄 <a href="#rapport" data-jump="rapport">Rapport</a> complet.</p></div>
   </div>`;
}

/* ---------- Calendrier ---------- */
function matchRow(p){
  const typ = p.statut==="joue"?`<span class="pill real">réel</span>`:`<span class="pill prono">prono</span>`;
  const mpp = p.mpp_v==null?'<span class="muted">—</span>':`${Math.round(p.mpp_v*100)}/${Math.round(p.mpp_n*100)}/${Math.round(p.mpp_d*100)}`;
  const dt = p.kickoff_cest.replace(/-/g,"/").slice(5,16);
  return `<tr data-g="${p.groupe}" data-s="${p.statut}" data-t="${esc(p.dom+' '+p.ext)}">
    <td>${dt}</td><td class="c"><span class="grouptag">${p.groupe}</span></td>
    <td>${esc(p.dom)} <span class="muted">–</span> ${esc(p.ext)}</td>
    <td class="c score">${p.bd}-${p.be}</td><td class="c">${typ}</td>
    <td>${probBar(p.pv,p.pn,p.pd)}</td><td class="c">${mpp}</td></tr>`;
}
function renderCalendrier(){
  const opts=["<option value=''>Tous les groupes</option>"].concat(D.meta.groupes.map(g=>`<option value="${g}">Groupe ${g}</option>`)).join("");
  document.getElementById("calendrier").innerHTML=`
    <h1>📅 Calendrier chronologique</h1>
    <p class="lead">Les 72 matchs triés par coup d'envoi (heure <strong>CEST</strong>, indicative).
    Barre = probas V/N/D du modèle ; colonne mpp = probas 1/N/2 de mpp.football.</p>
    <div class="controls">
      <input id="calSearch" placeholder="🔎 Rechercher une équipe…"/>
      <select id="calGroup">${opts}</select>
      <select id="calType"><option value="">Tous</option><option value="joue">Joués</option><option value="a_venir">À venir</option></select>
    </div>
    <div class="tablewrap"><table>
      <thead><tr><th>Date · h (CEST)</th><th class="c">Gr.</th><th>Match</th><th class="c">Prono</th><th class="c">Type</th><th>P(V/N/D) modèle</th><th class="c">mpp 1/N/2</th></tr></thead>
      <tbody id="calBody">${D.predictions.map(matchRow).join("")}</tbody>
    </table></div>`;
  const apply=()=>{
    const q=document.getElementById("calSearch").value.toLowerCase();
    const g=document.getElementById("calGroup").value, t=document.getElementById("calType").value;
    document.querySelectorAll("#calBody tr").forEach(tr=>{
      const ok=(!g||tr.dataset.g===g)&&(!t||tr.dataset.s===t)&&(!q||tr.dataset.t.toLowerCase().includes(q));
      tr.style.display=ok?"":"none";
    });
  };
  ["calSearch","calGroup","calType"].forEach(id=>document.getElementById(id).addEventListener("input",apply));
}

/* ---------- Groupes ---------- */
function renderGroupes(){
  const jump=D.meta.groupes.map(g=>`<a href="#g-${g}" class="grouptag" style="text-decoration:none">${g}</a>`).join(" ");
  let html=`<h1>🅰️ Pronostics par groupe</h1><p class="lead">Scores des 6 matchs et classement final projeté de chaque groupe.</p>
    <div class="controls">${jump}</div>`;
  D.meta.groupes.forEach(g=>{
    const ms=D.predictions.filter(p=>p.groupe===g);
    const scores=ms.map(p=>{
      const typ=p.statut==="joue"?'<span class="pill real">réel</span>':'<span class="pill prono">prono</span>';
      const mpp=p.mpp_v==null?'<span class="muted">—</span>':`${Math.round(p.mpp_v*100)}/${Math.round(p.mpp_n*100)}/${Math.round(p.mpp_d*100)}`;
      return `<tr><td class="c">J${p.journee}</td><td>${esc(p.dom)} – ${esc(p.ext)}</td>
        <td class="c score">${p.bd}-${p.be}</td><td class="c">${typ}</td><td>${probBar(p.pv,p.pn,p.pd)}</td><td class="c">${mpp}</td></tr>`;
    }).join("");
    const stand=D.standings[g].map(r=>`<tr>
        <td class="c">${r.rang}</td><td>${esc(r.equipe)} ${stPill(r.statut)}</td>
        <td class="c"><strong>${r.pts}</strong></td><td class="c">${r.g}-${r.n}-${r.p}</td>
        <td class="c">${r.bp}:${r.bc}</td><td class="c">${r.diff>=0?'+':''}${r.diff}</td></tr>`).join("");
    html+=`<h2 id="g-${g}">Groupe ${g}</h2>
      <p class="muted">${esc(D.analyses[g])}</p>
      <div class="grid2">
        <div><h3>Matchs</h3><div class="tablewrap"><table>
          <thead><tr><th class="c">J</th><th>Match</th><th class="c">Score</th><th class="c">Type</th><th>P(V/N/D)</th><th class="c">mpp</th></tr></thead>
          <tbody>${scores}</tbody></table></div></div>
        <div><h3>Classement final</h3><div class="tablewrap"><table>
          <thead><tr><th class="c">#</th><th>Équipe</th><th class="c">Pts</th><th class="c">V-N-D</th><th class="c">Buts</th><th class="c">Diff</th></tr></thead>
          <tbody>${stand}</tbody></table></div></div>
      </div>`;
  });
  document.getElementById("groupes").innerHTML=html;
}

/* ---------- Qualifiés ---------- */
function renderQualifies(){
  const col=(title,arr)=>`<div class="card"><h3>${title}</h3>${arr.map(x=>`<div><span class="grouptag">${x.groupe}</span> ${esc(x.equipe)}</div>`).join("")}</div>`;
  const t3=D.qualifiers.troisiemes.map(r=>`<tr style="opacity:${r.qualifie?1:.5}">
     <td class="c"><span class="grouptag">${r.groupe}</span></td><td>${esc(r.equipe)}</td>
     <td class="c">${r.pts}</td><td class="c">${r.diff>=0?'+':''}${r.diff}</td><td class="c">${r.bp}</td>
     <td class="c">${r.qualifie?'✅':'❌'}</td></tr>`).join("");
  document.getElementById("qualifies").innerHTML=`
    <h1>🎟️ Les 32 qualifiés</h1>
    <p class="lead">Format 2026 : 12 premiers + 12 deuxièmes + <strong>8 meilleurs troisièmes</strong>.</p>
    <div class="cards">
      ${col("🥇 1ers de groupe",D.qualifiers.premiers)}
      ${col("🥈 2es de groupe",D.qualifiers.deuxiemes)}
      ${col("🥉 Meilleurs 3es",D.qualifiers.meilleurs3)}
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
const LAYOUT = extra => Object.assign({
  paper_bgcolor:"#1b2836", plot_bgcolor:"#1b2836", font:{color:"#e8eef5",size:12},
  margin:{l:10,r:10,t:50,b:40}, legend:{orientation:"h",y:1.12,x:0},
  xaxis:{gridcolor:"#2a3a4d",zerolinecolor:"#2a3a4d"}, yaxis:{gridcolor:"#2a3a4d",zerolinecolor:"#2a3a4d"}
},extra||{});
const CFG={responsive:true,displayModeBar:false};

function renderAnalyses(){
  document.getElementById("analyses").innerHTML=`
    <h1>📊 Analyses interactives</h1>
    <p class="lead">Survolez les graphiques (zoom, infobulles). Les mêmes figures, en statique, sont dans le notebook.</p>
    <h2>Forces en présence (Elo)</h2><div class="chart" id="chartElo"></div>
    <h2>Points & qualification</h2><div class="chart" id="chartPoints"></div>
    <h2>Notre modèle vs mpp.football</h2>
    <p class="muted">Proba de victoire à domicile : notre modèle (x) vs mpp (y). Sur la diagonale = accord.</p>
    <div class="chart" id="chartMpp"></div>
    <h2>Validation sur la J1 réelle</h2>
    <p class="muted">Le modèle Elo « avant-match » face aux résultats réels (J1 fut très nulle/surprenante).</p>
    <div class="chart" id="chartJ1"></div>
    <h2>Frise des matchs</h2><div class="chart" id="chartTimeline"></div>`;
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

  // Elo (couleur = statut)
  const r=[...D.ratings].sort((a,b)=>a.elo-b.elo);
  Plotly.newPlot("chartElo",[{
    type:"bar",orientation:"h",x:r.map(t=>t.elo),y:r.map(t=>t.groupe+" · "+t.equipe),
    marker:{color:r.map(t=>ST_COLOR[t.statut])},
    text:r.map(t=>t.elo),textposition:"outside",textfont:{size:9},
    hovertemplate:"%{y}<br>Elo %{x}<extra></extra>"
  }],LAYOUT({height:1000,title:"Notes Elo des 48 équipes (couleur = sort final)",xaxis:{range:[1450,2250],gridcolor:"#2a3a4d"}}),CFG);

  // Points & qualif
  const teams=[]; Object.values(D.standings).forEach(g=>g.forEach(t=>teams.push(t)));
  teams.sort((a,b)=>a.pts-b.pts || a.diff-b.diff);
  Plotly.newPlot("chartPoints",[{
    type:"bar",orientation:"h",x:teams.map(t=>t.pts),y:teams.map(t=>t.equipe),
    marker:{color:teams.map(t=>ST_COLOR[t.statut])},text:teams.map(t=>t.pts),textposition:"outside",
    hovertemplate:"%{y}<br>%{x} pts<extra></extra>"
  }],LAYOUT({height:1050,title:"Points pronostiqués (vert=1er/2e, or=3e qualifié, rouge=éliminé)"}),CFG);

  // Model vs mpp
  const mp=D.predictions.filter(p=>p.mpp_v!=null);
  const same=p=>Math.sign(p.pv-p.pd)===Math.sign(p.mpp_v-p.mpp_d);
  const mk=(cond,col,name)=>({type:"scatter",mode:"markers",name,
     x:mp.filter(p=>cond(p)).map(p=>p.pv),y:mp.filter(p=>cond(p)).map(p=>p.mpp_v),
     text:mp.filter(p=>cond(p)).map(p=>p.dom+" – "+p.ext),
     marker:{size:9,color:col,line:{color:"#fff",width:.5}},
     hovertemplate:"%{text}<br>modèle %{x:.2f} · mpp %{y:.2f}<extra></extra>"});
  Plotly.newPlot("chartMpp",[
     mk(p=>same(p),"#2ecc71","Même favori"),
     mk(p=>!same(p),"#ef5350","Favori différent"),
     {type:"scatter",mode:"lines",x:[0,1],y:[0,1],line:{dash:"dash",color:"#9fb2c6"},hoverinfo:"skip",showlegend:false}
  ],LAYOUT({height:520,title:"P(victoire dom) — modèle (x) vs mpp (y)",
     xaxis:{range:[0,1],title:"modèle",gridcolor:"#2a3a4d"},yaxis:{range:[0,1],title:"mpp",gridcolor:"#2a3a4d"}}),CFG);

  // J1 validation : issues réelles vs modèle
  const cnt=(arr,f)=>arr.filter(f).length;
  const reels=D.j1, accN=cnt(reels,x=>x.ok);
  Plotly.newPlot("chartJ1",[
    {type:"bar",name:"Prédites OK",x:["J1"],y:[accN],marker:{color:"#2ecc71"},text:[accN],textposition:"outside"},
    {type:"bar",name:"Ratées",x:["J1"],y:[reels.length-accN],marker:{color:"#ef5350"},text:[reels.length-accN],textposition:"outside"}
  ],LAYOUT({height:340,barmode:"stack",
     title:`Issues J1 : ${accN}/${reels.length} correctes (${Math.round(D.meta.j1_accuracy*100)}%) — 8 nuls sur 16`}),CFG);

  // Timeline
  const ev=D.predictions.map(p=>({x:p.kickoff_cest.replace(" ","T"),y:p.groupe,
     t:p.dom+" – "+p.ext+" ("+p.bd+"-"+p.be+")",joue:p.statut==="joue"}));
  const tr=(joue,sym,name,col)=>({type:"scatter",mode:"markers",name,
     x:ev.filter(e=>e.joue===joue).map(e=>e.x),y:ev.filter(e=>e.joue===joue).map(e=>e.y),
     text:ev.filter(e=>e.joue===joue).map(e=>e.t),marker:{size:10,symbol:sym,color:col},
     hovertemplate:"%{text}<br>%{x}<extra></extra>"});
  Plotly.newPlot("chartTimeline",[tr(true,"circle","Joué","#3aa0ff"),tr(false,"x","À venir","#19c37d")],
     LAYOUT({height:520,title:"Frise des 72 matchs (heure CEST)",
       yaxis:{categoryorder:"category descending",gridcolor:"#2a3a4d"},xaxis:{gridcolor:"#2a3a4d"}}),CFG);
}

/* ---------- Rapport & Méthodo ---------- */
function renderRapport(){
  const body = window.marked ? marked.parse(D.reportMarkdown) : `<pre style="white-space:pre-wrap">${esc(D.reportMarkdown)}</pre>`;
  document.getElementById("rapport").innerHTML=`<div class="report">${body}</div>`;
}
function renderMethodo(){
  document.getElementById("methodo").innerHTML=`
    <h1>🔬 Méthodologie</h1>
    <div class="card"><h3>1. Modèle quantitatif (Poisson)</h3>
      <p class="muted">Les buts attendus (λ) dérivent de la différence Elo : <em>supremacy</em> bornée
      <code>3.6·tanh(Δelo/350)</code>, volume de buts croissant avec le déséquilibre, avantage hôte
      pour le Mexique/USA/Canada. Deux lois de Poisson donnent le score le plus probable et les probas V/N/D.</p></div>
    <div class="card"><h3>2. Couche multi-agents</h3>
      <p class="muted">12 agents <strong>prédicteurs</strong> (1 par groupe) recherchent forme récente,
      effectifs et blessures (2024-2026) pour ajuster le baseline ; 4 agents <strong>critiques</strong>
      challengent réalisme, biais et cohérence (départages, excès de nuls).</p></div>
    <div class="card"><h3>3. Données & validation</h3>
      <p class="muted">J1 = résultats réels (tournoi commencé) ; J2/J3 = pronostics. Le modèle Elo pur n'a
      anticipé que ~${Math.round(D.meta.j1_accuracy*100)}% des issues de la J1 (très nulle/surprenante),
      d'où l'intérêt des experts. Probas <strong>mpp</strong> = export mpp.football (56 matchs à venir).</p></div>
    <div class="note">⚠️ Limites : un pronostic n'est pas une certitude. La course aux meilleurs 3es se joue à un
    but près. Hors périmètre : la phase à élimination directe. Horaires CEST indicatifs.</div>`;
}

/* ---------- Navigation ---------- */
function show(sec){
  document.querySelectorAll(".sec").forEach(s=>s.classList.toggle("active",s.id===sec));
  document.querySelectorAll("#nav a").forEach(a=>a.classList.toggle("active",a.dataset.sec===sec));
  if(sec==="analyses"){drawAnalyses(); resizeIn("analyses");}
  if(sec==="qualifies"){drawThirds(); resizeIn("qualifies");}
  window.scrollTo({top:0,behavior:"smooth"});
}
document.addEventListener("click",e=>{
  const a=e.target.closest("[data-sec],[data-jump]");
  if(!a) return;
  const sec=a.dataset.sec||a.dataset.jump;
  if(sec){e.preventDefault(); location.hash=sec; show(sec);}
});

/* ---------- Init ---------- */
renderAccueil(); renderCalendrier(); renderGroupes(); renderQualifies();
renderAnalyses(); renderRapport(); renderMethodo();
const SECS=["accueil","calendrier","groupes","qualifies","analyses","rapport","methodo"];
const start=(location.hash||"#accueil").slice(1);
show(SECS.includes(start)?start:"accueil");
window.addEventListener("resize",()=>{if(drawn.analyses)resizeIn("analyses");if(drawn.thirds)resizeIn("qualifies");});
