import { useState } from 'react'
import Ruleta from './Ruleta'
import { aleatorio } from '../lib/preguntas'

export default function Sorteo({ banco, cantidad, onComenzar, onCancelar }) {
  const [ruletas, setRuletas] = useState(() =>
    Array.from({ length: cantidad }, (_, i) => ({
      objetivo: aleatorio(banco.length),
      giro: 1,
      retraso: 60 + i * 280,
      girando: true,
    })),
  )

  const detener = (i) =>
    setRuletas((rs) => rs.map((r, j) => (j === i ? { ...r, girando: false } : r)))

  const volverAGirar = (i) =>
    setRuletas((rs) =>
      rs.map((r, j) => (j === i ? { objetivo: aleatorio(banco.length), giro: r.giro + 1, retraso: 60, girando: true } : r)),
    )

  // Una ruleta detenida es duplicada si su pregunta ya salió en una ruleta anterior también detenida.
  const vistos = new Set()
  const duplicadas = ruletas.map((r) => {
    if (r.girando) return false
    const dup = vistos.has(r.objetivo)
    vistos.add(r.objetivo)
    return dup
  })

  const algunaGirando = ruletas.some((r) => r.girando)
  const hayDuplicadas = duplicadas.some(Boolean)
  const listo = !algunaGirando && !hayDuplicadas

  return (
    <section className="panel ancho">
      <h2>Sorteo de preguntas</h2>
      <div className="ruletas">
        {ruletas.map((r, i) => (
          <Ruleta
            key={i}
            numero={i + 1}
            banco={banco}
            objetivo={r.objetivo}
            giro={r.giro}
            retraso={r.retraso}
            girando={r.girando}
            duplicada={duplicadas[i]}
            onDetener={() => detener(i)}
            onVolverAGirar={() => volverAGirar(i)}
          />
        ))}
      </div>

      {hayDuplicadas && (
        <p className="aviso">Hay preguntas repetidas: vuelve a girar las ruletas marcadas en rojo.</p>
      )}

      <div className="acciones">
        <button className="boton secundario" onClick={onCancelar}>Cambiar configuración</button>
        {listo && (
          <button className="boton principal grande" onClick={() => onComenzar(ruletas.map((r) => banco[r.objetivo]))}>
            COMENZAR
          </button>
        )}
      </div>
    </section>
  )
}
