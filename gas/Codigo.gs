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
function getDashboardData(fechaInicio, fechaFin, turnoFilter) {
  const SPREADSHEET_ID = "1QUja52TCkWlknWh5YC1CcEAL0P6w1lk6vDXklWjULjE";
  const SUP_SPREADSHEET_ID = "1aGLYGiowhtvIzioo5zZF3rl-fnP6kBUg0ecYXrJr1-g";
  
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
              let sVal = String(jefesValues[i][idxSector]).toLowerCase().replace("sector", "").trim().toUpperCase();
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
      return { error: "No se encontraron datos en la hoja Jefes_Area." };
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
      let sectorId = sectorRaw.replace("sector", "").trim().toUpperCase();
      if (!sectoresData[sectorId]) continue;
      
      const sector = sectoresData[sectorId];
      
      // Filtrar por fecha
      let fechaVal = col.fecha >= 0 ? row[col.fecha] : null;
      if (fechaVal) {
        if (typeof fechaVal === 'string') fechaVal = new Date(fechaVal);
        if (fechaVal < fechaInicio || fechaVal > fechaFin) continue;
      }
      
      // Filtrar por turno
      if (turnoFilter) {
        var tv = col.turno >= 0 ? String(row[col.turno]).toUpperCase().trim() : "";
        var tcat = "";
        if (tv.indexOf("MAÑANA") !== -1 || tv.indexOf("M") !== -1) tcat = "manana";
        else if (tv.indexOf("TARDE") !== -1 || tv.indexOf("T") !== -1) tcat = "tarde";
        else if (tv.indexOf("NOCHE") !== -1 || tv.indexOf("N") !== -1) tcat = "noche";
        if (tcat !== turnoFilter) continue;
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
        : null;
      
      const comisarias = s.comisariasSet.size > 0
        ? Array.from(s.comisariasSet)
        : [];
      
      const tiposDelitoObj = {};
      Object.keys(s.crimeTypes)
        .sort((a, b) => s.crimeTypes[b] - s.crimeTypes[a])
        .slice(0, 5)
        .forEach(k => { tiposDelitoObj[k] = s.crimeTypes[k]; });
      if (Object.keys(tiposDelitoObj).length === 0 && incTotal > 0) {
        tiposDelitoObj["Otros"] = incTotal;
      }
      
      const franjasArray = [
        { l: "00–06h", v: s.franjas["00–06h"], c: "#003D6B" },
        { l: "06–12h", v: s.franjas["06–12h"], c: "#27AE60" },
        { l: "12–18h", v: s.franjas["12–18h"], c: "#F5A623" },
        { l: "18–24h", v: s.franjas["18–24h"], c: "#E03E3E" }
      ];
      
      var supervisores = [];
      var rendimiento = [];
      
      return {
        id, nombre: s.nombre, sector: s.sector, initials: s.initials,
        incTotal, tasaResp, comisarias,
        franjas: franjasArray, tiposDelito: tiposDelitoObj,
        frustrados: s.robosFrustrados, robosFrustrados: s.robosFrustrados,
        operativosCount: s.operativosCount,
        coordVecinales: s.coordVecinalesCount,
        capturas: s.capturasCount,
        patrullajeCount: s.patrullajeCount,
        supervisores, rendimiento
      };
    });
    
    // ── 6. SUPERVISOR DATA FROM SECOND SPREADSHEET ──
    var supervisorData = {};
    try {
      var supSs = SpreadsheetApp.openById(SUP_SPREADSHEET_ID);
      var supSheet = supSs.getSheetByName("2026");
      if (supSheet) {
        var supRows = supSheet.getDataRange().getValues();
        if (supRows.length > 1) {
          var supHeaders = supRows[0].map(function(h) { return String(h).trim().toUpperCase(); });
          var sFecha = supHeaders.indexOf("FECHA");
          var sSector = supHeaders.indexOf("SECTOR");
          var sTurno = supHeaders.indexOf("TURNO");
          var sSupervisor = supHeaders.indexOf("SUPERVISOR");
          var sPartes = supHeaders.indexOf("CANTPARTES");
          if (sSector >= 0 && sSupervisor >= 0) {
            for (var si = 1; si < supRows.length; si++) {
              var sr = supRows[si];
              var secId = String(sr[sSector]).toLowerCase().replace("sector","").trim().toUpperCase();
              if (!finalSectores.find(function(fs){ return fs.id === secId; })) continue;
              if (!supervisorData[secId]) supervisorData[secId] = [];
              supervisorData[secId].push({
                fecha: sFecha >= 0 ? sr[sFecha] : null,
                turno: sTurno >= 0 ? String(sr[sTurno]).trim() : "",
                supervisor: sSupervisor >= 0 ? String(sr[sSupervisor]).trim() : "",
                partes: sPartes >= 0 ? (parseInt(sr[sPartes]) || 0) : 0
              });
            }
          }
        }
      }
    } catch(e) {
      Logger.log("Error reading supervisor sheet: " + e.toString());
    }

    // ── Build supervisors dynamically from sheet data ──
    finalSectores.forEach(function(sec) {
      var supRows = supervisorData[sec.id] || [];
      if (supRows.length === 0) return;
      var turnoMap = {};
      supRows.forEach(function(r) {
        var t = r.turno.toUpperCase();
        var key = t.indexOf("M") !== -1 ? "M" : t.indexOf("T") !== -1 ? "T" : t.indexOf("N") !== -1 ? "N" : "X";
        if (!turnoMap[key]) turnoMap[key] = { names: {}, count: 0 };
        turnoMap[key].names[r.supervisor] = (turnoMap[key].names[r.supervisor] || 0) + r.partes;
        turnoMap[key].count++;
      });
      var newSups = [];
      var turnoLabels = { M: "M", T: "T", N: "N" };
      Object.keys(turnoLabels).forEach(function(tk) {
        var td = turnoMap[tk];
        if (!td || Object.keys(td.names).length === 0) return;
        var bestName = "", bestPartes = 0;
        Object.keys(td.names).forEach(function(nm) {
          if (td.names[nm] > bestPartes) { bestPartes = td.names[nm]; bestName = nm; }
        });
        if (!bestName) return;
        var partesAvg = Math.round((bestPartes / td.count) * 22);
        var ast = Math.min(100, Math.max(60, partesAvg));
        newSups.push({ n: bestName + " (" + tk + ")", ast: ast });
      });
      if (newSups.length > 0) {
        sec.supervisores = newSups;
        sec.rendimiento = newSups.map(function(p) {
          return {
            sup: p.n, rutas: Math.min(100, Math.max(60, Math.round(p.ast * 0.95))),
            reportes: Math.min(100, Math.max(60, Math.round(p.ast * 0.90))),
            actitud: Math.min(100, Math.max(60, Math.round(p.ast * 0.85))),
            total: Math.round((p.ast * 0.95 + p.ast * 0.90 + p.ast * 0.85) / 3)
          };
        });
      }
    });

    return {
      sectores: finalSectores,
      supervisorMeta: { totalRows: Object.values(supervisorData).reduce(function(a,b){return a+b.length;},0) || 0 }
    };
    
  } catch (error) {
    return { error: error.toString() };
  }
}
