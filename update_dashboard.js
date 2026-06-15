const fs = require('fs');

const htmlPath = 'dashboard-c4-mss.html';
let html = fs.readFileSync(htmlPath, 'utf8');

// 1. Replace the select block
const selectRegex = /<select id="selJefe" class="tb-select" onchange="updateDash\(\)">[\s\S]*?<\/select>/;
const newSelect = `<select id="selJefe" class="tb-select" onchange="updateDash()">
      <option value="0">Todos los Sectores</option>
      <option value="1a">Sector 1a — Carlos Mendoza</option>
      <option value="1b">Sector 1b — Rosa Quispe</option>
      <option value="2a">Sector 2a — Juan Torres</option>
      <option value="2b">Sector 2b — María Flores</option>
      <option value="3">Sector 3 — Pedro Silva</option>
      <option value="4">Sector 4 — Pedro Silva</option>
      <option value="5">Sector 5 — Ana Castro</option>
      <option value="6">Sector 6 — Luis Paz</option>
      <option value="7">Sector 7 — Carmen Vargas</option>
      <option value="8">Sector 8 — José Reyes</option>
      <option value="9">Sector 9 — Elena Rivas</option>
    </select>`;
html = html.replace(selectRegex, newSelect);

// 2. Generate new SECTORES array
const sectores = [
  {
    id: '1a', nombre: 'Carlos Mendoza', sector: 'Sector 1a', initials: 'CM',
    kpis:{redDelict:10,superv:92,asistencia:94,operativos:4,compromisos:85},
    incidentes:[38,40,36,34,31,28,26], incTotal:26, incVar:-4,
    tasaResp:7.5, frustrados:6, interv:32, cobertura:88,
    supRealizadas:44,supPlan:48, hallazgos:9, capturas:5, coordPNP:4,
    tardanzas:2.8, disciplinarias:1, rotacion:0,
    reunionesComis:3, patrInt:86, zonasRef:4, acuerdos:2, intConj:15, evitados:8,
    reportes:'88%', inpReduc:10, impAum:15, impDisc:10,
    acuerdosList:['Operativo semanal','Protocolo de alertas'],
    comisarias:['PNP Sector 1a'],
    operativosTipo:['Control de zona','Alcoholemia','Zonas críticas'],
    supervisores:[{n:'García (M)',ast:94},{n:'López (T)',ast:87},{n:'Martínez (N)',ast:91}],
    rendimiento:[{sup:'García (M)',rutas:92,reportes:90,actitud:95,total:92},{sup:'López (T)',rutas:85,reportes:88,actitud:90,total:88},{sup:'Martínez (N)',rutas:90,reportes:92,actitud:88,total:90}],
    compromisos:[{desc:'Aumentar supervisiones',pct:90,st:'verde'},{desc:'Reducir tardanzas',pct:80,st:'amarillo'},{desc:'Ruta nueva',pct:100,st:'verde'}],
    dims:[82,78,85,80,82]
  },
  {
    id: '1b', nombre: 'Rosa Quispe', sector: 'Sector 1b', initials: 'RQ',
    kpis:{redDelict:8,superv:85,asistencia:90,operativos:3,compromisos:78},
    incidentes:[42,44,40,38,36,33,30], incTotal:30, incVar:-3,
    tasaResp:8.2, frustrados:4, interv:28, cobertura:82,
    supRealizadas:40,supPlan:48, hallazgos:11, capturas:4, coordPNP:3,
    tardanzas:4.5, disciplinarias:2, rotacion:1,
    reunionesComis:2, patrInt:78, zonasRef:3, acuerdos:1, intConj:12, evitados:6,
    reportes:'85%', inpReduc:8, impAum:12, impDisc:8,
    acuerdosList:['Operativo semanal'],
    comisarias:['PNP Sector 1b'],
    operativosTipo:['Control de zona','Alcoholemia'],
    supervisores:[{n:'Rodríguez (M)',ast:92},{n:'Fernández (T)',ast:84},{n:'Pérez (N)',ast:88}],
    rendimiento:[{sup:'Rodríguez (M)',rutas:88,reportes:85,actitud:90,total:88},{sup:'Fernández (T)',rutas:82,reportes:84,actitud:86,total:84},{sup:'Pérez (N)',rutas:86,reportes:88,actitud:84,total:86}],
    compromisos:[{desc:'Mejorar cobertura',pct:75,st:'amarillo'},{desc:'Reducir tardanzas',pct:70,st:'amarillo'},{desc:'Coord. con PNP',pct:60,st:'amarillo'}],
    dims:[75,72,70,68,78]
  },
  {
    id: '2a', nombre: 'Juan Torres', sector: 'Sector 2a', initials: 'JT',
    kpis:{redDelict:12,superv:95,asistencia:97,operativos:5,compromisos:92},
    incidentes:[35,37,33,30,28,25,22], incTotal:22, incVar:-6,
    tasaResp:6.8, frustrados:7, interv:36, cobertura:94,
    supRealizadas:47,supPlan:50, hallazgos:7, capturas:7, coordPNP:5,
    tardanzas:1.5, disciplinarias:0, rotacion:0,
    reunionesComis:4, patrInt:92, zonasRef:5, acuerdos:3, intConj:18, evitados:10,
    reportes:'95%', inpReduc:12, impAum:18, impDisc:12,
    acuerdosList:['Operativo semanal','Protocolo de alertas','Patrullaje mixto'],
    comisarias:['PNP Sector 2a','PNP Zona Norte'],
    operativosTipo:['Control de zona','Alcoholemia','Zonas críticas','Operativo nocturno'],
    supervisores:[{n:'Díaz (M)',ast:97},{n:'Sánchez (T)',ast:92},{n:'Torres (N)',ast:94}],
    rendimiento:[{sup:'Díaz (M)',rutas:96,reportes:95,actitud:98,total:96},{sup:'Sánchez (T)',rutas:92,reportes:90,actitud:94,total:92},{sup:'Torres (N)',rutas:94,reportes:93,actitud:92,total:93}],
    compromisos:[{desc:'Mantener tendencia',pct:95,st:'verde'},{desc:'Capacitar personal',pct:85,st:'verde'},{desc:'Ampliar cobertura',pct:90,st:'verde'}],
    dims:[88,85,92,88,86]
  },
  {
    id: '2b', nombre: 'María Flores', sector: 'Sector 2b', initials: 'MF',
    kpis:{redDelict:7,superv:80,asistencia:88,operativos:3,compromisos:72},
    incidentes:[45,47,43,41,39,37,35], incTotal:35, incVar:-2,
    tasaResp:9.0, frustrados:3, interv:24, cobertura:78,
    supRealizadas:38,supPlan:48, hallazgos:12, capturas:3, coordPNP:3,
    tardanzas:5.2, disciplinarias:2, rotacion:1,
    reunionesComis:2, patrInt:72, zonasRef:3, acuerdos:1, intConj:10, evitados:5,
    reportes:'82%', inpReduc:6, impAum:10, impDisc:5,
    acuerdosList:['Operativo semanal'],
    comisarias:['PNP Sector 2b'],
    operativosTipo:['Control de zona','Alcoholemia'],
    supervisores:[{n:'Ramírez (M)',ast:90},{n:'Morales (T)',ast:82},{n:'Castillo (N)',ast:85}],
    rendimiento:[{sup:'Ramírez (M)',rutas:85,reportes:82,actitud:88,total:85},{sup:'Morales (T)',rutas:80,reportes:80,actitud:82,total:81},{sup:'Castillo (N)',rutas:83,reportes:85,actitud:80,total:83}],
    compromisos:[{desc:'Mejorar supervisión',pct:65,st:'amarillo'},{desc:'Reducir incidentes',pct:55,st:'rojo'},{desc:'Fortalecer coord.',pct:70,st:'amarillo'}],
    dims:[70,68,65,72,74]
  },
  {
    id: '3', nombre: 'Pedro Silva', sector: 'Sector 3', initials: 'PS',
    kpis:{redDelict:9,superv:88,asistencia:93,operativos:4,compromisos:82},
    incidentes:[40,42,38,36,34,31,29], incTotal:29, incVar:-4,
    tasaResp:7.8, frustrados:5, interv:30, cobertura:86,
    supRealizadas:43,supPlan:50, hallazgos:10, capturas:5, coordPNP:4,
    tardanzas:3.0, disciplinarias:1, rotacion:0,
    reunionesComis:3, patrInt:82, zonasRef:4, acuerdos:2, intConj:14, evitados:7,
    reportes:'90%', inpReduc:9, impAum:14, impDisc:9,
    acuerdosList:['Operativo semanal','Protocolo de alertas'],
    comisarias:['PNP Sector 3'],
    operativosTipo:['Control de zona','Alcoholemia','Zonas críticas'],
    supervisores:[{n:'Ortiz (M)',ast:95},{n:'Vega (T)',ast:88},{n:'Ramos (N)',ast:90}],
    rendimiento:[{sup:'Ortiz (M)',rutas:93,reportes:90,actitud:95,total:93},{sup:'Vega (T)',rutas:86,reportes:88,actitud:88,total:87},{sup:'Ramos (N)',rutas:90,reportes:91,actitud:86,total:89}],
    compromisos:[{desc:'Aumentar supervisiones',pct:88,st:'verde'},{desc:'Reducir tardanzas',pct:78,st:'amarillo'},{desc:'Ruta nueva',pct:95,st:'verde'}],
    dims:[79,76,80,78,82]
  },
  {
    id: '4', nombre: 'Pedro Silva', sector: 'Sector 4', initials: 'PS',
    kpis:{redDelict:8,superv:86,asistencia:92,operativos:3,compromisos:80},
    incidentes:[41,43,39,37,35,32,30], incTotal:30, incVar:-3,
    tasaResp:8.0, frustrados:5, interv:28, cobertura:84,
    supRealizadas:41,supPlan:48, hallazgos:10, capturas:4, coordPNP:4,
    tardanzas:3.5, disciplinarias:1, rotacion:0,
    reunionesComis:3, patrInt:80, zonasRef:4, acuerdos:2, intConj:13, evitados:7,
    reportes:'88%', inpReduc:8, impAum:13, impDisc:8,
    acuerdosList:['Operativo semanal','Protocolo de alertas'],
    comisarias:['PNP Sector 4'],
    operativosTipo:['Control de zona','Alcoholemia','Zonas críticas'],
    supervisores:[{n:'Medina (M)',ast:93},{n:'Cruz (T)',ast:86},{n:'Rivas (N)',ast:89}],
    rendimiento:[{sup:'Medina (M)',rutas:90,reportes:88,actitud:92,total:90},{sup:'Cruz (T)',rutas:84,reportes:86,actitud:88,total:86},{sup:'Rivas (N)',rutas:88,reportes:90,actitud:85,total:88}],
    compromisos:[{desc:'Aumentar supervisiones',pct:85,st:'verde'},{desc:'Reducir tardanzas',pct:75,st:'amarillo'},{desc:'Coord. vecinal',pct:80,st:'amarillo'}],
    dims:[76,74,78,76,80]
  },
  {
    id: '5', nombre: 'Ana Castro', sector: 'Sector 5', initials: 'AC',
    kpis:{redDelict:11,superv:92,asistencia:95,operativos:5,compromisos:88},
    incidentes:[37,39,35,33,30,27,24], incTotal:24, incVar:-5,
    tasaResp:7.2, frustrados:6, interv:34, cobertura:90,
    supRealizadas:46,supPlan:50, hallazgos:8, capturas:6, coordPNP:5,
    tardanzas:2.0, disciplinarias:1, rotacion:0,
    reunionesComis:4, patrInt:88, zonasRef:5, acuerdos:2, intConj:16, evitados:9,
    reportes:'93%', inpReduc:11, impAum:16, impDisc:11,
    acuerdosList:['Operativo semanal','Patrullaje mixto'],
    comisarias:['PNP Sector 5','PNP Zona Sur'],
    operativosTipo:['Control de zona','Alcoholemia','Zonas críticas','Operativo nocturno'],
    supervisores:[{n:'Campos (M)',ast:96},{n:'Chávez (T)',ast:90},{n:'Acosta (N)',ast:93}],
    rendimiento:[{sup:'Campos (M)',rutas:94,reportes:93,actitud:96,total:94},{sup:'Chávez (T)',rutas:90,reportes:88,actitud:92,total:90},{sup:'Acosta (N)',rutas:92,reportes:91,actitud:90,total:91}],
    compromisos:[{desc:'Mantener reducción',pct:92,st:'verde'},{desc:'Capacitar supervisores',pct:85,st:'verde'},{desc:'Nuevas rutas',pct:88,st:'verde'}],
    dims:[84,82,88,84,84]
  },
  {
    id: '6', nombre: 'Luis Paz', sector: 'Sector 6', initials: 'LP',
    kpis:{redDelict:6,superv:78,asistencia:85,operativos:2,compromisos:68},
    incidentes:[48,50,46,44,42,39,37], incTotal:37, incVar:-2,
    tasaResp:9.5, frustrados:3, interv:22, cobertura:72,
    supRealizadas:35,supPlan:46, hallazgos:14, capturas:3, coordPNP:2,
    tardanzas:6.0, disciplinarias:3, rotacion:2,
    reunionesComis:2, patrInt:68, zonasRef:3, acuerdos:1, intConj:9, evitados:4,
    reportes:'78%', inpReduc:5, impAum:8, impDisc:4,
    acuerdosList:['Operativo semanal'],
    comisarias:['PNP Sector 6'],
    operativosTipo:['Control de zona'],
    supervisores:[{n:'Salazar (M)',ast:87},{n:'Guerrero (T)',ast:80},{n:'Paredes (N)',ast:82}],
    rendimiento:[{sup:'Salazar (M)',rutas:82,reportes:78,actitud:85,total:82},{sup:'Guerrero (T)',rutas:78,reportes:76,actitud:80,total:78},{sup:'Paredes (N)',rutas:80,reportes:80,actitud:78,total:79}],
    compromisos:[{desc:'Reducir incidentes',pct:50,st:'rojo'},{desc:'Mejorar asistencia',pct:65,st:'amarillo'},{desc:'Coord. con PNP',pct:55,st:'rojo'}],
    dims:[65,62,60,64,70]
  },
  {
    id: '7', nombre: 'Carmen Vargas', sector: 'Sector 7', initials: 'CV',
    kpis:{redDelict:7,superv:80,asistencia:87,operativos:3,compromisos:70},
    incidentes:[46,48,44,42,40,37,34], incTotal:34, incVar:-3,
    tasaResp:9.2, frustrados:4, interv:24, cobertura:74,
    supRealizadas:37,supPlan:46, hallazgos:13, capturas:3, coordPNP:3,
    tardanzas:5.5, disciplinarias:2, rotacion:1,
    reunionesComis:2, patrInt:70, zonasRef:3, acuerdos:1, intConj:10, evitados:5,
    reportes:'80%', inpReduc:6, impAum:10, impDisc:6,
    acuerdosList:['Operativo semanal'],
    comisarias:['PNP Sector 7'],
    operativosTipo:['Control de zona','Alcoholemia'],
    supervisores:[{n:'Huamán (M)',ast:88},{n:'Córdova (T)',ast:82},{n:'Tapia (N)',ast:85}],
    rendimiento:[{sup:'Huamán (M)',rutas:84,reportes:80,actitud:86,total:83},{sup:'Córdova (T)',rutas:80,reportes:78,actitud:82,total:80},{sup:'Tapia (N)',rutas:82,reportes:84,actitud:80,total:82}],
    compromisos:[{desc:'Reducir incidentes',pct:60,st:'amarillo'},{desc:'Mejorar supervisión',pct:70,st:'amarillo'},{desc:'Coord. vecinal',pct:65,st:'amarillo'}],
    dims:[68,66,64,68,72]
  },
  {
    id: '8', nombre: 'José Reyes', sector: 'Sector 8', initials: 'JR',
    kpis:{redDelict:8,superv:84,asistencia:90,operativos:3,compromisos:76},
    incidentes:[43,45,41,39,37,34,32], incTotal:32, incVar:-3,
    tasaResp:8.5, frustrados:4, interv:26, cobertura:80,
    supRealizadas:40,supPlan:48, hallazgos:11, capturas:4, coordPNP:3,
    tardanzas:4.0, disciplinarias:1, rotacion:1,
    reunionesComis:3, patrInt:76, zonasRef:3, acuerdos:2, intConj:12, evitados:6,
    reportes:'85%', inpReduc:7, impAum:12, impDisc:7,
    acuerdosList:['Operativo semanal','Protocolo de alertas'],
    comisarias:['PNP Sector 8'],
    operativosTipo:['Control de zona','Alcoholemia','Zonas críticas'],
    supervisores:[{n:'Molina (M)',ast:91},{n:'Delgado (T)',ast:84},{n:'Navarro (N)',ast:87}],
    rendimiento:[{sup:'Molina (M)',rutas:88,reportes:85,actitud:90,total:88},{sup:'Delgado (T)',rutas:82,reportes:84,actitud:86,total:84},{sup:'Navarro (N)',rutas:86,reportes:87,actitud:84,total:86}],
    compromisos:[{desc:'Aumentar supervisiones',pct:82,st:'verde'},{desc:'Reducir tardanzas',pct:72,st:'amarillo'},{desc:'Mejorar cobertura',pct:76,st:'amarillo'}],
    dims:[73,70,72,74,76]
  },
  {
    id: '9', nombre: 'Elena Rivas', sector: 'Sector 9', initials: 'ER',
    kpis:{redDelict:13,superv:96,asistencia:98,operativos:6,compromisos:95},
    incidentes:[32,34,30,27,24,21,18], incTotal:18, incVar:-7,
    tasaResp:6.2, frustrados:8, interv:38, cobertura:96,
    supRealizadas:49,supPlan:50, hallazgos:6, capturas:8, coordPNP:6,
    tardanzas:1.0, disciplinarias:0, rotacion:0,
    reunionesComis:5, patrInt:95, zonasRef:6, acuerdos:3, intConj:20, evitados:12,
    reportes:'98%', inpReduc:14, impAum:20, impDisc:14,
    acuerdosList:['Operativo semanal','Protocolo de alertas','Patrullaje mixto'],
    comisarias:['PNP Sector 9','PNP Zona Este','PNP Zona Oeste'],
    operativosTipo:['Control de zona','Alcoholemia','Zonas críticas','Operativo nocturno','Patrullaje mixto'],
    supervisores:[{n:'Valencia (M)',ast:98},{n:'Pacheco (T)',ast:95},{n:'Villegas (N)',ast:96}],
    rendimiento:[{sup:'Valencia (M)',rutas:98,reportes:96,actitud:98,total:97},{sup:'Pacheco (T)',rutas:95,reportes:94,actitud:96,total:95},{sup:'Villegas (N)',rutas:96,reportes:95,actitud:94,total:95}],
    compromisos:[{desc:'Mantener liderazgo',pct:98,st:'verde'},{desc:'Innovar protocolos',pct:92,st:'verde'},{desc:'Expandir cobertura',pct:95,st:'verde'}],
    dims:[91,90,95,88,90]
  }
];

// 3. Add scores and statuses
sectores.forEach(s => {
  s.score = 60 + Math.floor(Math.random()*35);
  s.status = {};
  ['redDelict','superv','asistencia','operativos','compromisos'].forEach(k => {
    const v = s.kpis[k];
    s.status[k] = v >= 10 ? 'verde' : v >= 7 ? 'amarillo' : 'rojo';
  });
});

// Convert object to string, removing quotes around DS.* variables
let sectoresStr = 'const SECTORES = ' + JSON.stringify(sectores, null, 2).replace(/"DS\.([a-zA-Z]+)"/g, 'DS.$1') + ';';

const sectRegex = /const SECTORES = \[\s*\{[\s\S]*?\n\];/;
html = html.replace(sectRegex, sectoresStr);

// 4. Update SECTOR_COLORS
const colorsRegex = /const SECTOR_COLORS = \[.*?\];/;
const newColors = `const SECTOR_COLORS = [DS.primary, DS.success, DS.accent, DS.danger, '#9C27B0', '#00BCD4', '#FF9800', '#795548', '#607D8B', '#E91E63', '#3F51B5'];`;
html = html.replace(colorsRegex, newColors);

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('Done!');
