import { BaseMap, ModifiedMap, BaseMapData, ModifiedMapData } from '../models/Map';
import mongoose from 'mongoose';

class GameMapService {
  // Get a random base map with a specific exit
  async getRandomMapWithExit(exitDirection: 'north' | 'south' | 'east' | 'west'): Promise<BaseMapData> {
    const maps = await BaseMap.find({
      [`exits.${exitDirection}`]: true
    });

    if (!maps || maps.length === 0) {
      throw new Error(`No maps found with ${exitDirection} exit`);
    }

    // Randomly select one map
    const randomIndex = Math.floor(Math.random() * maps.length);
    return maps[randomIndex].toObject() as BaseMapData;
  }

  // Create a new player's modified map from a base map
  async createPlayerMap(baseMapId: string, playerId: string): Promise<ModifiedMapData> {
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
    const modifiedMap = new ModifiedMap({
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

    return modifiedMap.toObject() as ModifiedMapData;
  }

  // Get a player's map by exit direction
  async getPlayerMapByExit(
    playerId: string,
    currentMapId: string,
    exitDirection: 'north' | 'south' | 'east' | 'west'
  ): Promise<ModifiedMapData> {
    // Get the current map
    const currentMap = await BaseMap.findById(currentMapId);
    if (!currentMap) {
      throw new Error('Current map not found');
    }

    const currentMapData = currentMap.toObject() as BaseMapData;
    const hasExit = currentMapData.exits[exitDirection];
    
    if (!hasExit) {
      throw new Error(`No ${exitDirection} exit found in current map`);
    }

    // Get a random map with the opposite exit
    const oppositeDirection = {
      north: 'south',
      south: 'north',
      east: 'west',
      west: 'east'
    }[exitDirection] as 'north' | 'south' | 'east' | 'west';

    const nextMap = await this.getRandomMapWithExit(oppositeDirection);
    return await this.createPlayerMap(nextMap._id.toString(), playerId);
  }

  // Apply modifications to a player's map
  async applyModifications(
    baseMapId: string,
    playerId: string,
    mapInstanceId: string,
    modifications: { x: number; y: number; newType: 'wall' | 'floor' | 'exit' | 'unbreakable' }[]
  ): Promise<ModifiedMapData> {
    // Get the specific map instance
    const modifiedMap = await ModifiedMap.findOne({ _id: mapInstanceId, baseMapId, playerId });
    if (!modifiedMap) {
      throw new Error('Player map instance not found');
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

  // Get all player's modified maps
  async getPlayerMaps(playerId: string): Promise<ModifiedMapData[]> {
    const maps = await ModifiedMap.find({ playerId });
    return maps.map(map => map.toObject() as ModifiedMapData);
  }

  // Get all instances of a specific base map for a player
  async getPlayerMapInstances(playerId: string, baseMapId: string): Promise<ModifiedMapData[]> {
    const maps = await ModifiedMap.find({ playerId, baseMapId });
    return maps.map(map => map.toObject() as ModifiedMapData);
  }
}

export const gameMapService = new GameMapService(); 