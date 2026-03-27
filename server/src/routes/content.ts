import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();

const DEFAULT_CONTENT: Array<{ section: string; field: string; value: string }> = [
    { section: 'hero', field: 'title', value: 'Setiap Momen Punya Cerita' },
    { section: 'hero', field: 'subtitle', value: 'Kami mengabadikan momen melalui foto dan video dengan pendekatan yang sederhana, rapi, dan penuh perhatian pada detail.' },

    { section: 'introduction', field: 'heading', value: 'Halo, Anda sudah menemukan kami!' },
    { section: 'introduction', field: 'description1', value: 'Di antara perjalanan waktu dan berbagai pertemuan yang tak terduga, akhirnya kita dipertemukan di momen ini. Kami senang karya kami bisa menarik perhatian Anda.' },
    { section: 'introduction', field: 'description2', value: 'Melalui kecintaan kami pada fotografi dan videografi, kami berusaha menangkap setiap detail, rasa, dan emosi dari momen berharga, agar setiap kenangan penting dapat tersimpan dengan indah dan bermakna.' },

    { section: 'services', field: 'title', value: 'Services' },
    { section: 'services', field: 'subtitle', value: 'untuk merencanakan dan mengatur acara spesial Anda' },

    { section: 'booking', field: 'title', value: 'Alur Booking' },
    { section: 'booking', field: 'subtitle', value: 'Mulai dari konsultasi, pemilihan paket, hingga hari H — semua kami siapkan dengan profesional.' },
    { section: 'booking', field: 'step1_title', value: 'Konsultasi & Cek Tanggal' },
    { section: 'booking', field: 'step1_description', value: 'Klien menghubungi kami melalui WhatsApp untuk konsultasi awal dan memastikan ketersediaan tanggal acara.' },
    { section: 'booking', field: 'step2_title', value: 'Pilih Paket Fotografi' },
    { section: 'booking', field: 'step2_description', value: 'Klien memilih paket yang sesuai kebutuhan, konsep, dan budget yang diinginkan.' },
    { section: 'booking', field: 'step3_title', value: 'Konfirmasi & Pembayaran DP' },
    { section: 'booking', field: 'step3_description', value: 'Setelah paket disepakati, klien melakukan pembayaran DP untuk mengamankan jadwal.' },
    { section: 'booking', field: 'step4_title', value: 'Persiapan & Briefing' },
    { section: 'booking', field: 'step4_description', value: 'Kami melakukan briefing detail terkait rundown acara, konsep foto, lokasi, dan kebutuhan teknis lainnya.' },
    { section: 'booking', field: 'step5_title', value: 'Hari Pernikahan (Shooting Day)' },
    { section: 'booking', field: 'step5_description', value: 'Tim fotografer hadir tepat waktu dan mengabadikan setiap momen penting secara profesional.' },
    { section: 'booking', field: 'step6_title', value: 'Editing & Penyerahan Hasil' },
    { section: 'booking', field: 'step6_description', value: 'Proses editing dilakukan sesuai standar kualitas studio, lalu hasil diserahkan sesuai paket yang dipilih.' },

    { section: 'testimonials', field: 'title', value: 'What They Say' },
    { section: 'testimonials', field: 'quote1', value: 'Cara kalian menangkap momen hari kami sungguh luar biasa. Setiap foto adalah harta karun.' },
    { section: 'testimonials', field: 'author1', value: 'Racheal and Tim' },
    { section: 'testimonials', field: 'quote2', value: 'Profesional, sabar, dan sangat berbakat.' },
    { section: 'testimonials', field: 'author2', value: 'Agency Lead, Numa Studio' },
    { section: 'testimonials', field: 'quote3', value: 'Portrait saya selalu terlihat menakjubkan ketika ditangani oleh kalian.' },
    { section: 'testimonials', field: 'author3', value: 'Mary Jane' },

    { section: 'settings', field: 'phone', value: '+62 895-3511-5777' },
    { section: 'settings', field: 'email', value: 'admin@widymotret.com' },
    { section: 'settings', field: 'whatsapp', value: '62895351115777' },
    { section: 'settings', field: 'instagram', value: '@widymotretstudio' },
    { section: 'settings', field: 'address', value: 'Bandung, Indonesia' },

    { section: 'home', field: 'cta_heading', value: 'Wujudkan momen terbaik Anda bersama kami' },
    { section: 'home', field: 'cta_subheading', value: 'Hubungi kami sekarang untuk konsultasi gratis dan penawaran paket terbaik.' },
    { section: 'home', field: 'cta_button', value: 'Hubungi Sekarang' },
];

let isBootstrappingDefaults = false;

const ensureDefaultContent = async () => {
    if (isBootstrappingDefaults) return;
    isBootstrappingDefaults = true;
    try {
        console.log('[content] Ensuring default editable content rows exist...');
        await prisma.content.createMany({
            data: DEFAULT_CONTENT,
            skipDuplicates: true,
        });
        console.log(`[content] Ensured ${DEFAULT_CONTENT.length} default content rows`);
    } catch (err) {
        console.error('[content] Failed to seed default content:', err);
    } finally {
        isBootstrappingDefaults = false;
    }
};

// GET /api/content - Get all content (public)
router.get('/', async (req: Request, res: Response) => {
    try {
        await ensureDefaultContent();
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
        await ensureDefaultContent();
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
        await ensureDefaultContent();
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
