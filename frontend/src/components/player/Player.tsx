import "./player.css";
import React, { useEffect, useState, useCallback } from 'react';

type Position = { row: number; col: number };
type Controls = { up: boolean; down: boolean; left: boolean; right: boolean };

const Player: React.FC<{
  initialPosition: Position;
  onPositionChange: (position: Position) => void;
}> = ({ initialPosition, onPositionChange }) => {
  const [position, setPosition] = useState(initialPosition);
  const [controls, setControls] = useState<Controls>({
    up: false,
    down: false,
    left: false,
    right: false
  });

  // Gestion des événements clavier
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Empêcher le défilement de la fenêtre pour les touches directionnelles
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
      }

      console.log('Key pressed:', event.key);
      switch (event.key) {
        case 'ArrowUp':
          setControls(prev => ({ ...prev, up: true }));
          break;
        case 'ArrowDown':
          setControls(prev => ({ ...prev, down: true }));
          break;
        case 'ArrowLeft':
          setControls(prev => ({ ...prev, left: true }));
          break;
        case 'ArrowRight':
          setControls(prev => ({ ...prev, right: true }));
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      // Empêcher le défilement de la fenêtre pour les touches directionnelles
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
      }

      console.log('Key released:', event.key);
      switch (event.key) {
        case 'ArrowUp':
          setControls(prev => ({ ...prev, up: false }));
          break;
        case 'ArrowDown':
          setControls(prev => ({ ...prev, down: false }));
          break;
        case 'ArrowLeft':
          setControls(prev => ({ ...prev, left: false }));
          break;
        case 'ArrowRight':
          setControls(prev => ({ ...prev, right: false }));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Gestion du mouvement
  const handleMovement = useCallback(() => {
    console.log('Current position:', position);
    console.log('Current controls:', controls);
    
    let newRow = position.row;
    let newCol = position.col;

    if (controls.up === true) {
      console.log('Moving up');
      newRow--;
    }
    if (controls.down === true) {
      console.log('Moving down');
      newRow++;
    }
    if (controls.left === true) {
      console.log('Moving left');
      newCol--;
    }
    if (controls.right === true) {
      console.log('Moving right');
      newCol++;
    }

    // Vérification des limites
    if (newRow >= 0 && newRow < 15 && newCol >= 0 && newCol < 20) {
      if (newRow !== position.row || newCol !== position.col) {
        console.log('Updating position from:', position, 'to:', { row: newRow, col: newCol });
        const newPosition = { row: newRow, col: newCol };
        setPosition(newPosition);
        onPositionChange(newPosition);
      }
    }
  }, [position, controls, onPositionChange]);

  // Intervalle de mouvement
  useEffect(() => {
    const moveInterval = setInterval(handleMovement, 50);
    return () => clearInterval(moveInterval);
  }, [handleMovement]);

  return (
    <div 
      className="player"
      style={{
        gridRow: position.row + 1,
        gridColumn: position.col + 1
      }}
    />
  );
};

export default Player;  