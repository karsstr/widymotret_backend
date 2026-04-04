import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/portfolio-categories - List all categories (public)
router.get('/', async (req: Request, res: Response) => {
    try {
        const categories = await prisma.portfolioCategory.findMany({
            where: { isActive: true },
            orderBy: { orderIndex: 'asc' },
        });

        res.json({
            success: true,
            data: categories,
        });
    } catch (error) {
        console.error('Get portfolio categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server',
        });
    }
});

// GET /api/portfolio-categories/:id - Get single category (public)
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const category = await prisma.portfolioCategory.findUnique({
            where: { id },
        });

        if (!category) {
            res.status(404).json({
                success: false,
                message: 'Kategori portfolio tidak ditemukan',
            });
            return;
        }

        res.json({
            success: true,
            data: category,
        });
    } catch (error) {
        console.error('Get portfolio category error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server',
        });
    }
});

// POST /api/portfolio-categories - Create category (protected)
router.post('/', authMiddleware as any, async (req: Request, res: Response) => {
    try {
        const { name, slug, description, tagExample, examplePhotoUrl, isActive, orderIndex } = req.body;

        if (!name || !slug || !description || !tagExample) {
            res.status(400).json({
                success: false,
                message: 'Nama, slug, deskripsi, dan tag wajib diisi',
            });
            return;
        }

        // Check if slug already exists
        const existing = await prisma.portfolioCategory.findUnique({
            where: { slug },
        });

        if (existing) {
            res.status(400).json({
                success: false,
                message: 'Kategori dengan slug ini sudah ada',
            });
            return;
        }

        const category = await prisma.portfolioCategory.create({
            data: {
                name,
                slug,
                description,
                tagExample,
                examplePhotoUrl: examplePhotoUrl || null,
                isActive: isActive !== undefined ? isActive : true,
                orderIndex: orderIndex !== undefined ? orderIndex : 0,
            },
        });

        res.status(201).json({
            success: true,
            message: 'Kategori portfolio berhasil dibuat',
            data: category,
        });
    } catch (error) {
        console.error('Create portfolio category error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server',
        });
    }
});

// PUT /api/portfolio-categories/:id - Update category (protected)
router.put('/:id', authMiddleware as any, async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const { name, slug, description, tagExample, examplePhotoUrl, isActive, orderIndex } = req.body;

        const existing = await prisma.portfolioCategory.findUnique({
            where: { id },
        });

        if (!existing) {
            res.status(404).json({
                success: false,
                message: 'Kategori portfolio tidak ditemukan',
            });
            return;
        }

        // If slug is being changed, check for duplicates
        if (slug && slug !== existing.slug) {
            const duplicate = await prisma.portfolioCategory.findUnique({
                where: { slug },
            });

            if (duplicate) {
                res.status(400).json({
                    success: false,
                    message: 'Kategori dengan slug ini sudah ada',
                });
                return;
            }
        }

        const category = await prisma.portfolioCategory.update({
            where: { id },
            data: {
                ...(name !== undefined && { name }),
                ...(slug !== undefined && { slug }),
                ...(description !== undefined && { description }),
                ...(tagExample !== undefined && { tagExample }),
                ...(examplePhotoUrl !== undefined && { examplePhotoUrl }),
                ...(isActive !== undefined && { isActive }),
                ...(orderIndex !== undefined && { orderIndex }),
            },
        });

        res.json({
            success: true,
            message: 'Kategori portfolio berhasil diperbarui',
            data: category,
        });
    } catch (error) {
        console.error('Update portfolio category error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server',
        });
    }
});

// DELETE /api/portfolio-categories/:id - Delete category (protected)
router.delete('/:id', authMiddleware as any, async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        const existing = await prisma.portfolioCategory.findUnique({
            where: { id },
        });

        if (!existing) {
            res.status(404).json({
                success: false,
                message: 'Kategori portfolio tidak ditemukan',
            });
            return;
        }

        await prisma.portfolioCategory.delete({
            where: { id },
        });

        res.json({
            success: true,
            message: 'Kategori portfolio berhasil dihapus',
        });
    } catch (error) {
        console.error('Delete portfolio category error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server',
        });
    }
});

export default router;
