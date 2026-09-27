import { useEffect, useState } from 'react'
import Configuracion from './components/Configuracion'
import Sorteo from './components/Sorteo'
import Examen from './components/Examen'
import Resultados from './components/Resultados'
import { cargarPreguntas } from './lib/preguntas'

export default function App() {
  const [banco, setBanco] = useState(null)
  const [error, setError] = useState(null)
  const [fase, setFase] = useState('config') // config → sorteo → examen → resultados
  const [config, setConfig] = useState({ cantidad: 3, segundos: 90 })
  const [seleccion, setSeleccion] = useState([])
  const [respuestas, setRespuestas] = useState([])

  useEffect(() => {
    cargarPreguntas().then(setBanco).catch((e) => setError(e.message))
  }, [])

  const sortear = (cantidad, segundos) => {
    setConfig({ cantidad, segundos })
    setFase('sorteo')
  }

  const comenzar = (preguntas) => {
    setSeleccion(preguntas)
    setRespuestas(preguntas.map(() => ''))
    setFase('examen')
  }

  const responder = (i, valor) => setRespuestas((rs) => rs.map((r, j) => (j === i ? valor : r)))

  const reiniciar = () => {
    setSeleccion([])
    setRespuestas([])
    setFase('config')
  }

  return (
    <div className="app">
      <header className="cabecera">
        <h1>Ruleta de examen · Python</h1>
      </header>
      <main>
        {error && <p className="aviso">{error}</p>}
        {!error && !banco && <p className="cargando">Cargando preguntas…</p>}
        {banco && fase === 'config' && <Configuracion totalBanco={banco.length} inicial={config} onSortear={sortear} />}
        {banco && fase === 'sorteo' && (
          <Sorteo banco={banco} cantidad={config.cantidad} onComenzar={comenzar} onCancelar={() => setFase('config')} />
        )}
        {fase === 'examen' && (
          <Examen
            preguntas={seleccion}
            segundosPorPregunta={config.segundos}
            respuestas={respuestas}
            onResponder={responder}
            onTerminar={() => setFase('resultados')}
          />
        )}
        {fase === 'resultados' && <Resultados preguntas={seleccion} respuestas={respuestas} onReiniciar={reiniciar} />}
      </main>
    </div>
  )
}
