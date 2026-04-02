import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/packages - List all packages (public)
router.get('/', async (req: Request, res: Response) => {
    try {
        const packages = await prisma.package.findMany({
            orderBy: { createdAt: 'asc' },
        });

        res.json({
            success: true,
            data: packages,
        });
    } catch (error) {
        console.error('Get packages error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server',
        });
    }
});

// GET /api/packages/:id - Get single package (public)
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const pkg = await prisma.package.findUnique({
            where: { id },
        });

        if (!pkg) {
            res.status(404).json({
                success: false,
                message: 'Package tidak ditemukan',
            });
            return;
        }

        res.json({
            success: true,
            data: pkg,
        });
    } catch (error) {
        console.error('Get package error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server',
        });
    }
});

// POST /api/packages - Create package (protected)
router.post('/', authMiddleware as any, async (req: Request, res: Response) => {
    try {
        const { name, description, price, category, images, features, isPublished, whatsappLinkType, customWhatsappUrl } = req.body;

        if (!name || !description || price === undefined || !category) {
            res.status(400).json({
                success: false,
                message: 'Name, description, price, dan category wajib diisi',
            });
            return;
        }

        const pkg = await prisma.package.create({
            data: {
                name,
                description,
                price: parseInt(price),
                category,
                images: images || [],
                features: features || [],
                isPublished: isPublished !== undefined ? isPublished : true,
                whatsappLinkType: whatsappLinkType || 'studio',
                customWhatsappUrl: customWhatsappUrl || null,
            },
        });

        res.status(201).json({
            success: true,
            message: 'Package berhasil dibuat',
            data: pkg,
        });
    } catch (error) {
        console.error('Create package error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server',
        });
    }
});

// PUT /api/packages/:id - Update package (protected)
router.put('/:id', authMiddleware as any, async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const { name, description, price, category, images, features, isPublished, whatsappLinkType, customWhatsappUrl } = req.body;

        const existing = await prisma.package.findUnique({
            where: { id },
        });

        if (!existing) {
            res.status(404).json({
                success: false,
                message: 'Package tidak ditemukan',
            });
            return;
        }

        const pkg = await prisma.package.update({
            where: { id },
            data: {
                ...(name !== undefined && { name }),
                ...(description !== undefined && { description }),
                ...(price !== undefined && { price: parseInt(price) }),
                ...(category !== undefined && { category }),
                ...(images !== undefined && { images }),
                ...(features !== undefined && { features }),
                ...(isPublished !== undefined && { isPublished }),
                ...(whatsappLinkType !== undefined && { whatsappLinkType }),
                ...(customWhatsappUrl !== undefined && { customWhatsappUrl }),
            },
        });

        res.json({
            success: true,
            message: 'Package berhasil diperbarui',
            data: pkg,
        });
    } catch (error) {
        console.error('Update package error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server',
        });
    }
});

// DELETE /api/packages/:id - Delete package (protected)
router.delete('/:id', authMiddleware as any, async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        const existing = await prisma.package.findUnique({
            where: { id },
        });

        if (!existing) {
            res.status(404).json({
                success: false,
                message: 'Package tidak ditemukan',
            });
            return;
        }

        await prisma.package.delete({
            where: { id },
        });

        res.json({
            success: true,
            message: 'Package berhasil dihapus',
        });
    } catch (error) {
        console.error('Delete package error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server',
        });
    }
});

export default router;
