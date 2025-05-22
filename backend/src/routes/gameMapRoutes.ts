import express from 'express';
import { gameMapService } from '../services/gameMapService';

const router = express.Router();

// Get a random map with a specific exit
router.get('/random/:exitDirection', async (req, res) => {
  try {
    const { exitDirection } = req.params;
    if (!['north', 'south', 'east', 'west'].includes(exitDirection)) {
      return res.status(400).json({ error: 'Invalid exit direction' });
    }

    const map = await gameMapService.getRandomMapWithExit(exitDirection as 'north' | 'south' | 'east' | 'west');
    res.json(map);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Create a new player's map instance
router.post('/player/:baseMapId/:playerId', async (req, res) => {
  try {
    const { baseMapId, playerId } = req.params;
    const map = await gameMapService.createPlayerMap(baseMapId, playerId);
    res.json(map);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get a player's map by exit direction
router.get('/player/exit/:currentMapId/:playerId/:exitDirection', async (req, res) => {
  try {
    const { currentMapId, playerId, exitDirection } = req.params;
    if (!['north', 'south', 'east', 'west'].includes(exitDirection)) {
      return res.status(400).json({ error: 'Invalid exit direction' });
    }

    const map = await gameMapService.getPlayerMapByExit(
      playerId,
      currentMapId,
      exitDirection as 'north' | 'south' | 'east' | 'west'
    );
    res.json(map);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Apply modifications to a specific map instance
router.post('/player/modify/:baseMapId/:playerId/:mapInstanceId', async (req, res) => {
  try {
    const { baseMapId, playerId, mapInstanceId } = req.params;
    const { modifications } = req.body;
    
    const modifiedMap = await gameMapService.applyModifications(
      baseMapId,
      playerId,
      mapInstanceId,
      modifications
    );
    
    res.json(modifiedMap);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get all player's maps
router.get('/player/:playerId', async (req, res) => {
  try {
    const maps = await gameMapService.getPlayerMaps(req.params.playerId);
    res.json(maps);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get all instances of a specific base map for a player
router.get('/player/:playerId/base/:baseMapId', async (req, res) => {
  try {
    const { playerId, baseMapId } = req.params;
    const maps = await gameMapService.getPlayerMapInstances(playerId, baseMapId);
    res.json(maps);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router; 