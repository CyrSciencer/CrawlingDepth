import { BaseMap, ModifiedMap, BaseMapDocument, ModifiedMapDocument, BaseMapData, ModifiedMapData, Cell } from '../models/Map';
import mongoose from 'mongoose';

class MapService {
  // Create a new base map
  async createBaseMap(mapData: Omit<BaseMapData, '_id' | 'createdAt'>): Promise<BaseMapData> {
    const map = new BaseMap(mapData);
    const savedMap = await map.save();
    return savedMap.toObject() as BaseMapData;
  }

  // Get a base map by ID
  async getBaseMap(mapId: string): Promise<BaseMapData | null> {
    const map = await BaseMap.findById(mapId);
    return map ? map.toObject() as BaseMapData : null;
  }

  // Get a player's modified map, creating it if it doesn't exist
  async getOrCreatePlayerMap(baseMapId: string, playerId: string): Promise<ModifiedMapData> {
    // Find existing modified map
    let modifiedMap = await ModifiedMap.findOne({ baseMapId, playerId });
    
    if (!modifiedMap) {
      // Get the base map
      const baseMap = await BaseMap.findById(baseMapId);
      if (!baseMap) {
        throw new Error('Base map not found');
      }

      const baseMapData = baseMap.toObject() as BaseMapData;
      if (!baseMapData.baseLayout?.cells) {
        throw new Error('Base map has no layout');
      }

      // Create new modified map with base layout
      modifiedMap = new ModifiedMap({
        baseMapId,
        playerId,
        modifiedLayout: {
          cells: baseMapData.baseLayout.cells.map(cell => ({
            x: cell.x,
            y: cell.y,
            type: cell.type,
            modifiedAt: null
          }))
        },
        modifications: []
      });
      await modifiedMap.save();
    }

    return modifiedMap.toObject() as ModifiedMapData;
  }

  // Apply modifications to a player's map
  async applyModifications(
    baseMapId: string,
    playerId: string,
    modifications: { x: number; y: number; newType: 'wall' | 'floor' | 'exit' | 'unbreakable' }[]
  ): Promise<ModifiedMapData> {
    // Get or create the player's modified map
    const modifiedMap = await ModifiedMap.findOne({ baseMapId, playerId });
    if (!modifiedMap) {
      throw new Error('Player map not found');
    }

    const modifiedMapData = modifiedMap.toObject() as ModifiedMapData;
    if (!modifiedMapData.modifiedLayout?.cells) {
      throw new Error('Modified map has no layout');
    }

    // Apply each modification
    for (const mod of modifications) {
      const cell = modifiedMapData.modifiedLayout.cells.find(
        c => c.x === mod.x && c.y === mod.y
      );

      if (cell) {
        // Record the modification
        modifiedMap.modifications.push({
          x: mod.x,
          y: mod.y,
          originalType: cell.type,
          newType: mod.newType,
          modifiedAt: new Date()
        });

        // Update the cell
        cell.type = mod.newType;
        cell.modifiedAt = new Date();
      }
    }

    const savedMap = await modifiedMap.save();
    return savedMap.toObject() as ModifiedMapData;
  }

  // Get a player's modified map
  async getPlayerMap(baseMapId: string, playerId: string): Promise<ModifiedMapData | null> {
    const map = await ModifiedMap.findOne({ baseMapId, playerId });
    return map ? map.toObject() as ModifiedMapData : null;
  }

  // Get all modified maps for a player
  async getPlayerModifiedMaps(playerId: string): Promise<ModifiedMapData[]> {
    const maps = await ModifiedMap.find({ playerId });
    return maps.map(map => map.toObject() as ModifiedMapData);
  }

  // Get all base maps
  async getAllBaseMaps(): Promise<BaseMapData[]> {
    const maps = await BaseMap.find();
    return maps.map(map => map.toObject() as BaseMapData);
  }

  // Get map exits
  async getMapExits(mapId: string): Promise<{
    north: boolean;
    south: boolean;
    east: boolean;
    west: boolean;
  }> {
    const map = await BaseMap.findById(mapId);
    if (!map) {
      throw new Error('Map not found');
    }
    const mapData = map.toObject() as BaseMapData;
    return {
      north: mapData.exits.north,
      south: mapData.exits.south,
      east: mapData.exits.east,
      west: mapData.exits.west
    };
  }
}

export const mapService = new MapService(); 