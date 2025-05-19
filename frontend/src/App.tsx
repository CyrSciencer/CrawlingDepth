import React, { useState } from 'react';
import './App.css';
import Player from './components/player/Player';

interface Cell {
  id: string;
  row: number;
  col: number;
}

interface PlayerPosition {
  row: number;
  col: number;
}

// Main application component - Renders the welcome page
function App() {
  const [cells, setCells] = useState<Cell[]>(() => {
    const newCells: Cell[] = [];
    for (let row = 0; row < 15; row++) {
      for (let col = 0; col < 20; col++) {
        newCells.push({
          id: `${row}-${col}`,
          row,
          col
        });
      }
    }
    return newCells;
  });

  const [playerPosition, setPlayerPosition] = useState<PlayerPosition>({ row: 7, col: 10 });
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showInfo, setShowInfo] = useState(false);

  const handleCellClick = (cell: Cell) => {
    setSelectedCell(cell);
    setShowInfo(true);
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
                className={`cell ${selectedCell?.id === cell.id ? 'selected' : ''}`}
                onClick={() => handleCellClick(cell)}
                onMouseEnter={() => handleCellMouseEnter(cell)}
                onMouseLeave={handleCellMouseLeave}
              />
            ))}
            <Player
              initialPosition={playerPosition}
              onPositionChange={handlePlayerPositionChange}
            />
          </div>
          {showInfo && selectedCell && (
            <div 
              className="cell-info"
              style={{
                left: `${mousePosition.x + 15}px`,
                top: `${mousePosition.y + 15}px`
              }}
            >
              <h3>Informations Cellule</h3>
              <p>ID: {selectedCell.id}</p>
              <p>Position: ({selectedCell.row}, {selectedCell.col})</p>
              <p>Distance du joueur: {
                Math.abs(selectedCell.row - playerPosition.row) + 
                Math.abs(selectedCell.col - playerPosition.col)
              } cases</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App; 