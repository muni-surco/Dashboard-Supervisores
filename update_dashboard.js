const fs = require('fs');

const htmlPath = 'dashboard-c4-mss.html';
let html = fs.readFileSync(htmlPath, 'utf8');

// 1. Replace the select block
const selectRegex = /<select id="selJefe" class="tb-select" onchange="updateDash\(\)">[\s\S]*?<\/select>/;
const newSelect = `<select id="selJefe" class="tb-select" onchange="updateDash()">
      <option value="0">Todos los Sectores</option>
      <option value="1">Sector 1 — Supervisor Mendoza</option>
      <option value="2">Sector 2 — Supervisor Quispe</option>
      <option value="3">Sector 3 — Supervisor Torres</option>
      <option value="4">Sector 4 — Supervisor Flores</option>
      <option value="5">Sector 5 — Supervisor Silva</option>
      <option value="6">Sector 6 — Supervisor Castro</option>
      <option value="7">Sector 7 — Supervisor Paz</option>
      <option value="8">Sector 8 — Supervisor Vargas</option>
      <option value="9">Sector 9 — Supervisor Reyes</option>
    </select>`;
html = html.replace(selectRegex, newSelect);

// 2. Generate new SECTORES array
const nombres = [
  'Supervisor Mendoza', 'Supervisor Quispe', 'Supervisor Torres', 
  'Supervisor Flores', 'Supervisor Silva', 'Supervisor Castro', 
  'Supervisor Paz', 'Supervisor Vargas', 'Supervisor Reyes'
];
const initials = ['SM', 'SQ', 'ST', 'SF', 'SS', 'SC', 'SP', 'SV', 'SR'];

const sectores = [];
for(let i=1; i<=9; i++) {
  const baseScore = 60 + Math.floor(Math.random()*35); // 60 to 95
  const s = {
    id: i, nombre: nombres[i-1], sector: 'Sector ' + i,
    initials: initials[i-1], score: baseScore,
    kpis:{redDelict:10,superv:90,asistencia:95,operativos:4,compromisos:80},
    status:{redDelict:'verde',superv:'verde',asistencia:'verde',operativos:'verde',compromisos:'verde'},
    incidentes:[40,42,38,35,33,30,28], incTotal:28, incVar:-5.0,
    tasaResp:8.5, frustrados:5, interv:30, cobertura:90,
    franjas:[{l:'00–06h',v:8,c:"DS.primaryD"},{l:'06–12h',v:15,c:"DS.success"},{l:'12–18h',v:22,c:"DS.warning"},{l:'18–24h',v:31,c:"DS.danger"}],
    tiposDelito:{Robos:12,Hurtos:8,Violencia:5,Daños:3,Otros:2},
    supRealizadas:45,supPlan:50, hallazgos:10, capturas:6, coordPNP:5,
    operativosTipo:['Control de zona','Alcoholemia','Zonas críticas'],
    reportes:'90%',
    supervisores:[{n: nombres[i-1],ast:95}],
    tardanzas:2.5, disciplinarias:1, rotacion:0,
    rendimiento:[{sup: nombres[i-1],rutas:95,reportes:95,actitud:95,total:95}],
    reunionesComis:3, patrInt:85, zonasRef:4, acuerdos:2,
    acuerdosList:['Operativo semanal','Protocolo de alertas'],
    comisarias:['PNP Sector ' + i],
    intConj:15, evitados:8,
    compromisos:[{desc:'Aumentar supervisiones',pct:90,st:'verde'},{desc:'Reducir tardanzas',pct:80,st:'amarillo'},{desc:'Ruta nueva',pct:100,st:'verde'}],
    impReduc:10, impAum:15, impDisc:10,
    dims:[85,90,95,80,85]
  };
  sectores.push(s);
}

// Convert object to string, removing quotes around DS.* variables
let sectoresStr = 'const SECTORES = ' + JSON.stringify(sectores, null, 2).replace(/"DS\.([a-zA-Z]+)"/g, 'DS.$1') + ';';

const sectRegex = /const SECTORES = \[\s*\{[\s\S]*?\n\];/;
html = html.replace(sectRegex, sectoresStr);

// 3. Update SECTOR_COLORS
const colorsRegex = /const SECTOR_COLORS = \[.*?\];/;
const newColors = `const SECTOR_COLORS = [DS.primary, DS.success, DS.accent, DS.danger, '#9C27B0', '#00BCD4', '#FF9800', '#795548', '#607D8B'];`;
html = html.replace(colorsRegex, newColors);

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('Done!');
