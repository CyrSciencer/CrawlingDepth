import express from 'express';
import { mapService } from '../services/mapService';

const router = express.Router();

// Create a new base map
router.post('/base', async (req, res) => {
  try {
    const mapData = req.body;
    const map = await mapService.createBaseMap(mapData);
    res.status(201).json(map);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get a base map by ID
router.get('/base/:id', async (req, res) => {
  try {
    const map = await mapService.getBaseMap(req.params.id);
    if (!map) {
      return res.status(404).json({ error: 'Map not found' });
    }
    res.json(map);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get all base maps
router.get('/base', async (req, res) => {
  try {
    const maps = await mapService.getAllBaseMaps();
    res.json(maps);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get or create a player's modified map
router.get('/modified/:baseMapId/:playerId', async (req, res) => {
  try {
    const { baseMapId, playerId } = req.params;
    const map = await mapService.getOrCreatePlayerMap(baseMapId, playerId);
    res.json(map);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Apply modifications to a player's map
router.post('/modified/:baseMapId/:playerId', async (req, res) => {
  try {
    const { baseMapId, playerId } = req.params;
    const { modifications } = req.body;
    
    const modifiedMap = await mapService.applyModifications(
      baseMapId,
      playerId,
      modifications
    );
    
    res.json(modifiedMap);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get all modified maps for a player
router.get('/modified/player/:playerId', async (req, res) => {
  try {
    const maps = await mapService.getPlayerModifiedMaps(req.params.playerId);
    res.json(maps);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get map exits
router.get('/exits/:mapId', async (req, res) => {
  try {
    const exits = await mapService.getMapExits(req.params.mapId);
    res.json(exits);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router; 