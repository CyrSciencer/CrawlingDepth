import express from 'express';
import Player from '../models/Player';

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
        const player = new Player();
        await player.save();
        res.status(201).json(player);
    } catch (error) {
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
        res.json({ message: 'Player deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

export default router; 