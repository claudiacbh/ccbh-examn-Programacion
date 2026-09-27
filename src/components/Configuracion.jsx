import { useState } from 'react'

const CANTIDADES = [2, 3, 4]
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

export default function Configuracion({ totalBanco, inicial, onSortear }) {
  const [cantidad, setCantidad] = useState(inicial.cantidad)
  const [segundos, setSegundos] = useState(inicial.segundos)

  const cantidadOk = Number.isInteger(cantidad) && cantidad >= 1 && cantidad <= totalBanco
  const segundosOk = Number.isInteger(segundos) && segundos >= 1

  return (
    <section className="panel">
      <h2>¿Cuántas preguntas?</h2>
      <Opciones valores={CANTIDADES} valor={cantidad} onCambiar={setCantidad} min={1} max={totalBanco} />
      {!cantidadOk && <p className="aviso">Elige un número entre 1 y {totalBanco}.</p>}

      <h2>Tiempo por pregunta</h2>
      <Opciones valores={TIEMPOS} valor={segundos} onCambiar={setSegundos} sufijo="seg" min={1} />
      {!segundosOk && <p className="aviso">Escribe un número entero de segundos.</p>}

      <p className="resumen">
        Banco: {totalBanco} preguntas
        {cantidadOk && segundosOk && <> · Tiempo total: {formatoTiempo(cantidad * segundos)}</>}
      </p>

      <button className="boton principal" disabled={!cantidadOk || !segundosOk} onClick={() => onSortear(cantidad, segundos)}>
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
