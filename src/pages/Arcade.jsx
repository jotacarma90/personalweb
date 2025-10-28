// pages/Arcade.jsx
// Renders the selected game based on `game` prop, default info view otherwise.

import { lazy, Suspense } from "react";
import Tetris from "../games/Tetris"; // your working Tetris
import "./Arcade.css"; // optional, only if you want extra styles

// Lazy placeholders for upcoming games
const Snake = lazy(() => import("../games/Snake.jsx"));
const Pong  = lazy(() => import("../games/Pong.jsx"));
const Puzzle = lazy(() => import("../games/Puzzle.jsx"));
const Jeweled = lazy(() => import("../games/Jeweled.jsx"));

export default function Arcade({ game }) {
  return (
    <section className="arcade">
      {!game && (
        <>
          <h2>Mini Arcade</h2>
          <p className="subtle">Elige un juego en las pestañas de arriba.</p>
        </>
      )}

      <div className="game-wrap">
        <Suspense fallback={<div className="loading">Cargando juego…</div>}>
          {game === "tetris" && <Tetris />}
          {game === "snake"  && <Snake />}
          {game === "pong"   && <Pong />}
          {game === "puzzle" && <Puzzle />}
          {game === "jeweled" && <Jeweled />}
          {!game && (
            <div className="empty">
              <p>Selecciona un juego: Tetris, Snake, Pong, Puzzle o Jeweled.</p>
            </div>
          )}
        </Suspense>
      </div>
    </section>
  );
}
