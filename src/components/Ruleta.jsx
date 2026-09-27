import { useEffect, useRef, useState } from 'react'
import { aleatorio } from '../lib/preguntas'

const ALTO = 64 // alto de cada casilla, en px (debe coincidir con --casilla en App.css)
const VUELTAS = 55 // casillas que pasan antes de detenerse

// Tira vertical que se desliza y se detiene con la pregunta `objetivo` en el centro.
// Cada vez que cambia `giro` vuelve a girar.
export default function Ruleta({ numero, banco, objetivo, giro, retraso, girando, duplicada, onDetener, onVolverAGirar }) {
  const [tira, setTira] = useState(() => [banco[0], banco[0], banco[0]])
  const [desplazamiento, setDesplazamiento] = useState(0)
  const [animando, setAnimando] = useState(false)
  const ultima = useRef(banco[0])

  useEffect(() => {
    if (objetivo == null) return
    const relleno = () => banco[aleatorio(banco.length)]
    const nueva = [relleno(), ultima.current]
    for (let i = 0; i < VUELTAS; i++) nueva.push(relleno())
    nueva.push(banco[objetivo], relleno())

    setAnimando(false)
    setDesplazamiento(0)
    setTira(nueva)
    const t = setTimeout(() => {
      setAnimando(true)
      setDesplazamiento(-(nueva.length - 3) * ALTO)
    }, retraso)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [giro])

  const final = objetivo != null ? banco[objetivo] : null

  return (
    <div className={`ruleta ${duplicada ? 'duplicada' : ''} ${!girando && final ? 'detenida' : ''}`}>
      <div className="ruleta-titulo">Pregunta {numero}</div>
      <div className="ruleta-ventana">
        <div
          className="ruleta-tira"
          style={{
            transform: `translateY(${desplazamiento}px)`,
            transition: animando ? 'transform 5s cubic-bezier(.12,.75,.18,1)' : 'none',
          }}
          onTransitionEnd={(e) => {
            if (e.target !== e.currentTarget) return
            ultima.current = banco[objetivo]
            onDetener()
          }}
        >
          {tira.map((p, i) => (
            <div className="casilla" key={i}>
              <span className="casilla-id">#{p.id}</span>
              <span className="casilla-tema">{p.tema}</span>
            </div>
          ))}
        </div>
        <div className="ruleta-marco" />
      </div>
      <div className="ruleta-pie">
        {girando && <span className="estado">Girando…</span>}
        {!girando && duplicada && (
          <>
            <span className="estado error">¡Repetida!</span>
            <button className="boton pequeno" onClick={onVolverAGirar}>Volver a girar</button>
          </>
        )}
        {!girando && !duplicada && final && <span className="estado ok">Módulo {final.modulo}</span>}
      </div>
    </div>
  )
}
