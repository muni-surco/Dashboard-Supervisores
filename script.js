// ── DS palette for charts ──
const DS = {
  primary:  '#005ea5',
  primaryD: '#003D6B',
  secondary:'#00C9A7',
  accent:   '#F5A623',
  danger:   '#E03E3E',
  success:  '#27AE60',
  warning:  '#F5A623',
  g3: '#D0D5E8',
  g5: '#8888AA',
  g7: '#4A4A6A',
};

// ━━━━━━━━━━ DATA ━━━━━━━━━━
const SECTORES = [
  {
    "id": 1,
    "nombre": "Supervisor Mendoza",
    "sector": "Sector 1",
    "initials": "SM",
    "score": 68,
    "kpis": {
      "redDelict": 10,
      "superv": 90,
      "asistencia": 95,
      "operativos": 4,
      "compromisos": 80
    },
    "status": {
      "redDelict": "verde",
      "superv": "verde",
      "asistencia": "verde",
      "operativos": "verde",
      "compromisos": "verde"
    },
    "incidentes": [
      40,
      42,
      38,
      35,
      33,
      30,
      28
    ],
    "incTotal": 28,
    "incVar": -5,
    "tasaResp": 8.5,
    "frustrados": 5,
    "interv": 30,
    "cobertura": 90,
    "franjas": [
      {
        "l": "00–06h",
        "v": 8,
        "c": DS.primaryD
      },
      {
        "l": "06–12h",
        "v": 15,
        "c": DS.success
      },
      {
        "l": "12–18h",
        "v": 22,
        "c": DS.warning
      },
      {
        "l": "18–24h",
        "v": 31,
        "c": DS.danger
      }
    ],
    "tiposDelito": {
      "Robos": 12,
      "Hurtos": 8,
      "Violencia": 5,
      "Daños": 3,
      "Otros": 2
    },
    "supRealizadas": 45,
    "supPlan": 50,
    "hallazgos": 10,
    "capturas": 6,
    "coordPNP": 5,
    "operativosTipo": [
      "Control de zona",
      "Alcoholemia",
      "Zonas críticas"
    ],
    "reportes": "90%",
    "supervisores": [
      {
        "n": "Supervisor Mendoza",
        "ast": 95
      }
    ],
    "tardanzas": 2.5,
    "disciplinarias": 1,
    "rotacion": 0,
    "rendimiento": [
      {
        "sup": "Supervisor Mendoza",
        "rutas": 95,
        "reportes": 95,
        "actitud": 95,
        "total": 95
      }
    ],
    "reunionesComis": 3,
    "patrInt": 85,
    "zonasRef": 4,
    "acuerdos": 2,
    "acuerdosList": [
      "Operativo semanal",
      "Protocolo de alertas"
    ],
    "comisarias": [
      "PNP Sector 1"
    ],
    "intConj": 15,
    "evitados": 8,
    "compromisos": [
      {
        "desc": "Aumentar supervisiones",
        "pct": 90,
        "st": "verde"
      },
      {
        "desc": "Reducir tardanzas",
        "pct": 80,
        "st": "amarillo"
      },
      {
        "desc": "Ruta nueva",
        "pct": 100,
        "st": "verde"
      }
    ],
    "impReduc": 10,
    "impAum": 15,
    "impDisc": 10,
    "dims": [
      85,
      90,
      95,
      80,
      85
    ]
  },
  {
    "id": 2,
    "nombre": "Supervisor Quispe",
    "sector": "Sector 2",
    "initials": "SQ",
    "score": 84,
    "kpis": {
      "redDelict": 10,
      "superv": 90,
      "asistencia": 95,
      "operativos": 4,
      "compromisos": 80
    },
    "status": {
      "redDelict": "verde",
      "superv": "verde",
      "asistencia": "verde",
      "operativos": "verde",
      "compromisos": "verde"
    },
    "incidentes": [
      40,
      42,
      38,
      35,
      33,
      30,
      28
    ],
    "incTotal": 28,
    "incVar": -5,
    "tasaResp": 8.5,
    "frustrados": 5,
    "interv": 30,
    "cobertura": 90,
    "franjas": [
      {
        "l": "00–06h",
        "v": 8,
        "c": DS.primaryD
      },
      {
        "l": "06–12h",
        "v": 15,
        "c": DS.success
      },
      {
        "l": "12–18h",
        "v": 22,
        "c": DS.warning
      },
      {
        "l": "18–24h",
        "v": 31,
        "c": DS.danger
      }
    ],
    "tiposDelito": {
      "Robos": 12,
      "Hurtos": 8,
      "Violencia": 5,
      "Daños": 3,
      "Otros": 2
    },
    "supRealizadas": 45,
    "supPlan": 50,
    "hallazgos": 10,
    "capturas": 6,
    "coordPNP": 5,
    "operativosTipo": [
      "Control de zona",
      "Alcoholemia",
      "Zonas críticas"
    ],
    "reportes": "90%",
    "supervisores": [
      {
        "n": "Supervisor Quispe",
        "ast": 95
      }
    ],
    "tardanzas": 2.5,
    "disciplinarias": 1,
    "rotacion": 0,
    "rendimiento": [
      {
        "sup": "Supervisor Quispe",
        "rutas": 95,
        "reportes": 95,
        "actitud": 95,
        "total": 95
      }
    ],
    "reunionesComis": 3,
    "patrInt": 85,
    "zonasRef": 4,
    "acuerdos": 2,
    "acuerdosList": [
      "Operativo semanal",
      "Protocolo de alertas"
    ],
    "comisarias": [
      "PNP Sector 2"
    ],
    "intConj": 15,
    "evitados": 8,
    "compromisos": [
      {
        "desc": "Aumentar supervisiones",
        "pct": 90,
        "st": "verde"
      },
      {
        "desc": "Reducir tardanzas",
        "pct": 80,
        "st": "amarillo"
      },
      {
        "desc": "Ruta nueva",
        "pct": 100,
        "st": "verde"
      }
    ],
    "impReduc": 10,
    "impAum": 15,
    "impDisc": 10,
    "dims": [
      85,
      90,
      95,
      80,
      85
    ]
  },
  {
    "id": 3,
    "nombre": "Supervisor Torres",
    "sector": "Sector 3",
    "initials": "ST",
    "score": 78,
    "kpis": {
      "redDelict": 10,
      "superv": 90,
      "asistencia": 95,
      "operativos": 4,
      "compromisos": 80
    },
    "status": {
      "redDelict": "verde",
      "superv": "verde",
      "asistencia": "verde",
      "operativos": "verde",
      "compromisos": "verde"
    },
    "incidentes": [
      40,
      42,
      38,
      35,
      33,
      30,
      28
    ],
    "incTotal": 28,
    "incVar": -5,
    "tasaResp": 8.5,
    "frustrados": 5,
    "interv": 30,
    "cobertura": 90,
    "franjas": [
      {
        "l": "00–06h",
        "v": 8,
        "c": DS.primaryD
      },
      {
        "l": "06–12h",
        "v": 15,
        "c": DS.success
      },
      {
        "l": "12–18h",
        "v": 22,
        "c": DS.warning
      },
      {
        "l": "18–24h",
        "v": 31,
        "c": DS.danger
      }
    ],
    "tiposDelito": {
      "Robos": 12,
      "Hurtos": 8,
      "Violencia": 5,
      "Daños": 3,
      "Otros": 2
    },
    "supRealizadas": 45,
    "supPlan": 50,
    "hallazgos": 10,
    "capturas": 6,
    "coordPNP": 5,
    "operativosTipo": [
      "Control de zona",
      "Alcoholemia",
      "Zonas críticas"
    ],
    "reportes": "90%",
    "supervisores": [
      {
        "n": "Supervisor Torres",
        "ast": 95
      }
    ],
    "tardanzas": 2.5,
    "disciplinarias": 1,
    "rotacion": 0,
    "rendimiento": [
      {
        "sup": "Supervisor Torres",
        "rutas": 95,
        "reportes": 95,
        "actitud": 95,
        "total": 95
      }
    ],
    "reunionesComis": 3,
    "patrInt": 85,
    "zonasRef": 4,
    "acuerdos": 2,
    "acuerdosList": [
      "Operativo semanal",
      "Protocolo de alertas"
    ],
    "comisarias": [
      "PNP Sector 3"
    ],
    "intConj": 15,
    "evitados": 8,
    "compromisos": [
      {
        "desc": "Aumentar supervisiones",
        "pct": 90,
        "st": "verde"
      },
      {
        "desc": "Reducir tardanzas",
        "pct": 80,
        "st": "amarillo"
      },
      {
        "desc": "Ruta nueva",
        "pct": 100,
        "st": "verde"
      }
    ],
    "impReduc": 10,
    "impAum": 15,
    "impDisc": 10,
    "dims": [
      85,
      90,
      95,
      80,
      85
    ]
  },
  {
    "id": 4,
    "nombre": "Supervisor Flores",
    "sector": "Sector 4",
    "initials": "SF",
    "score": 82,
    "kpis": {
      "redDelict": 10,
      "superv": 90,
      "asistencia": 95,
      "operativos": 4,
      "compromisos": 80
    },
    "status": {
      "redDelict": "verde",
      "superv": "verde",
      "asistencia": "verde",
      "operativos": "verde",
      "compromisos": "verde"
    },
    "incidentes": [
      40,
      42,
      38,
      35,
      33,
      30,
      28
    ],
    "incTotal": 28,
    "incVar": -5,
    "tasaResp": 8.5,
    "frustrados": 5,
    "interv": 30,
    "cobertura": 90,
    "franjas": [
      {
        "l": "00–06h",
        "v": 8,
        "c": DS.primaryD
      },
      {
        "l": "06–12h",
        "v": 15,
        "c": DS.success
      },
      {
        "l": "12–18h",
        "v": 22,
        "c": DS.warning
      },
      {
        "l": "18–24h",
        "v": 31,
        "c": DS.danger
      }
    ],
    "tiposDelito": {
      "Robos": 12,
      "Hurtos": 8,
      "Violencia": 5,
      "Daños": 3,
      "Otros": 2
    },
    "supRealizadas": 45,
    "supPlan": 50,
    "hallazgos": 10,
    "capturas": 6,
    "coordPNP": 5,
    "operativosTipo": [
      "Control de zona",
      "Alcoholemia",
      "Zonas críticas"
    ],
    "reportes": "90%",
    "supervisores": [
      {
        "n": "Supervisor Flores",
        "ast": 95
      }
    ],
    "tardanzas": 2.5,
    "disciplinarias": 1,
    "rotacion": 0,
    "rendimiento": [
      {
        "sup": "Supervisor Flores",
        "rutas": 95,
        "reportes": 95,
        "actitud": 95,
        "total": 95
      }
    ],
    "reunionesComis": 3,
    "patrInt": 85,
    "zonasRef": 4,
    "acuerdos": 2,
    "acuerdosList": [
      "Operativo semanal",
      "Protocolo de alertas"
    ],
    "comisarias": [
      "PNP Sector 4"
    ],
    "intConj": 15,
    "evitados": 8,
    "compromisos": [
      {
        "desc": "Aumentar supervisiones",
        "pct": 90,
        "st": "verde"
      },
      {
        "desc": "Reducir tardanzas",
        "pct": 80,
        "st": "amarillo"
      },
      {
        "desc": "Ruta nueva",
        "pct": 100,
        "st": "verde"
      }
    ],
    "impReduc": 10,
    "impAum": 15,
    "impDisc": 10,
    "dims": [
      85,
      90,
      95,
      80,
      85
    ]
  },
  {
    "id": 5,
    "nombre": "Supervisor Silva",
    "sector": "Sector 5",
    "initials": "SS",
    "score": 80,
    "kpis": {
      "redDelict": 10,
      "superv": 90,
      "asistencia": 95,
      "operativos": 4,
      "compromisos": 80
    },
    "status": {
      "redDelict": "verde",
      "superv": "verde",
      "asistencia": "verde",
      "operativos": "verde",
      "compromisos": "verde"
    },
    "incidentes": [
      40,
      42,
      38,
      35,
      33,
      30,
      28
    ],
    "incTotal": 28,
    "incVar": -5,
    "tasaResp": 8.5,
    "frustrados": 5,
    "interv": 30,
    "cobertura": 90,
    "franjas": [
      {
        "l": "00–06h",
        "v": 8,
        "c": DS.primaryD
      },
      {
        "l": "06–12h",
        "v": 15,
        "c": DS.success
      },
      {
        "l": "12–18h",
        "v": 22,
        "c": DS.warning
      },
      {
        "l": "18–24h",
        "v": 31,
        "c": DS.danger
      }
    ],
    "tiposDelito": {
      "Robos": 12,
      "Hurtos": 8,
      "Violencia": 5,
      "Daños": 3,
      "Otros": 2
    },
    "supRealizadas": 45,
    "supPlan": 50,
    "hallazgos": 10,
    "capturas": 6,
    "coordPNP": 5,
    "operativosTipo": [
      "Control de zona",
      "Alcoholemia",
      "Zonas críticas"
    ],
    "reportes": "90%",
    "supervisores": [
      {
        "n": "Supervisor Silva",
        "ast": 95
      }
    ],
    "tardanzas": 2.5,
    "disciplinarias": 1,
    "rotacion": 0,
    "rendimiento": [
      {
        "sup": "Supervisor Silva",
        "rutas": 95,
        "reportes": 95,
        "actitud": 95,
        "total": 95
      }
    ],
    "reunionesComis": 3,
    "patrInt": 85,
    "zonasRef": 4,
    "acuerdos": 2,
    "acuerdosList": [
      "Operativo semanal",
      "Protocolo de alertas"
    ],
    "comisarias": [
      "PNP Sector 5"
    ],
    "intConj": 15,
    "evitados": 8,
    "compromisos": [
      {
        "desc": "Aumentar supervisiones",
        "pct": 90,
        "st": "verde"
      },
      {
        "desc": "Reducir tardanzas",
        "pct": 80,
        "st": "amarillo"
      },
      {
        "desc": "Ruta nueva",
        "pct": 100,
        "st": "verde"
      }
    ],
    "impReduc": 10,
    "impAum": 15,
    "impDisc": 10,
    "dims": [
      85,
      90,
      95,
      80,
      85
    ]
  },
  {
    "id": 6,
    "nombre": "Supervisor Castro",
    "sector": "Sector 6",
    "initials": "SC",
    "score": 62,
    "kpis": {
      "redDelict": 10,
      "superv": 90,
      "asistencia": 95,
      "operativos": 4,
      "compromisos": 80
    },
    "status": {
      "redDelict": "verde",
      "superv": "verde",
      "asistencia": "verde",
      "operativos": "verde",
      "compromisos": "verde"
    },
    "incidentes": [
      40,
      42,
      38,
      35,
      33,
      30,
      28
    ],
    "incTotal": 28,
    "incVar": -5,
    "tasaResp": 8.5,
    "frustrados": 5,
    "interv": 30,
    "cobertura": 90,
    "franjas": [
      {
        "l": "00–06h",
        "v": 8,
        "c": DS.primaryD
      },
      {
        "l": "06–12h",
        "v": 15,
        "c": DS.success
      },
      {
        "l": "12–18h",
        "v": 22,
        "c": DS.warning
      },
      {
        "l": "18–24h",
        "v": 31,
        "c": DS.danger
      }
    ],
    "tiposDelito": {
      "Robos": 12,
      "Hurtos": 8,
      "Violencia": 5,
      "Daños": 3,
      "Otros": 2
    },
    "supRealizadas": 45,
    "supPlan": 50,
    "hallazgos": 10,
    "capturas": 6,
    "coordPNP": 5,
    "operativosTipo": [
      "Control de zona",
      "Alcoholemia",
      "Zonas críticas"
    ],
    "reportes": "90%",
    "supervisores": [
      {
        "n": "Supervisor Castro",
        "ast": 95
      }
    ],
    "tardanzas": 2.5,
    "disciplinarias": 1,
    "rotacion": 0,
    "rendimiento": [
      {
        "sup": "Supervisor Castro",
        "rutas": 95,
        "reportes": 95,
        "actitud": 95,
        "total": 95
      }
    ],
    "reunionesComis": 3,
    "patrInt": 85,
    "zonasRef": 4,
    "acuerdos": 2,
    "acuerdosList": [
      "Operativo semanal",
      "Protocolo de alertas"
    ],
    "comisarias": [
      "PNP Sector 6"
    ],
    "intConj": 15,
    "evitados": 8,
    "compromisos": [
      {
        "desc": "Aumentar supervisiones",
        "pct": 90,
        "st": "verde"
      },
      {
        "desc": "Reducir tardanzas",
        "pct": 80,
        "st": "amarillo"
      },
      {
        "desc": "Ruta nueva",
        "pct": 100,
        "st": "verde"
      }
    ],
    "impReduc": 10,
    "impAum": 15,
    "impDisc": 10,
    "dims": [
      85,
      90,
      95,
      80,
      85
    ]
  },
  {
    "id": 7,
    "nombre": "Supervisor Paz",
    "sector": "Sector 7",
    "initials": "SP",
    "score": 63,
    "kpis": {
      "redDelict": 10,
      "superv": 90,
      "asistencia": 95,
      "operativos": 4,
      "compromisos": 80
    },
    "status": {
      "redDelict": "verde",
      "superv": "verde",
      "asistencia": "verde",
      "operativos": "verde",
      "compromisos": "verde"
    },
    "incidentes": [
      40,
      42,
      38,
      35,
      33,
      30,
      28
    ],
    "incTotal": 28,
    "incVar": -5,
    "tasaResp": 8.5,
    "frustrados": 5,
    "interv": 30,
    "cobertura": 90,
    "franjas": [
      {
        "l": "00–06h",
        "v": 8,
        "c": DS.primaryD
      },
      {
        "l": "06–12h",
        "v": 15,
        "c": DS.success
      },
      {
        "l": "12–18h",
        "v": 22,
        "c": DS.warning
      },
      {
        "l": "18–24h",
        "v": 31,
        "c": DS.danger
      }
    ],
    "tiposDelito": {
      "Robos": 12,
      "Hurtos": 8,
      "Violencia": 5,
      "Daños": 3,
      "Otros": 2
    },
    "supRealizadas": 45,
    "supPlan": 50,
    "hallazgos": 10,
    "capturas": 6,
    "coordPNP": 5,
    "operativosTipo": [
      "Control de zona",
      "Alcoholemia",
      "Zonas críticas"
    ],
    "reportes": "90%",
    "supervisores": [
      {
        "n": "Supervisor Paz",
        "ast": 95
      }
    ],
    "tardanzas": 2.5,
    "disciplinarias": 1,
    "rotacion": 0,
    "rendimiento": [
      {
        "sup": "Supervisor Paz",
        "rutas": 95,
        "reportes": 95,
        "actitud": 95,
        "total": 95
      }
    ],
    "reunionesComis": 3,
    "patrInt": 85,
    "zonasRef": 4,
    "acuerdos": 2,
    "acuerdosList": [
      "Operativo semanal",
      "Protocolo de alertas"
    ],
    "comisarias": [
      "PNP Sector 7"
    ],
    "intConj": 15,
    "evitados": 8,
    "compromisos": [
      {
        "desc": "Aumentar supervisiones",
        "pct": 90,
        "st": "verde"
      },
      {
        "desc": "Reducir tardanzas",
        "pct": 80,
        "st": "amarillo"
      },
      {
        "desc": "Ruta nueva",
        "pct": 100,
        "st": "verde"
      }
    ],
    "impReduc": 10,
    "impAum": 15,
    "impDisc": 10,
    "dims": [
      85,
      90,
      95,
      80,
      85
    ]
  },
  {
    "id": 8,
    "nombre": "Supervisor Vargas",
    "sector": "Sector 8",
    "initials": "SV",
    "score": 64,
    "kpis": {
      "redDelict": 10,
      "superv": 90,
      "asistencia": 95,
      "operativos": 4,
      "compromisos": 80
    },
    "status": {
      "redDelict": "verde",
      "superv": "verde",
      "asistencia": "verde",
      "operativos": "verde",
      "compromisos": "verde"
    },
    "incidentes": [
      40,
      42,
      38,
      35,
      33,
      30,
      28
    ],
    "incTotal": 28,
    "incVar": -5,
    "tasaResp": 8.5,
    "frustrados": 5,
    "interv": 30,
    "cobertura": 90,
    "franjas": [
      {
        "l": "00–06h",
        "v": 8,
        "c": DS.primaryD
      },
      {
        "l": "06–12h",
        "v": 15,
        "c": DS.success
      },
      {
        "l": "12–18h",
        "v": 22,
        "c": DS.warning
      },
      {
        "l": "18–24h",
        "v": 31,
        "c": DS.danger
      }
    ],
    "tiposDelito": {
      "Robos": 12,
      "Hurtos": 8,
      "Violencia": 5,
      "Daños": 3,
      "Otros": 2
    },
    "supRealizadas": 45,
    "supPlan": 50,
    "hallazgos": 10,
    "capturas": 6,
    "coordPNP": 5,
    "operativosTipo": [
      "Control de zona",
      "Alcoholemia",
      "Zonas críticas"
    ],
    "reportes": "90%",
    "supervisores": [
      {
        "n": "Supervisor Vargas",
        "ast": 95
      }
    ],
    "tardanzas": 2.5,
    "disciplinarias": 1,
    "rotacion": 0,
    "rendimiento": [
      {
        "sup": "Supervisor Vargas",
        "rutas": 95,
        "reportes": 95,
        "actitud": 95,
        "total": 95
      }
    ],
    "reunionesComis": 3,
    "patrInt": 85,
    "zonasRef": 4,
    "acuerdos": 2,
    "acuerdosList": [
      "Operativo semanal",
      "Protocolo de alertas"
    ],
    "comisarias": [
      "PNP Sector 8"
    ],
    "intConj": 15,
    "evitados": 8,
    "compromisos": [
      {
        "desc": "Aumentar supervisiones",
        "pct": 90,
        "st": "verde"
      },
      {
        "desc": "Reducir tardanzas",
        "pct": 80,
        "st": "amarillo"
      },
      {
        "desc": "Ruta nueva",
        "pct": 100,
        "st": "verde"
      }
    ],
    "impReduc": 10,
    "impAum": 15,
    "impDisc": 10,
    "dims": [
      85,
      90,
      95,
      80,
      85
    ]
  },
  {
    "id": 9,
    "nombre": "Supervisor Reyes",
    "sector": "Sector 9",
    "initials": "SR",
    "score": 90,
    "kpis": {
      "redDelict": 10,
      "superv": 90,
      "asistencia": 95,
      "operativos": 4,
      "compromisos": 80
    },
    "status": {
      "redDelict": "verde",
      "superv": "verde",
      "asistencia": "verde",
      "operativos": "verde",
      "compromisos": "verde"
    },
    "incidentes": [
      40,
      42,
      38,
      35,
      33,
      30,
      28
    ],
    "incTotal": 28,
    "incVar": -5,
    "tasaResp": 8.5,
    "frustrados": 5,
    "interv": 30,
    "cobertura": 90,
    "franjas": [
      {
        "l": "00–06h",
        "v": 8,
        "c": DS.primaryD
      },
      {
        "l": "06–12h",
        "v": 15,
        "c": DS.success
      },
      {
        "l": "12–18h",
        "v": 22,
        "c": DS.warning
      },
      {
        "l": "18–24h",
        "v": 31,
        "c": DS.danger
      }
    ],
    "tiposDelito": {
      "Robos": 12,
      "Hurtos": 8,
      "Violencia": 5,
      "Daños": 3,
      "Otros": 2
    },
    "supRealizadas": 45,
    "supPlan": 50,
    "hallazgos": 10,
    "capturas": 6,
    "coordPNP": 5,
    "operativosTipo": [
      "Control de zona",
      "Alcoholemia",
      "Zonas críticas"
    ],
    "reportes": "90%",
    "supervisores": [
      {
        "n": "Supervisor Reyes",
        "ast": 95
      }
    ],
    "tardanzas": 2.5,
    "disciplinarias": 1,
    "rotacion": 0,
    "rendimiento": [
      {
        "sup": "Supervisor Reyes",
        "rutas": 95,
        "reportes": 95,
        "actitud": 95,
        "total": 95
      }
    ],
    "reunionesComis": 3,
    "patrInt": 85,
    "zonasRef": 4,
    "acuerdos": 2,
    "acuerdosList": [
      "Operativo semanal",
      "Protocolo de alertas"
    ],
    "comisarias": [
      "PNP Sector 9"
    ],
    "intConj": 15,
    "evitados": 8,
    "compromisos": [
      {
        "desc": "Aumentar supervisiones",
        "pct": 90,
        "st": "verde"
      },
      {
        "desc": "Reducir tardanzas",
        "pct": 80,
        "st": "amarillo"
      },
      {
        "desc": "Ruta nueva",
        "pct": 100,
        "st": "verde"
      }
    ],
    "impReduc": 10,
    "impAum": 15,
    "impDisc": 10,
    "dims": [
      85,
      90,
      95,
      80,
      85
    ]
  }
];

const CHECKS_SEMANAL = [
  {item:'Índice delictivo semanal'},{item:'Supervisiones realizadas'},
  {item:'Asistencia del personal'},{item:'Robos frustrados'},
  {item:'Intervenciones relevantes'},{item:'Cumplimiento de rutas de patrullaje'},
  {item:'Coordinación con PNP'},
];

const KPI_DEFS = [
  {key:'redDelict', label:'Reducción delictiva', unit:'%', meta:'Meta ≥ 10%'},
  {key:'superv',    label:'Supervisiones',       unit:'%', meta:'Meta ≥ 90%'},
  {key:'asistencia',label:'Asistencia personal', unit:'%', meta:'Meta ≥ 95%'},
  {key:'operativos',label:'Operativos c/PNP',    unit:'',  meta:'Meta ≥ 4/mes'},
  {key:'compromisos',label:'Compromisos',        unit:'%', meta:'Meta ≥ 85%'}
];

// ── Chart colours ──
const SECTOR_COLORS = [DS.primary, DS.success, DS.accent, DS.danger, '#9C27B0', '#00BCD4', '#FF9800', '#795548', '#607D8B'];

// ── Charts registry ──
const charts = {};
function destroyChart(id){ if(charts[id]){ charts[id].destroy(); delete charts[id]; } }

function getSectorData(){
  const v = parseInt(document.getElementById('selJefe').value);
  return v===0 ? null : (SECTORES.find(s=>s.id===v)||null);
}
function statusLabel(s){
  if(s==='verde')   return ['verde','Cumplido'];
  if(s==='amarillo')return ['amarillo','Parcial'];
  return ['rojo','No cumplido'];
}

// ── Chart defaults ──
Chart.defaults.font.family = "'Chivo', 'Segoe UI', sans-serif";
Chart.defaults.color = DS.g7;

function chartDefaults(){ return {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false } }
}; }

// ─── UPDATE ───
function updateDash(){
  const s = getSectorData();
  const period = document.getElementById('selPeriodo').value;
  document.getElementById('badgePeriod').textContent =
    period==='sem'?'Sem. 16, 2025':period==='quin'?'1–15 Abr 2025':'Abril 2025';
  renderSelInfo(s);
  renderKPIs(s);
  renderResumen(s);
  renderSeguridad(s);
  renderOperaciones(s);
  renderPersonal(s);
  renderCoordinacion(s);
  renderEstrategia(s);
  renderRanking();
}

// ── SEL INFO ──
function renderSelInfo(s){
  const box = document.getElementById('sel-info-box');
  if(!s){ box.innerHTML=''; return; }
  const sc=s.score, cls=sc>=85?'verde':sc>=70?'amarillo':'rojo';
  const stars = sc>=85?'★★★★★':sc>=70?'★★★★☆':'★★★☆☆';
  box.innerHTML=`<div class="sel-info">
    <div class="sel-avatar">${s.initials}</div>
    <div class="sel-data"><h3>${s.nombre}</h3><p>${s.sector} · Jefe de Área C4</p>
      <div class="stars" style="margin-top:5px;">${stars}</div>
    </div>
    <div class="sel-score">
      <div class="score-n">${sc}</div>
      <div class="score-l">Puntaje global</div>
      <div class="kpi-pill ${cls}" style="margin-top:6px;"><span class="dot ${cls}"></span>${statusLabel(cls)[1]}</div>
    </div>
  </div>`;
}

// ── KPIs ──
function renderKPIs(s){
  const row = document.getElementById('kpi-row');
  const avg = k => s ? s.kpis[k] : Math.round(SECTORES.reduce((a,x)=>a+x.kpis[k],0)/SECTORES.length*10)/10;
  const avgSt = k => {
    if(s) return s.status[k];
    const v=SECTORES.map(x=>x.status[k]);
    return v.some(x=>x==='rojo')?'rojo':v.some(x=>x==='amarillo')?'amarillo':'verde';
  };
  row.innerHTML = KPI_DEFS.map(k=>{
    const v=avg(k.key), st=avgSt(k.key), [cls,lbl]=statusLabel(st);
    return `<div class="kpi-card ${cls}">
      <div class="kpi-lbl">${k.label}</div>
      <div class="kpi-val">${v}${k.unit}</div>
      <div class="kpi-tgt">${k.meta}</div>
      <div class="kpi-pill ${cls}"><span class="dot ${cls}"></span>${lbl}</div>
    </div>`;
  }).join('');
}

// ── RESUMEN ──
function renderResumen(s){
  const semanas=['Sem 10','Sem 11','Sem 12','Sem 13','Sem 14','Sem 15','Sem 16'];
  destroyChart('tendencia');
  const datasets = s ? [{
    label:s.sector, data:s.incidentes,
    borderColor:DS.primary, backgroundColor:'rgba(0,94,165,0.08)',
    tension:.4, fill:true, pointRadius:4, pointBackgroundColor:DS.primary
  }] : SECTORES.map((x,i)=>({
    label:x.sector, data:x.incidentes,
    borderColor:SECTOR_COLORS[i], backgroundColor:'transparent',
    tension:.4, pointRadius:3
  }));
  charts['tendencia'] = new Chart(document.getElementById('chartTendencia'),{
    type:'line', data:{labels:semanas, datasets},
    options:{...chartDefaults(), plugins:{legend:{display:!s,labels:{boxWidth:10,font:{size:11}}}}, scales:{y:{beginAtZero:false, grid:{color:'rgba(0,0,0,.05)'},ticks:{font:{size:11}}}}}
  });

  destroyChart('rankBar');
  charts['rankBar'] = new Chart(document.getElementById('chartRankBar'),{
    type:'bar',
    data:{labels:SECTORES.map(x=>x.sector.replace('Sector ','')),
      datasets:[{label:'Puntaje',data:SECTORES.map(x=>x.score),
        backgroundColor:SECTORES.map(x=>x.score>=85?DS.primary:x.score>=70?DS.warning:DS.danger),
        borderRadius:6}]},
    options:{...chartDefaults(), scales:{y:{beginAtZero:true,max:100,grid:{color:'rgba(0,0,0,.05)'},ticks:{font:{size:11}}}}}
  });

  const delData = s ? s.tiposDelito : (() => {
    const keys=Object.keys(SECTORES[0].tiposDelito), agg={};
    keys.forEach(k=>{ agg[k]=SECTORES.reduce((a,x)=>a+x.tiposDelito[k],0); });
    return agg;
  })();
  destroyChart('delitos');
  charts['delitos'] = new Chart(document.getElementById('chartDelitos'),{
    type:'doughnut',
    data:{labels:Object.keys(delData), datasets:[{data:Object.values(delData),
      backgroundColor:[DS.primary,DS.success,DS.warning,DS.danger,DS.g5],
      borderWidth:2, borderColor:'#fff'}]},
    options:{...chartDefaults(), plugins:{legend:{display:true,position:'right',labels:{boxWidth:10,font:{size:11}}}}}
  });

  const supsData = s ? s.supervisores : SECTORES[0].supervisores;
  document.getElementById('asistencia-prog').innerHTML = supsData.map(p=>{
    const cls=p.ast>=95?'verde':p.ast>=85?'amarillo':'rojo';
    return `<div class="prog-row"><span class="prog-name">${p.n}</span>
      <div class="prog-track"><div class="prog-bar ${cls}" style="width:${p.ast}%"></div></div>
      <span class="prog-val">${p.ast}%</span></div>`;
  }).join('');

  const comps = s ? s.compromisos : SECTORES[0].compromisos;
  document.getElementById('compromisos-mini').innerHTML = comps.map(c=>
    `<div class="comp-item"><span class="dot ${c.st}"></span>
      <span class="comp-desc">${c.desc}</span>
      <span class="comp-pct ${c.st}">${c.pct}%</span></div>`
  ).join('');
}

// ── SEGURIDAD ──
function renderSeguridad(s){
  const d=s||SECTORES[0];
  document.getElementById('s-incidentes').textContent = s?d.incTotal:SECTORES.reduce((a,x)=>a+x.incTotal,0);
  const varVal = s?d.incVar:-(SECTORES.reduce((a,x)=>a+Math.abs(x.incVar),0)/SECTORES.length).toFixed(1);
  document.getElementById('s-inc-var').innerHTML=`<span class="${varVal<0?'chip-up':'chip-dn'}">${varVal<0?'▼':'▲'} ${Math.abs(varVal)}%</span> vs. sem. anterior`;
  document.getElementById('s-respuesta').textContent=d.tasaResp+' min';
  document.getElementById('s-frustrados').textContent=s?d.frustrados:SECTORES.reduce((a,x)=>a+x.frustrados,0);
  document.getElementById('s-intervenciones').textContent=s?d.interv:SECTORES.reduce((a,x)=>a+x.interv,0);
  document.getElementById('s-rutas').textContent=d.cobertura+'%';

  const semanas=['Sem 10','Sem 11','Sem 12','Sem 13','Sem 14','Sem 15','Sem 16'];
  destroyChart('semanas');
  charts['semanas'] = new Chart(document.getElementById('chartSemanas'),{
    type:'line', data:{labels:semanas, datasets:[{label:'Incidentes',data:d.incidentes,
      borderColor:DS.primary,backgroundColor:'rgba(0,94,165,0.07)',tension:.4,fill:true,pointRadius:4,pointBackgroundColor:DS.primary}]},
    options:{...chartDefaults(), scales:{y:{beginAtZero:false,grid:{color:'rgba(0,0,0,.05)'},ticks:{font:{size:11}}}}}
  });

  document.getElementById('franja-chart').innerHTML = d.franjas.map(f=>{
    const w=Math.round(f.v/50*100);
    return `<div class="franja-row"><span class="franja-label">${f.l}</span>
      <div class="franja-bar" style="width:${w}%;background:${f.c};min-width:32px;">${f.v}</div>
      <span style="font-size:11px;color:var(--g5);margin-left:6px;">${f.v} casos</span></div>`;
  }).join('');

  destroyChart('tiposDelito');
  charts['tiposDelito'] = new Chart(document.getElementById('chartTiposDelito'),{
    type:'bar',
    data:{labels:Object.keys(d.tiposDelito), datasets:[{label:'Casos',data:Object.values(d.tiposDelito),
      backgroundColor:DS.primary+'CC', borderRadius:5}]},
    options:{...chartDefaults(), scales:{y:{beginAtZero:true,grid:{color:'rgba(0,0,0,.05)'},ticks:{font:{size:11}}}}}
  });

  destroyChart('cobertura');
  charts['cobertura'] = new Chart(document.getElementById('chartCobertura'),{
    type:'radar',
    data:{labels:['Rutas mañana','Rutas tarde','Rutas noche','Puntos críticos','Zonas resid.'],
      datasets:[{label:'Cobertura %',data:[d.cobertura,d.cobertura-2,d.cobertura-5,d.cobertura+2,d.cobertura-3],
        backgroundColor:'rgba(0,94,165,0.1)',borderColor:DS.primary,pointBackgroundColor:DS.primary,pointRadius:3}]},
    options:{...chartDefaults(), scales:{r:{min:50,max:100,ticks:{font:{size:9},stepSize:10}}}}
  });
}

// ── OPERACIONES ──
function renderOperaciones(s){
  const d=s||SECTORES[0];
  document.getElementById('o-sup').textContent=d.supRealizadas;
  document.getElementById('o-sup-plan').textContent=`de ${d.supPlan} planificadas`;
  document.getElementById('o-hallazgos').textContent=d.hallazgos;
  document.getElementById('o-capturas').textContent=d.capturas;
  document.getElementById('o-coord').textContent=d.coordPNP;
  document.getElementById('o-reportes').textContent=d.reportes;

  const semanas=['Sem 13','Sem 14','Sem 15','Sem 16'];
  const supData=[Math.round(d.supPlan*.22),Math.round(d.supPlan*.24),Math.round(d.supPlan*.26),Math.round(d.supRealizadas*.28)];
  destroyChart('supervisiones');
  charts['supervisiones'] = new Chart(document.getElementById('chartSupervisiones'),{
    type:'bar',
    data:{labels:semanas, datasets:[
      {label:'Realizadas',data:supData,backgroundColor:DS.primary,borderRadius:5},
      {label:'Plan',data:[d.supPlan/4,d.supPlan/4,d.supPlan/4,d.supPlan/4].map(Math.round),backgroundColor:DS.primary+'33',borderRadius:5}
    ]},
    options:{...chartDefaults(), plugins:{legend:{display:true,position:'top',labels:{boxWidth:10,font:{size:11}}}},
      scales:{y:{beginAtZero:true,grid:{color:'rgba(0,0,0,.05)'},ticks:{font:{size:11}}}}}
  });

  document.getElementById('operativos-list').innerHTML = d.operativosTipo.map(op=>
    `<span class="coord-tag"><span class="dot verde"></span>${op}</span>`
  ).join('');

  destroyChart('operativos');
  charts['operativos'] = new Chart(document.getElementById('chartOperativos'),{
    type:'bar',
    data:{labels:d.operativosTipo.map(o=>o.replace('Op. ','')),
      datasets:[{label:'Operativos',data:d.operativosTipo.map(()=>1),backgroundColor:DS.success+'CC',borderRadius:5}]},
    options:{...chartDefaults(), scales:{y:{display:false},x:{ticks:{font:{size:10}}}}}
  });
}

// ── PERSONAL ──
function renderPersonal(s){
  const d=s||SECTORES[0];
  document.getElementById('p-asist').textContent=d.kpis.asistencia+'%';
  document.getElementById('p-tard').textContent=d.tardanzas+'%';
  document.getElementById('p-disc').textContent=d.disciplinarias;
  document.getElementById('p-rot').textContent=d.rotacion;

  document.getElementById('rank-asistencia').innerHTML = d.supervisores.map(p=>{
    const cls=p.ast>=95?'verde':p.ast>=85?'amarillo':'rojo';
    return `<div class="prog-row"><span class="prog-name">${p.n}</span>
      <div class="prog-track"><div class="prog-bar ${cls}" style="width:${p.ast}%"></div></div>
      <span class="prog-val">${p.ast}%</span></div>`;
  }).join('');

  destroyChart('turnos');
  charts['turnos'] = new Chart(document.getElementById('chartTurnos'),{
    type:'bar',
    data:{labels:['Turno Mañana','Turno Tarde','Turno Noche'],
      datasets:[{label:'Asistencia %',
        data:[d.kpis.asistencia+1,d.kpis.asistencia-1,d.kpis.asistencia-2].map(v=>Math.min(100,v)),
        backgroundColor:[DS.primary,DS.primary+'BB',DS.primary+'88'],borderRadius:6}]},
    options:{...chartDefaults(), scales:{y:{min:70,max:100,grid:{color:'rgba(0,0,0,.05)'},ticks:{font:{size:11}}}}}
  });

  const tbl=document.getElementById('tbl-rendimiento');
  tbl.innerHTML=`<thead><tr>
    <th>Supervisor</th><th class="num">Rutas %</th><th class="num">Reportes %</th>
    <th class="num">Actitud</th><th class="num">Puntaje Total</th><th>Semáforo</th>
  </tr></thead><tbody>`+d.rendimiento.map(r=>{
    const cls=r.total>=90?'verde':r.total>=75?'amarillo':'rojo';
    return `<tr><td>${r.sup}</td><td class="num">${r.rutas}</td><td class="num">${r.reportes}</td>
      <td class="num">${r.actitud}</td><td class="num"><strong>${r.total}</strong></td>
      <td><span class="status-badge ${cls}"><span class="dot ${cls}"></span>${statusLabel(cls)[1]}</span></td></tr>`;
  }).join('')+'</tbody>';
}

// ── COORDINACIÓN ──
function renderCoordinacion(s){
  const d=s||SECTORES[0];
  document.getElementById('c-reuniones').textContent=d.reunionesComis;
  document.getElementById('c-pat').textContent=d.patrInt+'%';
  document.getElementById('c-zonas').textContent=d.zonasRef;
  document.getElementById('c-acuerdos').textContent=d.acuerdos;
  document.getElementById('c-intconj').textContent=d.intConj;
  document.getElementById('c-evitados').textContent=d.evitados;

  const semanas=['Sem 13','Sem 14','Sem 15','Sem 16'];
  destroyChart('patInt');
  charts['patInt'] = new Chart(document.getElementById('chartPatInt'),{
    type:'bar',
    data:{labels:semanas, datasets:[
      {label:'Realizado',data:[d.patrInt-4,d.patrInt-2,d.patrInt,d.patrInt+1].map(v=>Math.min(100,v)),backgroundColor:DS.primary,borderRadius:5},
      {label:'Planificado',data:[100,100,100,100],backgroundColor:DS.primary+'22',borderRadius:5}
    ]},
    options:{...chartDefaults(), plugins:{legend:{display:true,position:'top',labels:{boxWidth:10,font:{size:11}}}},
      scales:{y:{min:0,max:100,grid:{color:'rgba(0,0,0,.05)'},ticks:{font:{size:11}}}}}
  });

  document.getElementById('acuerdos-list').innerHTML=d.acuerdosList.map(a=>
    `<div class="comp-item"><span class="dot verde"></span><span class="comp-desc">${a}</span></div>`
  ).join('');

  document.getElementById('comisarias-tags').innerHTML=d.comisarias.map(c=>
    `<span class="coord-tag">${c}</span>`
  ).join('');
}

// ── ESTRATEGIA ──
function renderEstrategia(s){
  const d=s||SECTORES[0];
  const comps=d.compromisos;
  const cumplidos=comps.filter(c=>c.pct>=95).length;
  const en_prog=comps.filter(c=>c.pct>=60&&c.pct<95).length;
  const prom=Math.round(comps.reduce((a,c)=>a+c.pct,0)/comps.length);
  document.getElementById('e-total').textContent=comps.length;
  document.getElementById('e-cumplidos').textContent=cumplidos;
  document.getElementById('e-progreso').textContent=en_prog;
  document.getElementById('e-prom').textContent=prom+'%';
  document.getElementById('e-red').textContent=d.impReduc+'%';
  document.getElementById('e-aum').textContent='+'+d.impAum+'%';
  document.getElementById('e-disc').textContent=d.impDisc>0?('-'+d.impDisc+'%'):(d.impDisc+'%');

  destroyChart('comp');
  const secData=s?[s]:SECTORES;
  charts['comp'] = new Chart(document.getElementById('chartComp'),{
    type:'bar',
    data:{labels:secData.map(x=>x.sector.replace('Sector ','')),
      datasets:[{label:'Avance %',
        data:secData.map(x=>Math.round(x.compromisos.reduce((a,c)=>a+c.pct,0)/x.compromisos.length)),
        backgroundColor:secData.map(x=>{
          const v=Math.round(x.compromisos.reduce((a,c)=>a+c.pct,0)/x.compromisos.length);
          return v>=85?DS.primary:v>=65?DS.warning:DS.danger;
        }),borderRadius:6}]},
    options:{...chartDefaults(), scales:{y:{min:0,max:100,grid:{color:'rgba(0,0,0,.05)'},ticks:{font:{size:11}}}}}
  });

  document.getElementById('compromisos-detail').innerHTML=comps.map(c=>
    `<div class="comp-item">
      <span class="dot ${c.st}"></span>
      <span class="comp-desc">${c.desc}</span>
      <div class="prog-track" style="width:60px;"><div class="prog-bar ${c.st}" style="width:${c.pct}%"></div></div>
      <span class="comp-pct ${c.st}">${c.pct}%</span>
    </div>`
  ).join('');
}

// ── RANKING ──
function renderRanking(){
  const sorted=[...SECTORES].sort((a,b)=>b.score-a.score);
  destroyChart('rankGlobal');
  charts['rankGlobal'] = new Chart(document.getElementById('chartRankGlobal'),{
    type:'bar', indexAxis:'y',
    data:{labels:sorted.map(x=>x.sector),
      datasets:[{label:'Puntaje',data:sorted.map(x=>x.score),
        backgroundColor:sorted.map(x=>x.score>=85?DS.primary:x.score>=70?DS.warning:DS.danger),
        borderRadius:5}]},
    options:{...chartDefaults(), scales:{x:{min:0,max:100,grid:{color:'rgba(0,0,0,.05)'},ticks:{font:{size:11}}},y:{ticks:{font:{size:11}}}}}
  });

  destroyChart('radar');
  charts['radar'] = new Chart(document.getElementById('chartRadar'),{
    type:'radar',
    data:{labels:['Seguridad','Operaciones','Personal','Coordinación','Estrategia'],
      datasets:SECTORES.map((s,i)=>({
        label:s.sector, data:s.dims,
        borderColor:SECTOR_COLORS[i],
        backgroundColor:SECTOR_COLORS[i]+'18',
        pointRadius:3
      }))},
    options:{...chartDefaults(), plugins:{legend:{display:true,position:'bottom',labels:{boxWidth:10,font:{size:10}}}},
      scales:{r:{min:40,max:100,ticks:{font:{size:9},stepSize:20}}}}
  });

  document.getElementById('tbody-ranking').innerHTML=sorted.map((s,i)=>{
    const cls=s.score>=85?'verde':s.score>=70?'amarillo':'rojo';
    const rankCls=i===0?'r1':i===1?'r2':i===2?'r3':'';
    return `<tr>
      <td><span class="rank-n ${rankCls}">${i+1}</span></td>
      <td><strong>${s.nombre}</strong></td>
      <td>${s.sector}</td>
      <td class="num">${s.dims[0]}</td><td class="num">${s.dims[1]}</td>
      <td class="num">${s.dims[2]}</td><td class="num">${s.dims[3]}</td>
      <td class="num">${s.dims[4]}</td>
      <td class="num"><strong>${s.score}</strong></td>
      <td><span class="status-badge ${cls}"><span class="dot ${cls}"></span>${statusLabel(cls)[1]}</span></td>
    </tr>`;
  }).join('');

  document.getElementById('checklist-semanal').innerHTML=
    `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">`+
    CHECKS_SEMANAL.map(c=>
      `<div class="comp-item" style="padding:8px 10px;background:var(--g1);border-radius:var(--rmd);border-bottom:none;border:1px solid var(--g3);">
        <span class="dot verde"></span><span class="comp-desc" style="font-size:var(--tsm);">${c.item}</span>
      </div>`
    ).join('')+`</div>`;
}

// ── NAV ──
function showPanel(id, el){
  document.querySelectorAll('.section-panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  document.getElementById('panel-'+id).classList.add('active');
  el.classList.add('active');
}

// ── INIT ──
window.addEventListener('load', ()=>{
  updateDash();
  lucide.createIcons();
});