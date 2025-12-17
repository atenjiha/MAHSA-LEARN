import { Router } from 'express';
import type { Request, Response } from 'express';
import { Badge } from '../models/Badge';

const router = Router();

// Get all badges
router.get('/', async (req: Request, res: Response) => {
    try {
        const badges = await Badge.find();
        res.json(badges);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching badges', error });
    }
});

// Get badge by ID
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const badge = await Badge.findOne({ id: req.params.id });
        if (!badge) return res.status(404).json({ message: 'Badge not found' });
        res.json(badge);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching badge', error });
    }
});

// Create badge (for admin use)
router.post('/', async (req: Request, res: Response) => {
    try {
        const badge = new Badge(req.body);
        await badge.save();
        res.status(201).json(badge);
    } catch (error) {
        res.status(400).json({ message: 'Error creating badge', error });
    }
});

export default router;
