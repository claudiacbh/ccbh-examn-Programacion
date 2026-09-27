// Bloque de código que resalta los espacios "____" a completar.
export default function Codigo({ codigo }) {
  if (!codigo) return null
  const partes = codigo.split('____')
  return (
    <pre className="codigo">
      <code>
        {partes.map((parte, i) => (
          <span key={i}>
            {parte}
            {i < partes.length - 1 && <span className="hueco">____</span>}
          </span>
        ))}
      </code>
    </pre>
  )
}
