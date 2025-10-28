// src/games/Puzzle.jsx
// 2048 playable: arrows/WASD to move, R to reset, P to pause.
// Simple merge logic, score, game-over detection.

import { useEffect, useMemo, useState } from "react";
import "./Puzzle.css";

const SIZE = 4;

function emptyBoard() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

function clone(b) { return b.map(row => row.slice()); }

function addRandomTile(board) {
  const empty = [];
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      if (board[y][x] === 0) empty.push({ x, y });
    }
  }
  if (empty.length === 0) return board;
  const { x, y } = empty[Math.floor(Math.random() * empty.length)];
  board[y][x] = Math.random() < 0.9 ? 2 : 4;
  return board;
}

function slideAndMerge(line) {
  // remove zeros
  const nums = line.filter(n => n !== 0);
  // merge
  let scoreGain = 0;
  for (let i = 0; i < nums.length - 1; i++) {
    if (nums[i] !== 0 && nums[i] === nums[i + 1]) {
      nums[i] *= 2;
      scoreGain += nums[i];
      nums[i + 1] = 0;
      i++;
    }
  }
  // compact again
  const result = nums.filter(n => n !== 0);
  while (result.length < SIZE) result.push(0);
  return { line: result, scoreGain };
}

function rotateBoard(b) {
  // rotate 90° clockwise
  const nb = emptyBoard();
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      nb[x][SIZE - 1 - y] = b[y][x];
    }
  }
  return nb;
}

function move(board, dir) {
  // We rotate the board so that any direction becomes "move left"
  // rotMap gives how many CW rotations are needed to align dir to "left":
  //  left=0, up=3, right=2, down=1 (all in CW rotations)
  const rotMap = [0, 3, 2, 1];
  const rot = rotMap[dir];

  let b = clone(board);

  // rotate CW 'rot' times
  for (let i = 0; i < rot; i++) b = rotateBoard(b);

  let moved = false;
  let scoreGain = 0;

  for (let y = 0; y < SIZE; y++) {
    const { line, scoreGain: gain } = slideAndMerge(b[y]);
    if (line.some((v, idx) => v !== b[y][idx])) moved = true;
    b[y] = line;
    scoreGain += gain;
  }

  // rotate back (CCW 'rot' == CW (4-rot))
  for (let i = 0; i < (4 - rot) % 4; i++) b = rotateBoard(b);

  return { board: b, moved, scoreGain };
}


function hasMoves(b) {
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      if (b[y][x] === 0) return true;
      if (x + 1 < SIZE && b[y][x] === b[y][x + 1]) return true;
      if (y + 1 < SIZE && b[y][x] === b[y + 1][x]) return true;
    }
  }
  return false;
}

export default function Puzzle2048() {
  const [board, setBoard] = useState(() => {
    let b = addRandomTile(emptyBoard());
    b = addRandomTile(b);
    return b;
  });
  const [score, setScore] = useState(0);
  const [paused, setPaused] = useState(false);
  const [over, setOver] = useState(false);

  // Controls
  useEffect(() => {
    const onKey = (e) => {
      if (over) return;
      if (e.key === "p" || e.key === "P") { setPaused(p => !p); return; }
      if (e.key === "r" || e.key === "R") { reset(); return; }
      if (paused) return;

      const map = {
        ArrowLeft: 0, a: 0, A:0,
        ArrowUp:   1, w: 1, W:1,
        ArrowRight:2, d: 2, D:2,
        ArrowDown: 3, s: 3, S:3,
      };
      const dir = map[e.key];
      if (dir == null) return;

      const { board: nb, moved, scoreGain } = move(board, dir);
      if (moved) {
        addRandomTile(nb);
        setBoard(nb);
        if (scoreGain) setScore(s => s + scoreGain);
        if (!hasMoves(nb)) setOver(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [board, paused, over]);

  const reset = () => {
    let b = addRandomTile(emptyBoard());
    b = addRandomTile(b);
    setBoard(b);
    setScore(0);
    setPaused(false);
    setOver(false);
  };

  const maxTile = useMemo(() => Math.max(...board.flat()), [board]);

  return (
    <div className="g2048-wrap">
      <div className="g2048-hud">
        <div>Score: {score}</div>
        <div>Best: {maxTile}</div>
        <div>{paused ? "Paused (P)" : "Playing"}</div>
        {over && <div className="over">Game Over</div>}
        <div className="row">
          <button className="btn" onClick={() => setPaused(p => !p)}>{paused ? "Resume (P)" : "Pause (P)"}</button>
          <button className="btn" onClick={reset}>Reset (R)</button>
        </div>
        <div className="help">Controls: ← ↑ → ↓ / WASD · P pause · R reset</div>
      </div>

      <div className="g2048-board">
        {board.map((row, r) => (
          <div key={r} className="g2048-row">
            {row.map((v, c) => (
              <div key={c} className={`tile ${v ? `v${v}` : "v0"}`}>
                {v !== 0 ? v : ""}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
