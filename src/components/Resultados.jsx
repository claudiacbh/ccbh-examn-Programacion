import Codigo from './Codigo'
import { esCorrecta, respuestasValidas } from '../lib/preguntas'

export default function Resultados({ preguntas, respuestas, onReiniciar }) {
  const aciertos = preguntas.filter((p, i) => esCorrecta(respuestas[i], p)).length

  return (
    <section className="panel ancho">
      <div className="puntaje">
        <span className="puntaje-num">{aciertos} / {preguntas.length}</span>
        <span className="puntaje-sub">respuestas correctas</span>
      </div>

      <div className="preguntas">
        {preguntas.map((p, i) => {
          const ok = esCorrecta(respuestas[i], p)
          const dada = (respuestas[i] ?? '').trim()
          const otras = respuestasValidas(p).slice(1)
          return (
            <article className={`pregunta ${ok ? 'correcta' : 'incorrecta'}`} key={p.id}>
              <header>
                <span className="pregunta-num">{ok ? '✅' : '❌'} Pregunta {i + 1}</span>
                <span className="pregunta-tema">#{p.id} · {p.tema}</span>
              </header>
              <p className="pregunta-texto">{p.pregunta}</p>
              <Codigo codigo={p.codigo} />
              <dl className="comparacion">
                <dt>Respuesta dada</dt>
                <dd><code>{dada || '(sin respuesta)'}</code></dd>
                <dt>Respuesta correcta</dt>
                <dd>
                  <code>{p.respuesta}</code>
                  {otras.length > 0 && <span className="alternativas"> (también vale: {otras.join(', ')})</span>}
                </dd>
              </dl>
            </article>
          )
        })}
      </div>

      <div className="acciones">
        <button className="boton principal grande" onClick={onReiniciar}>Volver a empezar</button>
      </div>
    </section>
  )
}
