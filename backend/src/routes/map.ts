import express from 'express';
import { BaseMap, ModifiedMap } from '../models/Map';
import mongoose, { ObjectId } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { mapService } from '../services/mapService';
import Player, { IPlayer } from '../models/Player';

type CellType = 'wall' | 'floor' | 'exit' | 'unbreakable';

interface MapModification {
    x: number;
    y: number;
    originalType: CellType;
    newType: CellType;
    modifiedAt: Date;
}

interface MapConnection {
    mapId: string;
    baseMapId: mongoose.Types.ObjectId;
}

interface Cell {
    x: number;
    y: number;
    type: CellType;
    resources: {
        stone: number;
        iron: number;
        copper: number;
        zinc: number;
        tin: number;
        gold: number;
        silver: number;
    };
}

type PlayerMapInstance = IPlayer['mapsBound'][string];

interface PlayerMaps {
    [mapId: string]: PlayerMapInstance;
}

const router = express.Router();

// Base Map Routes
router.post('/base', async (req, res) => {
    try {
        console.log('Received map creation request:', JSON.stringify(req.body, null, 2));

        const {
            name,
            width,
            height,
            baseLayout,
            exits
        } = req.body;

        // Log received data
        console.log('Parsed data:', {
            name,
            width,
            height,
            hasBaseLayout: !!baseLayout,
            hasExits: !!exits
        });

        // Validate required fields
        if (!name || !width || !height || !baseLayout || !exits) {
            console.log('Missing required fields:', {
                name: !!name,
                width: !!width,
                height: !!height,
                hasBaseLayout: !!baseLayout,
                hasExits: !!exits
            });
            return res.status(400).json({ 
                message: 'Missing required fields',
                received: { name, width, height, hasBaseLayout: !!baseLayout, hasExits: !!exits }
            });
        }

        // Validate baseLayout structure
        if (!baseLayout.cells || !Array.isArray(baseLayout.cells)) {
            console.log('Invalid baseLayout structure:', baseLayout);
            return res.status(400).json({ 
                message: 'Invalid baseLayout structure',
                received: baseLayout
            });
        }

        // Validate cells
        for (const cell of baseLayout.cells) {
            if (!cell.x || !cell.y || !cell.type) {
                console.log('Invalid cell structure:', cell);
                return res.status(400).json({ 
                    message: 'Invalid cell structure',
                    cell
                });
            }
        }

        // Create new base map with default values for optional fields
        const baseMap = new BaseMap({
            name,
            type: 'room', // Default type for created maps
            width,
            height,
            baseLayout: {
                cells: baseLayout.cells.map((cell: any) => {
                    const isWall = cell.type === 'wall';
                    const isExit = cell.type === 'exit';
                    const isBreakable = isWall && !isExit;
                    
                    return {
                        id: `${cell.x}-${cell.y}`,
                        x: cell.x,
                        y: cell.y,
                        type: cell.type,
                        isExit,
                        isBreakable,
                        isSelectable: cell.type === 'floor' || isBreakable,
                        resources: cell.resources || (isWall ? {
                            stone: 1,
                            iron: 0,
                            copper: 0,
                            zinc: 0,
                            tin: 0,
                            gold: 0,
                            silver: 0
                        } : {
                            stone: 0,
                            iron: 0,
                            copper: 0,
                            zinc: 0,
                            tin: 0,
                            gold: 0,
                            silver: 0
                        })
                    };
                })
            },
            exits: {
                north: exits.north || false,
                south: exits.south || false,
                east: exits.east || false,
                west: exits.west || false
            },
            difficulty: 1,
            tags: ['created']
        });

        console.log('Attempting to save base map:', baseMap);
        await baseMap.save();
        console.log('Base map saved successfully');
        res.status(201).json(baseMap);
    } catch (error) {
        console.error('Error creating base map:', error);
        if (error instanceof mongoose.Error.ValidationError) {
            console.error('Validation error details:', error.errors);
            return res.status(400).json({ 
                message: 'Validation error', 
                errors: error.errors 
            });
        }
        res.status(500).json({ 
            message: 'Server error', 
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Get base map by ID
router.get('/base/:id', async (req, res) => {
    try {
        const map = await BaseMap.findById(req.params.id);
        if (!map) {
            return res.status(404).json({ message: 'Map not found' });
        }
        res.json(map);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Get all base maps
router.get('/base', async (req, res) => {
    try {
        const baseMaps = await BaseMap.find();
        res.json(baseMaps);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Get or create player's current map
router.get('/current/:playerId', async (req, res) => {
    try {
        const { playerId } = req.params;
        
        // Trouver le joueur
        const player = await Player.findById(playerId);
        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }

        // Si le joueur n'a pas de maps, créer la première map
        if (!player.mapsBound || Object.keys(player.mapsBound).length === 0) {
            // Trouver la map "First"
            const firstMap = await BaseMap.findOne({ name: 'First' });
            if (!firstMap || !firstMap.baseLayout) {
                return res.status(404).json({ message: 'First map template not found or invalid' });
            }

            // Créer une nouvelle instance de map pour le joueur
            const mapId = new mongoose.Types.ObjectId().toString();
            const newMap: PlayerMapInstance = {
                baseMapId: firstMap._id,
                playerId: player._id,
                modifiedLayout: {
                    cells: firstMap.baseLayout.cells.map(cell => ({
                        x: cell.x,
                        y: cell.y,
                        type: cell.type as CellType,
                        resources: cell.resources || {
                            stone: 0,
                            iron: 0,
                            copper: 0,
                            zinc: 0,
                            tin: 0,
                            gold: 0,
                            silver: 0
                        }
                    }))
                },
                modifications: [],
                connections: {},
                createdAt: new Date(),
                lastModifiedAt: new Date()
            };

            player.mapsBound = {
                [mapId]: newMap
            };

            await player.save();
            return res.json(player.mapsBound[mapId]);
        }

        // Retourner la dernière map modifiée
        const lastModifiedMap = Object.entries(player.mapsBound)
            .sort(([, a], [, b]) => b.lastModifiedAt.getTime() - a.lastModifiedAt.getTime())[0][1];

        res.json(lastModifiedMap);
    } catch (error) {
        console.error('Error getting current map:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

// Get or create a player's modified map
router.get('/modified/:baseMapId/:playerId', async (req, res) => {
    try {
        const { baseMapId, playerId } = req.params;
        const map = await ModifiedMap.findOne({ baseMapId, playerId });
        
        if (!map) {
            const baseMap = await BaseMap.findById(baseMapId);
            if (!baseMap || !baseMap.baseLayout) {
                return res.status(404).json({ message: 'Base map not found' });
            }
            
            const newMap = new ModifiedMap({
                baseMapId,
                playerId,
                mapInstanceId: uuidv4(),
                position: { x: 0, y: 0, depth: 0 },
                connections: [],
                modifiedLayout: {
                    cells: baseMap.baseLayout.cells.map(cell => ({
                        ...cell.toObject(),
                        id: `${cell.x}-${cell.y}`,
                        resources: cell.type === 'wall' ? { ...cell.resources } : {
                            stone: 0,
                            iron: 0,
                            copper: 0,
                            zinc: 0,
                            tin: 0,
                            gold: 0,
                            silver: 0
                        }
                    }))
                },
                modifications: [],
                state: {
                    isExplored: false,
                    isCleared: false,
                    lastVisited: new Date(),
                    specialEvents: []
                }
            });
            
            await newMap.save();
            return res.json(newMap);
        }
        
        res.json(map);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Apply modifications to a player's map
router.post('/modified/:baseMapId/:playerId', async (req, res) => {
    try {
        const { baseMapId, playerId } = req.params;
        const { modifications } = req.body as { modifications: MapModification[] };
        
        // Convert modifications to the format expected by the service
        const serviceModifications = modifications.map(mod => ({
            x: parseInt(mod.cellId.split('-')[0]),
            y: parseInt(mod.cellId.split('-')[1]),
            newType: mod.changes.type || 'floor'
        }));
        
        const modifiedMap = await mapService.applyModifications(
            baseMapId,
            playerId,
            serviceModifications
        );
        
        res.json(modifiedMap);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Get all modified maps for a player
router.get('/modified/player/:playerId', async (req, res) => {
    try {
        const maps = await ModifiedMap.find({ playerId: req.params.playerId });
        res.json(maps);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Handle map transition through exits
router.post('/transition/:playerId', async (req, res) => {
    try {
        const { playerId } = req.params;
        const { exitDirection } = req.body;
        
        // Get current map
        const currentMap = await ModifiedMap.findOne({ playerId });
        if (!currentMap || !currentMap.position) {
            return res.status(404).json({ message: 'Current map not found' });
        }
        
        // Calculate new position based on exit direction
        const newPosition = calculateNewPosition(currentMap.position, exitDirection);
        
        // Check if there's already a map at the new position
        let targetMap = await ModifiedMap.findOne({
            playerId,
            'position.x': newPosition.x,
            'position.y': newPosition.y,
            'position.depth': newPosition.depth
        });
        
        if (!targetMap) {
            // Find a suitable base map for the new position
            const baseMap = await BaseMap.findOne({
                type: 'room',
                [`exits.${getOppositeDirection(exitDirection)}`]: true
            });
            
            if (!baseMap || !baseMap.baseLayout) {
                return res.status(404).json({ message: 'No suitable map found' });
            }
            
            // Create new modified map
            targetMap = new ModifiedMap({
                baseMapId: baseMap._id,
                playerId,
                mapInstanceId: uuidv4(),
                position: newPosition,
                connections: [],
                modifiedLayout: {
                    cells: baseMap.baseLayout.cells.map(cell => ({
                        ...cell.toObject(),
                        id: `${cell.x}-${cell.y}`,
                        resources: cell.type === 'wall' ? { ...cell.resources } : {
                            stone: 0,
                            iron: 0,
                            copper: 0,
                            zinc: 0,
                            tin: 0,
                            gold: 0,
                            silver: 0
                        }
                    }))
                },
                modifications: [],
                state: {
                    isExplored: false,
                    isCleared: false,
                    lastVisited: new Date(),
                    specialEvents: []
                }
            });
            
            await targetMap.save();
            
            // Update connections in current map
            currentMap.connections.push({
                direction: exitDirection,
                targetMapId: targetMap._id
            });
            await currentMap.save();
        }
        
        // Calculate player position in new map
        const playerPosition = calculatePlayerPosition(exitDirection);
        
        res.json({
            map: targetMap,
            newPosition: playerPosition
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Helper function to calculate new position based on exit direction
function calculateNewPosition(currentPosition: { x: number; y: number; depth: number }, exitDirection: string) {
    const newPosition = { ...currentPosition };
    
    switch (exitDirection) {
        case 'north':
            newPosition.y -= 1;
            break;
        case 'south':
            newPosition.y += 1;
            break;
        case 'east':
            newPosition.x += 1;
            break;
        case 'west':
            newPosition.x -= 1;
            break;
    }
    
    return newPosition;
}

// Helper function to get opposite direction
function getOppositeDirection(direction: string): string {
    switch (direction) {
        case 'north': return 'south';
        case 'south': return 'north';
        case 'east': return 'west';
        case 'west': return 'east';
        default: return direction;
    }
}

// Helper function to calculate player position based on exit direction
function calculatePlayerPosition(exitDirection: string) {
    const width = 18;
    const height = 18;
    
    switch (exitDirection) {
        case 'north':
            return { x: width / 2, y: height - 2 };
        case 'south':
            return { x: width / 2, y: 1 };
        case 'east':
            return { x: 1, y: height / 2 };
        case 'west':
            return { x: width - 2, y: height / 2 };
        default:
            return { x: width / 2, y: height / 2 };
    }
}

// Create new map instance from base map
router.post('/instance/:playerId/:baseMapId', async (req, res) => {
    try {
        const { playerId, baseMapId } = req.params;
        const { entryDirection } = req.body as { entryDirection: 'north' | 'south' | 'east' | 'west' };

        // Trouver le joueur et la base map
        const [player, baseMap] = await Promise.all([
            Player.findById(playerId),
            BaseMap.findById(baseMapId)
        ]);

        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }
        if (!baseMap || !baseMap.baseLayout) {
            return res.status(404).json({ message: 'Base map not found or invalid' });
        }

        // Créer une nouvelle instance de map
        const mapId = new mongoose.Types.ObjectId().toString();
        const newMapInstance: PlayerMapInstance = {
            baseMapId: baseMap._id,
            playerId: player._id,
            modifiedLayout: {
                cells: baseMap.baseLayout.cells.map(cell => ({
                    x: cell.x,
                    y: cell.y,
                    type: cell.type as CellType,
                    resources: cell.resources || {
                        stone: 0,
                        iron: 0,
                        copper: 0,
                        zinc: 0,
                        tin: 0,
                        gold: 0,
                        silver: 0
                    }
                }))
            },
            modifications: [],
            connections: {},
            createdAt: new Date(),
            lastModifiedAt: new Date()
        };

        // Ajouter la nouvelle map aux maps du joueur
        player.mapsBound = {
            ...player.mapsBound,
            [mapId]: newMapInstance
        };

        // Mettre à jour les connexions
        if (entryDirection) {
            // Trouver la map précédente
            const previousMapId = Object.keys(player.mapsBound).find(id => 
                player.mapsBound[id].connections[entryDirection]?.baseMapId.equals(baseMapId)
            );

            if (previousMapId) {
                // Mettre à jour les connexions dans les deux sens
                const oppositeDirection = {
                    north: 'south',
                    south: 'north',
                    east: 'west',
                    west: 'east'
                }[entryDirection] as 'north' | 'south' | 'east' | 'west';

                player.mapsBound[previousMapId].connections[entryDirection] = {
                    mapId,
                    baseMapId: baseMap._id
                };
                player.mapsBound[mapId].connections[oppositeDirection] = {
                    mapId: previousMapId,
                    baseMapId: player.mapsBound[previousMapId].baseMapId
                };
            }
        }

        await player.save();
        res.status(201).json(player.mapsBound[mapId]);
    } catch (error) {
        console.error('Error creating map instance:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

export default router; 