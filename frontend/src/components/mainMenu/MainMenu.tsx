import React from 'react';
import { usePlayer } from '../../hooks/usePlayer';
import './MainMenu.css';

interface MainMenuProps {
  onStartGame: () => void;
  onModeSelect: (mode: 'gameplay' | 'mapCreator') => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStartGame, onModeSelect }) => {
  const { player, loading, error, createPlayer } = usePlayer();

  const handlePlay = async () => {
    try {
      if (!player) {
        // Créer un nouveau joueur si aucun n'existe
        await createPlayer();
      }
      onStartGame();
    } catch (err) {
      console.error('Error starting game:', err);
    }
  };

  if (loading) {
    return <div className="main-menu">Loading...</div>;
  }

  if (error) {
    return <div className="main-menu">Error: {error}</div>;
  }

  return (
    <div className="main-menu">
      <h1>Crawling Depth</h1>
      <div className="menu-buttons">
        <button 
          className="menu-button gameplay"
          onClick={handlePlay}
        >
          {player ? 'Continue Game' : 'New Game'}
        </button>
        <button 
          className="menu-button creator"
          onClick={() => onModeSelect('mapCreator')}
        >
          Créer une Map
        </button>
      </div>
    </div>
  );
};

export default MainMenu; 