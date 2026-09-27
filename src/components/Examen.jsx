import { useEffect, useState } from 'react'
import Codigo from './Codigo'
import { formatoTiempo } from './Configuracion'

export default function Examen({ preguntas, segundosPorPregunta, respuestas, onResponder, onTerminar }) {
  const total = preguntas.length * segundosPorPregunta
  const [restante, setRestante] = useState(total)

  useEffect(() => {
    if (restante <= 0) return
    const t = setTimeout(() => setRestante((r) => r - 1), 1000)
    return () => clearTimeout(t)
  }, [restante])

  const agotado = restante <= 0
  const urgente = !agotado && restante <= 10

  return (
    <section className="panel ancho">
      <div className={`cronometro ${urgente ? 'urgente' : ''} ${agotado ? 'agotado' : ''}`}>
        {agotado ? '¡Tiempo!' : formatoTiempo(restante)}
      </div>

      <div className="preguntas">
        {preguntas.map((p, i) => (
          <article className="pregunta" key={p.id}>
            <header>
              <span className="pregunta-num">Pregunta {i + 1}</span>
              <span className="pregunta-tema">#{p.id} · {p.tema}</span>
            </header>
            <p className="pregunta-texto">{p.pregunta}</p>
            <Codigo codigo={p.codigo} />
            <label className="respuesta">
              Respuesta:
              <input
                type="text"
                value={respuestas[i] ?? ''}
                onChange={(e) => onResponder(i, e.target.value)}
                autoComplete="off"
                spellCheck={false}
              />
            </label>
          </article>
        ))}
      </div>

      <div className="acciones">
        <button className="boton principal grande" onClick={onTerminar}>Terminar</button>
      </div>
    </section>
  )
}
