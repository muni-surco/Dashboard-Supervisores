const SUPABASE_URL = 'https://iotxurynamixapftjwze.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvdHh1cnluYW1peGFwZnRqd3plIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyNTc1MDYsImV4cCI6MjA5NzgzMzUwNn0.-SDfDO5vrebHnc7B2E77tbnl5nKnpM2ub2pBoSQGPOQ';

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

function supFetch(path) {
  var url = SUPABASE_URL + '/rest/v1/' + path;
  // Add limit para evitar el default ~1000 filas de Supabase REST
  if (url.indexOf('limit=') === -1) url += (url.indexOf('?') === -1 ? '?' : '&') + 'limit=1000000';
  var options = {
    method: 'GET',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
      'Content-Type': 'application/json'
    },
    muteHttpExceptions: true
  };
  var resp = UrlFetchApp.fetch(url, options);
  var code = resp.getResponseCode();
  var body = resp.getContentText();
  if (code !== 200) throw new Error('Supabase ' + code + ': ' + body.slice(0, 500));
  return JSON.parse(body);
}

function getJefes() {
  return supFetch('jefes_area?select=*');
}

function getSupervisoresData() {
  const SUP_SPREADSHEET_ID = "1aGLYGiowhtvIzioo5zZF3rl-fnP6kBUg0ecYXrJr1-g";
  try {
    var supSs = SpreadsheetApp.openById(SUP_SPREADSHEET_ID);
    var supSheet = supSs.getSheetByName("2026");
    if (!supSheet) return { error: "No se encontró la hoja '2026'." };
    var allRows = supSheet.getDataRange().getValues();
    if (allRows.length <= 1) return { error: "Sin datos." };
    var headers = allRows[0].map(function(h) { return String(h).trim().toUpperCase(); });
    var sSector = headers.indexOf("SECTOR");
    var sTurno = headers.indexOf("TURNO");
    var sSupervisor = headers.indexOf("SUPERVISOR");
    var sPartes = headers.indexOf("CANTPARTES");
    if (sSector < 0 || sSupervisor < 0) return { error: "No se encontraron SECTOR y/o SUPERVISOR." };
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
    var supervisores = [];
    Object.keys(agg).forEach(function(secId) {
      var turnos = agg[secId];
      Object.keys(turnos).forEach(function(turnoName) {
        var sups = turnos[turnoName];
        var bestName = "", bestSum = 0;
        Object.keys(sups).forEach(function(nm) {
          if (sups[nm].sum > bestSum) { bestSum = sups[nm].sum; bestName = nm; }
        });
        if (bestName) {
          var d = sups[bestName];
          supervisores.push({ sector: secId, turno: turnoName, supervisor: bestName, partes: bestSum, count: d.count });
        }
      });
    });
    return { supervisores: supervisores };
  } catch (error) {
    return { error: error.toString() };
  }
}

function getAllData() {
  try {
    var jefes = getJefes();
    var supResult = getSupervisoresData();
    return {
      jefes: jefes,
      supervisores: supResult.error ? [] : supResult.supervisores
    };
  } catch (e) {
    return { error: e.message };
  }
}
