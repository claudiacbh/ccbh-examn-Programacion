import { useState } from 'react'
import { agruparPorModulo } from '../lib/preguntas'

const CANTIDADES = [1, 2, 3, 4]
const MODOS = [
  { id: 'aleatorio', titulo: 'Aleatorio', detalle: 'De todos los módulos' },
  { id: 'porModulo', titulo: 'Aleatorio por módulo', detalle: 'La misma cantidad de cada módulo' },
]
const TIEMPOS = [60, 90, 120, 180]

function Opciones({ valores, valor, onCambiar, sufijo, min, max }) {
  const esOtro = valor !== null && !valores.includes(valor)
  const [otro, setOtro] = useState(esOtro)
  return (
    <div className="opciones">
      {valores.map((v) => (
        <button
          key={v}
          className={`tarjeta ${!otro && valor === v ? 'activa' : ''}`}
          onClick={() => { setOtro(false); onCambiar(v) }}
        >
          <span className="tarjeta-num">{v}</span>
          {sufijo && <span className="tarjeta-sub">{sufijo}</span>}
        </button>
      ))}
      <label className={`tarjeta ${otro ? 'activa' : ''}`}>
        <span className="tarjeta-sub">Otro</span>
        <input
          type="number"
          min={min}
          max={max}
          value={otro && valor !== null ? valor : ''}
          placeholder="…"
          onFocus={() => { if (!otro) { setOtro(true); onCambiar(null) } }}
          onChange={(e) => { setOtro(true); onCambiar(e.target.value === '' ? null : Number(e.target.value)) }}
        />
      </label>
    </div>
  )
}

export default function Configuracion({ banco, inicial, onSortear }) {
  const [modo, setModo] = useState(inicial.modo)
  const [cantidad, setCantidad] = useState(inicial.cantidad)
  const [segundos, setSegundos] = useState(inicial.segundos)

  const modulos = agruparPorModulo(banco)
  const porModulo = modo === 'porModulo'
  const maximo = porModulo ? Math.min(...modulos.map((m) => m.preguntas.length)) : banco.length
  const total = porModulo ? cantidad * modulos.length : cantidad

  const cantidadOk = Number.isInteger(cantidad) && cantidad >= 1 && cantidad <= maximo
  const segundosOk = Number.isInteger(segundos) && segundos >= 1

  return (
    <section className="panel">
      <h2>Modo</h2>
      <div className="opciones modos">
        {MODOS.map((m) => (
          <button key={m.id} className={`tarjeta ${modo === m.id ? 'activa' : ''}`} onClick={() => setModo(m.id)}>
            <span className="tarjeta-modo">{m.titulo}</span>
            <span className="tarjeta-sub">{m.detalle}</span>
          </button>
        ))}
      </div>

      <h2>{porModulo ? '¿Cuántas preguntas por módulo?' : '¿Cuántas preguntas?'}</h2>
      <Opciones valores={CANTIDADES} valor={cantidad} onCambiar={setCantidad} min={1} max={maximo} />
      {!cantidadOk && (
        <p className="aviso">
          Elige un número entre 1 y {maximo}
          {porModulo && ' (el módulo más pequeño tiene ' + maximo + ' preguntas)'}.
        </p>
      )}

      <h2>Tiempo por pregunta</h2>
      <Opciones valores={TIEMPOS} valor={segundos} onCambiar={setSegundos} sufijo="seg" min={1} />
      {!segundosOk && <p className="aviso">Escribe un número entero de segundos.</p>}

      <p className="resumen">
        Banco: {banco.length} preguntas en {modulos.length} módulos
        {cantidadOk && porModulo && <> · {cantidad} × {modulos.length} módulos = {total} preguntas</>}
        {cantidadOk && segundosOk && <> · Tiempo total: {formatoTiempo(total * segundos)}</>}
      </p>

      <button
        className="boton principal"
        disabled={!cantidadOk || !segundosOk}
        onClick={() => onSortear({ modo, cantidad, segundos })}
      >
        Sortear preguntas
      </button>
    </section>
  )
}

export function formatoTiempo(total) {
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
