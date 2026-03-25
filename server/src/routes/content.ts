import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma.ts';
import { authMiddleware } from '../middleware/auth.ts';

const router = Router();

// GET /api/content - Get all content (public)
router.get('/', async (req: Request, res: Response) => {
    try {
        const contents = await prisma.content.findMany();

        // Convert to the format the frontend expects
        const data = contents.map((c: any) => ({
            id: String(c.id),
            section: c.section,
            field: c.field,
            value: c.value,
            updated_at: c.updatedAt.toISOString(),
        }));

        res.json({
            success: true,
            message: 'Semua konten berhasil diambil',
            data,
        });
    } catch (error) {
        console.error('Get all content error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
});

// GET /api/content/:section - Get content by section (public)
router.get('/:section', async (req: Request, res: Response) => {
    try {
        const section = req.params.section as string;
        const contents = await prisma.content.findMany({
            where: { section },
        });

        const data = contents.map((c: any) => ({
            id: String(c.id),
            section: c.section,
            field: c.field,
            value: c.value,
            updated_at: c.updatedAt.toISOString(),
        }));

        res.json({
            success: true,
            message: 'Konten section berhasil diambil',
            data,
        });
    } catch (error) {
        console.error('Get section content error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
});

// GET /api/content/:section/:field - Get single content field (public)
router.get('/:section/:field', async (req: Request, res: Response) => {
    try {
        const { section, field } = req.params;
        const content = await prisma.content.findUnique({
            where: { section_field: { section: section as string, field: field as string } },
        });

        if (!content) {
            res.status(404).json({
                success: false,
                message: 'Konten tidak ditemukan',
            });
            return;
        }

        res.json({
            success: true,
            message: 'Konten berhasil diambil',
            data: {
                id: String(content.id),
                section: content.section,
                field: content.field,
                value: content.value,
                updated_at: content.updatedAt.toISOString(),
            },
        });
    } catch (error) {
        console.error('Get content error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
});

// PUT /api/content/:section/:field - Update or create content field (protected)
router.put('/:section/:field', authMiddleware as any, async (req: Request, res: Response) => {
    try {
        const { section, field } = req.params;
        const { value } = req.body;

        console.log(`[DEBUG content.PUT] Updating: section=${section}, field=${field}, value=${value}`);

        if (value === undefined) {
            console.log(`[DEBUG content.PUT] Value is undefined`);
            res.status(400).json({
                success: false,
                message: 'Value wajib diisi',
            });
            return;
        }

        const content = await prisma.content.upsert({
            where: { section_field: { section: section as string, field: field as string } },
            update: { value },
            create: { section: section as string, field: field as string, value },
        });

        console.log(`[DEBUG content.PUT] Successfully upserted:`, {
            id: content.id,
            section: content.section,
            field: content.field,
            value: content.value,
        });

        res.json({
            success: true,
            message: 'Konten berhasil diperbarui',
            data: {
                id: String(content.id),
                section: content.section,
                field: content.field,
                value: content.value,
                updated_at: content.updatedAt.toISOString(),
            },
        });
    } catch (error) {
        console.error('[DEBUG content.PUT] Error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
});

// POST /api/content/batch - Batch update multiple fields (protected)
router.post('/batch', authMiddleware as any, async (req: Request, res: Response) => {
    try {
        const { updates } = req.body;

        if (!updates || !Array.isArray(updates)) {
            res.status(400).json({
                success: false,
                message: 'Updates array wajib diisi',
            });
            return;
        }

        const results = [];
        for (const update of updates) {
            const content = await prisma.content.upsert({
                where: { section_field: { section: update.section, field: update.field } },
                update: { value: update.value },
                create: { section: update.section, field: update.field, value: update.value },
            });
            results.push({
                id: String(content.id),
                section: content.section,
                field: content.field,
                value: content.value,
                updated_at: content.updatedAt.toISOString(),
            });
        }

        res.json({
            success: true,
            message: `${results.length} konten berhasil diperbarui`,
            data: results,
        });
    } catch (error) {
        console.error('Batch update content error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
});

// DELETE /api/content/:section/:field - Delete content (protected)
router.delete('/:section/:field', authMiddleware as any, async (req: Request, res: Response) => {
    try {
        const { section, field } = req.params;

        const existing = await prisma.content.findUnique({
            where: { section_field: { section: section as string, field: field as string } },
        });

        if (!existing) {
            res.status(404).json({
                success: false,
                message: 'Konten tidak ditemukan',
            });
            return;
        }

        await prisma.content.delete({
            where: { section_field: { section: section as string, field: field as string } },
        });

        res.json({
            success: true,
            message: 'Konten berhasil dihapus',
        });
    } catch (error) {
        console.error('Delete content error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
});

export default router;
