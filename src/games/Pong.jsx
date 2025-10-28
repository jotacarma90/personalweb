// src/games/Pong.jsx
// Single player: Left paddle (W/S or ArrowUp/Down). Right paddle = simple AI.
// P to pause, R to reset.

import { useEffect, useRef, useState } from "react";
import "./Pong.css";

const W = 640, H = 400;
const PADDLE_W = 10, PADDLE_H = 70, PADDLE_SPEED = 6;
const BALL_R = 7;

export default function Pong() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  const [paused, setPaused] = useState(false);
  const [scoreL, setScoreL] = useState(0);
  const [scoreR, setScoreR] = useState(0);
  const [over, setOver] = useState(false);

  const stateRef = useRef({
    l: { y: H/2 - PADDLE_H/2 },
    r: { y: H/2 - PADDLE_H/2 },
    ball: { x: W/2, y: H/2, vx: 4, vy: 3 },
    input: { up: false, down: false },
  });

  // Input
  useEffect(() => {
    const onDown = (e) => {
      if (e.key === "p" || e.key === "P") { setPaused(p => !p); return; }
      if (e.key === "r" || e.key === "R") { reset(); return; }
      if (e.key === "w" || e.key === "W" || e.key === "ArrowUp")   stateRef.current.input.up = true;
      if (e.key === "s" || e.key === "S" || e.key === "ArrowDown") stateRef.current.input.down = true;
    };
    const onUp = (e) => {
      if (e.key === "w" || e.key === "W" || e.key === "ArrowUp")   stateRef.current.input.up = false;
      if (e.key === "s" || e.key === "S" || e.key === "ArrowDown") stateRef.current.input.down = false;
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => { window.removeEventListener("keydown", onDown); window.removeEventListener("keyup", onUp); };
  }, []);

  // Loop
  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");

    function step() {
      if (!paused && !over) update();
      draw(ctx);
      rafRef.current = requestAnimationFrame(step);
    }
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [paused, over]);

  function reset() {
    stateRef.current.l.y = H/2 - PADDLE_H/2;
    stateRef.current.r.y = H/2 - PADDLE_H/2;
    stateRef.current.ball = { x: W/2, y: H/2, vx: Math.random() < 0.5 ? 4 : -4, vy: (Math.random() * 2 + 2) * (Math.random()<0.5?-1:1) };
    setScoreL(0); setScoreR(0); setPaused(false); setOver(false);
  }

  function update() {
    const s = stateRef.current;

    // Player movement
    if (s.input.up)   s.l.y = Math.max(0, s.l.y - PADDLE_SPEED);
    if (s.input.down) s.l.y = Math.min(H - PADDLE_H, s.l.y + PADDLE_SPEED);

    // Simple AI for right paddle (follows ball with easing)
    const targetY = s.ball.y - PADDLE_H/2;
    s.r.y += (targetY - s.r.y) * 0.08;
    s.r.y = Math.max(0, Math.min(H - PADDLE_H, s.r.y));

    // Ball physics
    s.ball.x += s.ball.vx;
    s.ball.y += s.ball.vy;

    // Top/bottom bounce
    if (s.ball.y - BALL_R < 0 || s.ball.y + BALL_R > H) s.ball.vy *= -1;

    // Paddle collision (left)
    if (s.ball.x - BALL_R <= PADDLE_W &&
        s.ball.y >= s.l.y && s.ball.y <= s.l.y + PADDLE_H && s.ball.vx < 0) {
      s.ball.vx *= -1;
      // add a bit of angle based on hit position
      const hit = (s.ball.y - (s.l.y + PADDLE_H/2)) / (PADDLE_H/2);
      s.ball.vy = 4 * hit;
    }

    // Paddle collision (right)
    if (s.ball.x + BALL_R >= W - PADDLE_W &&
        s.ball.y >= s.r.y && s.ball.y <= s.r.y + PADDLE_H && s.ball.vx > 0) {
      s.ball.vx *= -1;
      const hit = (s.ball.y - (s.r.y + PADDLE_H/2)) / (PADDLE_H/2);
      s.ball.vy = 4 * hit;
    }

    // Scoring
    if (s.ball.x < 0) {
      setScoreR(v => {
        const nv = v + 1;
        if (nv >= 7) setOver(true);
        return nv;
      });
      s.ball = { x: W/2, y: H/2, vx: 4, vy: (Math.random()*2+2) * (Math.random()<0.5?-1:1) };
    } else if (s.ball.x > W) {
      setScoreL(v => {
        const nv = v + 1;
        if (nv >= 7) setOver(true);
        return nv;
      });
      s.ball = { x: W/2, y: H/2, vx: -4, vy: (Math.random()*2+2) * (Math.random()<0.5?-1:1) };
    }
  }

  function draw(ctx) {
    const s = stateRef.current;
    ctx.clearRect(0,0,W,H);
    // background
    ctx.fillStyle = "#0f0f10"; ctx.fillRect(0,0,W,H);
    // center line
    ctx.fillStyle = "rgba(255,255,255,.15)";
    for (let y = 0; y < H; y += 18) ctx.fillRect(W/2 - 1, y, 2, 12);
    // paddles
    ctx.fillStyle = "#7c5cff";
    ctx.fillRect(0, s.l.y, PADDLE_W, PADDLE_H);
    ctx.fillStyle = "#6ee7ff";
    ctx.fillRect(W - PADDLE_W, s.r.y, PADDLE_W, PADDLE_H);
    // ball
    ctx.beginPath();
    ctx.fillStyle = "#e8e8ea";
    ctx.arc(s.ball.x, s.ball.y, BALL_R, 0, Math.PI*2);
    ctx.fill();
  }

  return (
    <div className="pong-wrap">
      <div className="pong-hud">
        <div>Score: {scoreL} : {scoreR}</div>
        <div>{paused ? "Paused (P)" : "Playing to 7"}</div>
        {over && <div className="over">Game Over</div>}
        <div className="row">
          <button className="btn" onClick={() => setPaused(p => !p)}>{paused ? "Resume (P)" : "Pause (P)"}</button>
          <button className="btn" onClick={reset}>Reset (R)</button>
        </div>
        <div className="help">Controls: W/S o ↑/↓ · P pausa · R reset</div>
      </div>

      <canvas ref={canvasRef} className="pong-canvas" width={W} height={H} />
    </div>
  );
}
