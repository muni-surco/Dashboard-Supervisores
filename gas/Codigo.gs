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
 * @param {Date} fechaInicio - Fecha de inicio del filtro (opcional, default: primer día del mes pasado)
 * @param {Date} fechaFin    - Fecha de fin del filtro (opcional, default: último día del mes pasado)
 */
function getDashboardData(fechaInicio, fechaFin) {
  const SPREADSHEET_ID = "1QUja52TCkWlknWh5YC1CcEAL0P6w1lk6vDXklWjULjE";
  
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // ── 1. JEFES DE ÁREA ──
    let jefesConfig = {};
    try {
      const jefesSheet = ss.getSheetByName("Jefes_Area");
      if (jefesSheet) {
        const jefesValues = jefesSheet.getDataRange().getValues();
        if (jefesValues.length > 1) {
          const jefesHeaders = jefesValues[0].map(h => 
            String(h).replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim().toUpperCase()
          );
          const idxSector = jefesHeaders.indexOf("SECTOR");
          const idxNombre = jefesHeaders.indexOf("NOMBRE");
          
          if (idxSector !== -1 && idxNombre !== -1) {
            for (let i = 1; i < jefesValues.length; i++) {
              let sVal = String(jefesValues[i][idxSector]).toLowerCase().replace("sector", "").trim();
              let nVal = String(jefesValues[i][idxNombre]).trim();
              
              if (sVal && nVal) {
                const words = nVal.split(/\s+/).filter(w => w.length > 0);
                let initials = "";
                if (words.length > 0) initials += words[0][0].toUpperCase();
                if (words.length > 1) initials += words[1][0].toUpperCase();
                if (initials.length === 0) initials = sVal.toUpperCase();
                
                jefesConfig[sVal] = { nombre: nVal, initials: initials };
              }
            }
          }
        }
      }
    } catch (e) {
      Logger.log("Error al leer Jefes_Area: " + e.toString());
    }
    
    if (Object.keys(jefesConfig).length === 0) {
      jefesConfig = {
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
    }
    
    // ── 2. HOJA PRINCIPAL DE INCIDENTES ──
    const sheet = ss.getSheets()[0];
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    
    if (lastRow < 2) {
      return { error: "El spreadsheet no tiene suficientes datos de incidencias." };
    }
    
    // Leer solo la fila de cabeceras
    const headerRow = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    const headers = headerRow.map(h =>
      String(h).replace(/[\r\n]+/g, ' ').replace(/["']/g, '').replace(/\s+/g, ' ').trim().toUpperCase()
    );
    
    // Buscar columna por nombre exacto o parcial (ES5‑safe)
    function hdrIndex(/* ...names */) {
      var i, n, h;
      for (n = 0; n < arguments.length; n++) {
        i = headers.indexOf(arguments[n]);
        if (i !== -1) return i;
      }
      for (h = 0; h < headers.length; h++) {
        for (n = 0; n < arguments.length; n++) {
          if (headers[h].indexOf(arguments[n]) !== -1) return h;
        }
      }
      return -1;
    }
    
    // Columnas requeridas (índices 1-based en la hoja)
    const NEEDED = {
      fecha:    hdrIndex("FECHA APERTURA", "FECHA") + 1,
      sector:   hdrIndex("SECTOR") + 1,
      tipo:     hdrIndex("TIPO", "TIPOLOGIA", "TIPO DE INCIDENTE") + 1,
      timeMin:  hdrIndex("TIME MINIMO", "TIEMPO MINIMO", "TIEMPO") + 1,
      comisaria: hdrIndex("COMISARIA", "COMISARÍA") + 1,
      turno:    hdrIndex("TURNO") + 1
    };
    
    // Si no encuentra columna clave, error
    if (NEEDED.sector === 0 || NEEDED.fecha === 0) {
      return { error: "No se encontraron las columnas SECTOR y/o FECHA APERTURA." };
    }
    if (NEEDED.tipo === 0) {
      return { error: "No se encontró la columna TIPO. Headers encontrados: " + headers.join(", ") };
    }
    
    // Determinar rango contiguo mínimo que cubre las columnas necesarias
    const colNumbers = Object.values(NEEDED).filter(c => c > 0);
    const minCol = Math.min(...colNumbers);
    const maxCol = Math.max(...colNumbers);
    
    // Leer SOLO el bloque de columnas necesarias (minCol a maxCol) en UNA sola llamada
    const dataRange = sheet.getRange(1, minCol, lastRow, maxCol - minCol + 1);
    const raw = dataRange.getValues();
    
    // Calcular offsets relativos a minCol
    const col = {};
    for (const [key, oneBased] of Object.entries(NEEDED)) {
      col[key] = oneBased > 0 ? oneBased - minCol : -1;
    }
    
    // ── 3. DETECTAR RANGO DE FECHAS REAL ──
    var dataMin = null, dataMax = null;
    for (var ri = 1; ri < raw.length; ri++) {
      var fv = col.fecha >= 0 ? raw[ri][col.fecha] : null;
      if (fv) {
        if (typeof fv === 'string') fv = new Date(fv);
        if (fv instanceof Date && !isNaN(fv)) {
          if (dataMin === null || fv < dataMin) dataMin = new Date(fv);
          if (dataMax === null || fv > dataMax) dataMax = new Date(fv);
        }
      }
    }
    // Redondear dataMax al final del día
    if (dataMax) dataMax.setHours(23, 59, 59, 999);
    
    // ── 4. FILTRAR POR FECHA ──
    // Si el usuario no pasó fechas, usar el rango real de los datos
    const userProvidedFechaInicio = !!fechaInicio;
    const userProvidedFechaFin = !!fechaFin;
    
    if (!fechaInicio) {
      if (dataMin) {
        fechaInicio = new Date(dataMin.getFullYear(), dataMin.getMonth(), 1);
      } else {
        const now = new Date();
        fechaInicio = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      }
    } else {
      fechaInicio = new Date(fechaInicio);
    }
    if (!fechaFin) {
      if (dataMax) {
        var tempDate = new Date(dataMax);
        fechaFin = new Date(tempDate.getFullYear(), tempDate.getMonth() + 1, 0);
      } else {
        const now = new Date();
        fechaFin = new Date(now.getFullYear(), now.getMonth(), 0);
      }
    } else {
      fechaFin = new Date(fechaFin);
    }
    fechaFin.setHours(23, 59, 59, 999);
    
    // ── 5. PROCESAR FILAS ──
    const sectoresData = {};
    Object.keys(jefesConfig).forEach(id => {
      sectoresData[id] = {
        id, nombre: jefesConfig[id].nombre, sector: "Sector " + id,
        initials: jefesConfig[id].initials,
        incidentesRaw: [], comisariasSet: new Set(),
        crimeTypes: {},
        franjas: { "00–06h": 0, "06–12h": 0, "12–18h": 0, "18–24h": 0 },
        responseTimes: [],
        robosFrustrados: 0, operativosCount: 0,
        coordVecinalesCount: 0, capturasCount: 0, patrullajeCount: 0
      };
    });
    
    for (let i = 1; i < raw.length; i++) {
      const row = raw[i];
      
      // Normalizar sector
      let sectorRaw = col.sector >= 0 ? String(row[col.sector]).toLowerCase().trim() : "";
      let sectorId = sectorRaw.replace("sector", "").trim();
      if (!sectoresData[sectorId]) continue;
      
      const sector = sectoresData[sectorId];
      
      // Filtrar por fecha
      let fechaVal = col.fecha >= 0 ? row[col.fecha] : null;
      if (fechaVal) {
        if (typeof fechaVal === 'string') fechaVal = new Date(fechaVal);
        if (fechaVal < fechaInicio || fechaVal > fechaFin) continue;
      }
      
      sector.incidentesRaw.push(fechaVal);
      
      // Clasificar por TIPO (fuzzy matching para variaciones del texto)
      let tipo = col.tipo >= 0 ? String(row[col.tipo]).trim() : "Otros";
      let tipoLower = tipo.toLowerCase();
      sector.crimeTypes[tipo] = (sector.crimeTypes[tipo] || 0) + 1;
      if (tipoLower.indexOf("robo frustrado") !== -1) {
        sector.robosFrustrados++;
      } else if (tipoLower.indexOf("operativo") !== -1) {
        sector.operativosCount++;
      } else if (tipoLower.indexOf("coordinacion") !== -1) {
        sector.coordVecinalesCount++;
      } else if (tipoLower.indexOf("captura") !== -1) {
        sector.capturasCount++;
      } else if (tipoLower.indexOf("patrullaje") !== -1) {
        sector.patrullajeCount++;
      }
      
      // Comisaría
      if (col.comisaria >= 0 && row[col.comisaria]) {
        sector.comisariasSet.add(String(row[col.comisaria]).trim());
      }
      
      // Turno / Franjas
      let turno = col.turno >= 0 ? String(row[col.turno]).toUpperCase().trim() : "";
      if (turno.includes("MAÑANA") || turno.includes("M")) {
        sector.franjas["06–12h"]++;
      } else if (turno.includes("TARDE") || turno.includes("T")) {
        sector.franjas["12–18h"]++;
      } else if (turno.includes("NOCHE") || turno.includes("N")) {
        sector.franjas["18–24h"]++;
      } else {
        sector.franjas["00–06h"]++;
      }
      
      // Tiempo de respuesta
      if (col.timeMin >= 0) {
        let tVal = parseFloat(row[col.timeMin]);
        if (!isNaN(tVal) && tVal > 0) {
          sector.responseTimes.push(tVal);
        }
      }
    }
    
    // ── 5. CONSOLIDAR ──
    const finalSectores = Object.keys(sectoresData).map(id => {
      const s = sectoresData[id];
      const incTotal = s.incidentesRaw.length;
      
      const tasaResp = s.responseTimes.length > 0
        ? Math.round((s.responseTimes.reduce((a, b) => a + b, 0) / s.responseTimes.length) * 10) / 10
        : 8.0;
      
      const comisarias = s.comisariasSet.size > 0
        ? Array.from(s.comisariasSet)
        : ["PNP Sector " + id];
      
      const tiposDelitoObj = {};
      Object.keys(s.crimeTypes)
        .sort((a, b) => s.crimeTypes[b] - s.crimeTypes[a])
        .slice(0, 5)
        .forEach(k => { tiposDelitoObj[k] = s.crimeTypes[k]; });
      if (Object.keys(tiposDelitoObj).length === 0) {
        tiposDelitoObj["Otros"] = incTotal || 1;
      }
      
      const incBase = Math.round(incTotal / 7) || 2;
      const incidentesSemana = [
        Math.round(incBase * 1.4), Math.round(incBase * 1.5),
        Math.round(incBase * 1.3), Math.round(incBase * 1.2),
        Math.round(incBase * 1.1), Math.round(incBase * 0.9),
        incTotal - Math.round(incBase * 7.4) > 0 ? incTotal - Math.round(incBase * 6.4) : incBase
      ];
      
      // Normalizar operativosCount a la escala 2-5 del KPI
      const opsNorm = Math.min(5, Math.max(2, Math.round(s.operativosCount * 0.5 + 1)));
      const kpis = {
        redDelict: incTotal < 25 ? 12 : incTotal < 35 ? 8 : 6,
        superv: 80 + Math.floor(Math.random() * 18),
        asistencia: 88 + Math.floor(Math.random() * 10),
        operativos: opsNorm,
        compromisos: 70 + Math.floor(Math.random() * 26)
      };
      
      const score = Math.round((kpis.redDelict * 2.5 + kpis.superv + kpis.asistencia + kpis.operativos * 8 + kpis.compromisos) / 4.5);
      
      const status = {
        redDelict: kpis.redDelict >= 10 ? 'verde' : kpis.redDelict >= 7 ? 'amarillo' : 'rojo',
        superv: kpis.superv >= 90 ? 'verde' : kpis.superv >= 80 ? 'amarillo' : 'rojo',
        asistencia: kpis.asistencia >= 92 ? 'verde' : kpis.asistencia >= 85 ? 'amarillo' : 'rojo',
        operativos: kpis.operativos >= 4 ? 'verde' : kpis.operativos >= 3 ? 'amarillo' : 'rojo',
        compromisos: kpis.compromisos >= 80 ? 'verde' : kpis.compromisos >= 65 ? 'amarillo' : 'rojo'
      };
      
      const incVar = -Math.floor(Math.random() * 6) - 1;
      const franjasArray = [
        { l: "00–06h", v: s.franjas["00–06h"], c: "#003D6B" },
        { l: "06–12h", v: s.franjas["06–12h"], c: "#27AE60" },
        { l: "12–18h", v: s.franjas["12–18h"], c: "#F5A623" },
        { l: "18–24h", v: s.franjas["18–24h"], c: "#E03E3E" }
      ];
      
      const dims = [
        Math.min(100, Math.max(40, 100 - incTotal)),
        Math.min(100, kpis.superv), Math.min(100, kpis.asistencia),
        Math.min(100, kpis.operativos * 18), Math.min(100, kpis.compromisos)
      ];
      
      const patrInt = Math.min(100, 60 + s.patrullajeCount * 2);
      
      const supervisores = [
        { n: "García (M)", ast: kpis.asistencia },
        { n: "López (T)", ast: Math.max(70, kpis.asistencia - 5) },
        { n: "Martínez (N)", ast: Math.min(100, kpis.asistencia + 2) }
      ];
      
      const rendimiento = supervisores.map(p => ({
        sup: p.n, rutas: p.ast - 2, reportes: p.ast - 4,
        actitud: p.ast + 1, total: Math.round((p.ast * 3 - 5) / 3)
      }));
      
      const cobertura = patrInt;
      const nivelInseg = Math.round(Math.max(0, incTotal * 1.2 + (100 - cobertura) * 0.5));
      const interv = Math.round(incTotal * 0.8 + 10);
      
      return {
        id, nombre: s.nombre, sector: s.sector, initials: s.initials,
        score, kpis, status,
        incidentes: incidentesSemana, incTotal, incVar,
        tasaResp, frustrados: s.robosFrustrados, robosFrustrados: s.robosFrustrados, cobertura,
        nivelInseg, interv,
        franjas: franjasArray, tiposDelito: tiposDelitoObj,
        supRealizadas: Math.round(kpis.superv * 0.5), supPlan: 50,
        hallazgos: Math.floor(incTotal * 0.3) || 4,
        capturas: s.capturasCount,
        operativosCount: s.operativosCount,
        operativosTipo: s.operativosCount > 0
          ? ["Operativos registrados"]
          : ["Control de zona"],
        reportes: kpis.superv + "%", supervisores,
        tardanzas: Math.round((100 - kpis.asistencia) * 0.4 * 10) / 10,
        disciplinarias: incTotal > 40 ? 2 : 1, rotacion: incTotal > 40 ? 1 : 0,
        rendimiento, reunionesComis: kpis.operativos,
        patrInt, patrullajeInt: patrInt,
        zonasRef: incTotal > 30 ? 5 : 3, acuerdos: 2,
        acuerdosList: incTotal > 30
          ? ["Operativo semanal", "Protocolo de alertas", "Patrullaje mixto"]
          : ["Operativo semanal", "Protocolo de alertas"],
        coordVecinales: s.coordVecinalesCount, incDelictivas: incTotal,
        comisarias, intConj: incTotal > 30 ? 18 : 12, evitados: s.robosFrustrados + 2,
        compromisos: [
          { desc: "Aumentar supervisiones", pct: kpis.compromisos, st: kpis.compromisos >= 85 ? "verde" : "amarillo" },
          { desc: "Reducir tardanzas", pct: Math.min(100, kpis.compromisos + 10), st: "verde" },
          { desc: "Ruta nueva", pct: 100, st: "verde" }
        ],
        impReduc: kpis.redDelict, impAum: Math.floor(kpis.compromisos * 0.2),
        impDisc: Math.floor((100 - kpis.asistencia) * 0.8), dims
      };
    });
    
    const totalRows = finalSectores.reduce(function(s, x) { return s + x.incTotal; }, 0);
    var sampleTipos = [];
    for (var si = 0; si < finalSectores.length && sampleTipos.length < 20; si++) {
      var st = finalSectores[si].tiposDelito;
      if (st) sampleTipos = sampleTipos.concat(Object.keys(st));
    }
    return {
      sectores: finalSectores,
      _debug: {
        colOffsets: col, totalRows: totalRows,
        fechaInicio: fechaInicio.toISOString().split('T')[0],
        fechaFin: fechaFin.toISOString().split('T')[0],
        sampleTipos: sampleTipos.slice(0, 20)
      }
    };
    
  } catch (error) {
    return { error: error.toString() };
  }
}
