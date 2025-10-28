// App.jsx
// App layout with top nav and nested routes for the Arcade tabs.

import { Suspense, lazy } from "react";
import { NavLink, Outlet, Route, Routes } from "react-router-dom";
import "./App.css";

// Lazy-load pages
const Home = lazy(() => import("./pages/Home.jsx"));
const Arcade = lazy(() => import("./pages/Arcade.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

export default function App() {
  return (
    <div className="site">
      <header className="nav">
        <div className="container nav-inner">
          <div className="brand">vhalgarv<span>.com</span></div>
          <nav className="menu">
            <NavLink to="/" end>Inicio</NavLink>
            <NavLink to="/arcade">Arcade</NavLink>
          </nav>
        </div>
      </header>

      <main>
        <div className="container">
          <Suspense fallback={<div className="loading">Cargando…</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/arcade/*" element={<ArcadeLayout />}>
                <Route index element={<Arcade />} />
                {/* Nested routes inside Arcade */}
                <Route path="tetris" element={<Arcade game="tetris" />} />
                <Route path="snake"  element={<Arcade game="snake"  />} />
                <Route path="pong"   element={<Arcade game="pong"   />} />
                <Route path="puzzle" element={<Arcade game="puzzle" />} />
                <Route path="jeweled" element={<Arcade game="jeweled" />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </div>
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

// Layout wrapper to show Arcade sub-navigation
function ArcadeLayout() {
  return (
    <>
      <div className="tabs">
        <NavLink to="/arcade/tetris" className="tab">Tetris</NavLink>
        <NavLink to="/arcade/snake"  className="tab">Snake</NavLink>
        <NavLink to="/arcade/pong"   className="tab">Pong</NavLink>
        <NavLink to="/arcade/puzzle" className="tab">Puzzle</NavLink>
        <NavLink to="/arcade/jeweled" className="tab">Jeweled</NavLink>
      </div>
      <Outlet />
    </>
  );
}
