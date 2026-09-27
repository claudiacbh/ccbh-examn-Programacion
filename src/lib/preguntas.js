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
