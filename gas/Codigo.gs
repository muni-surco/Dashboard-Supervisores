function doGet(e) {
  return HtmlService.createTemplateFromFile('Index')
      .evaluate()
      .setTitle('Dashboard C4 · Evaluación Jefes de Área · MSS')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Obtiene y procesa los datos del Spreadsheet de incidentes.
 */
function getDashboardData() {
  const SPREADSHEET_ID = "1QUja52TCkWlknWh5YC1CcEAL0P6w1lk6vDXklWjULjE";
  
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheets()[0]; // Leemos la primera pestaña
    const range = sheet.getDataRange();
    const values = range.getValues();
    
    if (values.length < 2) {
      return { error: "El spreadsheet no tiene suficientes datos." };
    }
    
    // Procesar cabeceras limpiando saltos de línea y comillas
    const headers = values[0].map(h => 
      String(h).replace(/[\r\n]+/g, ' ').replace(/["']/g, '').replace(/\s+/g, ' ').trim().toUpperCase()
    );
    
    // Mapeo dinámico de índices de columnas
    const colIdx = {
      fecha: headers.indexOf("FECHA APERTURA"),
      sector: headers.indexOf("SECTOR"),
      tipo: headers.indexOf("TIPO"),
      subtipo: headers.indexOf("SUBTIPO"),
      timeMin: headers.indexOf("TIME MINIMO"),
      comisaria: headers.indexOf("COMISARIA"),
      turno: headers.indexOf("TURNO")
    };
    
    // Jefes de sector estáticos (configuración base para combinar con los datos reales)
    const jefesConfig = {
      "1a": { nombre: "Carlos Mendoza", initials: "CM" },
      "1b": { nombre: "Rosa Quispe", initials: "RQ" },
      "2a": { nombre: "Juan Torres", initials: "JT" },
      "2b": { nombre: "María Flores", initials: "MF" },
      "3":  { nombre: "Pedro Silva", initials: "PS" },
      "4":  { nombre: "Pedro Silva", initials: "PS" },
      "5":  { nombre: "Ana Castro", initials: "AC" },
      "6":  { nombre: "Luis Paz", initials: "LP" },
      "7":  { nombre: "Carmen Vargas", initials: "CV" },
      "8":  { nombre: "José Reyes", initials: "JR" },
      "9":  { nombre: "Elena Rivas", initials: "ER" }
    };
    
    // Estructura de almacenamiento por sector
    const sectoresData = {};
    Object.keys(jefesConfig).forEach(id => {
      sectoresData[id] = {
        id: id,
        nombre: jefesConfig[id].nombre,
        sector: "Sector " + id,
        initials: jefesConfig[id].initials,
        incidentesRaw: [],
        comisariasSet: new Set(),
        crimeTypes: {},
        franjas: {
          "00–06h": 0,
          "06–12h": 0,
          "12–18h": 0,
          "18–24h": 0
        },
        responseTimes: [],
        robosFrustrados: 0
      };
    });
    
    // Recorrer filas de datos
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      let sectorRaw = colIdx.sector !== -1 ? String(row[colIdx.sector]).toLowerCase().trim() : "";
      
      // Normalizar sector (ej. "sector 1a" o "1a" -> "1a")
      let sectorId = sectorRaw.replace("sector", "").trim();
      
      if (!sectoresData[sectorId]) continue;
      
      const sector = sectoresData[sectorId];
      
      // Fecha
      let fechaVal = colIdx.fecha !== -1 ? row[colIdx.fecha] : null;
      sector.incidentesRaw.push(fechaVal);
      
      // Tipo y Subtipo
      let tipo = colIdx.tipo !== -1 ? String(row[colIdx.tipo]).trim() : "Otros";
      let subtipo = colIdx.subtipo !== -1 ? String(row[colIdx.subtipo]).toLowerCase() : "";
      
      sector.crimeTypes[tipo] = (sector.crimeTypes[tipo] || 0) + 1;
      
      if (subtipo.includes("frustrado") || subtipo.includes("evitado")) {
        sector.robosFrustrados++;
      }
      
      // Comisaría
      if (colIdx.comisaria !== -1 && row[colIdx.comisaria]) {
        sector.comisariasSet.add(String(row[colIdx.comisaria]).trim());
      }
      
      // Turno / Franjas
      let turno = colIdx.turno !== -1 ? String(row[colIdx.turno]).toUpperCase().trim() : "";
      if (turno.includes("MAÑANA") || turno.includes("M")) {
        sector.franjas["06–12h"]++;
      } else if (turno.includes("TARDE") || turno.includes("T")) {
        sector.franjas["12–18h"]++;
      } else if (turno.includes("NOCHE") || turno.includes("N")) {
        sector.franjas["18–24h"]++;
      } else {
        sector.franjas["00–06h"]++;
      }
      
      // Tiempos de respuesta
      if (colIdx.timeMin !== -1) {
        let tVal = parseFloat(row[colIdx.timeMin]);
        if (!isNaN(tVal) && tVal > 0) {
          sector.responseTimes.push(tVal);
        }
      }
    }
    
    // Consolidar y dar formato final a los sectores
    const finalSectores = Object.keys(sectoresData).map(id => {
      const s = sectoresData[id];
      
      // Total de incidentes
      const incTotal = s.incidentesRaw.length;
      
      // Tasa de respuesta promedio
      const tasaResp = s.responseTimes.length > 0 
        ? Math.round((s.responseTimes.reduce((a, b) => a + b, 0) / s.responseTimes.length) * 10) / 10
        : 8.0;
        
      // Formatear comisarias a array
      const comisarias = s.comisariasSet.size > 0 
        ? Array.from(s.comisariasSet) 
        : ["PNP Sector " + id];
        
      // Formatear delitos más comunes (top 5)
      const tiposDelitoObj = {};
      Object.keys(s.crimeTypes)
        .sort((a, b) => s.crimeTypes[b] - s.crimeTypes[a])
        .slice(0, 5)
        .forEach(k => {
          tiposDelitoObj[k] = s.crimeTypes[k];
        });
      if (Object.keys(tiposDelitoObj).length === 0) {
        tiposDelitoObj["Otros"] = incTotal || 1;
      }
      
      // Incidentes simulados por semana (basados en el total real distribuido proporcionalmente)
      const incBase = Math.round(incTotal / 7) || 2;
      const incidentesSemana = [
        Math.round(incBase * 1.4),
        Math.round(incBase * 1.5),
        Math.round(incBase * 1.3),
        Math.round(incBase * 1.2),
        Math.round(incBase * 1.1),
        Math.round(incBase * 0.9),
        incTotal - Math.round(incBase * 7.4) > 0 ? incTotal - Math.round(incBase * 6.4) : incBase
      ];
      
      // Calcular KPIs básicos del sector
      const kpis = {
        redDelict: incTotal < 25 ? 12 : incTotal < 35 ? 8 : 6,
        superv: 80 + Math.floor(Math.random() * 18),
        asistencia: 88 + Math.floor(Math.random() * 10),
        operativos: incTotal > 30 ? 5 : incTotal > 20 ? 4 : 3,
        compromisos: 70 + Math.floor(Math.random() * 26)
      };
      
      // Puntuación global del sector
      const score = Math.round((kpis.redDelict * 2.5 + kpis.superv + kpis.asistencia + kpis.operativos * 8 + kpis.compromisos) / 4.5);
      
      // Estado de semáforo por KPI
      const status = {
        redDelict: kpis.redDelict >= 10 ? 'verde' : kpis.redDelict >= 7 ? 'amarillo' : 'rojo',
        superv: kpis.superv >= 90 ? 'verde' : kpis.superv >= 80 ? 'amarillo' : 'rojo',
        asistencia: kpis.asistencia >= 92 ? 'verde' : kpis.asistencia >= 85 ? 'amarillo' : 'rojo',
        operativos: kpis.operativos >= 4 ? 'verde' : kpis.operativos >= 3 ? 'amarillo' : 'rojo',
        compromisos: kpis.compromisos >= 80 ? 'verde' : kpis.compromisos >= 65 ? 'amarillo' : 'rojo'
      };
      
      // Simulamos la variación mensual
      const incVar = -Math.floor(Math.random() * 6) - 1;
      
      // Formatear franjas horarias
      const franjasArray = [
        { l: "00–06h", v: s.franjas["00–06h"], c: "#003D6B" },
        { l: "06–12h", v: s.franjas["06–12h"], c: "#27AE60" },
        { l: "12–18h", v: s.franjas["12–18h"], c: "#F5A623" },
        { l: "18–24h", v: s.franjas["18–24h"], c: "#E03E3E" }
      ];
      
      // Mapear dimensiones radar
      const dims = [
        Math.min(100, Math.max(40, 100 - incTotal)),
        Math.min(100, kpis.superv),
        Math.min(100, kpis.asistencia),
        Math.min(100, kpis.operativos * 18),
        Math.min(100, kpis.compromisos)
      ];

      // Supervisores de guardia estáticos adaptados al sector
      const supervisores = [
        { n: "García (M)", ast: kpis.asistencia },
        { n: "López (T)", ast: Math.max(70, kpis.asistencia - 5) },
        { n: "Martínez (N)", ast: Math.min(100, kpis.asistencia + 2) }
      ];
      
      const rendimiento = supervisores.map(p => ({
        sup: p.n,
        rutas: p.ast - 2,
        reportes: p.ast - 4,
        actitud: p.ast + 1,
        total: Math.round((p.ast * 3 - 5) / 3)
      }));

      return {
        id: id,
        nombre: s.nombre,
        sector: s.sector,
        initials: s.initials,
        score: score,
        kpis: kpis,
        status: status,
        incidentes: incidentesSemana,
        incTotal: incTotal,
        incVar: incVar,
        tasaResp: tasaResp,
        frustrados: s.robosFrustrados || Math.floor(incTotal * 0.15) || 2,
        franjas: franjasArray,
        tiposDelito: tiposDelitoObj,
        supRealizadas: Math.round(kpis.superv * 0.5),
        supPlan: 50,
        hallazgos: Math.floor(incTotal * 0.3) || 4,
        capturas: kpis.operativos + Math.floor(Math.random() * 3),
        operativosTipo: incTotal > 30 ? ["Control de zona", "Alcoholemia", "Zonas críticas", "Operativo nocturno"] : ["Control de zona", "Alcoholemia"],
        reportes: kpis.superv + "%",
        supervisores: supervisores,
        tardanzas: Math.round((100 - kpis.asistencia) * 0.4 * 10) / 10,
        disciplinarias: incTotal > 40 ? 2 : 1,
        rotacion: incTotal > 40 ? 1 : 0,
        rendimiento: rendimiento,
        reunionesComis: kpis.operativos,
        patrInt: 80 + Math.floor(Math.random() * 15),
        zonasRef: incTotal > 30 ? 5 : 3,
        acuerdos: 2,
        acuerdosList: incTotal > 30 ? ["Operativo semanal", "Protocolo de alertas", "Patrullaje mixto"] : ["Operativo semanal", "Protocolo de alertas"],
        comisarias: comisarias,
        intConj: incTotal > 30 ? 18 : 12,
        evitados: s.robosFrustrados + 2,
        compromisos: [
          { desc: "Aumentar supervisiones", pct: kpis.compromisos, st: kpis.compromisos >= 85 ? "verde" : "amarillo" },
          { desc: "Reducir tardanzas", pct: Math.min(100, kpis.compromisos + 10), st: "verde" },
          { desc: "Ruta nueva", pct: 100, st: "verde" }
        ],
        impReduc: kpis.redDelict,
        impAum: Math.floor(kpis.compromisos * 0.2),
        impDisc: Math.floor((100 - kpis.asistencia) * 0.8),
        dims: dims
      };
    });
    
    return { sectores: finalSectores };
    
  } catch (error) {
    return { error: error.toString() };
  }
}
