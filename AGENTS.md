# AGENTS.md

## Proyecto

**Dashboard C4 · Evaluación de Jefes de Área · MSS** — Panel de control para la División C4 de la Municipalidad de Santiago de Surco. Evalúa a los jefes de área por sector según incidencias delictivas, operatividad, personal y coordinación.

- Idioma de UI, comentarios y código: **español**.
- Sin framework ni build system: **JavaScript vanilla** (sin `package.json`, sin npm, sin tests ni linter configurados). Todo se sirve/despliega directamente.
- Data fuente: **Supabase** (tabla `incidencias`) + **Google Sheets** (supervisores), con key de la API de Google Sheets.

## Estructura

Hay **dos variantes** del dashboard que se mantienen en paralelo:

| Ruta | Variante | Motor de gráficos | Despliegue |
|---|---|---|---|
| `/` (`index.html`, `script.js`, `styles.css`) | Standalone web | Chart.js 4.4.1 | Hosting estático |
| `/gas/` (`Index.html`, `Script.html`, `Styles.html`, `Codigo.gs`) | Apps Script | ECharts 5 | Google Apps Script Web App |
| `/gas/` (`Index2.html`, `Script2.html`) | Apps Script (Apex) | ApexCharts 5 | Google Apps Script Web App |

### Archivos raíz (variante standalone)
- `index.html` — estructura del dashboard (4 paneles: resumen, seguridad, supervisores, ranking). Carga Chart.js, lucide y supabase-js desde CDN.
- `script.js` — toda la lógica: fetch a Supabase (`incidencias`, `jefes_area`) + Google Sheets, procesado **client-side** de incidencias, render de KPIs/gráficos.
- `styles.css` — diseño completo (design tokens como `--cs`, `--csd`, `--cp`, `--cpd`, `--g5`, `--g7`, `--s4`, `--rmd`…).
- `extract_css_js.js` — utilidad one-shot que extrajo el CSS/JS embebido de un HTML monolítico `dashboard-c4-mss.html` a archivos separados. **No regenerar** a menos que se sepa que el HTML fuente existe.
- `update_dashboard.js` — utilidad legacy con datos mock (`SECTORES` hardcodeados). No forma parte del flujo de datos real; no editarlo salvo que se le pida explícitamente.

### Archivos GAS (`gas/`)
- `Codigo.gs` — backend Apps Script. `doGet(e)` elige plantilla: `Index2` si `?ver=apex`, si no `Index`. `include(filename)` inyecta HTML parciales. `getSupervisoresData()` lee la tabla `supervisores` de Supabase y agrega por (sector, turno, supervisor). `getSupervisoresDetalle()` devuelve **todos** los supervisores por (sector, turno) con su `CANTPARTES` (nº de turnos), para la comparativa "Participación de Turnos vs Incidencias".
- `Index.html` — plantilla ECharts (sidebar con Dashboard + Gestión de Personal, selector de sector en modal, mapa Leaflet).
- `Script.html` — JS de la plantilla ECharts (índice del dashboard GAS).
- `Index2.html` / `Script2.html` — variante ApexCharts (misma UI, distinto motor).
- `Styles.html` — CSS compartido por ambas plantillas GAS (inyectado con `<?!= include('Styles'); ?>`).
- `Script.html.bak` — backup de la versión Chart.js. Referencia, no editar.

### SQL de Supabase (`supabase/`)
- `init.sql` — tablas `jefes_area` (sector, nombre) y `supervisores` (fuente única de supervisores, con política RLS de lectura anónima), índices sobre `incidencias`.
- `mv_dashboard.sql` — **materialized views** (`incidencias_diaria`, `incidencias_tipos_diaria`, `incidencias_subclas_diaria`) + función `refresh_dashboard_mvs()`. Las MV pre-agregan las ~184k filas de `incidencias` a ~8k para el dashboard.
- `func_get_dashboard_sectors.sql` — RPC `get_dashboard_sectors(fecha_inicio, fecha_fin, turno_filter)` que devuelve por sector: incTotal, tasaResp, comisarias, franjas, tiposDelito, subclas, robosFrustrados, operativosCount, coordVecinales, capturas, patrullajeCount.
- `func_get_delitos_ubicaciones.sql` — RPC `get_delitos_ubicaciones(...)` que devuelve JSONB de puntos (sector, lat, lng, tipo) para el mapa, solo `sub_clasificacion = 'delitos'`, tope 3000.
- `func_clasificar_franja.sql` — helper `clasificar_franja(turno_raw)`.

## Cómo funciona el flujo de datos

- **Variante GAS (la activa/principal)**: `loadData()` en `Script.html`/`Script2.html` llama a los RPC de Supabase (`get_dashboard_sectors` + `get_delitos_ubicaciones`) y luego a `google.script.run.getSupervisoresData()` (lee la tabla `supervisores` de Supabase vía `Codigo.gs`) → `finishLoad()` construye `SECTORES`, llama `computeThresholds()` (umbrales dinámicos por terciles) y `buildSupervisores()`.
- **Variante standalone**: `loadData()` en `script.js` trae `incidencias`, `jefes_area` y `supervisores` por REST (con `limit` alto) y procesa todo en el cliente con `processIncidencias()`.

### Fuentes de datos (constantes compartidas)
- `SUPABASE_URL` / `SUPABASE_ANON_KEY`: hardcodeadas en `Codigo.gs`, `script.js`, `Script.html`, `Script2.html`. Son keys **públicas de Supabase** (anon), pero si cambian hay que actualizar **todos** los archivos.
- Google Sheets de supervisores: ID `1aGLYGiowhtvIzioo5zZF3rl-fnP6kBUg0ecYXrJr1-g`, hoja `2026`, columnas `SECTOR, TURNO, SUPERVISOR, CANTPARTES`. Es **solo la fuente de migración**: los datos se cargan en la tabla `supervisores` de Supabase y el dashboard lee de ahí.
- Tabla `supervisores` (Supabase): `sector, turno, supervisor, cant_partes` (una fila por mes/turno/supervisor; `fecha` opcional). Política RLS de lectura anónima en `init.sql`. La normalización de `sector` y la detección M/T/N se hacen al leer (en `Codigo.gs` y `script.js`).
- Tabla `jefes_area`: `sector` (ej. `1A`, `1B`, `3`) es PK y es el join con `incidencias.sector`.

## Convenciones de código

- **Indentación**: 2 espacios (HTML, JS y GAS). No usar tabs.
- **Finales de línea**: `.gitattributes` normaliza a LF. No forzar CRLF.
- **Estilo JS**: mezcla de ES5 (`var`, `function`, concatenación con `+`) y ES6 (`const/let`, arrow functions, template literals, `?.`). Seguir el estilo del archivo que se toque — en `Script.html`/`Script2.html` predomina ES5; en `script.js` hay ambos.
- **Sin comentarios innecesarios**: solo agregar comentarios cuando aporten contexto.
- **UI en español**, acentos incluidos. No traducir.

### Normalización de datos (importante, usada igual en SQL y JS)
- **Sector**: `UPPER(TRIM(REPLACE(sector,'sector','')))`; `9A` y `9B` se normalizan a `9` (tanto en las MV como en `get_delitos_ubicaciones`). Mantener esta regla consistente.
- **Turno → franja horaria**:
  - Mañana/`M` → `06–12h` (client) / `0612` (DB)
  - Tarde/`T` → `12–18h` / `1218`
  - Noche/`N` → `18–24h` / `1824`
  - default → `00–06h` / `0006`
- **Tipos**: `clasificarTipo` mapea subcadenas (`robo frustrado`, `operativo`, `coordinacion`, `captura`, `patrullaje`).
- **Semáforo de estado**: `verde` (cumplido) / `amarillo` (parcial) / `rojo` (no cumplido). Clases CSS: `verde`, `amarillo`, `rojo`, `dot`, `status-badge`, `kpi-pill`.
- **Paleta de colores**: objeto `DS` (`primary:#005ea5`, `primaryD:#003D6B`, `secondary:#00C9A7`, `accent:#F5A623`, `danger:#E03E3E`, `success:#27AE60`, `g3`, `g5`, `g7`) y `SECTOR_COLORS`. Reutilizar, no inventar colores nuevos.
- **Turnos de supervisores**: nombres con sufijo `(M)`/`(T)`/`(N)`. `baseName()` y `letterFromName()` extraen el nombre y la letra.

### Cálculo de supervisores/asistencia
A partir de los partes de la tabla `supervisores` (por (sector, turno) se toma el supervisor con más partes: `bestName`/`bestPartes`), `partesAvg = round((bestPartes/count)*22)` y `ast = clamp(partesAvg, 60, 100)`. `rendimiento` se deriva: `rutas=ast*0.95`, `reportes=ast*0.90`, `actitud=ast*0.85`, `total` = promedio. Mantener esta fórmula consistente entre `script.js`, `Codigo.gs` y `Script.html`/`Script2.html`.

### Gráficos
- **Standalone**: Chart.js (`new Chart(...)`, `destroyChart(id)` antes de recrear; `charts` cache).
- **GAS ECharts**: `echarts.init(el)` vía `getChart(id, el)`, `inst.dispose()` en `destroyChart`, y `resizeCharts()` en `resize`/cambio de panel/sidebar.
- **GAS ApexCharts**: `renderChart(id, opts)` con `new ApexCharts(el, fullOpts)`.
- GAS usa `formatNum()` (`toLocaleString('en-US')`) para mostrar números grandes.

## Comandos

No hay scripts de build, test ni lint. Lo único ejecutable son los scripts de utilidad Node:
- `node extract_css_js.js` (requiere `dashboard-c4-mss.html` en la raíz — legacy, ver arriba).
- `node update_dashboard.js` (legacy, datos mock — NO correrlo sobre el dashboard real).

**Verificación**: no hay tests automatizados. Validar manualmente abriendo `index.html` (la variante standalone) y probando la Web App GAS (filtros por sector/turno/fecha, modal de sector, mapa, cambio de fechas). Los RPC de Supabase se prueban en el SQL Editor del proyecto (después de cada cambio de función: `NOTIFY pgrst, 'reload schema';` — anotado en los propios `.sql`).

## Despliegue / mantenimiento

- **GAS**: la carpeta `gas/` es un proyecto de Apps Script (con `appsscript.json` en la raíz). Se sube con `clasp`. `doGet` sirve `Index`/`Index2` y usa `include()` para componer `Styles` + `Script`/`Script2`.
- **Supabase**: tras importar nuevos datos a `incidencias`, ejecutar `SELECT public.refresh_dashboard_mvs();` para refrescar las MV. Las MV no se refrescan automáticamente. Al cargar datos en la tabla `supervisores` no hace falta refrescar nada; basta que exista la política RLS de `init.sql`.
- **Import de supervisores**: exportar la hoja `2026` a CSV y cargarlo en la tabla `supervisores` (columnas `sector, turno, supervisor, cant_partes`; `fecha` queda null). La normalización se hace al leer.
- **Cuidado**: hay 3 archivos GAS modificados sin commit (`gas/Script.html`, `gas/Script2.html`, `gas/Styles.html`) al momento de escribir este archivo.

## Gotchas / advertencias

- `script.js` (standalone) aún tiene referencias a funciones/IDs de la versión antigua (p. ej. `renderResumen` usa `chartTendencia`, `chartRankBar`, `chartRadar`, `chartRankGlobal`; `renderPersonal` usa `p-asist`, `p-tard`, `rank-asistencia`, `chartTurnos`, `tbl-rendimiento`). **No borrar funciones referenciadas** aunque parezcan huérfanas; verificar con búsqueda antes de eliminar.
- `index.html` (standalone) define paneles que `script.js` espera. Mantener sincronizados los IDs de elementos HTML con las funciones de render.
- En `processIncidencias` de `script.js` la agregación es por sector normalizado; `buildSupervisores` espera que `sector` de la tabla `supervisores` coincida con el `id` del sector normalizado.
- No guardar secretos nuevos en el repo. Las keys existentes son públicas por diseño (anon key de Supabase y key de Sheets con restricciones), pero **nunca** agregar claves de servicio o tokens.
