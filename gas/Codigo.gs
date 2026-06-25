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
 * Retorna solo los datos de supervisores desde el spreadsheet, filtrados por fecha.
 * Las incidencias ahora se obtienen desde Supabase vía el frontend.
 */
function getSupervisoresData(fechaInicioStr, fechaFinStr) {
  const SUP_SPREADSHEET_ID = "1aGLYGiowhtvIzioo5zZF3rl-fnP6kBUg0ecYXrJr1-g";
  
  try {
    Logger.log('getSupervisoresData llamado con: ' + fechaInicioStr + ', ' + fechaFinStr);
    var supSs = SpreadsheetApp.openById(SUP_SPREADSHEET_ID);
    var supSheet = supSs.getSheetByName("2026");
    if (!supSheet) {
      Logger.log('Error: No se encontró la hoja \'2026\' en el spreadsheet de supervisores.');
      return { error: "No se encontró la hoja '2026' en el spreadsheet de supervisores." };
    }
    
    var supRows = supSheet.getDataRange().getValues();
    Logger.log('Total de filas leídas del spreadsheet de supervisores: ' + supRows.length);
    if (supRows.length <= 1) {
      Logger.log('Error: El spreadsheet de supervisores no tiene datos.');
      return { error: "El spreadsheet de supervisores no tiene datos." };
    }
    
    var supHeaders = supRows[0].map(function(h) { return String(h).trim().toUpperCase(); });
    var sFecha = supHeaders.indexOf("FECHA");
    var sSector = supHeaders.indexOf("SECTOR");
    var sTurno = supHeaders.indexOf("TURNO");
    var sSupervisor = supHeaders.indexOf("SUPERVISOR");
    var sPartes = supHeaders.indexOf("CANTPARTES");

    Logger.log('Indices de cabeceras - FECHA: ' + sFecha + ', SECTOR: ' + sSector + ', SUPERVISOR: ' + sSupervisor);
    
    if (sSector < 0 || sSupervisor < 0) {
      Logger.log('Error: No se encontraron las columnas SECTOR y/o SUPERVISOR.');
      return { error: "No se encontraron las columnas SECTOR y/o SUPERVISOR." };
    }

    // Parse date filters
    const fechaInicio = fechaInicioStr ? new Date(fechaInicioStr + 'T00:00:00') : null;
    const fechaFin = fechaFinStr ? new Date(fechaFinStr + 'T23:59:59') : null;
    Logger.log('Fechas de filtro parsed: ' + fechaInicio + ' a ' + fechaFin);
    
    var rows = [];
    for (var si = 1; si < supRows.length; si++) {
      var sr = supRows[si];
      
      // Date filtering for supervisors
      let rowDate = sFecha >= 0 ? new Date(sr[sFecha]) : null;
      if (rowDate && !isNaN(rowDate)) {
        if (fechaInicio && rowDate < fechaInicio) continue;
        if (fechaFin && rowDate > fechaFin) continue;
      }

      rows.push({
        fecha: sFecha >= 0 ? sr[sFecha] : null,
        sector: String(sr[sSector]).toLowerCase().replace("sector","").trim().toUpperCase(),
        turno: sTurno >= 0 ? String(sr[sTurno]).trim() : "",
        supervisor: sSupervisor >= 0 ? String(sr[sSupervisor]).trim() : "",
        partes: sPartes >= 0 ? (parseInt(sr[sPartes]) || 0) : 0
      });
    }
    
    Logger.log('Número de filas de supervisores después de filtrar: ' + rows.length);
    return { rows: rows, total: rows.length };
    
  } catch (error) {
    Logger.log('Error inesperado en getSupervisoresData: ' + error.toString());
    return { error: error.toString() };
  }
}
