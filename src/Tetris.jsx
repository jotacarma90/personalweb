import './Tetris.css'
import { useState, useEffect } from 'react';

export default function Tetris() {
    const [board, setBoard] = useState(Array(20).fill(Array(10).fill(0))); // Tablero 20x10
    const [block, setBlock] = useState({ x: 4, y: 0 }); // Posición inicial del bloque

    // Manejo de teclas
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft') {
        moveBlock(-1, 0); // Mover a la izquierda
      } else if (event.key === 'ArrowRight') {
        moveBlock(1, 0); // Mover a la derecha
      } else if (event.key === 'ArrowDown') {
        moveBlock(0, 1); // Bajar más rápido
      }
    };

    useEffect(() => {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown); // Limpiar eventos
    }, []);

    // Movimiento del bloque
    const moveBlock = (dx, dy) => {
      setBlock((prev) => {
        const newX = prev.x + dx;
        const newY = prev.y + dy;

        // Limitar los bordes del tablero
        if (newX < 0 || newX >= 10 || newY >= 20) return prev;

        return { x: newX, y: newY };
      });
    };

    // Movimiento automático hacia abajo
    useEffect(() => {
      const interval = setInterval(() => {
        moveBlock(0, 1);
      }, 500); // Baja cada 500 ms
      return () => clearInterval(interval);
    }, []);

    return (
      <div className="tetris-board">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="tetris-row">
            {row.map((cell, cellIndex) => (
              <div
                key={cellIndex}
                className={`tetris-cell ${
                  rowIndex === block.y && cellIndex === block.x ? 'block' : ''
                }`}
              ></div>
            ))}
          </div>
        ))}
      </div>
    );
  }
