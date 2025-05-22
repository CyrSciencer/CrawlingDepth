import React, { useState, useEffect } from 'react';
import './MapCreator.css';
import { Cell } from '../../types/cell';
import axios from '../../config/axios';

type ResourceType = 'stone' | 'iron' | 'copper' | 'zinc' | 'tin' | 'gold' | 'silver';

// Types de maps avec leurs configurations
type MapType = '4_EXITS' | '3_EXITS' | '2_EXITS' | '1_EXIT';

interface MapConfig {
  type: MapType;
  exits: ('N' | 'E' | 'S' | 'W')[];
  description: string;
}

// Configuration des maps avec leurs informations clés
const MAP_CONFIGS: Record<string, MapConfig> = {
  '4_EXITS': {
    type: '4_EXITS',
    exits: ['N', 'E', 'S', 'W'],
    description: 'Map with exits on all sides'
  },
  'NES': {
    type: '3_EXITS',
    exits: ['N', 'E', 'S'],
    description: 'Map with North, East and South exits'
  },
  'NSW': {
    type: '3_EXITS',
    exits: ['N', 'S', 'W'],
    description: 'Map with North, South and West exits'
  },
  'ESW': {
    type: '3_EXITS',
    exits: ['E', 'S', 'W'],
    description: 'Map with East, South and West exits'
  },
  'NWE': {
    type: '3_EXITS',
    exits: ['N', 'W', 'E'],
    description: 'Map with North, West and East exits'
  },
  'EW': {
    type: '2_EXITS',
    exits: ['E', 'W'],
    description: 'Map with East-West exits'
  },
  'NS': {
    type: '2_EXITS',
    exits: ['N', 'S'],
    description: 'Map with North-South exits'
  },
  'N': {
    type: '1_EXIT',
    exits: ['N'],
    description: 'Map with North exit only'
  },
  'E': {
    type: '1_EXIT',
    exits: ['E'],
    description: 'Map with East exit only'
  },
  'S': {
    type: '1_EXIT',
    exits: ['S'],
    description: 'Map with South exit only'
  },
  'W': {
    type: '1_EXIT',
    exits: ['W'],
    description: 'Map with West exit only'
  }
};

interface MapData {
  id?: string;           // ID unique de la map (généré par la DB)
  name: string;          // Nom de la map
  width: number;         // Largeur de la map
  height: number;        // Hauteur de la map
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
  createdAt?: Date;      // Date de création
  updatedAt?: Date;      // Date de dernière modification
}

interface MapCreatorProps {
  cells: Cell[];
  onCellUpdate: (updatedCells: Cell[]) => void;
  onSaveMap: (mapData: MapData) => void;
}

const MapCreator: React.FC<MapCreatorProps> = ({ cells, onCellUpdate, onSaveMap }) => {
  const [isCreatorMode, setIsCreatorMode] = useState(true);
  const [selectedTool, setSelectedTool] = useState<'wall' | 'normal'>('normal');
  const [mapName, setMapName] = useState('');
  const [secondaryResourceType, setSecondaryResourceType] = useState<ResourceType | 'none'>('none');
  const [localCells, setLocalCells] = useState<Cell[]>(cells);
  const [selectedConfig, setSelectedConfig] = useState<keyof typeof MAP_CONFIGS>('4_EXITS');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setLocalCells(cells);
  }, [cells]);

  const isBorderCell = (cell: Cell): boolean => {
    return cell.row === 0 || cell.row === 17 || cell.col === 0 || cell.col === 17;
  };

  const isExitCell = (cell: Cell): boolean => {
    const isCentralCell = (cell.row === 0 || cell.row === 17) ? (cell.col >= 7 && cell.col <= 9) :
                         (cell.col === 0 || cell.col === 17) ? (cell.row >= 7 && cell.row <= 9) : false;

    if (!isCentralCell) return false;

    const config = MAP_CONFIGS[selectedConfig];
    return config.exits.some(exit => {
      switch (exit) {
        case 'N': return cell.row === 0 && cell.col >= 7 && cell.col <= 9;
        case 'E': return cell.row >= 7 && cell.row <= 9 && cell.col === 17;
        case 'S': return cell.row === 17 && cell.col >= 7 && cell.col <= 9;
        case 'W': return cell.row >= 7 && cell.row <= 9 && cell.col === 0;
        default: return false;
      }
    });
  };

  const handleCellClick = (cell: Cell) => {
    if (!isCreatorMode || isBorderCell(cell) || isExitCell(cell)) return;

    const updatedCells = localCells.map(c => {
      if (c.id === cell.id) {
        switch (selectedTool) {
          case 'wall':
            if (c.isWall) return c;
            
            const resources: Cell['resources'] = {
              stone: secondaryResourceType === 'none' ? 2 : 1,
              iron: 0,
              copper: 0,
              zinc: 0,
              tin: 0,
              gold: 0,
              silver: 0
            };

            if (secondaryResourceType !== 'none') {
              resources[secondaryResourceType] = 1;
            }

            return { 
              ...c, 
              isWall: true, 
              isExit: false, 
              isBreakable: true,
              resources
            };

          case 'normal':
            if (!c.isWall) return c;
            
            return { 
              ...c, 
              isWall: false, 
              isExit: false, 
              isBreakable: true,
              resources: undefined
            };
        }
      }
      return c;
    });

    setLocalCells(updatedCells);
    onCellUpdate(updatedCells);
  };

  const checkDuplicateMapName = async (name: string): Promise<boolean> => {
    try {
      const response = await axios.get(`/api/maps/base`);
      const maps = response.data;
      return maps.some((map: any) => map.name === name);
    } catch (error) {
      console.error('Error checking duplicate map name:', error);
      return false;
    }
  };

  const handleSaveMap = async () => {
    if (!mapName) {
      setErrorMessage('Please enter a map name');
      setSaveStatus('error');
      return;
    }

    try {
      setSaveStatus('saving');
      setErrorMessage('');

      // Check for duplicate map name
      const isDuplicate = await checkDuplicateMapName(mapName);
      if (isDuplicate) {
        setErrorMessage('A map with this name already exists');
        setSaveStatus('error');
        return;
      }

      // Transform cells to match backend format
      const transformedCells = localCells.map(cell => ({
        id: cell.id,
        row: cell.row,
        col: cell.col,
        x: cell.col,
        y: cell.row,
        type: cell.isWall && cell.isExit ? 'unbreakable' as const :
              cell.isExit ? 'exit' as const :
              cell.isWall ? 'wall' as const : 'floor' as const,
        isExit: cell.isExit,
        isBreakable: cell.isBreakable,
        resources: cell.isWall ? (cell.resources || {
          stone: 0,
          iron: 0,
          copper: 0,
          zinc: 0,
          tin: 0,
          gold: 0,
          silver: 0
        }) : {
          stone: 0,
          iron: 0,
          copper: 0,
          zinc: 0,
          tin: 0,
          gold: 0,
          silver: 0
        },
        modifiedAt: new Date()
      }));

      // Get the selected configuration
      const config = MAP_CONFIGS[selectedConfig];
      
      // Set up exits based on the configuration
      const exits = {
        north: config.exits.includes('N'),
        south: config.exits.includes('S'),
        east: config.exits.includes('E'),
        west: config.exits.includes('W')
      };

      const mapData: MapData = {
        name: mapName,
        width: 18,
        height: 18,
        baseLayout: {
          cells: transformedCells.map(cell => ({
            x: cell.x,
            y: cell.y,
            type: cell.type,
            resources: cell.resources,
            modifiedAt: new Date()
          }))
        },
        exits
      };

      // Call the parent's onSaveMap with the prepared data
      onSaveMap(mapData);
      
      setSaveStatus('success');
      
      // Reset form after successful save
      setTimeout(() => {
        setMapName('');
        setSaveStatus('idle');
      }, 2000);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.error || 'Error saving map');
      setSaveStatus('error');
    }
  };

  return (
    <div>
      <div className="creator-tools">
        <div className="exit-config">
          <label>Map Configuration:</label>
          <select
            value={selectedConfig}
            onChange={(e) => setSelectedConfig(e.target.value as keyof typeof MAP_CONFIGS)}
          >
            <optgroup label="4 Exits">
              <option value="4_EXITS">4 Exits (N,E,S,W)</option>
            </optgroup>
            <optgroup label="3 Exits">
              <option value="NES">North, East, South</option>
              <option value="NSW">North, South, West</option>
              <option value="ESW">East, South, West</option>
              <option value="NWE">North, West, East</option>
            </optgroup>
            <optgroup label="2 Exits">
              <option value="EW">East-West</option>
              <option value="NS">North-South</option>
            </optgroup>
            <optgroup label="1 Exit">
              <option value="N">North</option>
              <option value="E">East</option>
              <option value="S">South</option>
              <option value="W">West</option>
            </optgroup>
          </select>
          <div className="config-description">
            {MAP_CONFIGS[selectedConfig].description}
          </div>
        </div>

        <div className="tool-buttons">
          <button
            className={`tool-button ${selectedTool === 'normal' ? 'active' : ''}`}
            onClick={() => setSelectedTool('normal')}
          >
            Normal
          </button>
          <button
            className={`tool-button ${selectedTool === 'wall' ? 'active' : ''}`}
            onClick={() => setSelectedTool('wall')}
          >
            Wall
          </button>
        </div>

        {selectedTool === 'wall' && (
          <div className="wall-resources">
            <div>
              <label>Stone: {secondaryResourceType === 'none' ? '2' : '1'}</label>
            </div>
            <div>
              <label>Secondary Resource:</label>
              <select
                value={secondaryResourceType}
                onChange={(e) => setSecondaryResourceType(e.target.value as ResourceType | 'none')}
              >
                <option value="none">None (2 stones)</option>
                <option value="iron">Iron (1 stone + 1 iron)</option>
                <option value="copper">Copper (1 stone + 1 copper)</option>
                <option value="zinc">Zinc (1 stone + 1 zinc)</option>
                <option value="tin">Tin (1 stone + 1 tin)</option>
                <option value="gold">Gold (1 stone + 1 gold)</option>
                <option value="silver">Silver (1 stone + 1 silver)</option>
              </select>
            </div>
          </div>
        )}

        <div className="map-save">
          <input
            type="text"
            placeholder="Enter map name"
            value={mapName}
            onChange={(e) => setMapName(e.target.value)}
          />
          <button 
            onClick={handleSaveMap}
            disabled={saveStatus === 'saving'}
          >
            {saveStatus === 'saving' ? 'Saving...' : 'Save Map'}
          </button>
          {saveStatus === 'success' && (
            <div className="success-message">Map saved successfully!</div>
          )}
          {saveStatus === 'error' && (
            <div className="error-message">{errorMessage}</div>
          )}
        </div>
      </div>

      <div className="grid-container">
        {localCells.map(cell => (
          <div
            key={cell.id}
            className={`cell ${cell.isWall ? 'wall' : ''} ${isExitCell(cell) ? 'exit' : ''} ${cell.isBreakable === false ? 'unbreakable' : ''} ${isBorderCell(cell) ? 'border' : ''}`}
            onClick={() => handleCellClick(cell)}
          />
        ))}
      </div>
    </div>
  );
};

export default MapCreator; 