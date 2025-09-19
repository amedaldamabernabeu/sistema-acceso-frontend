import Image from "next/image";

export default function HomePage() {
  return (
    <div>
      <div
        style={{
          height: 360,
          backgroundImage: "url('/fondo.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          textShadow: '0 2px 6px rgba(0,0,0,0.45)',
        }}
      >
        <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.45)', padding: 28, borderRadius: 12 }}>
          <h1 style={{ fontSize: 40, margin: 0 }}>Control de Acceso - Universidad</h1>
          <p style={{ marginTop: 8 }}>Panel de administración</p>
        </div>
      </div>

      <div className="container">
        <div className="card">
          <h2>Bienvenido</h2>
          <p>Use el menú para gestionar asociaciones entre Carreras y Departamentos.</p>
        </div>
      </div>
    </div>
  )
}
