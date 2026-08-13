const SUPABASE_URL = 'https://iotxurynamixapftjwze.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvdHh1cnluYW1peGFwZnRqd3plIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyNTc1MDYsImV4cCI6MjA5NzgzMzUwNn0.-SDfDO5vrebHnc7B2E77tbnl5nKnpM2ub2pBoSQGPOQ';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const SHEETS = {
  id: '1aGLYGiowhtvIzioo5zZF3rl-fnP6kBUg0ecYXrJr1-g',
  range: '2026!A:E',
  apiKey: 'AIzaSyCzFTPnZSVf9hVWKSiMMNSzq9OxjAhu-T0'
};

async function fetchSheetData(){
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEETS.id}/values/${SHEETS.range}?key=${SHEETS.apiKey}`;
    const r = await fetch(url);
    if(!r.ok) return [];
    const data = await r.json();
    return data.values || [];
  } catch(e){
    console.warn('Sheet fetch failed:', e.message);
    return [];
  }
}

function applySheetData(map){
  if(!map) return;
  SECTORES.forEach(sec => {
    const secId = sec.id.toLowerCase().replace('sector','').trim();
    const newSups = [];
    ['M','T','N'].forEach(function(tk) {
      const key = secId + '|' + tk;
      const d = map[key];
      if(!d || Object.keys(d.supervisores).length === 0) return;
      let bestName = '';
      let bestPartes = 0;
      Object.keys(d.supervisores).forEach(function(nm) {
        if(d.supervisores[nm] > bestPartes) { bestPartes = d.supervisores[nm]; bestName = nm; }
      });
      if(!bestName) return;
      const partesAvg = Math.round((bestPartes / d.count) * 22);
      const ast = Math.min(100, Math.max(60, partesAvg));
      newSups.push({ n: bestName + ' (' + tk + ')', ast: ast });
    });
    if(newSups.length > 0){
      sec.supervisores = newSups;
      sec.rendimiento = newSups.map(function(p){
        return {
          sup: p.n,
          rutas: Math.min(100, Math.max(60, Math.round(p.ast * 0.95))),
          reportes: Math.min(100, Math.max(60, Math.round(p.ast * 0.90))),
          actitud: Math.min(100, Math.max(60, Math.round(p.ast * 0.85))),
          total: Math.round((p.ast * 0.95 + p.ast * 0.90 + p.ast * 0.85) / 3)
        };
      });
    }
  });
}

function buildSupervisoresFromSheet(rows){
  if(!rows || rows.length < 2) return [];
  const map = {};
  rows.slice(1).forEach(row => {
    const sec = String(row[1] || '').trim();
    const turn = String(row[2] || '').trim().toUpperCase();
    const name = String(row[3] || '').trim();
    const partes = parseInt(row[4], 10) || 0;
    if(!sec || !name) return;
    const key = sec + '|' + turn;
    if(!map[key]) map[key] = { sector: sec, turno: turn, supervisores: {}, partesTotal: 0, count: 0 };
    map[key].supervisores[name] = (map[key].supervisores[name] || 0) + partes;
    map[key].partesTotal += partes;
    map[key].count += 1;
  });
  return map;
}

function sheetMapToTurnos(map){
  const out=[];
  Object.keys(map||{}).forEach(function(key){
    const d=map[key];
    Object.keys(d.supervisores||{}).forEach(function(nm){
      out.push({sector:normalizeSecId(d.sector),turno:d.turno,supervisor:nm,partes:d.supervisores[nm]});
    });
  });
  return out;
}

function sheetMapToSupervisorRows(map){
  const supervisores = [];
  Object.keys(map || {}).forEach(function(key){
    const d = map[key];
    let bestName = '';
    let bestSum = 0;
    Object.keys(d.supervisores || {}).forEach(function(nm){
      if(d.supervisores[nm] > bestSum){
        bestSum = d.supervisores[nm];
        bestName = nm;
      }
    });
    if(bestName){
      supervisores.push({
        sector: d.sector,
        turno: d.turno,
        supervisor: bestName,
        partes: bestSum,
        count: d.count
      });
    }
  });
  return supervisores;
}

const DS = {
  primary:'#005ea5',primaryD:'#003D6B',secondary:'#00C9A7',accent:'#F5A623',
  danger:'#E03E3E',success:'#27AE60',warning:'#F5A623',
  g3:'#D0D5E8',g5:'#8888AA',g7:'#4A4A6A',
};

let SECTORES = [];
let CACHED_INCIDENCIAS = [];
let CACHED_JEFES = {};
let CACHED_SUPERVISORS = [];
let CACHED_TURNOS = [];
let CACHED_FRANJAS_FULL = {};

function kpiVal(d,k){ return k.val?k.val(d):d[k.key]; }
const KPI_DEFS = [
  {key:'incDelictivas',label:'Incidencias Atendidas',unit:'',meta:'—',
   val:d=>d.incDelictivas,thr:d=>d.incDelictivas<=25?'verde':d.incDelictivas<=35?'amarillo':'rojo'},
  {key:'robosFrustrados',label:'Robos Frustrados',unit:'',meta:'—',
   val:d=>d.robosFrustrados,thr:d=>d.robosFrustrados>=6?'verde':d.robosFrustrados>=4?'amarillo':'rojo'},
  {key:'operativos',label:'Operativos',unit:'',meta:'—',
   val:d=>d.operativosCount,thr:d=>d.operativosCount>=5?'verde':d.operativosCount>=3?'amarillo':'rojo'},
  {key:'coordVecinales',label:'Coord. Vecinales',unit:'',meta:'—',
   val:d=>d.coordVecinales,thr:d=>d.coordVecinales>=4?'verde':d.coordVecinales>=3?'amarillo':'rojo'},
  {key:'capturas',label:'Capturas',unit:'',meta:'—',
   val:d=>d.capturas,thr:d=>d.capturas>=5?'verde':d.capturas>=3?'amarillo':'rojo'}
];

const SECTOR_COLORS = [DS.primary,DS.success,DS.accent,DS.danger,'#9C27B0','#00BCD4','#FF9800','#795548','#607D8B','#E91E63','#3F51B5'];

const charts = {};
function destroyChart(id){ if(charts[id]){ charts[id].destroy(); delete charts[id]; } }

function getSectorData(){
  const v=document.getElementById('selJefe').value;
  return v==='0'?null:(SECTORES.find(s=>s.id===v)||null);
}
function getSupData(sector){
  const v=document.getElementById('selSup').value;
  if(v==='0'||!sector)return null;
  var supEntry=sector.supervisores.find(function(p){return baseName(p.n)===v;});
  var rendEntry=sector.rendimiento.find(function(r){return baseName(r.sup)===v;});
  return {sup:supEntry||null,rend:rendEntry||null};
}
function populateJefes(){
  const sel=document.getElementById('selJefe');
  const current=sel.value;
  sel.innerHTML='<option value="0">Todos los Sectores</option>'+
    SECTORES.map(s=>`<option value="${s.id}">${s.sector} — ${s.nombre}</option>`).join('');
  if([...sel.options].some(o=>o.value===current))sel.value=current;
}

const TURNO_MAP={manana:'M',tarde:'T',noche:'N'};
const LETTER_MAP={M:'manana',T:'tarde',N:'noche'};
function turnoLetter(v){ return TURNO_MAP[v]||null; }
function letterFromName(n){ var m=n.match(/\((\w)\)/); return m?m[1].toUpperCase():null; }
function baseName(n){ return (n||'').replace(/\s*\([MTN]\)\s*$/,'').trim(); }

function populateSupervisores(){
  const sel=document.getElementById('selSup');
  const sv=sel.value;
  const sid=document.getElementById('selJefe').value;
  const turno=document.getElementById('selTurno').value;
  const tl=turnoLetter(turno);
  var raw=sid==='0'
    ? SECTORES.flatMap(x=>x.supervisores)
    : (SECTORES.find(s=>s.id===sid)?.supervisores||[]);
  if(tl)raw=raw.filter(function(p){ return letterFromName(p.n)===tl; });
  var seen={};
  var lista=raw.filter(function(p){
    var b=baseName(p.n);
    if(seen[b])return false;
    seen[b]=true;
    return true;
  });
  const opts='<option value="0">Todos los Supervisores</option>'+
    lista.map(p=>`<option value="${baseName(p.n).replace(/"/g,'&quot;')}">${baseName(p.n)}</option>`).join('');
  sel.innerHTML=opts;
  if([...sel.options].some(o=>o.value===sv))sel.value=sv;else sel.value='0';
}
function statusLabel(s){
  if(s==='verde')return['verde','Cumplido'];
  if(s==='amarillo')return['amarillo','Parcial'];
  return['rojo','No cumplido'];
}

Chart.defaults.font.family="'Chivo','Segoe UI',sans-serif";
Chart.defaults.color=DS.g7;
function chartDefaults(){return{
  responsive:true,maintainAspectRatio:false,
  plugins:{legend:{display:false}}
};}

function onSupChange(){
  var sv=document.getElementById('selSup').value;
  if(sv&&sv!=='0'){
    var letters={};
    SECTORES.forEach(function(sec){
      sec.supervisores.forEach(function(p){
        if(baseName(p.n)===sv){
          var lt=letterFromName(p.n);
          if(lt)letters[lt]=true;
        }
      });
    });
    var keys=Object.keys(letters);
    document.getElementById('selTurno').value=keys.length===1?LETTER_MAP[keys[0]]||'':'';
  }
  updateDash();
}

function updateDash(){
  if(SECTORES.length===0)return;
  populateJefes();
  populateSupervisores();
  const s=getSectorData();
  const sup=getSupData(s);
  const fStart=document.getElementById('fechaInicio').value;
  const fEnd=document.getElementById('fechaFin').value;
  if(fStart&&fEnd){
    const d1=new Date(fStart+'T00:00:00');
    const d2=new Date(fEnd+'T00:00:00');
    const opt={day:'numeric',month:'short'};
    document.getElementById('badgePeriod').textContent=
      `${d1.toLocaleDateString('es-ES',opt)} — ${d2.toLocaleDateString('es-ES',opt)} ${d2.getFullYear()}`;
  }
  renderSelInfo(s);
  renderSupInfo(sup);
  renderKPIs(s);
  renderResumen(s);
  renderSeguridad(s);
  renderPersonal(s,sup);
  renderComparativa();
  renderRanking();
}

function renderSelInfo(s){
  const box=document.getElementById('sel-info-box');
  if(!s){box.innerHTML='';return;}
  box.innerHTML=`<div class="sel-info">
    <div class="sel-avatar">${s.initials}</div>
    <div class="sel-data"><h3>${s.nombre}</h3><p>${s.sector} · Jefe de Área C4</p></div>
  </div>`;
}

function renderSupInfo(sup){
  const box=document.getElementById('sup-info-box');
  if(!sup){box.innerHTML='';return;}
  const r=sup.rend,total=r?r.total:0,ast=sup.sup?sup.sup.ast:0;
  const cls=total>=90?'verde':total>=75?'amarillo':'rojo';
  const turno=sup.sup?.n.includes('(M)')?'Mañana':sup.sup?.n.includes('(T)')?'Tarde':sup.sup?.n.includes('(N)')?'Noche':'—';
  box.innerHTML=`<div class="sel-info" style="background:linear-gradient(135deg,var(--csd),var(--cs));margin-bottom:var(--s3);padding:var(--s3) var(--s4);">
    <div class="sel-avatar" style="background:var(--cp);color:#fff;width:38px;height:38px;font-size:13px;">${sup.sup?.n.match(/^(\w)/)?.[1]||'S'}</div>
    <div class="sel-data"><h3 style="font-size:var(--tsm);">${sup.sup?.n||'—'}</h3>
      <p style="font-size:var(--txs);">Turno ${turno} · Asistencia: ${ast}% · Puntaje: ${total}</p></div>
    <div class="sel-score" style="margin-left:auto;">
      <div class="score-n" style="font-size:24px;">${total}</div>
      <div class="score-l" style="font-size:10px;">Rendimiento</div>
      <div class="kpi-pill ${cls}" style="margin-top:4px;padding:2px 7px;"><span class="dot ${cls}"></span><span style="font-size:10px;">${statusLabel(cls)[1]}</span></div>
    </div>
  </div>`;
}

function renderKPIs(s){
  const row=document.getElementById('kpi-row');
  const aggK=(k)=>{
    const vals=SECTORES.map(x=>kpiVal(x,k));
    if(typeof vals[0]!=='number')return vals.reduce((a,b)=>a+b,0);
    if(k.unit==='%')return Math.round(vals.reduce((a,b)=>a+b,0)/vals.length);
    return vals.reduce((a,b)=>a+b,0);
  };
  const avgSt=(k)=>{
    if(s)return k.thr(s);
    const v=SECTORES.map(x=>k.thr(x));
    return v.some(x=>x==='rojo')?'rojo':v.some(x=>x==='amarillo')?'amarillo':'verde';
  };
  var curSup = document.getElementById('selSup') ? document.getElementById('selSup').value : '0';
  var supRow = null;
  if(curSup && curSup !== '0' && s){
    var sRows = supervisorRows();
    supRow = sRows.find(function(r){ return r.sup === curSup && r.sec === s.id; });
    if(!supRow) supRow = sRows.find(function(r){ return r.sup === curSup; });
  }
  row.innerHTML=KPI_DEFS.map(k=>{
    var v=s?kpiVal(s,k):aggK(k);
    if(k.key === 'incDelictivas' && supRow){
      v = supRow.inc;
    }
    const st=avgSt(k),[cls,lbl]=statusLabel(st);
    return `<div class="kpi-card ${cls}">
      <div class="kpi-lbl">${k.label}</div>
      <div class="kpi-val">${fmtNum?fmtNum(v):v}${k.unit}</div>
      <div class="kpi-tgt">${k.meta}</div>
      <div class="kpi-pill ${cls}"><span class="dot ${cls}"></span>${lbl}</div>
    </div>`;
  }).join('');
  row.style.gridTemplateColumns='repeat(5,1fr)';
}

function renderResumen(s){
  destroyChart('delitos');
  const delData=s?s.tiposDelito:(()=>{
    const keys=Object.keys(SECTORES[0].tiposDelito),agg={};
    keys.forEach(k=>{agg[k]=SECTORES.reduce((a,x)=>a+(x.tiposDelito[k]||0),0);});
    return agg;
  })();
  charts['delitos']=new Chart(document.getElementById('chartDelitos'),{
    type:'doughnut',
    data:{labels:Object.keys(delData),datasets:[{data:Object.values(delData),
      backgroundColor:[DS.primary,DS.success,DS.warning,DS.danger,DS.g5],
      borderWidth:2,borderColor:'#fff'}]},
    options:{...chartDefaults(),plugins:{legend:{display:true,position:'right',labels:{boxWidth:10,font:{size:11}}}}}
  });
  const supsData=s?s.supervisores:SECTORES.flatMap(x=>x.supervisores.map(p=>({...p,n:x.sector.replace('Sector ','')+' '+p.n})));
  document.getElementById('asistencia-prog').innerHTML=supsData.sort((a,b)=>b.ast-a.ast).slice(0,6).map(p=>{
    const cls=p.ast>=95?'verde':p.ast>=85?'amarillo':'rojo';
    return `<div class="prog-row"><span class="prog-name">${p.n}</span>
      <div class="prog-track"><div class="prog-bar ${cls}" style="width:${p.ast}%"></div></div>
      <span class="prog-val">${p.ast}%</span></div>`;
  }).join('');
}

function renderSeguridad(s){
  const d=s||{};
  const sum=k=>SECTORES.reduce((a,x)=>a+(x[k]||0),0);
  const avg=k=>Math.round(SECTORES.reduce((a,x)=>a+(x[k]||0),0)/SECTORES.length*10)/10;
  var curSup = document.getElementById('selSup') ? document.getElementById('selSup').value : '0';
  var sr = null;
  if(curSup && curSup !== '0' && s){
    var sRows = supervisorRows();
    sr = sRows.find(function(r){ return r.sup === curSup && r.sec === s.id; });
    if(!sr) sr = sRows.find(function(r){ return r.sup === curSup; });
  }
  var supInc = sr ? sr.inc : null;
  document.getElementById('s-incidentes').textContent=supInc!==null?fmtNum(supInc):(s?fmtNum(d.incTotal):fmtNum(sum('incTotal')));
  document.getElementById('s-frustrados').textContent=s?fmtNum(d.frustrados):fmtNum(sum('frustrados'));
  document.getElementById('s-respuesta').textContent=s?d.tasaResp?d.tasaResp+' min':'—':avg('tasaResp')?avg('tasaResp').toFixed(1)+' min':'—';
  let franData=s?JSON.parse(JSON.stringify(d.franjas)):SECTORES[0].franjas.map((f,i)=>({...f,v:Math.round(SECTORES.reduce((a,x)=>a+x.franjas[i].v,0))}));
  if(sr && sr.turnos && sr.turnos.length > 0){
    franData = franData.map(function(f){
      var letter = f.l.indexOf('06–12') !== -1 || f.l.indexOf('Mañana') !== -1 ? 'M' :
                   f.l.indexOf('12–18') !== -1 || f.l.indexOf('Tarde') !== -1 ? 'T' :
                   f.l.indexOf('18–24') !== -1 || f.l.indexOf('Noche') !== -1 ? 'N' : null;
      if(letter && sr.turnos.indexOf(letter) === -1){
        return Object.assign({}, f, { v: 0 });
      }
      return f;
    });
  }
  document.getElementById('franja-chart').innerHTML=franData.map(f=>{
    const maxVal=Math.max(...franData.map(fd=>fd.v))||1;
    const w=Math.round((f.v/maxVal)*90)+10;
    return `<div class="franja-row"><span class="franja-label">${f.l}</span>
      <div class="franja-bar" style="width:${w}%;background:${f.c};min-width:32px;">${f.v}</div>
      <span style="font-size:11px;color:var(--g5);margin-left:6px;">${f.v} casos</span></div>`;
  }).join('');
  const delData=s?d.tiposDelito:(()=>{
    const keys=Object.keys(SECTORES[0].tiposDelito),agg={};
    keys.forEach(k=>{agg[k]=SECTORES.reduce((sx,x)=>sx+(x.tiposDelito[k]||0),0);});
    return agg;
  })();
  destroyChart('tiposDelito');
  charts['tiposDelito']=new Chart(document.getElementById('chartTiposDelito'),{
    type:'bar',
    data:{labels:Object.keys(delData),datasets:[{label:'Casos',data:Object.values(delData),
      backgroundColor:DS.primary+'CC',borderRadius:5}]},
    options:{...chartDefaults(),scales:{y:{beginAtZero:true,grid:{color:'rgba(0,0,0,.05)'},ticks:{font:{size:11}}}}}
  });
}

function renderOperaciones(s){
  const d=s||{};
  const sum=k=>SECTORES.reduce((a,x)=>a+(x[k]||0),0);
  document.getElementById('o-operativos').textContent=s?d.operativosCount:sum('operativosCount');
  document.getElementById('o-capturas').textContent=s?d.capturas:sum('capturas');
}

function renderPersonal(s,sup){
  const d=s||{};
  const supsRaw=s?d.supervisores:SECTORES.flatMap(x=>x.supervisores.map(p=>({...p,n:x.sector.replace('Sector ','')+' '+p.n,sec:x.sector.replace('Sector ','')})));
  const avgAst=supsRaw.length?Math.round(supsRaw.reduce((a,p)=>a+p.ast,0)/supsRaw.length):0;
  document.getElementById('p-asist').textContent=sup?(sup.sup?.ast||0)+'%':avgAst+'%';
  document.getElementById('p-tard').textContent='—';
  document.getElementById('p-disc').textContent='—';
  document.getElementById('p-rot').textContent='—';
  const allSups=sup?supsRaw.filter(p=>baseName(p.n)===baseName(sup.sup?.n)):supsRaw;
  document.getElementById('rank-asistencia').innerHTML=allSups.sort((a,b)=>b.ast-a.ast).slice(0,8).map(p=>{
    const cls=p.ast>=95?'verde':p.ast>=85?'amarillo':'rojo';
    const hl=sup?' style="background:var(--cpl);border-radius:var(--rmd);padding:4px 6px;"':'';
    return `<div class="prog-row"${hl}><span class="prog-name">${p.n}</span>
      <div class="prog-track"><div class="prog-bar ${cls}" style="width:${p.ast}%"></div></div>
      <span class="prog-val">${p.ast}%</span></div>`;
  }).join('');
  const turnoAvg=m=>{
    const match=supsRaw.filter(p=>p.n.includes(m));
    return match.length?Math.round(match.reduce((a,p)=>a+p.ast,0)/match.length):0;
  };
  destroyChart('turnos');
  charts['turnos']=new Chart(document.getElementById('chartTurnos'),{
    type:'bar',
    data:{labels:['Turno Mañana','Turno Tarde','Turno Noche'],
      datasets:[{label:'Asistencia %',
        data:[turnoAvg('(M)'),turnoAvg('(T)'),turnoAvg('(N)')],
        backgroundColor:[DS.primary,DS.primary+'BB',DS.primary+'88'],borderRadius:6}]},
    options:{...chartDefaults(),scales:{y:{min:70,max:100,grid:{color:'rgba(0,0,0,.05)'},ticks:{font:{size:11}}}}}
  });
  const rendRaw=s?d.rendimiento:SECTORES.flatMap(x=>x.rendimiento.map(r=>({...r,sup:x.sector.replace('Sector ','')+' '+r.sup,sec:x.sector.replace('Sector ','')})));
  const allRend=sup?rendRaw.filter(r=>baseName(r.sup)===baseName(sup.rend?.sup)):rendRaw;
  const tbl=document.getElementById('tbl-rendimiento');
  tbl.innerHTML=`<thead><tr>
    <th>${s?'':'Sector '}Supervisor</th><th class="num">Rutas %</th><th class="num">Reportes %</th>
    <th class="num">Actitud</th><th class="num">Puntaje Total</th><th>Semáforo</th>
  </tr></thead><tbody>`+allRend.slice(0,10).map(r=>{
    const cls=r.total>=90?'verde':r.total>=75?'amarillo':'rojo';
    return `<tr><td>${r.sup}</td><td class="num">${r.rutas}</td><td class="num">${r.reportes}</td>
      <td class="num">${r.actitud}</td><td class="num"><strong>${r.total}</strong></td>
      <td><span class="status-badge ${cls}"><span class="dot ${cls}"></span>${statusLabel(cls)[1]}</span></td></tr>`;
  }).join('')+'</tbody>';
}

function renderCoordinacion(s){
  const d=s||{};
  const sum=k=>SECTORES.reduce((a,x)=>a+(x[k]||0),0);
  document.getElementById('c-coord').textContent=s?d.coordVecinales:sum('coordVecinales');
  const comis=s?d.comisarias:[...new Set(SECTORES.flatMap(x=>x.comisarias))];
  document.getElementById('comisarias-tags').innerHTML=comis.map(c=>`<span class="coord-tag">${c}</span>`).join('');
}

/* ── COMPARATIVA ── */
function fmtNum(v){ return (v===null||v===undefined)?'—':v.toLocaleString('en-US'); }
function sectoresSorted(){ return SECTORES.slice().sort(function(a,b){ return String(a.id).localeCompare(String(b.id)); }); }

function respStatus(v){
  if(!(v>0))return 'rojo';
  var vals=SECTORES.map(function(s){ return s.tasaResp; }).filter(function(x){ return x>0; }).sort(function(a,b){ return a-b; });
  if(!vals.length)return 'rojo';
  var lo=vals[Math.floor(vals.length/3)];
  var hi=vals[Math.floor(2*vals.length/3)];
  if(v<=lo)return 'verde';
  if(v<=hi)return 'amarillo';
  return 'rojo';
}
function respStatusColor(v){
  var st=respStatus(v);
  return st==='verde'?DS.success:st==='amarillo'?DS.warning:DS.danger;
}

function grupoTipo(k){ var p=String(k||'').split(' - ')[0]; return p||String(k); }
function valTipoDelito(s,g){ var v=0; Object.keys(s.tiposDelito||{}).forEach(function(k){ if(grupoTipo(k)===g)v+=s.tiposDelito[k]; }); return v; }
function sectorTopDelito(s){
  var agg={};
  Object.keys(s.tiposDelito||{}).forEach(function(k){ var g=grupoTipo(k); agg[g]=(agg[g]||0)+s.tiposDelito[k]; });
  var keys=Object.keys(agg);
  if(!keys.length)return null;
  var best=keys[0],max=agg[best];
  keys.forEach(function(k){ if(agg[k]>max){ max=agg[k]; best=k; } });
  return {name:best,val:max};
}
function topDelitosGlobal(n){
  var agg={};
  SECTORES.forEach(function(s){
    Object.keys(s.tiposDelito||{}).forEach(function(k){ var g=grupoTipo(k); agg[g]=(agg[g]||0)+s.tiposDelito[k]; });
  });
  return Object.keys(agg).map(function(k){ return [k,agg[k]]; }).sort(function(a,b){ return b[1]-a[1]; }).slice(0,n);
}
function kpiStatus(k,sec){
  try{ return k.thr(sec); }catch(e){ return 'rojo'; }
}

function renderCompSectores(){
  if(!SECTORES.length)return;
  var secs=sectoresSorted();
  var kpiDefs=KPI_DEFS.slice(0,5);
  var tipos=topDelitosGlobal(10);

  destroyChart('compKpis');
  charts['compKpis']=new Chart(document.getElementById('chartCompKpis'),{
    type:'bar',
    data:{labels:secs.map(function(s){ return s.id; }),
      datasets:tipos.map(function(t,i){ return {label:t[0],data:secs.map(function(s){ return valTipoDelito(s,t[0]); }),backgroundColor:SECTOR_COLORS[i%SECTOR_COLORS.length],borderRadius:4}; }),},
    options:{...chartDefaults(),plugins:{legend:{display:true,position:'bottom',labels:{boxWidth:10,font:{size:10}}}},
      scales:{x:{grid:{display:false}},y:{beginAtZero:true,grid:{color:'rgba(0,0,0,.05)'},ticks:{font:{size:11}}}}}
  });

  destroyChart('compResp');
  charts['compResp']=new Chart(document.getElementById('chartCompResp'),{
    type:'bar',
    data:{labels:secs.map(function(s){ return s.id; }),
      datasets:[{label:'Tiempo de respuesta (min)',data:secs.map(function(s){ return s.tasaResp||0; }),
        backgroundColor:secs.map(function(s){ return respStatusColor(s.tasaResp); }),borderRadius:4}]},
    options:{...chartDefaults(),
      scales:{x:{grid:{display:false}},y:{beginAtZero:true,grid:{color:'rgba(0,0,0,.05)'},ticks:{font:{size:11}}}}}
  });

  destroyChart('compTipos');
  charts['compTipos']=new Chart(document.getElementById('chartCompTipos'),{
    type:'bar',
    data:{labels:secs.map(function(s){ return s.id; }),
      datasets:tipos.map(function(t,i){ return {label:t[0],data:secs.map(function(s){ return valTipoDelito(s,t[0]); }),backgroundColor:SECTOR_COLORS[i%SECTOR_COLORS.length],borderRadius:3}; }),},
    options:{...chartDefaults(),plugins:{legend:{display:true,position:'right',labels:{boxWidth:10,font:{size:10}}}},
      scales:{x:{stacked:true,grid:{display:false}},y:{stacked:true,beginAtZero:true,grid:{color:'rgba(0,0,0,.05)'},ticks:{font:{size:11}}}}}
  });

  var maxTop=0;
  secs.forEach(function(x){ var t=sectorTopDelito(x); if(t&&t.val>maxTop)maxTop=t.val; });
  var thead='<thead><tr><th>#</th><th>Sector</th><th>Jefe de Área</th>'+
    '<th class="num">Incidencias</th><th class="num">Robos Frustr.</th><th class="num">Operativos</th>'+
    '<th class="num">Coord. Vec.</th><th class="num">Capturas</th><th class="num">T. Respuesta</th><th>Top Delito</th></tr></thead>';
  var tbody='<tbody>'+secs.map(function(s,idx){
    var st=kpiDefs.map(function(k){ return kpiStatus(k,s); });
    var top=sectorTopDelito(s);
    var topCell=top?('<div class="mini-row"><span class="mini-lbl" title="'+top.name+'">'+top.name+'</span>'+
      '<div class="mini-track"><div class="mini-fill" style="width:'+Math.round(top.val/maxTop*100)+'%"></div></div>'+
      '<span class="mini-val">'+fmtNum(top.val)+'</span></div>'):'—';
    return '<tr><td>'+(idx+1)+'</td><td><strong>'+s.id+'</strong></td><td>'+s.nombre+'</td>'+
      '<td class="num st-'+st[0]+'">'+fmtNum(s.incTotal)+'</td>'+
      '<td class="num st-'+st[1]+'">'+fmtNum(s.robosFrustrados)+'</td>'+
      '<td class="num st-'+st[2]+'">'+fmtNum(s.operativosCount)+'</td>'+
      '<td class="num st-'+st[3]+'">'+fmtNum(s.coordVecinales)+'</td>'+
      '<td class="num st-'+st[4]+'">'+fmtNum(s.capturas)+'</td>'+
      '<td class="num st-'+respStatus(s.tasaResp)+'">'+(s.tasaResp>0?s.tasaResp.toFixed(1)+' min':'—')+'</td>'+
      '<td>'+topCell+'</td></tr>';
  }).join('')+'</tbody>';
  document.getElementById('tbl-comp-sectores').innerHTML=thead+tbody;
}

function turnosSupervisor(secId, name){
  var total=0;
  (CACHED_TURNOS||[]).forEach(function(t){
    if(t.sector===secId&&t.supervisor===name)total+=t.partes;
  });
  return total;
}
function franjasTurnosFull(incidencias, fStart, fEnd){
  var fr={};
  incidencias.forEach(function(row){
    var secId=normalizarSector(row.sector);
    if(!fr[secId])fr[secId]={M:0,T:0,N:0,O:0};
    if(fStart||fEnd){
      var fd=row.fecha_apertura?new Date(row.fecha_apertura):null;
      if(fd&&!isNaN(fd)){
        if(fStart&&fd<new Date(fStart+'T00:00:00'))return;
        if(fEnd&&fd>new Date(fEnd+'T23:59:59'))return;
      }
    }
    var f=clasificarFranja(row.turno);
    if(f==='06–12h')fr[secId].M++;
    else if(f==='12–18h')fr[secId].T++;
    else if(f==='18–24h')fr[secId].N++;
    else fr[secId].O++;
  });
  return fr;
}
function franjaIncFull(s, lt){
  var full=CACHED_FRANJAS_FULL&&CACHED_FRANJAS_FULL[s.id];
  if(full&&lt)return full[lt]||0;
  return franjaInc(s, lt);
}
function supervisorRows(){
  var map={};
  SECTORES.forEach(function(s){
    (s.rendimiento||[]).forEach(function(r){
      var astEntry=(s.supervisores||[]).find(function(p){ return baseName(p.n)===baseName(r.sup); });
      var nm=baseName(r.sup);
      var key=s.id+'|'+nm;
      var partes=turnosSupervisor(s.id,nm);
      if(!map[key])map[key]={sup:nm,sec:s.id,turnos:[],turno:'—',inc:0,partes:partes,ratio:0,ast:astEntry?astEntry.ast:null,
        rutas:r.rutas,reportes:r.reportes,actitud:r.actitud,total:r.total};
      var lt=letterFromName(r.sup);
      if(lt&&map[key].turnos.indexOf(lt)===-1){map[key].turnos.push(lt);map[key].inc+=franjaIncFull(s,lt);}
      if(partes>map[key].partes)map[key].partes=partes;
    });
  });
  var rows=[];
  Object.keys(map).forEach(function(k){ var r=map[k]; r.turno=r.turnos.map(turnoLabel).join('/')||'—'; r.ratio=r.partes>0?Math.round(r.inc/r.partes):0; rows.push(r); });
  rows.sort(function(a,b){ return String(a.sec).localeCompare(String(b.sec)) || String(a.sup).localeCompare(String(b.sup)); });
  return rows;
}
function turnoLabel(t){ return t==='M'?'Mañana':t==='T'?'Tarde':t==='N'?'Noche':'—'; }
function franjaInc(s, turno){
  if(!s||!s.franjas||!s.franjas.length||!turno)return 0;
  var L=turno==='M'?'Mañana':turno==='T'?'Tarde':turno==='N'?'Noche':null;
  var f=L?s.franjas.find(function(x){ return x.l===L; }):null;
  if(f)return f.v;
  var R=turno==='M'?'06–12h':turno==='T'?'12–18h':turno==='N'?'18–24h':null;
  f=R?s.franjas.find(function(x){ return x.l===R; }):null;
  return f?f.v:0;
}
function rendCls(v){ return v>=90?'verde':v>=75?'amarillo':'rojo'; }
function astCls(v){ return v>=95?'verde':v>=85?'amarillo':'rojo'; }

function renderCompSupervisores(){
  var rows=supervisorRows();
  if(!rows.length)return;
  var kpiDefs=KPI_DEFS.slice(0,5);
  var tipos=topDelitosGlobal(10);
  function totDelitos(s){ var v=0; tipos.forEach(function(t){ v+=s?valTipoDelito(s,t[0]):0; }); return v; }
  var delitosRows=rows.slice().sort(function(a,b){
    var as=SECTORES.find(function(x){ return x.id===a.sec; });
    var bs=SECTORES.find(function(x){ return x.id===b.sec; });
    return totDelitos(bs)-totDelitos(as);
  });
  var incRows=rows.slice().sort(function(a,b){ return b.inc-a.inc; });

  destroyChart('compSups');
  charts['compSups']=new Chart(document.getElementById('chartCompSups'),{
    type:'bar',
    data:{labels:delitosRows.map(function(r){ return r.sup+' ('+r.sec+')'; }),
      datasets:tipos.map(function(t,i){ return {label:t[0],data:delitosRows.map(function(r){ var s=SECTORES.find(function(x){ return x.id===r.sec; }); return s?valTipoDelito(s,t[0]):0; }),backgroundColor:SECTOR_COLORS[i%SECTOR_COLORS.length],borderRadius:3}; }),},
    options:{...chartDefaults(),plugins:{legend:{display:true,position:'bottom',labels:{boxWidth:10,font:{size:10}}}},
      scales:{x:{stacked:true,grid:{display:false},ticks:{font:{size:10},maxRotation:45,minRotation:0}},y:{stacked:true,beginAtZero:true,grid:{color:'rgba(0,0,0,.05)'},ticks:{font:{size:11}}}}}
  });

  destroyChart('compAst');
  charts['compAst']=new Chart(document.getElementById('chartCompAst'),{
    type:'bar',
    data:{labels:incRows.map(function(r){ return r.sup+' ('+r.sec+')'; }),
      datasets:[{label:'Incidencias',data:incRows.map(function(r){ return r.inc; }),backgroundColor:DS.primary,borderRadius:4}]},
    options:{...chartDefaults(),
      scales:{x:{grid:{display:false},ticks:{font:{size:10},maxRotation:45,minRotation:0}},y:{beginAtZero:true,grid:{color:'rgba(0,0,0,.05)'},ticks:{font:{size:11}}}}}
  });

  var scatterRows=rows.filter(function(r){ return r.partes>0; });
  destroyChart('compTurnos');
  charts['compTurnos']=new Chart(document.getElementById('chartCompTurnos'),{
    type:'scatter',
    data:{datasets:[{label:'Supervisores',data:scatterRows.map(function(r){ return {x:r.partes,y:r.inc,sup:r.sup,sec:r.sec,ratio:r.ratio}; }),backgroundColor:DS.primary,pointRadius:5}]},
    options:{...chartDefaults(),
      plugins:{legend:{display:false},tooltip:{callbacks:{label:function(c){ var d=c.raw; return d.sup+' ('+d.sec+'): '+d.partes+' turnos · '+fmtNum(d.inc)+' incidencias · '+fmtNum(d.ratio)+' por turno'; }}}},
      scales:{x:{title:{display:true,text:'Turnos trabajados'},grid:{color:'rgba(0,0,0,.05)'},ticks:{font:{size:10}}},y:{title:{display:true,text:'Incidencias'},beginAtZero:true,grid:{color:'rgba(0,0,0,.05)'},ticks:{font:{size:11}}}}}
  });

  var maxTop=0;
  rows.forEach(function(r){ var s=SECTORES.find(function(x){ return x.id===r.sec; }); var t=s?sectorTopDelito(s):null; if(t&&t.val>maxTop)maxTop=t.val; });
  var thead='<thead><tr><th>#</th><th>Supervisor</th><th>Sector</th><th>Turno</th>'+
    '<th class="num">Incidencias</th><th class="num">Turnos</th><th class="num">Inc/Turno</th>'+
    '<th class="num">Robos Frustr.</th><th class="num">Operativos</th>'+
    '<th class="num">T. Respuesta</th><th>Top Delito</th></tr></thead>';
  var tbody='<tbody>'+rows.map(function(r,idx){
    var s=SECTORES.find(function(x){ return x.id===r.sec; });
    if(!s)return '';
    var st=kpiDefs.map(function(k){ return kpiStatus(k,s); });
    var top=sectorTopDelito(s);
    var topCell=top?('<div class="mini-row"><span class="mini-lbl" title="'+top.name+'">'+top.name+'</span>'+
      '<div class="mini-track"><div class="mini-fill" style="width:'+Math.round(top.val/maxTop*100)+'%"></div></div>'+
      '<span class="mini-val">'+fmtNum(top.val)+'</span></div>'):'—';
    return '<tr><td>'+(idx+1)+'</td><td><strong>'+r.sup+'</strong></td><td>'+r.sec+'</td><td>'+turnoLabel(r.turno)+'</td>'+
      '<td class="num st-'+st[0]+'">'+fmtNum(r.inc)+'</td>'+
      '<td class="num">'+fmtNum(r.partes)+'</td>'+
      '<td class="num">'+fmtNum(r.ratio)+'</td>'+
      '<td class="num st-'+st[1]+'">'+fmtNum(s.robosFrustrados)+'</td>'+
      '<td class="num st-'+st[2]+'">'+fmtNum(s.operativosCount)+'</td>'+
      '<td class="num st-'+respStatus(s.tasaResp)+'">'+(s.tasaResp>0?s.tasaResp.toFixed(1)+' min':'—')+'</td>'+
      '<td>'+topCell+'</td></tr>';
  }).join('')+'</tbody>';
  document.getElementById('tbl-comp-supervisores').innerHTML=thead+tbody;
}

function switchCompTab(tab, el){
  document.querySelectorAll('.tab-btn').forEach(function(b){ b.classList.remove('active'); });
  el.classList.add('active');
  document.querySelectorAll('.comp-tab').forEach(function(t){ t.classList.remove('active'); });
  document.getElementById('comp-'+tab).classList.add('active');
  renderComparativa();
}
function renderComparativa(){
  var panel=document.getElementById('panel-comparativa');
  if(!panel||!panel.classList.contains('active'))return;
  var secciones=document.getElementById('comp-sectores');
  if(secciones&&secciones.classList.contains('active')){
    renderCompSectores();
  }else{
    renderCompSupervisores();
  }
}

function showPanel(id,el){
  document.querySelectorAll('.section-panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  document.getElementById('panel-'+id).classList.add('active');
  el.classList.add('active');
  if(id==='comparativa')renderComparativa();
}

function normalizarSector(raw){
  return String(raw||'').toLowerCase().trim().replace(/^sector\s*/,'').trim().toUpperCase();
}

function clasificarTurno(turnoRaw){
  var tv=(turnoRaw||'').toUpperCase().trim();
  if(tv.indexOf("MAÑANA")!==-1||tv.indexOf("M")!==-1) return "manana";
  if(tv.indexOf("TARDE")!==-1||tv.indexOf("T")!==-1) return "tarde";
  if(tv.indexOf("NOCHE")!==-1||tv.indexOf("N")!==-1) return "noche";
  return null;
}

function clasificarFranja(turnoRaw){
  var tv=(turnoRaw||'').toUpperCase().trim();
  if(tv.indexOf("MAÑANA")!==-1||tv.indexOf("M")!==-1) return "06–12h";
  if(tv.indexOf("TARDE")!==-1||tv.indexOf("T")!==-1) return "12–18h";
  if(tv.indexOf("NOCHE")!==-1||tv.indexOf("N")!==-1) return "18–24h";
  return "00–06h";
}

function clasificarTipo(tipoRaw){
  var tl=(tipoRaw||'').toLowerCase();
  if(tl.indexOf("robo frustrado")!==-1) return "robosFrustrados";
  if(tl.indexOf("operativo")!==-1) return "operativosCount";
  if(tl.indexOf("coordinacion")!==-1) return "coordVecinalesCount";
  if(tl.indexOf("captura")!==-1) return "capturasCount";
  if(tl.indexOf("patrullaje")!==-1) return "patrullajeCount";
  return null;
}

function processIncidencias(incidencias, jefesConfig, turnoFilter, fStart, fEnd){
  var sd={};
  Object.keys(jefesConfig).forEach(function(id){
    sd[id]={id,nombre:jefesConfig[id].nombre,sector:"Sector "+id,
      initials:jefesConfig[id].initials,
      incidentesRaw:[],comisariasSet:new Set(),
      crimeTypes:{},franjas:{"00–06h":0,"06–12h":0,"12–18h":0,"18–24h":0},
      responseTimes:[],robosFrustrados:0,operativosCount:0,
      coordVecinalesCount:0,capturasCount:0,patrullajeCount:0};
  });

  incidencias.forEach(function(row){
    var secId=normalizarSector(row.sector);
    if(!sd[secId])return;
    var s=sd[secId];

    // Date filter
    if(fStart||fEnd){
      var fd=row.fecha_apertura?new Date(row.fecha_apertura):null;
      if(fd&&!isNaN(fd)){
        if(fStart&&fd<new Date(fStart+'T00:00:00'))return;
        if(fEnd&&fd>new Date(fEnd+'T23:59:59'))return;
      }
    }

    // Turno filter
    if(turnoFilter&&clasificarTurno(row.turno)!==turnoFilter)return;

    s.incidentesRaw.push(row.fecha_apertura);
    var tipo=row.tipo||"Otros";
    s.crimeTypes[tipo]=(s.crimeTypes[tipo]||0)+1;

    var subT=clasificarTipo(tipo);
    if(subT)s[subT]++;

    if(row.cia)s.comisariasSet.add(String(row.cia).trim());

    s.franjas[clasificarFranja(row.turno)]++;

    var tVal=parseFloat(row.time_minimo);
    if(!isNaN(tVal)&&tVal>0)s.responseTimes.push(tVal);
  });

  return Object.keys(sd).map(function(id){
    var s=sd[id];
    var incTotal=s.incidentesRaw.length;
    var tasaResp=s.responseTimes.length>0
      ?Math.round((s.responseTimes.reduce(function(a,b){return a+b;},0)/s.responseTimes.length)*10)/10:null;
    var comisarias=s.comisariasSet.size>0?Array.from(s.comisariasSet):[];
    var tdo={};
    Object.keys(s.crimeTypes).sort(function(a,b){return s.crimeTypes[b]-s.crimeTypes[a];}).slice(0,5).forEach(function(k){tdo[k]=s.crimeTypes[k];});
    if(Object.keys(tdo).length===0&&incTotal>0)tdo["Otros"]=incTotal;
    return{
      id,nombre:s.nombre,sector:s.sector,initials:s.initials,
      incTotal,tasaResp,comisarias,
      franjas:[{l:"00–06h",v:s.franjas["00–06h"],c:"#003D6B"},{l:"06–12h",v:s.franjas["06–12h"],c:"#27AE60"},{l:"12–18h",v:s.franjas["12–18h"],c:"#F5A623"},{l:"18–24h",v:s.franjas["18–24h"],c:"#E03E3E"}],
      tiposDelito:tdo,
      frustrados:s.robosFrustrados,robosFrustrados:s.robosFrustrados,
      operativosCount:s.operativosCount,
      coordVecinales:s.coordVecinalesCount,
      capturas:s.capturasCount,patrullajeCount:s.patrullajeCount,
      supervisores:[],rendimiento:[]
    };
  });
}

function normalizeSecId(v){
  return String(v||'').toLowerCase().replace("sector","").trim().toUpperCase();
}
function buildSupervisores(sectores, supList){
  var bySector={};
  supList.forEach(function(s){
    var sn=normalizeSecId(s.sector);
    if(!bySector[sn])bySector[sn]=[];
    bySector[sn].push(s);
  });
  sectores.forEach(function(sec){
    var entries=bySector[normalizeSecId(sec.id)]||[];
    if(entries.length===0)return;
    var newSups=[];
    ["M","T","N"].forEach(function(tk){
      var match=null;
      for(var ei=0;ei<entries.length;ei++){
        var et=entries[ei].turno||'';
        if(et.indexOf(tk)!==-1){match=entries[ei];break;}
      }
      if(!match)return;
      var partesAvg=Math.round((match.partes/match.count)*22);
      var ast=Math.min(100,Math.max(60,partesAvg));
      newSups.push({n:match.supervisor+" ("+tk+")",ast:ast});
    });
    if(newSups.length>0){
      sec.supervisores=newSups;
      sec.rendimiento=newSups.map(function(p){return{
        sup:p.n,rutas:Math.min(100,Math.max(60,Math.round(p.ast*0.95))),
        reportes:Math.min(100,Math.max(60,Math.round(p.ast*0.90))),
        actitud:Math.min(100,Math.max(60,Math.round(p.ast*0.85))),
        total:Math.round((p.ast*0.95+p.ast*0.90+p.ast*0.85)/3)
      };});
    }
  });
}

function finishLoad(incidencias, jefesConfig, supRows, turnoFilter, fStart, fEnd){
  SECTORES=processIncidencias(incidencias,jefesConfig,turnoFilter,fStart,fEnd);
  buildSupervisores(SECTORES,supRows||[]);
  document.getElementById('loading-overlay').style.display='none';
  updateDash();
  lucide.createIcons();
}

function loadData(turnoFilter){
  document.getElementById('loading-overlay').style.display='flex';

  var pSupabase = supabaseClient.from('incidencias').select('*').then(function(res){
    if(res.error)throw new Error('Error Supabase incidencias: '+res.error.message);
    CACHED_INCIDENCIAS=res.data;
    return res.data;
  });

  var pJefes = supabaseClient.from('jefes_area').select('*').then(function(res){
    if(res.error)throw new Error('Error Supabase jefes: '+res.error.message);
    var jc={};
    res.data.forEach(function(j){
      var words=j.nombre.split(/\s+/).filter(function(w){return w.length>0;});
      var ini=words.length>0?words[0][0].toUpperCase():'';
      if(words.length>1)ini+=words[1][0].toUpperCase();
      if(!ini)ini=j.sector;
      jc[j.sector]={nombre:j.nombre,initials:ini};
    });
    CACHED_JEFES=jc;
    return jc;
  });

  Promise.all([pSupabase,pJefes]).then(async function(results){
    var incidencias=results[0];
    var jefesConfig=results[1];
    CACHED_FRANJAS_FULL=franjasTurnosFull(incidencias,
      document.getElementById('fechaInicio').value,
      document.getElementById('fechaFin').value);
    const rows = await fetchSheetData();
    const supData = buildSupervisoresFromSheet(rows);
    if(supData){
      CACHED_SUPERVISORS = sheetMapToSupervisorRows(supData);
      CACHED_TURNOS = sheetMapToTurnos(supData);
      applySheetData(supData);
    } else {
      CACHED_SUPERVISORS = [];
      CACHED_TURNOS = [];
    }
    finishLoad(incidencias,jefesConfig,CACHED_SUPERVISORS,turnoFilter,
      document.getElementById('fechaInicio').value,
      document.getElementById('fechaFin').value);

  }).catch(function(err){
    alert(err.message||'Error al cargar datos');
    document.getElementById('loading-overlay').style.display='none';
  });
}

function onTurnoChange(){
  var turno=document.getElementById('selTurno').value;
  // Re-process locally from cached data with new turno filter
  if(CACHED_INCIDENCIAS.length>0&&Object.keys(CACHED_JEFES).length>0){
    CACHED_FRANJAS_FULL=franjasTurnosFull(CACHED_INCIDENCIAS,
      document.getElementById('fechaInicio').value,
      document.getElementById('fechaFin').value);
    SECTORES=processIncidencias(CACHED_INCIDENCIAS,CACHED_JEFES,turno,
      document.getElementById('fechaInicio').value,
      document.getElementById('fechaFin').value);
    buildSupervisores(SECTORES,CACHED_SUPERVISORS);
    updateDash();
  }else{
    loadData(turno);
  }
}

function onFechaChange(){
  // Re-process locally from cached data with new date range
  if(CACHED_INCIDENCIAS.length>0&&Object.keys(CACHED_JEFES).length>0){
    var turno=document.getElementById('selTurno').value;
    CACHED_FRANJAS_FULL=franjasTurnosFull(CACHED_INCIDENCIAS,
      document.getElementById('fechaInicio').value,
      document.getElementById('fechaFin').value);
    SECTORES=processIncidencias(CACHED_INCIDENCIAS,CACHED_JEFES,turno,
      document.getElementById('fechaInicio').value,
      document.getElementById('fechaFin').value);
    buildSupervisores(SECTORES,CACHED_SUPERVISORS);
    updateDash();
  }
}

window.addEventListener('load',function(){
  var fInicioInput=document.getElementById('fechaInicio');
  var fFinInput=document.getElementById('fechaFin');

  if(!fInicioInput.value)fInicioInput.value='2026-01-01';
  if(!fFinInput.value)fFinInput.value='2026-12-31';

  loadData('');
});
