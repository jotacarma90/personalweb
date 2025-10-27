// App.jsx
// New landing with a hero, "Mini Arcade" (Tetris), and a simple footer.

import { useState } from "react";
import Tetris from "./Tetris";
import "./App.css";

export default function App() {
  // Example small interaction for header CTA
  const [hello, setHello] = useState(false);

  return (
    <div className="site">
      <header className="nav">
        <div className="container nav-inner">
          <div className="brand">vhalgarv<span>.com</span></div>
          <nav className="menu">
            <a href="#arcade">Arcade</a>
            <a href="#about">Sobre mí</a>
            <a href="#contact">Contacto</a>
          </nav>
          <button className="btn primary" onClick={() => setHello(true)}>
            {hello ? "¡Hola! 👋" : "Salúdame"}
          </button>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="container hero-grid">
            <div className="hero-text">
              <h1>Pequeño laboratorio web</h1>
              <p>
                Experimentos, minijuegos y notas mientras aprendo diseño web, React y Vite.
                Aquí iré publicando cosillas chulas y pruebas.
              </p>
              <div className="cta-row">
                <a className="btn primary" href="#arcade">Jugar ahora</a>
                <a className="btn ghost" href="#about">Saber más</a>
              </div>
            </div>
            <div className="hero-card">
              <div className="stat">
                <span className="stat-number">⚡️</span>
                <span className="stat-label">Vite + React</span>
              </div>
              <div className="stat">
                <span className="stat-number">🎮</span>
                <span className="stat-label">Mini-Arcade</span>
              </div>
              <div className="stat">
                <span className="stat-number">🛠️</span>
                <span className="stat-label">WIP constante</span>
              </div>
            </div>
          </div>
        </section>

        <section id="arcade" className="arcade">
          <div className="container">
            <h2>Mini Arcade</h2>
            <p className="subtle">
              Empezamos con Tetris. Próximos: Snake, Pong, y algún puzzle.
            </p>
            <div className="game-wrap">
              <Tetris />
            </div>
          </div>
        </section>

        <section id="about" className="about">
          <div className="container about-grid">
            <div>
              <h3>Sobre mí</h3>
              <p>
                Soy vhalgarv y esta es mi web personal. Estoy aprendiendo frontend y
                probando ideas. Aquí documento el progreso y subo mini-proyectos.
              </p>
            </div>
            <ul className="pill-list">
              <li>React + Vite</li>
              <li>CI/CD en AWS</li>
              <li>Vanilla CSS</li>
            </ul>
          </div>
        </section>

        <section id="contact" className="contact">
          <div className="container">
            <h3>Contacto</h3>
            <p className="subtle">¿Feedback o ideas? ¡Encantado de leerte!</p>
            <a className="btn primary" href="mailto:hello@vhalgarv.com">Escríbeme</a>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <span>© {new Date().getFullYear()} vhalgarv</span>
          <span className="sep">·</span>
          <span>Hecho con React + Vite</span>
        </div>
      </footer>
    </div>
  );
}
