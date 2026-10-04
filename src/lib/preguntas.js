import Papa from 'papaparse'

// El CSV vive en public/ para poder editarlo sin recompilar la app.
export async function cargarPreguntas() {
  const res = await fetch(`${import.meta.env.BASE_URL}preguntas.csv`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`No se pudo leer preguntas.csv (HTTP ${res.status})`)
  const { data } = Papa.parse(await res.text(), { header: true, skipEmptyLines: true })
  return data
    .filter((fila) => fila.id && fila.pregunta && fila.respuesta)
    .map((fila) => ({ ...fila, id: String(fila.id).trim(), codigo: fila.codigo ?? '' }))
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
