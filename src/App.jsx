import { useEffect, useState } from 'react'
import Configuracion from './components/Configuracion'
import Sorteo from './components/Sorteo'
import Examen from './components/Examen'
import Resultados from './components/Resultados'
import { agruparPorModulo, cargarConfig, cargarPreguntas } from './lib/preguntas'

export default function App() {
  const [banco, setBanco] = useState(null)
  const [error, setError] = useState(null)
  const [fase, setFase] = useState('config') // config → sorteo → examen → resultados
  const [titulo, setTitulo] = useState('')
  const [config, setConfig] = useState({ modo: 'aleatorio', cantidad: 3, segundos: 90 })
  const [seleccion, setSeleccion] = useState([])
  const [respuestas, setRespuestas] = useState([])

  useEffect(() => {
    cargarPreguntas().then(setBanco).catch((e) => setError(e.message))
    cargarConfig().then((c) => {
      setTitulo(c.titulo)
      document.title = c.titulo
    })
  }, [])

  const sortear = (nuevaConfig) => {
    setConfig(nuevaConfig)
    setFase('sorteo')
  }

  // Una ranura por ruleta: en "aleatorio" todas sortean del banco completo;
  // en "por módulo" cada módulo aporta `cantidad` ranuras que sortean solo dentro de él.
  const ranuras = () =>
    config.modo === 'porModulo'
      ? agruparPorModulo(banco).flatMap(({ modulo, preguntas }) =>
          Array.from({ length: config.cantidad }, () => ({ pool: preguntas, etiqueta: modulo })),
        )
      : Array.from({ length: config.cantidad }, () => ({ pool: banco }))

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
        <h1>{titulo}</h1>
      </header>
      <main>
        {error && <p className="aviso">{error}</p>}
        {!error && !banco && <p className="cargando">Cargando preguntas…</p>}
        {banco && fase === 'config' && <Configuracion banco={banco} inicial={config} onSortear={sortear} />}
        {banco && fase === 'sorteo' && (
          <Sorteo ranuras={ranuras()} onComenzar={comenzar} onCancelar={() => setFase('config')} />
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
