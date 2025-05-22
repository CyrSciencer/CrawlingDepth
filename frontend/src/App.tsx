import React, { useState } from 'react';
import './App.css';
import Player from './components/player/Player';
import MapCreator from './components/mapCreator/MapCreator';
import MainMenu from './components/mainMenu/MainMenu';
import { cellWall, cellExit, levelBorder, cellUnbreakable, getCellPriority, cellResource } from './utils/cellProperties';
import { Cell } from './types/cell';
import axios from './config/axios';

interface PlayerPosition {
  x: number;
  y: number;
}

type GameMode = 'menu' | 'gameplay' | 'mapCreator';

// Main application component - Renders the welcome page
function App() {
  const [gameMode, setGameMode] = useState<GameMode>('menu');
  const [cells, setCells] = useState<Cell[]>(() => {
    const newCells: Cell[] = [];
    for (let row = 0; row < 18; row++) {
      for (let col = 0; col < 18; col++) {
        const cell = {
          id: `${row}-${col}`,
          row,
          col
        };
        // Appliquer les propriétés de cellule dans l'ordre logique
        let processedCell = levelBorder(cell);
        processedCell = cellExit(processedCell);
        processedCell = cellUnbreakable(processedCell);
        processedCell = cellResource(processedCell);
        newCells.push(processedCell);
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

  const handleModeSelect = (mode: 'gameplay' | 'mapCreator') => {
    setGameMode(mode);
  };

  const handleReturnToMenu = () => {
    setGameMode('menu');
  };

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

  const handleCellUpdate = (updatedCells: Cell[]) => {
    setCells(updatedCells);
  };

  const handleSaveMap = async (mapData: {
    name: string;
    width: number;
    height: number;
    baseLayout: {
      cells: {
        x: number;
        y: number;
        type: 'wall' | 'floor' | 'exit' | 'unbreakable';
        resources: {
          stone: number;
          iron: number;
          copper: number;
          zinc: number;
          tin: number;
          gold: number;
          silver: number;
        };
        modifiedAt: Date;
      }[];
    };
    exits: {
      north: boolean;
      south: boolean;
      east: boolean;
      west: boolean;
    };
  }) => {
    try {
      const response = await axios.post('/api/maps/base', mapData);

      if (response.status !== 201) {
        throw new Error('Failed to save map');
      }

      const savedMap = response.data;
      alert('Map saved successfully!');
    } catch (error: any) {
      console.error('Error saving map:', error);
      alert('Failed to save map. Please try again.');
    }
  };

  if (gameMode === 'menu') {
    return <MainMenu onModeSelect={handleModeSelect} />;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Plateau de Jeu</h1>
        <button className="return-button" onClick={handleReturnToMenu}>
          Retour au Menu
        </button>
      </header>
      <main>
        <div className="game-container">
          {gameMode === 'mapCreator' && (
            <MapCreator
              cells={cells}
              onCellUpdate={handleCellUpdate}
              onSaveMap={handleSaveMap}
            />
          )}
          {gameMode === 'gameplay' && (
            <>
              <div 
                className="game-board"
                onMouseMove={handleMouseMove}
              >
                {cells.map(cell => (
                  <div
                    key={cell.id}
                    className={`cell ${selectedCell?.id === cell.id ? 'selected' : ''} priority-${getCellPriority(cell, selectedCell || undefined)}`}
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
                  cells={cells}
                />
              </div>
              {showInfo && selectedCell && !selectedCell.isWall && (
                <div className="cell-info">
                  <h3>Informations Cellule</h3>
                  <p>Position: ({selectedCell.row}, {selectedCell.col})</p>
                  <p>is an exit: {selectedCell.isExit ? 'true' : 'false'}</p>
                </div>
              )}
              {showInfo && selectedCell && selectedCell.isWall && (
                <div className="cell-info">
                  <h3>Informations Cellule</h3>
                  <p>Position: ({selectedCell.row}, {selectedCell.col})</p>
                  <p>Type: Wall</p>
                  {selectedCell.resources && (
                    <ul>
                      <li>Stone: {selectedCell.resources.stone}</li>
                      <li>Iron: {selectedCell.resources.iron}</li>
                      <li>Copper: {selectedCell.resources.copper}</li>
                      <li>Zinc: {selectedCell.resources.zinc}</li>
                      <li>Tin: {selectedCell.resources.tin}</li>
                      <li>Gold: {selectedCell.resources.gold}</li>
                      <li>Silver: {selectedCell.resources.silver}</li>
                    </ul>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default App; 