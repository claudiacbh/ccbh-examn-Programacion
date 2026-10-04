import { useState } from 'react'
import Ruleta from './Ruleta'
import { aleatorio } from '../lib/preguntas'

// `ranuras`: una por ruleta, cada una con el `pool` de preguntas del que sortea
// y una `etiqueta` opcional para agrupar (el módulo, en el modo por módulo).
export default function Sorteo({ ranuras, onComenzar, onCancelar }) {
  const [ruletas, setRuletas] = useState(() =>
    ranuras.map((ranura, i) => ({
      ...ranura,
      objetivo: aleatorio(ranura.pool.length),
      giro: 1,
      retraso: 60 + i * 280,
      girando: true,
    })),
  )

  const detener = (i) =>
    setRuletas((rs) => rs.map((r, j) => (j === i ? { ...r, girando: false } : r)))

  const volverAGirar = (i) =>
    setRuletas((rs) =>
      rs.map((r, j) => (j === i ? { ...r, objetivo: aleatorio(r.pool.length), giro: r.giro + 1, retraso: 60, girando: true } : r)),
    )

  // Una ruleta detenida es duplicada si su pregunta ya salió en una ruleta anterior también detenida.
  const vistos = new Set()
  const duplicadas = ruletas.map((r) => {
    if (r.girando) return false
    const id = r.pool[r.objetivo].id
    const dup = vistos.has(id)
    vistos.add(id)
    return dup
  })

  const algunaGirando = ruletas.some((r) => r.girando)
  const hayDuplicadas = duplicadas.some(Boolean)
  const listo = !algunaGirando && !hayDuplicadas

  // Agrupa las ruletas consecutivas con la misma etiqueta (sin etiqueta → un solo grupo).
  const grupos = []
  ruletas.forEach((r, i) => {
    const ultimo = grupos[grupos.length - 1]
    if (ultimo && ultimo.etiqueta === r.etiqueta) ultimo.indices.push(i)
    else grupos.push({ etiqueta: r.etiqueta, indices: [i] })
  })

  return (
    <section className="panel ancho">
      <h2>Sorteo de preguntas</h2>
      {grupos.map((g) => (
        <div className="grupo-ruletas" key={g.indices[0]}>
          {g.etiqueta && <h3 className="grupo-titulo">Módulo {g.etiqueta}</h3>}
          <div className="ruletas">
            {g.indices.map((i) => {
              const r = ruletas[i]
              return (
                <Ruleta
                  key={i}
                  numero={i + 1}
                  banco={r.pool}
                  objetivo={r.objetivo}
                  giro={r.giro}
                  retraso={r.retraso}
                  girando={r.girando}
                  duplicada={duplicadas[i]}
                  onDetener={() => detener(i)}
                  onVolverAGirar={() => volverAGirar(i)}
                />
              )
            })}
          </div>
        </div>
      ))}

      {hayDuplicadas && (
        <p className="aviso">Hay preguntas repetidas: vuelve a girar las ruletas marcadas en rojo.</p>
      )}

      <div className="acciones">
        <button className="boton secundario" onClick={onCancelar}>Cambiar configuración</button>
        {listo && (
          <button className="boton principal grande" onClick={() => onComenzar(ruletas.map((r) => r.pool[r.objetivo]))}>
            COMENZAR
          </button>
        )}
      </div>
    </section>
  )
}
