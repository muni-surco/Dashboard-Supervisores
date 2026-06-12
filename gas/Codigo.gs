function doGet(e) {
  return HtmlService.createTemplateFromFile('Index')
      .evaluate()
      .setTitle('Dashboard C4 · Evaluación Jefes de Área · MSS')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// Función auxiliar para incluir archivos HTML dentro de la plantilla principal
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
