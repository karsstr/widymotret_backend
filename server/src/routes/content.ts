import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();

const DEFAULT_CONTENT: Array<{ section: string; field: string; value: string }> = [
    { section: 'hero', field: 'title', value: 'Setiap Momen Punya Cerita' },
    { section: 'hero', field: 'subtitle', value: 'Kami mengabadikan momen melalui foto dan video dengan pendekatan yang sederhana, rapi, dan penuh perhatian pada detail.' },
    { section: 'hero', field: 'carousel_0', value: '/home (1).png' },
    { section: 'hero', field: 'carousel_1', value: '/home (2).jpg' },
    { section: 'hero', field: 'carousel_2', value: '/home (3).jpg' },
    { section: 'hero', field: 'carousel_3', value: '/home (4).jpg' },

    { section: 'introduction', field: 'heading', value: 'Halo, Anda sudah menemukan kami!' },
    { section: 'introduction', field: 'description1', value: 'Di antara perjalanan waktu dan berbagai pertemuan yang tak terduga, akhirnya kita dipertemukan di momen ini. Kami senang karya kami bisa menarik perhatian Anda.' },
    { section: 'introduction', field: 'description2', value: 'Melalui kecintaan kami pada fotografi dan videografi, kami berusaha menangkap setiap detail, rasa, dan emosi dari momen berharga, agar setiap kenangan penting dapat tersimpan dengan indah dan bermakna.' },

    { section: 'services', field: 'title', value: 'Services' },
    { section: 'services', field: 'subtitle', value: 'untuk merencanakan dan mengatur acara spesial Anda' },

    { section: 'featured', field: 'title', value: 'Potret Unggulan' },
    { section: 'featured', field: 'subtitle', value: 'Sekilas pandang dari beberapa karya terbaik kami.' },
    { section: 'featured', field: 'portrait_0', value: '/portrait/portrait (1).png' },
    { section: 'featured', field: 'portrait_1', value: '/portrait/portrait (2).png' },
    { section: 'featured', field: 'portrait_2', value: '/portrait/portrait (3).png' },
    { section: 'featured', field: 'portrait_3', value: '/portrait/portrait (4).png' },
    { section: 'featured', field: 'portrait_4', value: '/portrait/portrait (5).png' },

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
    { section: 'testimonials', field: 'quote4', value: '' },
    { section: 'testimonials', field: 'author4', value: '' },
    { section: 'testimonials', field: 'quote5', value: '' },
    { section: 'testimonials', field: 'author5', value: '' },
    { section: 'testimonials', field: 'quote6', value: '' },
    { section: 'testimonials', field: 'author6', value: '' },
    { section: 'testimonials', field: 'quote7', value: '' },
    { section: 'testimonials', field: 'author7', value: '' },

    { section: 'settings', field: 'phone', value: '+62 895-3511-5777' },
    { section: 'settings', field: 'email', value: 'admin@widymotret.com' },
    { section: 'settings', field: 'whatsapp', value: '62895351115777' },
    { section: 'settings', field: 'instagram', value: '@widymotretstudio' },
    { section: 'settings', field: 'address', value: 'Bandung, Indonesia' },

    { section: 'home', field: 'cta_heading', value: 'Wujudkan momen terbaik Anda bersama kami' },
    { section: 'home', field: 'cta_subheading', value: 'Hubungi kami sekarang untuk konsultasi gratis dan penawaran paket terbaik.' },
    { section: 'home', field: 'cta_button', value: 'Hubungi Sekarang' },

    // About page content
    { section: 'about_page', field: 'tagline', value: 'A passionate photographer with an eye for honest, powerful moments' },
    { section: 'about_page', field: 'story_heading', value: 'My story' },
    { section: 'about_page', field: 'story_paragraph0', value: 'My love for photography started with a borrowed camera and a sunset.' },
    { section: 'about_page', field: 'story_paragraph1', value: 'Since then, I\'ve chased light, laughter, and the in-between moments that make life feel real.' },
    { section: 'about_page', field: 'story_paragraph2', value: 'I photograph to preserve stories—the ones you\'re living right now.' },
    { section: 'about_page', field: 'philosophy_quote', value: 'I believe great photography happens when people feel seen, not posed.' },
    { section: 'about_page', field: 'behind_lens_heading', value: 'Behind the Lens' },
    { section: 'about_page', field: 'behind_lens_tagline', value: 'When I\'m not behind the camera, I\'m hiking, sipping coffee, or chasing sunsets.' },
    { section: 'about_page', field: 'behind_lens_description', value: 'Photography isn\'t just what I do—it\'s how I experience the world. This approach shapes every frame I capture.' },
    { section: 'about_page', field: 'team_heading', value: 'The Team' },
    { section: 'about_page', field: 'team_description', value: 'While I started this journey solo, I\'ve gathered a talented group of photographers and videographers who share the same passion for authentic storytelling.' },
    { section: 'about_page', field: 'cta_heading', value: 'Ready to tell your story?' },
    { section: 'about_page', field: 'cta_subheading', value: 'Let\'s create something beautiful together and capture your most precious moments.' },
    { section: 'about_page', field: 'cta_button', value: 'Start Your Session' },

    // Footer section
    { section: 'footer', field: 'studio_description', value: 'Mengabadikan momen abadi bersama orang-orang terkasih. Kami percaya setiap momen memiliki cerita uniknya sendiri.' },
    { section: 'footer', field: 'copyright_text', value: '© 2025 Studio Photography. All rights reserved.' },
    { section: 'footer', field: 'tagline', value: 'Made with ♥ for capturing love' },
    { section: 'footer', field: 'email', value: 'admin@widymotret.com' },
    { section: 'footer', field: 'phone', value: '+62 895-3511-5777' },
    { section: 'footer', field: 'address', value: 'Bandung, Indonesia' },
    { section: 'footer', field: 'facebook_url', value: 'https://www.facebook.com/widymotret/' },
    { section: 'footer', field: 'instagram_url', value: 'https://www.instagram.com/widymotretstudio/' },
    { section: 'footer', field: 'whatsapp_url', value: 'https://api.whatsapp.com/send/?phone=62895351115777' },
    { section: 'footer', field: 'quick_link_0_label', value: 'Home' },
    { section: 'footer', field: 'quick_link_0_url', value: '/' },
    { section: 'footer', field: 'quick_link_1_label', value: 'Portfolio' },
    { section: 'footer', field: 'quick_link_1_url', value: '/#portfolio' },
    { section: 'footer', field: 'quick_link_2_label', value: 'Harga' },
    { section: 'footer', field: 'quick_link_2_url', value: '/' },
    { section: 'footer', field: 'quick_link_3_label', value: 'Tentang' },
    { section: 'footer', field: 'quick_link_3_url', value: '/#about' },
    { section: 'footer', field: 'quick_link_4_label', value: 'Hubungi' },
    { section: 'footer', field: 'quick_link_4_url', value: '/#contact' },
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

        console.log(`[content.PUT] Updating: section=${section}, field=${field}, value length=${value?.length || 0}`);

        if (value === undefined) {
            console.log(`[content.PUT] Value is undefined - rejecting`);
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

        console.log(`[content.PUT] ✓ Upserted: section=${content.section}, field=${content.field}, value length=${content.value.length}`);

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
        console.error('[content.PUT] ✗ Error:', error instanceof Error ? error.message : error);
        if (error instanceof Error) {
            console.error('[content.PUT] Stack:', error.stack);
        }
        res.status(500).json({ 
            success: false, 
            message: `Terjadi kesalahan server: ${error instanceof Error ? error.message : 'Unknown error'}`,
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
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

        console.log(`[content.batch] Starting batch update of ${updates.length} items`);
        
        const results = [];
        for (const update of updates) {
            try {
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
                    success: true,
                });
            } catch (itemError) {
                console.error(`[content.batch] Item failed: section=${update.section}, field=${update.field}`, itemError);
                results.push({
                    section: update.section,
                    field: update.field,
                    success: false,
                    error: itemError instanceof Error ? itemError.message : 'Unknown error',
                });
            }
        }

        const allSuccessful = results.every((r: any) => r.success);
        console.log(`[content.batch] ✓ Completed: ${allSuccessful ? 'all successful' : 'some failed'}`);
        
        res.json({
            success: allSuccessful,
            message: allSuccessful 
                ? `${results.length} konten berhasil diperbarui` 
                : `${results.filter((r: any) => r.success).length}/${results.length} konten berhasil diperbarui`,
            data: results,
        });
    } catch (error) {
        console.error('[content.batch] Fatal error:', error instanceof Error ? error.message : error);
        res.status(500).json({ 
            success: false, 
            message: `Terjadi kesalahan server: ${error instanceof Error ? error.message : 'Unknown error'}` 
        });
    }
});

// DELETE /api/content/:section/:field - Delete content (protected)
// DELETE /api/content/:section/:field - Actually delete a content field (protected)
router.delete('/:section/:field', authMiddleware as any, async (req: Request, res: Response) => {
    try {
        const { section, field } = req.params;
        
        console.log(`[content.DELETE] Attempting to delete: section=${section}, field=${field}`);

        const existing = await prisma.content.findUnique({
            where: { section_field: { section: section as string, field: field as string } },
        });

        if (!existing) {
            console.log(`[content.DELETE] Not found`);
            res.status(404).json({
                success: false,
                message: 'Konten tidak ditemukan',
            });
            return;
        }

        await prisma.content.delete({
            where: { section_field: { section: section as string, field: field as string } },
        });

        console.log(`[content.DELETE] ✓ Deleted successfully`);
        res.json({
            success: true,
            message: 'Konten berhasil dihapus',
        });
    } catch (error) {
        console.error('[content.DELETE] ✗ Error:', error instanceof Error ? error.message : error);
        res.status(500).json({ 
            success: false, 
            message: `Terjadi kesalahan server: ${error instanceof Error ? error.message : 'Unknown error'}` 
        });
    }
});

export default router;
