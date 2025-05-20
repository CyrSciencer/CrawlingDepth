import React, { useState } from 'react';
import './App.css';
import Player from './components/player/Player';
import { cellWall, cellExit } from './utils/cellProperties';
import { Cell } from './types/cell';

interface PlayerPosition {
  x: number;
  y: number;
}

// Main application component - Renders the welcome page
function App() {
  const [cells, setCells] = useState<Cell[]>(() => {
    const newCells: Cell[] = [];
    for (let row = 0; row < 18; row++) {
      for (let col = 0; col < 18; col++) {
        const cell = {
          id: `${row}-${col}`,
          row,
          col
        };
        newCells.push(cellExit(cell));
      }
    }
    return newCells;
  });

  const [playerPosition, setPlayerPosition] = useState<PlayerPosition>(() => {
    // Position centrale en tenant compte de la taille du joueur et des marges
    const centerX = (36 * 9) + 1; // 9 cellules - moitié de la taille du joueur
    const centerY = (36 * 9) + 1; // 9 cellules - moitié de la taille du joueur
    return { x: centerX, y: centerY };
  });

  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showInfo, setShowInfo] = useState(false);

  const handleCellClick = (cell: Cell) => {
    if (!cell.isWall) {
      setSelectedCell(cell);
      setShowInfo(true);
    }
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    setMousePosition({ x: event.clientX, y: event.clientY });
  };

  const handleCellMouseEnter = (cell: Cell) => {
    if (selectedCell?.id === cell.id) {
      setShowInfo(true);
    }
  };

  const handleCellMouseLeave = () => {
    setShowInfo(false);
  };

  const handlePlayerPositionChange = (newPosition: PlayerPosition) => {
    console.log('App: Player position changing to:', newPosition);
    setPlayerPosition(newPosition);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Plateau de Jeu</h1>
      </header>
      <main>
        <div className="game-container">
          <div 
            className="game-board"
            onMouseMove={handleMouseMove}
          >
            {cells.map(cell => (
              <div
                key={cell.id}
                className={`cell ${selectedCell?.id === cell.id ? 'selected' : ''} ${cell.isWall ? 'wall' : ''} ${cell.isExit ? 'exit' : ''}`}
                onClick={() => handleCellClick(cell)}
                onMouseEnter={() => handleCellMouseEnter(cell)}
                onMouseLeave={handleCellMouseLeave}
              />
            ))}
            <Player
              position={playerPosition}
              onPositionChange={handlePlayerPositionChange}
              setShowInfo={setShowInfo}
              setSelectedCell={setSelectedCell}
            />
          </div>
          {showInfo && selectedCell && !selectedCell.isWall && (
            <div 
              className="cell-info"
            >
              <h3>Informations Cellule</h3>
             
              <p>Position: ({selectedCell.row}, {selectedCell.col})</p>
              <p>is an exit: {selectedCell.isExit ? 'true' : 'false'}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App; 