import Papa from 'papaparse'

export const COLUMNAS = ['id', 'modulo', 'tema', 'tipo', 'pregunta', 'codigo', 'respuesta', 'alternativas']
const OBLIGATORIAS = ['id', 'pregunta', 'respuesta']

// Convierte el texto de un preguntas.csv en el banco de preguntas.
// Lanza un Error con un mensaje para el usuario si el archivo no sirve;
// devuelve `avisos` con las filas que se descartaron.
export function parsearPreguntas(texto) {
  const { data, meta } = Papa.parse(String(texto ?? '').replace(/^\uFEFF/, ''), {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
  })

  const faltan = OBLIGATORIAS.filter((c) => !(meta.fields ?? []).includes(c))
  if (faltan.length) throw new Error(`Al archivo le faltan las columnas: ${faltan.join(', ')}.`)

  const avisos = []
  const vistos = new Set()
  const preguntas = []
  data.forEach((fila, i) => {
    const linea = i + 2 // +1 por el encabezado, +1 porque las filas empiezan en 1
    const id = String(fila.id ?? '').trim()
    if (!id || !fila.pregunta?.trim() || !fila.respuesta?.trim()) {
      avisos.push(`Fila ${linea}: falta id, pregunta o respuesta; se omitió.`)
      return
    }
    if (vistos.has(id)) {
      avisos.push(`Fila ${linea}: el id ${id} está repetido; se omitió.`)
      return
    }
    vistos.add(id)
    preguntas.push({ ...fila, id, tema: fila.tema ?? '', modulo: fila.modulo ?? '', codigo: fila.codigo ?? '' })
  })

  if (!preguntas.length) throw new Error('El archivo no tiene ninguna pregunta válida.')
  return { preguntas, avisos }
}

// Quita espacios sobrantes y comillas externas: "2020", '2020' y 2020 cuentan igual.
export function normalizar(texto) {
  let s = String(texto ?? '').trim().replace(/\s+/g, ' ')
  if (/^(['"]).+\1$/.test(s)) s = s.slice(1, -1).trim()
  return s
}

export function respuestasValidas(pregunta) {
  const alternativas = pregunta.alternativas ? pregunta.alternativas.split('|') : []
  return [pregunta.respuesta, ...alternativas].map(normalizar).filter(Boolean)
}

export function esCorrecta(respuesta, pregunta) {
  const r = normalizar(respuesta)
  return r !== '' && respuestasValidas(pregunta).includes(r)
}

export function aleatorio(max) {
  return Math.floor(Math.random() * max)
}

// Agrupa el banco por la columna `modulo` del CSV, ordenado por nombre ("0 · …", "1 · …", …).
export function agruparPorModulo(banco) {
  const grupos = new Map()
  for (const p of banco) {
    const modulo = (p.modulo ?? '').trim() || 'Sin módulo'
    if (!grupos.has(modulo)) grupos.set(modulo, [])
    grupos.get(modulo).push(p)
  }
  return [...grupos.entries()]
    .sort(([a], [b]) => a.localeCompare(b, 'es', { numeric: true }))
    .map(([modulo, preguntas]) => ({ modulo, preguntas }))
}

const CONFIG_POR_DEFECTO = { titulo: 'Ruleta de examen · Python' }

// config.json vive en public/ para poder cambiar el título sin recompilar.
export async function cargarConfig() {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}config.json`, { cache: 'no-store' })
    if (!res.ok) return CONFIG_POR_DEFECTO
    return { ...CONFIG_POR_DEFECTO, ...(await res.json()) }
  } catch {
    return CONFIG_POR_DEFECTO
  }
}
