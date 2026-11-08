import { parsearPreguntas } from './preguntas'

// Los archivos subidos se guardan en localStorage de este navegador (nunca salen de él).
// Se guarda el CSV original y se vuelve a parsear al cargar.
const CLAVE = 'ccbh-exam.bancos'
const CLAVE_ULTIMO = 'ccbh-exam.ultimo'

function leer(clave, porDefecto) {
  try {
    const v = localStorage.getItem(clave)
    return v === null ? porDefecto : JSON.parse(v)
  } catch {
    return porDefecto
  }
}

function escribir(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor))
    return true
  } catch {
    return false
  }
}

const sinPreguntas = ({ preguntas, avisos, ...guardado }) => guardado

// Devuelve los bancos guardados ya parseados: [{ id, nombre, guardado, csv, preguntas }].
export function cargarBancos() {
  const guardados = leer(CLAVE, [])
  if (!Array.isArray(guardados)) return []
  return guardados.flatMap((b) => {
    try {
      return [{ ...b, preguntas: parsearPreguntas(b.csv).preguntas }]
    } catch {
      return [] // un archivo guardado que ya no se puede leer se ignora
    }
  })
}

// Guarda la lista completa; devuelve false si el navegador no lo permitió (sin espacio, modo privado…).
export function guardarBancos(bancos) {
  return escribir(CLAVE, bancos.map(sinPreguntas))
}

export const ultimoBanco = () => leer(CLAVE_ULTIMO, null)
export const recordarUltimo = (id) => escribir(CLAVE_ULTIMO, id)
