import "./player.css";
import React, { useEffect, useRef } from 'react';

interface PlayerProps {
  position: { x: number; y: number };
  onPositionChange: (position: { x: number; y: number }) => void;
  setShowInfo: (show: boolean) => void;
  setSelectedCell: (cell: any) => void;
}

const CELL_SIZE = 36; // Taille exacte d'une cellule en pixels
const PLAYER_SIZE = 35; // Taille du joueur
const PLAYER_MARGIN = 1; // Marge du joueur

const Player: React.FC<PlayerProps> = ({ position, onPositionChange, setShowInfo, setSelectedCell }) => {
  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Empêcher le défilement de la page
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
      }

      let newX = position.x;
      let newY = position.y;
      setShowInfo(false);
      setSelectedCell(null);
      switch (event.key) {
        case 'ArrowUp':
          newY = Math.max(PLAYER_MARGIN, position.y - CELL_SIZE);
          break;
        case 'ArrowDown':
          newY = Math.min(CELL_SIZE * 18 - PLAYER_SIZE - PLAYER_MARGIN, position.y + CELL_SIZE);
          break;
        case 'ArrowLeft':
          newX = Math.max(PLAYER_MARGIN, position.x - CELL_SIZE);
          break;
        case 'ArrowRight':
          newX = Math.min(CELL_SIZE * 18 - PLAYER_SIZE - PLAYER_MARGIN, position.x + CELL_SIZE);
          break;
        default:
          return;
      }

      // Ne mettre à jour que si la position a changé
      if (newX !== position.x || newY !== position.y) {
        onPositionChange({ x: newX, y: newY });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [position, onPositionChange]);

  return (
    <div
      ref={playerRef}
      className="player"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`
      }}
    />
  );
};

export default Player;  