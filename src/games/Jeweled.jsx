// src/games/Jeweled.jsx
// Minimal match-3 (Jeweled): click two adjacent cells to swap.
// Matches of 3+ are removed; gravity & refill; cascades add score.
// Controls: Click cells; Reset button.

import { useMemo, useState } from "react";
import "./Jeweled.css";

const ROWS = 8, COLS = 8, TYPES = 6;

const rand = (n) => Math.floor(Math.random() * n);
const randomGem = () => 1 + rand(TYPES);

function makeBoardNoInitialMatches() {
  // Fill ensuring no immediate straight 3 on creation
  const b = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      let g;
      do {
        g = randomGem();
      } while (
        (c >= 2 && b[r][c - 1] === g && b[r][c - 2] === g) ||
        (r >= 2 && b[r - 1][c] === g && b[r - 2][c] === g)
      );
      b[r][c] = g;
    }
  }
  return b;
}

const clone = (b) => b.map(r => r.slice());

function findMatches(board) {
  // returns Set of "r,c"
  const m = new Set();

  // Horizontal
  for (let r = 0; r < ROWS; r++) {
    let run = 1;
    for (let c = 1; c <= COLS; c++) {
      const same = c < COLS && board[r][c] !== 0 && board[r][c] === board[r][c - 1];
      if (same) {
        run++;
      } else {
        if (run >= 3) {
          for (let k = c - run; k < c; k++) m.add(`${r},${k}`);
        }
        run = 1;
      }
    }
  }

  // Vertical
  for (let c = 0; c < COLS; c++) {
    let run = 1;
    for (let r = 1; r <= ROWS; r++) {
      const same = r < ROWS && board[r][c] !== 0 && board[r][c] === board[r - 1][c];
      if (same) {
        run++;
      } else {
        if (run >= 3) {
          for (let k = r - run; k < r; k++) m.add(`${k},${c}`);
        }
        run = 1;
      }
    }
  }
  return m;
}

function removeMatches(board, matches) {
  const b = clone(board);
  matches.forEach(key => {
    const [r, c] = key.split(",").map(Number);
    b[r][c] = 0;
  });
  return b;
}

function collapse(b) {
  const board = clone(b);
  for (let c = 0; c < COLS; c++) {
    let write = ROWS - 1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r][c] !== 0) {
        board[write][c] = board[r][c];
        write--;
      }
    }
    for (let r = write; r >= 0; r--) board[r][c] = 0;
  }
  return board;
}

function refill(b) {
  const board = clone(b);
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c] === 0) board[r][c] = randomGem();
    }
  }
  return board;
}

function areAdjacent(a, b) {
  return Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1;
}

export default function Jeweled() {
  const [board, setBoard] = useState(() => makeBoardNoInitialMatches());
  const [score, setScore] = useState(0);
  const [sel, setSel] = useState(null); // {r,c} or null
  const [message, setMessage] = useState("");

  const handleCell = (r, c) => {
    setMessage("");
    if (!sel) { setSel({ r, c }); return; }
    if (sel.r === r && sel.c === c) { setSel(null); return; }
    if (!areAdjacent(sel, { r, c })) { setSel({ r, c }); return; }

    // Attempt swap
    const swapped = clone(board);
    [swapped[sel.r][sel.c], swapped[r][c]] = [swapped[r][c], swapped[sel.r][sel.c]];

    // Valid only if creates a match
    const m = findMatches(swapped);
    if (m.size === 0) {
      setSel(null);
      setMessage("Sin combinación…");
      return;
    }

    // Accept swap, then resolve cascades
    let curr = swapped;
    let cascade = 1;
    let gained = 0;

    while (true) {
      const matches = findMatches(curr);
      if (matches.size === 0) break;
      // simple scoring: 10 pts per gem * cascade multiplier
      gained += matches.size * 10 * cascade;

      curr = removeMatches(curr, matches);
      curr = collapse(curr);
      curr = refill(curr);

      cascade++;
      // (Optional) safety cap to avoid infinite loops
      if (cascade > 20) break;
    }

    setBoard(curr);
    if (gained) setScore(s => s + gained);
    setSel(null);
  };

  const reset = () => {
    setBoard(makeBoardNoInitialMatches());
    setScore(0);
    setSel(null);
    setMessage("");
  };

  const grid = useMemo(() => {
    const out = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const v = board[r][c];
        const key = `${r},${c}`;
        const isSel = sel && sel.r === r && sel.c === c;
        out.push(
          <button
            key={key}
            className={`j-cell gem-${v} ${isSel ? "selected" : ""}`}
            onClick={() => handleCell(r, c)}
            aria-label={`cell ${r},${c}`}
          />
        );
      }
    }
    return out;
  }, [board, sel]);

  return (
    <div className="j-wrap">
      <div className="j-hud">
        <div>Score: {score}</div>
        {message && <div className="j-msg">{message}</div>}
        <div className="row">
          <button className="btn" onClick={reset}>Reset</button>
        </div>
        <div className="help">Haz clic en dos fichas adyacentes para intercambiarlas.</div>
      </div>

      <div
        className="j-board"
        style={{ gridTemplateColumns: `repeat(${COLS}, 44px)`, gridTemplateRows: `repeat(${ROWS}, 44px)` }}
        aria-label="Jeweled board"
      >
        {grid}
      </div>
    </div>
  );
}
