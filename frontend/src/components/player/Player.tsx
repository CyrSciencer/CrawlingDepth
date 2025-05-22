import "./player.css";
import React, { useEffect, useRef, useState } from 'react';
import { Cell } from '../../types/cell';

interface PlayerProps {
  position: { x: number; y: number };
  onPositionChange: (position: { x: number; y: number }) => void;
  setShowInfo: (show: boolean) => void;
  setSelectedCell: (cell: any) => void;
  cells: Cell[];
}

const CELL_SIZE = 36; // Taille exacte d'une cellule en pixels
const PLAYER_SIZE = 35; // Taille du joueur
const PLAYER_MARGIN = 1; // Marge du joueur

// Directions possibles avec les angles corrigés
enum Direction {
  UP = 360,    // Rotation vers le haut
  RIGHT = 90, // Regarde vers la droite
  DOWN = 180,   // Rotation vers le bas
  LEFT = 270   // Rotation vers la gauche
}

const Player: React.FC<PlayerProps> = ({ position, onPositionChange, setShowInfo, setSelectedCell, cells }) => {
  const playerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState<Direction>(Direction.RIGHT);
  const [pendingMovement, setPendingMovement] = useState<{ x: number; y: number } | null>(null);

  // Fonction pour obtenir la cellule à une position donnée
  const getCellAtPosition = (x: number, y: number): Cell | undefined => {
    const col = Math.floor(x / CELL_SIZE);
    const row = Math.floor(y / CELL_SIZE);
    return cells.find(cell => cell.row === row && cell.col === col);
  };

  // Fonction pour vérifier si une position est valide (pas un mur)
  const isValidPosition = (x: number, y: number): boolean => {
    const cell = getCellAtPosition(x, y);
    return cell ? !cell.isWall : false;
  };

  // Fonction pour obtenir la direction en fonction des touches
  const getDirectionFromKey = (key: string): Direction | null => {
    switch (key) {
      case 'ArrowUp': return Direction.UP;
      case 'ArrowRight': return Direction.RIGHT;
      case 'ArrowDown': return Direction.DOWN;
      case 'ArrowLeft': return Direction.LEFT;
      default: return null;
    }
  };

  // Fonction pour calculer la nouvelle position en fonction de la direction
  const calculateNewPosition = (direction: Direction): { x: number; y: number } => {
    let newX = position.x;
    let newY = position.y;

    switch (direction) {
      case Direction.UP:
        newY = Math.max(PLAYER_MARGIN, position.y - CELL_SIZE);
        break;
      case Direction.DOWN:
        newY = Math.min(CELL_SIZE * 18 - PLAYER_SIZE - PLAYER_MARGIN, position.y + CELL_SIZE);
        break;
      case Direction.LEFT:
        newX = Math.max(PLAYER_MARGIN, position.x - CELL_SIZE);
        break;
      case Direction.RIGHT:
        newX = Math.min(CELL_SIZE * 18 - PLAYER_SIZE - PLAYER_MARGIN, position.x + CELL_SIZE);
        break;
    }

    return { x: newX, y: newY };
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Empêcher le défilement de la page
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
      }

      const direction = getDirectionFromKey(event.key);
      if (!direction) return;

      setShowInfo(false);
      setSelectedCell(null);

      // Si le joueur n'est pas déjà dans la bonne direction
      if (rotation !== direction) {
        // Tourner le joueur
        setRotation(direction);
        // Calculer et stocker la position potentielle
        const newPos = calculateNewPosition(direction);
        if (isValidPosition(newPos.x, newPos.y)) {
          setPendingMovement(newPos);
        }
      } else {
        // Si le joueur est déjà dans la bonne direction, vérifier s'il y a un mouvement en attente
        if (pendingMovement) {
          onPositionChange(pendingMovement);
          setPendingMovement(null);
        } else {
          // Sinon, calculer et effectuer le mouvement directement
          const newPos = calculateNewPosition(direction);
          if (isValidPosition(newPos.x, newPos.y)) {
            onPositionChange(newPos);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [position, onPositionChange, cells, rotation, pendingMovement]);

  return (
    <div
      ref={playerRef}
      className="player"
      style={{
        transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`
      }}
    >
      <div className="player-front" />
    </div>
  );
};

export default Player;  