import { useEffect, useState } from 'react'
import Banco from './components/Banco'
import Configuracion from './components/Configuracion'
import Sorteo from './components/Sorteo'
import Examen from './components/Examen'
import Resultados from './components/Resultados'
import { agruparPorModulo, cargarConfig } from './lib/preguntas'

export default function App() {
  const [banco, setBanco] = useState(null) // { nombre, preguntas }
  const [fase, setFase] = useState('banco') // banco → config → sorteo → examen → resultados
  const [titulo, setTitulo] = useState('')
  const [config, setConfig] = useState({ modo: 'aleatorio', cantidad: 3, segundos: 90 })
  const [seleccion, setSeleccion] = useState([])
  const [respuestas, setRespuestas] = useState([])

  useEffect(() => {
    cargarConfig().then((c) => {
      setTitulo(c.titulo)
      document.title = c.titulo
    })
  }, [])

  const elegirBanco = (nuevo) => {
    setBanco(nuevo)
    setFase('config')
  }

  const sortear = (nuevaConfig) => {
    setConfig(nuevaConfig)
    setFase('sorteo')
  }

  // Una ranura por ruleta: en "aleatorio" todas sortean del banco completo;
  // en "por módulo" cada módulo aporta `cantidad` ranuras que sortean solo dentro de él.
  const ranuras = () =>
    config.modo === 'porModulo'
      ? agruparPorModulo(banco.preguntas).flatMap(({ modulo, preguntas }) =>
          Array.from({ length: config.cantidad }, () => ({ pool: preguntas, etiqueta: modulo })),
        )
      : Array.from({ length: config.cantidad }, () => ({ pool: banco.preguntas }))

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
        {fase === 'banco' && <Banco onElegir={elegirBanco} />}
        {banco && fase === 'config' && (
          <Configuracion
            banco={banco.preguntas}
            nombre={banco.nombre}
            inicial={config}
            onSortear={sortear}
            onCambiarBanco={() => setFase('banco')}
          />
        )}
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
