import { useState } from 'react'
import { COLUMNAS, agruparPorModulo, parsearPreguntas } from '../lib/preguntas'
import { cargarBancos, guardarBancos, recordarUltimo, ultimoBanco } from '../lib/bancos'

const EJEMPLO = `${import.meta.env.BASE_URL}preguntas-ejemplo.csv`

const fecha = (iso) =>
  new Date(iso).toLocaleString('es', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

// Primer paso: elegir el banco de preguntas (uno guardado en el navegador o un CSV nuevo).
export default function Banco({ onElegir }) {
  const [bancos, setBancos] = useState(cargarBancos)
  const [elegido, setElegido] = useState(() => {
    const ultimo = ultimoBanco()
    return bancos.some((b) => b.id === ultimo) ? ultimo : bancos[0]?.id ?? null
  })
  const [error, setError] = useState(null)
  const [avisos, setAvisos] = useState([])
  const [sinGuardar, setSinGuardar] = useState(false)
  const [arrastrando, setArrastrando] = useState(false)

  const actualizar = (nuevos) => {
    setBancos(nuevos)
    setSinGuardar(!guardarBancos(nuevos))
  }

  const subir = async (archivo) => {
    if (!archivo) return
    setError(null)
    setAvisos([])
    try {
      const csv = await archivo.text()
      const { preguntas, avisos } = parsearPreguntas(csv)
      // Un archivo con el mismo nombre reemplaza al guardado.
      const previo = bancos.find((b) => b.nombre === archivo.name)
      const nuevo = { id: previo?.id ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`, nombre: archivo.name, guardado: new Date().toISOString(), csv, preguntas }
      actualizar([nuevo, ...bancos.filter((b) => b.id !== nuevo.id)])
      setElegido(nuevo.id)
      setAvisos(avisos)
    } catch (e) {
      setError(`No se pudo usar «${archivo.name}»: ${e.message}`)
    }
  }

  const borrar = (banco) => {
    if (!confirm(`¿Borrar «${banco.nombre}» de este navegador?`)) return
    const nuevos = bancos.filter((b) => b.id !== banco.id)
    actualizar(nuevos)
    if (elegido === banco.id) setElegido(nuevos[0]?.id ?? null)
  }

  const continuar = () => {
    const banco = bancos.find((b) => b.id === elegido)
    recordarUltimo(banco.id)
    onElegir({ nombre: banco.nombre, preguntas: banco.preguntas })
  }

  return (
    <section className="panel">
      <h2>Banco de preguntas</h2>
      <p className="explicacion">
        Sube tu archivo de preguntas o elige uno que ya hayas subido. Los archivos se guardan solo en este
        navegador.
      </p>

      <label
        className={`zona-subida ${arrastrando ? 'activa' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setArrastrando(true) }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={(e) => { e.preventDefault(); setArrastrando(false); subir(e.dataTransfer.files[0]) }}
      >
        <input type="file" accept=".csv,text/csv" onChange={(e) => { subir(e.target.files[0]); e.target.value = '' }} />
        <span className="zona-titulo">📄 Subir un archivo CSV</span>
        <span className="tarjeta-sub">Haz clic o arrastra el archivo aquí</span>
      </label>

      {error && <p className="aviso">{error}</p>}
      {avisos.length > 0 && (
        <details className="avisos">
          <summary>Se omitieron {avisos.length} filas del archivo</summary>
          <ul>{avisos.map((a) => <li key={a}>{a}</li>)}</ul>
        </details>
      )}
      {sinGuardar && (
        <p className="aviso">No se pudo guardar en este navegador: el archivo se podrá usar solo hasta recargar la página.</p>
      )}

      {bancos.length > 0 && (
        <>
          <h2>Archivos guardados</h2>
          <ul className="bancos">
            {bancos.map((b) => (
              <li key={b.id} className={`banco ${elegido === b.id ? 'activa' : ''}`}>
                <button className="banco-elegir" onClick={() => setElegido(b.id)} aria-pressed={elegido === b.id}>
                  <span className="banco-nombre">{b.nombre}</span>
                  <span className="tarjeta-sub">
                    {b.preguntas.length} preguntas · {agruparPorModulo(b.preguntas).length} módulos · {fecha(b.guardado)}
                  </span>
                </button>
                <button className="banco-borrar" onClick={() => borrar(b)} aria-label={`Borrar ${b.nombre}`} title="Borrar">
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <details className="formato">
        <summary>¿Cómo debe ser el archivo?</summary>
        <p>
          Un CSV con encabezado y estas columnas: <code>{COLUMNAS.join(', ')}</code>. Son obligatorias <code>id</code>,{' '}
          <code>pregunta</code> y <code>respuesta</code>. En <code>alternativas</code> van otras respuestas válidas
          separadas por <code>|</code>, y en <code>codigo</code> el espacio a completar se escribe <code>____</code>.
        </p>
      </details>

      <div className="acciones">
        <a className="boton secundario" href={EJEMPLO} download="preguntas.csv">Descargar ejemplo (5 preguntas)</a>
        <button className="boton principal" disabled={!elegido} onClick={continuar}>Continuar</button>
      </div>
    </section>
  )
}
