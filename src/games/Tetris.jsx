// Tetris.jsx
// Minimal playable Tetris for React + Vite
// Controls: ← → to move, ↓ to soft drop, ↑ to rotate, Space for hard drop, P to pause.

import { useEffect, useMemo, useRef, useState } from "react";
import "./Tetris.css";

const ROWS = 20;
const COLS = 10;

// Board helpers
const createEmptyBoard = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0));

// Tetromino shape definitions (each is an array of rotation matrices)
const TETROMINOES = {
  I: [
    [[1, 1, 1, 1]],
    [[1], [1], [1], [1]],
  ],
  O: [
    [
      [1, 1],
      [1, 1],
    ],
  ],
  T: [
    [
      [0, 1, 0],
      [1, 1, 1],
    ],
    [
      [1, 0],
      [1, 1],
      [1, 0],
    ],
    [
      [1, 1, 1],
      [0, 1, 0],
    ],
    [
      [0, 1],
      [1, 1],
      [0, 1],
    ],
  ],
  S: [
    [
      [0, 1, 1],
      [1, 1, 0],
    ],
    [
      [1, 0],
      [1, 1],
      [0, 1],
    ],
  ],
  Z: [
    [
      [1, 1, 0],
      [0, 1, 1],
    ],
    [
      [0, 1],
      [1, 1],
      [1, 0],
    ],
  ],
  J: [
    [
      [1, 0, 0],
      [1, 1, 1],
    ],
    [
      [1, 1],
      [1, 0],
      [1, 0],
    ],
    [
      [1, 1, 1],
      [0, 0, 1],
    ],
    [
      [0, 1],
      [0, 1],
      [1, 1],
    ],
  ],
  L: [
    [
      [0, 0, 1],
      [1, 1, 1],
    ],
    [
      [1, 0],
      [1, 0],
      [1, 1],
    ],
    [
      [1, 1, 1],
      [1, 0, 0],
    ],
    [
      [1, 1],
      [0, 1],
      [0, 1],
    ],
  ],
};

// Map piece types to numeric ids for coloring (1..7)
const TYPES = ["I", "O", "T", "S", "Z", "J", "L"];
const TYPE_TO_ID = Object.fromEntries(TYPES.map((t, i) => [t, i + 1]));

function randomType() {
  return TYPES[Math.floor(Math.random() * TYPES.length)];
}

function getRotations(type) {
  return TETROMINOES[type];
}

// Check collision of a piece against board/bounds
function isValidPosition(board, piece, offX = 0, offY = 0, nextRot = null) {
  const rotations = getRotations(piece.type);
  const rotIdx = nextRot ?? piece.rot;
  const shape = rotations[rotIdx];

  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (!shape[y][x]) continue;
      const newX = piece.x + x + offX;
      const newY = piece.y + y + offY;

      // Outside bounds
      if (newX < 0 || newX >= COLS || newY >= ROWS) return false;
      // Above top is allowed (spawn area), but only y < 0; if >=0 must not collide
      if (newY >= 0 && board[newY][newX]) return false;
    }
  }
  return true;
}

// Merge piece into board (returns a new board)
function mergePiece(board, piece) {
  const newBoard = board.map((row) => row.slice());
  const shape = getRotations(piece.type)[piece.rot];
  const id = TYPE_TO_ID[piece.type];

  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (!shape[y][x]) continue;
      const by = piece.y + y;
      const bx = piece.x + x;
      if (by >= 0 && by < ROWS && bx >= 0 && bx < COLS) {
        newBoard[by][bx] = id;
      }
    }
  }
  return newBoard;
}

// Clear full lines and return { board, linesCleared }
function clearLines(board) {
  let cleared = 0;
  const remaining = board.filter((row) => row.some((cell) => cell === 0));
  cleared = ROWS - remaining.length;
  const newBoard = [
    ...Array.from({ length: cleared }, () => Array(COLS).fill(0)),
    ...remaining,
  ];
  return { board: newBoard, linesCleared: cleared };
}

export default function Tetris() {
  const [board, setBoard] = useState(createEmptyBoard());
  const [piece, setPiece] = useState(() => {
    const type = randomType();
    const shape = getRotations(type)[0];
    return {
      type,
      rot: 0,
      x: Math.floor((COLS - shape[0].length) / 2),
      y: -2, // spawn slightly above
    };
  });
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [paused, setPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  // Gravity speed (ms). You can tweak to taste.
  const speed = 650;

  const gravityTimer = useRef(null);

  // Spawn a new random piece
  const spawn = () => {
    const type = randomType();
    const rot = 0;
    const shape = getRotations(type)[rot];
    const next = {
      type,
      rot,
      x: Math.floor((COLS - shape[0].length) / 2),
      y: -2,
    };
    // If cannot place new piece -> game over
    if (!isValidPosition(board, next, 0, 0, next.rot)) {
      setGameOver(true);
      return null;
    }
    setPiece(next);
    return next;
  };

  // Soft move down 1 row; returns true if moved, false if locked
  const stepDown = () => {
    if (isValidPosition(board, piece, 0, 1)) {
      setPiece((p) => ({ ...p, y: p.y + 1 }));
      return true;
    }
    // Lock piece
    const merged = mergePiece(board, piece);
    const { board: cleared, linesCleared } = clearLines(merged);
    setBoard(cleared);
    if (linesCleared) {
      setLines((L) => L + linesCleared);
      // Simple scoring: 100 per line, 300 for 2, 500 for 3, 800 for tetris
      const table = { 1: 100, 2: 300, 3: 500, 4: 800 };
      setScore((s) => s + (table[linesCleared] || linesCleared * 100));
    }
    spawn();
    return false;
  };

  // Hard drop
  const hardDrop = () => {
    if (gameOver || paused) return;
    let moved = true;
    while (moved) {
      moved = isValidPosition(board, piece, 0, 1);
      if (moved) setPiece((p) => ({ ...p, y: p.y + 1 }));
    }
    // Lock immediately after final move
    const merged = mergePiece(board, piece);
    const { board: cleared, linesCleared } = clearLines(merged);
    setBoard(cleared);
    if (linesCleared) {
      const table = { 1: 100, 2: 300, 3: 500, 4: 800 };
      setLines((L) => L + linesCleared);
      setScore((s) => s + (table[linesCleared] || linesCleared * 100));
    }
    spawn();
  };

  // Move horizontally
  const move = (dx) => {
    if (gameOver || paused) return;
    if (isValidPosition(board, piece, dx, 0)) {
      setPiece((p) => ({ ...p, x: p.x + dx }));
    }
  };

  // Soft drop
  const softDrop = () => {
    if (gameOver || paused) return;
    stepDown();
  };

  // Rotate (clockwise)
  const rotate = () => {
    if (gameOver || paused) return;
    const rotations = getRotations(piece.type);
    const nextRot = (piece.rot + 1) % rotations.length;

    // Basic wall-kick: try x offsets [-1, +1, -2, +2]
    const kicks = [0, -1, 1, -2, 2];
    for (const k of kicks) {
      if (isValidPosition(board, piece, k, 0, nextRot)) {
        setPiece((p) => ({ ...p, rot: nextRot, x: p.x + k }));
        return;
      }
    }
    // If none fits, do nothing
  };

  // Keyboard controls
  useEffect(() => {
    const onKeyDown = (e) => {
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          move(-1);
          break;
        case "ArrowRight":
          e.preventDefault();
          move(1);
          break;
        case "ArrowDown":
          e.preventDefault();
          softDrop();
          break;
        case "ArrowUp":
          e.preventDefault();
          rotate();
          break;
        case " ":
          e.preventDefault();
          hardDrop();
          break;
        case "p":
        case "P":
          setPaused((p) => !p);
          break;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [board, piece, gameOver, paused]);

  // Gravity loop
  useEffect(() => {
    if (gameOver || paused) return;
    gravityTimer.current = setInterval(() => {
      stepDown();
    }, speed);
    return () => clearInterval(gravityTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board, piece, gameOver, paused]);

  // Derived “board with active piece” for rendering
  const renderBoard = useMemo(() => {
    const b = board.map((row) => row.slice());
    const shape = getRotations(piece.type)[piece.rot];
    const id = TYPE_TO_ID[piece.type];

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (!shape[y][x]) continue;
        const by = piece.y + y;
        const bx = piece.x + x;
        if (by >= 0 && by < ROWS && bx >= 0 && bx < COLS) {
          b[by][bx] = id;
        }
      }
    }
    return b;
  }, [board, piece]);

  const reset = () => {
    setBoard(createEmptyBoard());
    setScore(0);
    setLines(0);
    setPaused(false);
    setGameOver(false);
    const type = randomType();
    const shape = getRotations(type)[0];
    setPiece({
      type,
      rot: 0,
      x: Math.floor((COLS - shape[0].length) / 2),
      y: -2,
    });
  };

  return (
    <div className="tetris-wrapper">
      <div className="tetris-hud">
        <div>Score: {score}</div>
        <div>Lines: {lines}</div>
        <div>{paused ? "Paused (P)" : "Playing"}</div>
        {gameOver && <div className="tetris-over">Game Over</div>}
        <button onClick={paused ? () => setPaused(false) : () => setPaused(true)}>
          {paused ? "Resume (P)" : "Pause (P)"}
        </button>
        <button onClick={reset}>Reset</button>
      </div>

      <div className="tetris-board" aria-label="Tetris board">
        {renderBoard.map((row, r) => (
          <div key={r} className="tetris-row">
            {row.map((cell, c) => {
              const cls = cell ? `tetris-cell filled color-${cell}` : "tetris-cell";
              return <div key={c} className={cls} />;
            })}
          </div>
        ))}
      </div>

      <div className="tetris-help">
        Controls: ← → move, ↓ soft drop, ↑ rotate, Space hard drop, P pause
      </div>
    </div>
  );
}
