import express from 'express';
import Player, { IPlayer } from '../models/Player';
import { BaseMap } from '../models/Map';
import mongoose from 'mongoose';

const router = express.Router();

// Get player by ID
router.get('/:id', async (req, res) => {
    try {
        const player = await Player.findById(req.params.id);
        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }
        res.json(player);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Create new player
router.post('/', async (req, res) => {
    try {
        // Créer le joueur
        const player = new Player();
        await player.save();

        // Trouver la map "First"
        const firstMap = await BaseMap.findOne({ name: 'First' });
        if (!firstMap || !firstMap.baseLayout) {
            return res.status(500).json({ message: 'First map template not found or invalid' });
        }

        // Créer la première instance de map pour le joueur
        const mapId = new mongoose.Types.ObjectId().toString();
        const playerId = player._id as mongoose.Types.ObjectId;
        
        player.mapsBound = {
            [mapId]: {
                baseMapId: firstMap._id as mongoose.Types.ObjectId,
                playerId: playerId,
                modifiedLayout: {
                    cells: firstMap.baseLayout.cells.map(cell => ({
                        x: cell.x,
                        y: cell.y,
                        type: cell.type,
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
            }
        };

        await player.save();

        // Définir le cookie avec l'ID du joueur
        res.cookie('playerId', playerId.toString(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 jours
        });

        res.status(201).json(player);
    } catch (error) {
        console.error('Error creating player:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

// Update player
router.put('/:id', async (req, res) => {
    try {
        const player = await Player.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }
        res.json(player);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Delete player
router.delete('/:id', async (req, res) => {
    try {
        const player = await Player.findByIdAndDelete(req.params.id);
        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }
        // Supprimer le cookie
        res.clearCookie('playerId');
        res.json({ message: 'Player deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

export default router; 