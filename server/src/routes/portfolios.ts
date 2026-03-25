import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma.ts';
import { authMiddleware, AuthRequest } from '../middleware/auth.ts';

const router = Router();

// GET /api/portfolios - List all portfolios (public, optional category filter)
router.get('/', async (req: Request, res: Response) => {
    try {
        const category = req.query.category as string | undefined;

        const where = category ? { category } : {};

        const portfolios = await prisma.portfolio.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });

        res.json({
            success: true,
            data: portfolios,
        });
    } catch (error) {
        console.error('Get portfolios error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server',
        });
    }
});

// GET /api/portfolios/:id - Get single portfolio (public)
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const portfolio = await prisma.portfolio.findUnique({
            where: { id },
        });

        if (!portfolio) {
            res.status(404).json({
                success: false,
                message: 'Portfolio tidak ditemukan',
            });
            return;
        }

        res.json({
            success: true,
            data: portfolio,
        });
    } catch (error) {
        console.error('Get portfolio error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server',
        });
    }
});

// POST /api/portfolios - Create portfolio (protected)
router.post('/', authMiddleware as any, async (req: Request, res: Response) => {
    try {
        const { title, description, imageUrl, category } = req.body;

        if (!title || !description || !imageUrl || !category) {
            res.status(400).json({
                success: false,
                message: 'Title, description, imageUrl, dan category wajib diisi',
            });
            return;
        }

        const portfolio = await prisma.portfolio.create({
            data: {
                title,
                description,
                imageUrl,
                category,
            },
        });

        res.status(201).json({
            success: true,
            message: 'Portfolio berhasil dibuat',
            data: portfolio,
        });
    } catch (error) {
        console.error('Create portfolio error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server',
        });
    }
});

// PUT /api/portfolios/:id - Update portfolio (protected)
router.put('/:id', authMiddleware as any, async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const { title, description, imageUrl, category } = req.body;

        const existing = await prisma.portfolio.findUnique({
            where: { id },
        });

        if (!existing) {
            res.status(404).json({
                success: false,
                message: 'Portfolio tidak ditemukan',
            });
            return;
        }

        const portfolio = await prisma.portfolio.update({
            where: { id },
            data: {
                ...(title !== undefined && { title }),
                ...(description !== undefined && { description }),
                ...(imageUrl !== undefined && { imageUrl }),
                ...(category !== undefined && { category }),
            },
        });

        res.json({
            success: true,
            message: 'Portfolio berhasil diperbarui',
            data: portfolio,
        });
    } catch (error) {
        console.error('Update portfolio error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server',
        });
    }
});

// DELETE /api/portfolios/:id - Delete portfolio (protected)
router.delete('/:id', authMiddleware as any, async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        const existing = await prisma.portfolio.findUnique({
            where: { id },
        });

        if (!existing) {
            res.status(404).json({
                success: false,
                message: 'Portfolio tidak ditemukan',
            });
            return;
        }

        await prisma.portfolio.delete({
            where: { id },
        });

        res.json({
            success: true,
            message: 'Portfolio berhasil dihapus',
        });
    } catch (error) {
        console.error('Delete portfolio error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server',
        });
    }
});

export default router;
