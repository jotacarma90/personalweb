// games/Snake.jsx
// Playable Snake: arrows/WASD to move, P to pause, R to reset.
// Grid 20x20, increasing length, simple scoring.

import { useEffect, useRef, useState } from "react";
import "./Snake.css";

const ROWS = 20;
const COLS = 20;
const INITIAL_SPEED = 160; // ms between moves

const DIRS = {
  ArrowUp:    { x: 0, y: -1 },
  ArrowDown:  { x: 0, y: 1 },
  ArrowLeft:  { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 }, a: { x: -1, y: 0 }, s: { x: 0, y: 1 }, d: { x: 1, y: 0 },
  W: { x: 0, y: -1 }, A: { x: -1, y: 0 }, S: { x: 0, y: 1 }, D: { x: 1, y: 0 },
};

function randomCell(excludeSet) {
  while (true) {
    const x = Math.floor(Math.random() * COLS);
    const y = Math.floor(Math.random() * ROWS);
    const key = `${x},${y}`;
    if (!excludeSet.has(key)) return { x, y };
  }
}

export default function Snake() {
  const [snake, setSnake] = useState(() => [
    { x: 10, y: 10 },
    { x: 9,  y: 10 },
    { x: 8,  y: 10 },
  ]);
  const [dir, setDir] = useState({ x: 1, y: 0 });
  const [food, setFood] = useState(() => randomCell(new Set(["10,10", "9,10", "8,10"])));
  const [paused, setPaused] = useState(false);
  const [over, setOver] = useState(false);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);

  const timer = useRef(null);
  const pendingDir = useRef(dir); // prevent double-turn within a tick

  // Keyboard controls
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "p" || e.key === "P") { setPaused(p => !p); return; }
      if (e.key === "r" || e.key === "R") { reset(); return; }
      const next = DIRS[e.key];
      if (!next || over || paused) return;

      // disallow reverse into itself
      const curr = pendingDir.current;
      if ((curr.x + next.x === 0 && curr.y + next.y === 0)) return;

      pendingDir.current = next;
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paused, over]);

  // Game loop
  useEffect(() => {
    if (paused || over) return;
    timer.current = setInterval(() => {
      setSnake((prev) => {
        const d = pendingDir.current;

        const head = prev[0];
        const newHead = { x: head.x + d.x, y: head.y + d.y };

        // Check walls
        if (newHead.x < 0 || newHead.x >= COLS || newHead.y < 0 || newHead.y >= ROWS) {
          setOver(true); return prev;
        }
        // Check self collision
        for (let i = 0; i < prev.length; i++) {
          if (prev[i].x === newHead.x && prev[i].y === newHead.y) {
            setOver(true); return prev;
          }
        }

        // Move
        const nextSnake = [newHead, ...prev];

        // Eat?
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => s + 10);
          // speed up slightly every 5 foods
          setSpeed(sp => ( ((score + 10) % 50 === 0) ? Math.max(70, sp - 10) : sp));
          // place new food avoiding snake cells
          const occupied = new Set(nextSnake.map(c => `${c.x},${c.y}`));
          setFood(randomCell(occupied));
          // keep growth (no tail pop)
          return nextSnake;
        } else {
          nextSnake.pop(); // normal move: remove tail
          return nextSnake;
        }
      });
    }, speed);
    return () => clearInterval(timer.current);
  }, [paused, over, speed, score]);

  const reset = () => {
    setSnake([{ x:10,y:10 }, { x:9,y:10 }, { x:8,y:10 }]);
    setDir({ x:1,y:0 });
    pendingDir.current = { x:1,y:0 };
    setFood({ x: 14, y: 10 });
    setPaused(false);
    setOver(false);
    setScore(0);
    setSpeed(INITIAL_SPEED);
  };

  // Keep dir state in sync for UI if needed
  useEffect(() => { setDir(pendingDir.current); });

  // Board rendering (CSS grid cells)
  const cells = [];
  const snakeSet = new Set(snake.map(c => `${c.x},${c.y}`));
  const foodKey = `${food.x},${food.y}`;

  for (let y=0; y<ROWS; y++) {
    for (let x=0; x<COLS; x++) {
      const key = `${x},${y}`;
      let cls = "cell";
      if (snakeSet.has(key)) cls += " snake";
      if (key === foodKey) cls += " food";
      cells.push(<div key={key} className={cls} />);
    }
  }

  return (
    <div className="snake-wrap">
      <div className="snake-hud">
        <div>Score: {score}</div>
        <div>{paused ? "Paused (P)" : "Playing"}</div>
        {over && <div className="over">Game Over</div>}
        <div className="row">
          <button className="btn" onClick={() => setPaused(p => !p)}>{paused ? "Resume (P)" : "Pause (P)"}</button>
          <button className="btn" onClick={reset}>Reset (R)</button>
        </div>
        <div className="help">Controls: ← → ↑ ↓ / WASD · P pause · R reset</div>
      </div>

      <div
        className="snake-board"
        aria-label="Snake board"
        style={{ gridTemplateColumns: `repeat(${COLS}, 20px)`, gridTemplateRows: `repeat(${ROWS}, 20px)` }}
      >
        {cells}
      </div>
    </div>
  );
}
