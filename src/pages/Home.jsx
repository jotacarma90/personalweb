// pages/Home.jsx
// Simple hero page.

export default function Home() {
  return (
    <section className="hero">
      <div className="hero-grid">
        <div className="hero-text">
          <h1>Pequeño laboratorio web</h1>
          <p>
            Experimentos, minijuegos y notas mientras aprendo diseño web, React y Vite.
            Ahora con navegación por pestañas para cada juego.
          </p>
          <div className="cta-row">
            <a className="btn primary" href="/arcade/tetris">Jugar Tetris</a>
            <a className="btn ghost" href="/arcade">Ver Arcade</a>
          </div>
        </div>
        <div className="hero-card">
          <div className="stat"><span className="stat-number">⚡</span><span className="stat-label">Vite + React</span></div>
          <div className="stat"><span className="stat-number">🎮</span><span className="stat-label">Mini-Arcade</span></div>
          <div className="stat"><span className="stat-number">🧩</span><span className="stat-label">Más juegos pronto</span></div>
        </div>
      </div>
    </section>
  );
}
