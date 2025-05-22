import React from 'react';
import './MainMenu.css';

interface MainMenuProps {
  onModeSelect: (mode: 'gameplay' | 'mapCreator') => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onModeSelect }) => {
  return (
    <div className="main-menu">
      <h1>Crawling Depth</h1>
      <div className="menu-buttons">
        <button 
          className="menu-button gameplay"
          onClick={() => onModeSelect('gameplay')}
        >
          Jouer
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