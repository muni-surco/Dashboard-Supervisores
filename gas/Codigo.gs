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
 * Retorna supervisores agregados por sector+turno desde el spreadsheet.
 * Agrupa todas las filas diarias, elige el supervisor con mayor CantPartes
 * por sector+turno, y devuelve solo los datos agregados (no filas raw).
 */
function getSupervisoresData() {
  const SUP_SPREADSHEET_ID = "1aGLYGiowhtvIzioo5zZF3rl-fnP6kBUg0ecYXrJr1-g";

  try {
    var supSs = SpreadsheetApp.openById(SUP_SPREADSHEET_ID);
    var supSheet = supSs.getSheetByName("2026");
    if (!supSheet) {
      return { error: "No se encontró la hoja '2026' en el spreadsheet de supervisores." };
    }

    var allRows = supSheet.getDataRange().getValues();
    if (allRows.length <= 1) {
      return { error: "El spreadsheet de supervisores no tiene datos." };
    }

    var headers = allRows[0].map(function(h) { return String(h).trim().toUpperCase(); });
    var sSector = headers.indexOf("SECTOR");
    var sTurno = headers.indexOf("TURNO");
    var sSupervisor = headers.indexOf("SUPERVISOR");
    var sPartes = headers.indexOf("CANTPARTES");

    if (sSector < 0 || sSupervisor < 0) {
      return { error: "No se encontraron las columnas SECTOR y/o SUPERVISOR." };
    }

    // Aggregate: sector -> turno -> supervisor -> {sumPartes, count}
    var agg = {};
    for (var si = 1; si < allRows.length; si++) {
      var sr = allRows[si];
      var sector = String(sr[sSector]).toLowerCase().replace("sector","").trim().toUpperCase();
      var turno = sTurno >= 0 ? String(sr[sTurno]).trim().toUpperCase() : "";
      var supName = sSupervisor >= 0 ? String(sr[sSupervisor]).trim() : "";
      var partes = sPartes >= 0 ? (parseInt(sr[sPartes]) || 0) : 0;
      if (!sector || !supName) continue;

      if (!agg[sector]) agg[sector] = {};
      if (!agg[sector][turno]) agg[sector][turno] = {};
      if (!agg[sector][turno][supName]) agg[sector][turno][supName] = { sum: 0, count: 0 };
      agg[sector][turno][supName].sum += partes;
      agg[sector][turno][supName].count++;
    }

    // Pick best supervisor per sector+turno (highest sumPartes)
    var supervisores = [];
    var turnoKeys = Object.keys(agg);
    for (var ti = 0; ti < turnoKeys.length; ti++) {
      var secId = turnoKeys[ti];
      var turnos = agg[secId];
      var turnoNames = Object.keys(turnos);
      for (var tj = 0; tj < turnoNames.length; tj++) {
        var turnoName = turnoNames[tj];
        var sups = turnos[turnoName];
        var supNames = Object.keys(sups);
        var bestName = "", bestSum = 0;
        for (var sk = 0; sk < supNames.length; sk++) {
          var nm = supNames[sk];
          if (sups[nm].sum > bestSum) {
            bestSum = sups[nm].sum;
            bestName = nm;
          }
        }
        if (bestName) {
          var d = sups[bestName];
          supervisores.push({
            sector: secId,
            turno: turnoName,
            supervisor: bestName,
            partes: bestSum,
            count: d.count
          });
        }
      }
    }

    Logger.log('Supervisores agregados devueltos: ' + supervisores.length);
    return { supervisores: supervisores };

  } catch (error) {
    Logger.log('Error en getSupervisoresData: ' + error.toString());
    return { error: error.toString() };
  }
}
