import { useState, useEffect } from 'react';
import axios from '../config/axios';
import Cookies from 'js-cookie';

interface Player {
  _id: string;
  inventorySpace: number;
  health: number;
  movementPerTurn: number;
  resources: {
    stone: number;
    iron: number;
    copper: number;
    zinc: number;
    tin: number;
    gold: number;
    silver: number;
  };
  mapsBound: {
    [mapId: string]: {
      baseMapId: string;
      playerId: string;
      modifiedLayout: {
        cells: Array<{
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
        }>;
      };
      modifications: Array<{
        x: number;
        y: number;
        originalType: string;
        newType: string;
        modifiedAt: Date;
      }>;
      connections: {
        north?: { mapId: string; baseMapId: string };
        south?: { mapId: string; baseMapId: string };
        east?: { mapId: string; baseMapId: string };
        west?: { mapId: string; baseMapId: string };
      };
      createdAt: Date;
      lastModifiedAt: Date;
    };
  };
}

export const usePlayer = () => {
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const createPlayer = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/players');
      setPlayer(response.data);
      return response.data;
    } catch (err) {
      setError('Failed to create player');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getPlayer = async (id: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/players/${id}`);
      setPlayer(response.data);
      return response.data;
    } catch (err) {
      setError('Failed to get player');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const playerId = Cookies.get('playerId');
    if (playerId) {
      getPlayer(playerId).catch(() => {
        // Si le joueur n'existe plus, on supprime le cookie
        Cookies.remove('playerId');
      });
    } else {
      setLoading(false);
    }
  }, []);

  return {
    player,
    loading,
    error,
    createPlayer,
    getPlayer
  };
}; 