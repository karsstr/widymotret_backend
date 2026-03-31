import bcrypt from 'bcryptjs';
import prisma from './lib/prisma';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
    console.log('🌱 Seeding database...');

    // Create default admin user
    // Password: Widy@M0tr3t2026 (strong, memorable, with capital letters and numbers)
    const hashedPassword = await bcrypt.hash('Widy@M0tr3t2026', 10);

    const admin = await prisma.admin.upsert({
        where: { username: 'admin@widymotret.com' },
        update: {},
        create: {
            username: 'admin@widymotret.com',
            password: hashedPassword,
        },
    });

    console.log(`✅ Admin user created: ${admin.username} (password: Widy@M0tr3t2026`);

    // Seed all packages from servicesData
    const packages = [
        // Studio
        { name: 'Pas Foto Ijazah', category: 'studio', description: 'Pas foto profesional untuk keperluan ijazah dan dokumen resmi', price: 25000, features: ['Background merah, biru, atau putih', 'Ukuran 2x3, 3x4, atau 4x6', 'Softfile digital', 'Professional edit'], isPublished: true },
        { name: 'Pas Foto Couple', category: 'studio', description: 'Paket pas foto untuk pasangan dengan konsep formal dan bebas', price: 100000, features: ['Background biru', '2 foto formal', '3 foto bebas', 'Softfile digital', 'Professional edit'], isPublished: true },
        { name: 'Personal Photo', category: 'studio', description: 'Sesi photoshoot personal dengan konsep pilihan Anda', price: 150000, features: ['1 orang', '20 menit photoshoot', '1 konsep & 1 background', 'Hasil digital berkualitas tinggi'], isPublished: true },
        { name: 'Mini Group', category: 'studio', description: 'Cocok untuk foto bersama teman atau keluarga kecil', price: 250000, features: ['3-5 orang', '30 menit photoshoot', '1 konsep & 1 background', 'Hasil digital untuk semua peserta'], isPublished: true },
        { name: 'Medium Group', category: 'studio', description: 'Paket untuk grup ukuran menengah dengan durasi lebih lama', price: 300000, features: ['5-10 orang', '30 menit photoshoot', '1 konsep & 1 background', 'Hasil digital untuk semua peserta'], isPublished: true },
        { name: 'Large Group', category: 'studio', description: 'Ideal untuk foto organisasi atau acara grup besar', price: 500000, features: ['10-20 orang', '30 menit photoshoot', '1 konsep & 1 background', 'Hasil digital untuk semua peserta'], isPublished: true },
        { name: 'Extra Large Group', category: 'studio', description: 'Paket fleksibel untuk grup sangat besar dengan harga per orang', price: 20000, features: ['Minimal 20 orang', 'Maksimal 50 orang', '30 menit photoshoot', '1 konsep & 1 background'], isPublished: true },

        // Graduation
        { name: 'Graduation A', category: 'graduation', description: 'Paket foto wisuda untuk grup kecil', price: 300000, features: ['Maksimal 5 orang', '30 menit photoshoot', '1 konsep & 1 background', 'Hasil digital berkualitas tinggi'], isPublished: true },
        { name: 'Graduation B', category: 'graduation', description: 'Paket foto wisuda untuk grup menengah', price: 450000, features: ['Maksimal 10 orang', '30 menit photoshoot', '1 konsep & 1 background', 'Hasil digital berkualitas tinggi'], isPublished: true },
        { name: 'Graduation C', category: 'graduation', description: 'Paket foto wisuda untuk grup besar', price: 500000, features: ['Maksimal 15 orang', '30 menit photoshoot', '1 konsep & 1 background', 'Hasil digital berkualitas tinggi'], isPublished: true },

        // Event
        { name: 'Birthday Party', category: 'event', description: 'Paket foto ulang tahun dengan konsep fun dan ceria', price: 350000, features: ['Maksimal 4 orang', '30 menit photoshoot', '1 konsep & 1 background space white', 'Bebas membawa properti ulang tahun', 'Boleh bawa kue, balon, dll'], isPublished: true },

        // Product
        { name: 'Photo Product', category: 'product', description: 'Layanan foto produk dengan harga fleksibel', price: 50000, features: ['Harga per produk', 'Syarat dan ketentuan berlaku', 'Menyesuaikan jumlah produk', 'Konsep sesuai kebutuhan', 'Professional lighting & editing'], isPublished: true },

        // Wedding
        { name: 'Photography Basic', category: 'wedding', description: 'Paket photography basic untuk pernikahan', price: 2500000, features: ['1 Photographer', 'Unlimited File (Maks 8 Hours)', '150+ Professional Editing', '1 Magnetic Album (Custom Name)', '120pcs 4r Print', 'Free Flashdisk 16GB'], isPublished: true },
        { name: 'Photography Bronze', category: 'wedding', description: 'Paket photography bronze dengan 2 fotografer', price: 3000000, features: ['2 Photographer', 'Unlimited File (Maks 8 Hours)', '250+ Professional Editing', '1 Magnetic Album (Custom Name)', '160pcs 4r Print', 'Free Flashdisk 16GB'], isPublished: true },
        { name: 'Photography Silver', category: 'wedding', description: 'Paket photography silver dengan album storybook', price: 4000000, features: ['2 Photographer', 'Unlimited File (Maks 8 Hours)', '300+ Professional Editing', '1 Storybook Album (11 Pages)', '1 Photobook Album (40 Photo)', 'Free Flashdisk 32GB'], isPublished: true },
        { name: 'Photography Silver Plus', category: 'wedding', description: 'Paket photography silver plus dengan durasi lebih panjang', price: 4500000, features: ['2 Photographer', 'Unlimited File (Maks 10 Hours)', '350+ Professional Editing', '1 Storybook Album (11 Pages)', '1 Photobook Album (80 Photo)', '1 Print 20rp (50x75cm)', 'Free Flashdisk 32GB'], isPublished: true },
        { name: 'Photography Gold', category: 'wedding', description: 'Paket photography gold dengan assistant', price: 5500000, features: ['2 Photographer', '1 Assistant', 'Unlimited File (Maks 10 Hours)', '400+ Professional Editing', '1 Storybook Album (11 Pages)', '1 Photobook Album (80 Photo)', '2 Print 20rp (50x75cm)', 'Free Flashdisk 32GB'], isPublished: true },
        { name: 'Photography Platinum', category: 'wedding', description: 'Paket photography platinum untuk dokumentasi maksimal', price: 6500000, features: ['3 Photographer', 'Unlimited File (Maks 12 Hours)', '500+ Professional Editing', '1 Storybook Album (11 Pages)', '1 Photobook Album (80 Photo)', '2 Print 20rp (50x75cm)', 'Free Flashdisk 32GB'], isPublished: true },
        { name: 'Videography Basic', category: 'wedding', description: 'Paket videography basic dengan cinematic teaser', price: 1200000, features: ['1 Videographer', 'Maks 8 Hours', '1 Minutes Cinematic Teaser', 'Free to Request Song', 'Send Via Google Drive'], isPublished: true },
        { name: 'Videography Bronze', category: 'wedding', description: 'Paket videography bronze with cinematic clip', price: 1800000, features: ['1 Videographer', 'Maks 8 Hours', '3 Minutes Cinematic Clip', 'Free to Request Song', 'Send Via Google Drive'], isPublished: true },
        { name: 'Videography Silver', category: 'wedding', description: 'Paket videography silver with teaser & clip', price: 2500000, features: ['1 Videographer', 'Maks 8 Hours', '1 Minutes Cinematic Teaser', '3 Minutes Cinematic Clip', 'Free to Request Song', 'Free Flashdisk 16GB'], isPublished: true },
        { name: 'Videography Gold', category: 'wedding', description: 'Paket videography gold with documentary video', price: 3500000, features: ['2 Videographer', 'Maks 10 Hours', '1 Minutes Cinematic Teaser', '3 Minutes Cinematic Clip', '60-90 Minutes Documentary Video', 'Free Sneakpeak', 'Free to Request Song', 'Free Flashdisk 32GB'], isPublished: true },
        { name: 'Videography Gold (Same Day Edit)', category: 'wedding', description: 'Paket videography gold with same day edit feature', price: 4500000, features: ['3 Videographer', 'Same Day Edit', 'Maks 10 Hours', '1 Minutes Cinematic Teaser', '3 Minutes Cinematic Clip', '60-90 Minutes Documentary Video', 'Free Sneakpeak', 'Free to Request Song', 'Free Flashdisk 32GB'], isPublished: true },
        { name: 'Photo & Video Basic', category: 'wedding', description: 'Paket kombinasi photo & video basic', price: 4850000, features: ['1 Photographer', '1 Videographer', 'Unlimited File (Maks 8 Hours)', '150+ Professional Editing', '1 Magnetic Album (Custom Name)', '120pcs 4r Print', '1 Minutes Cinematic Teaser', '3 Minutes Cinematic Clip', 'Free to Request Song', 'Free Flashdisk 16GB'], isPublished: true },
        { name: 'Photo & Video Bronze', category: 'wedding', description: 'Paket kombinasi photo & video bronze', price: 5500000, features: ['2 Photographer', '1 Videographer', 'Unlimited File (Maks 8 Hours)', '250+ Professional Editing', '1 Magnetic Album (Custom Name)', '160pcs 4r Print', '1 Minutes Cinematic Teaser', '3 Minutes Cinematic Clip', 'Free to Request Song', 'Free Flashdisk 32GB'], isPublished: true },
        { name: 'Photo & Video Bronze Plus', category: 'wedding', description: 'Paket kombinasi photo & video bronze plus with album premium', price: 6500000, features: ['2 Photographer', '1 Videographer', 'Unlimited File (Maks 8 Hours)', '350+ Professional Editing', '1 Storybook Album (11 Pages)', '1 Photobook Album (80 Photo)', '1 Minutes Cinematic Teaser', '3 Minutes Cinematic Clip', 'Free to Request Song', 'Free Flashdisk 32GB'], isPublished: true },
    ];

    // Clear existing packages to avoid duplicate issues and ensure fresh sync
    await prisma.package.deleteMany();

    for (const pkg of packages) {
        await prisma.package.create({
            data: {
                ...pkg,
                features: JSON.parse(JSON.stringify(pkg.features)),
            },
        });
    }

    console.log(`✅ ${packages.length} packages created and categorized`);

    // Seed some sample portfolios
    const portfolios = [
        {
            title: 'Studio Portrait Session',
            description: 'Professional portrait session di studio dengan lighting profesional',
            imageUrl: '/portrait/portrait (1).png',
            category: 'portrait',
        },
        {
            title: 'Wedding Ceremony Moments',
            description: 'Dokumentasi momen sakral upacara pernikahan',
            imageUrl: '/landscape/landscape (1).png',
            category: 'event',
        },
        {
            title: 'Brand Campaign Photo',
            description: 'Fotografi komersial untuk kebutuhan branding',
            imageUrl: '/landscape/landscape (2).png',
            category: 'editorial',
        },
    ];

    for (const portfolio of portfolios) {
        await prisma.portfolio.upsert({
            where: { id: portfolios.indexOf(portfolio) + 1 },
            update: {},
            create: portfolio,
        });
    }

    console.log(`✅ ${portfolios.length} sample portfolios created`);

    // Seed default content (website text content)
    const defaultContent: { section: string; field: string; value: string }[] = [
        // Hero Section
        { section: 'hero', field: 'title', value: 'Setiap Momen Punya Cerita' },
        { section: 'hero', field: 'subtitle', value: 'Kami mengabadikan momen melalui foto dan video dengan pendekatan yang sederhana, rapi, dan penuh perhatian pada detail.' },

        // Introduction Section
        { section: 'introduction', field: 'heading', value: 'Halo, Anda sudah menemukan kami!' },
        { section: 'introduction', field: 'description1', value: 'Di antara perjalanan waktu dan berbagai pertemuan yang tak terduga, akhirnya kita dipertemukan di momen ini. Kami senang karya kami bisa menarik perhatian Anda.' },
        { section: 'introduction', field: 'description2', value: 'Melalui kecintaan kami pada fotografi dan videografi, kami berusaha menangkap setiap detail, rasa, dan emosi dari momen berharga, agar setiap kenangan penting dapat tersimpan dengan indah dan bermakna.' },

        // About Section
        { section: 'about', field: 'title', value: 'Widymotret' },
        { section: 'about', field: 'description1', value: 'Widymotret adalah studio fotografi yang berdiri sejak 2021 dan melayani berbagai kebutuhan pemotretan.' },
        { section: 'about', field: 'description2', value: 'Kami menyesuaikan gaya foto sesuai keinginan klien, mulai dari natural, elegan, hingga cinematic, dengan fokus pada kenyamanan dan hasil yang rapi serta berkesan.' },

        // Services Section
        { section: 'services', field: 'title', value: 'Services' },
        { section: 'services', field: 'subtitle', value: 'untuk merencanakan dan mengatur acara spesial Anda' },

        // Booking Process Section
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

        // Portfolio Section
        { section: 'portfolio', field: 'title', value: 'Our portofolios' },

        // Featured Shots
        { section: 'featured', field: 'title', value: 'Potret Unggulan' },
        { section: 'featured', field: 'subtitle', value: 'Sekilas pandang dari beberapa karya terbaik kami.' },

        // Testimonials
        { section: 'testimonials', field: 'title', value: 'Testimoni' },
        { section: 'testimonials', field: 'quote1', value: 'Cara kalian menangkap momen hari kami sungguh luar biasa. Setiap foto adalah harta karun.' },
        { section: 'testimonials', field: 'author1', value: 'Racheal and Tim' },
        { section: 'testimonials', field: 'quote2', value: 'Profesional, sabar, dan sangat berbakat.' },
        { section: 'testimonials', field: 'author2', value: 'Agency Lead, Numa Studio' },
        { section: 'testimonials', field: 'quote3', value: 'Portrait saya selalu terlihat menakjubkan ketika ditangani oleh kalian.' },
        { section: 'testimonials', field: 'author3', value: 'Mary Jane' },

        // Home CTA
        { section: 'home', field: 'cta_heading', value: 'Siap Mengabadikan Momen Spesial Anda?' },
        { section: 'home', field: 'cta_subheading', value: 'Hubungi kami sekarang dan jadwalkan sesi pemotretan Anda' },
        { section: 'home', field: 'cta_button', value: 'Booking Sekarang' },

        // Contact Settings
        { section: 'settings', field: 'phone', value: '+62 895-3511-15777' },
        { section: 'settings', field: 'email', value: 'widymotret@gmail.com' },
        { section: 'settings', field: 'address', value: 'Jl. Raya Pernasidi No.3, Cilongok, Banyumas – Jawa Tengah' },
        { section: 'settings', field: 'whatsapp', value: '62895351115777' },
        { section: 'settings', field: 'instagram', value: '@widymotretstudio' },

        // About Page - Text Content
        { section: 'about_page', field: 'tagline', value: 'A passionate photographer with an eye for honest, powerful moments' },
        { section: 'about_page', field: 'story_heading', value: 'My story' },
        { section: 'about_page', field: 'story_paragraph1', value: 'My love for photography started with a borrowed camera and a sunset.' },
        { section: 'about_page', field: 'story_paragraph2', value: "Since then, I've chased light, laughter, and the in-between moments that make life feel real." },
        { section: 'about_page', field: 'story_paragraph3', value: "I photograph to preserve stories—the ones you're living right now." },
        { section: 'about_page', field: 'philosophy_quote', value: 'I believe great photography happens when people feel seen, not posed.' },
        { section: 'about_page', field: 'behind_lens_heading', value: 'Behind the Lens' },
        { section: 'about_page', field: 'behind_lens_tagline', value: "When I'm not behind the camera, I'm hiking, sipping coffee, or chasing sunsets." },
        { section: 'about_page', field: 'behind_lens_description', value: 'Every moment captured is a story preserved for a lifetime.' },
        { section: 'about_page', field: 'team_heading', value: 'Meet Our Team' },
        { section: 'about_page', field: 'team_description', value: 'Meet the creative minds behind every stunning shot. Our dedicated team brings passion, expertise, and a commitment to capturing your most precious moments.' },
        { section: 'about_page', field: 'cta_heading', value: 'Made up your mind yet?' },
        { section: 'about_page', field: 'cta_subheading', value: "Let's talk about your visions and how I can bring them to life" },
        { section: 'about_page', field: 'cta_button', value: 'Contact me' },

        // About Page - Image Fields
        { section: 'about', field: 'hero_main', value: '/portrait/portrait (1).png' },
        { section: 'about', field: 'hero_right_top', value: '/landscape/landscape (2).png' },
        { section: 'about', field: 'hero_right_bottom', value: '/landscape/landscape (3).png' },
        { section: 'about', field: 'story_img1', value: '/portrait/portrait (2).png' },
        { section: 'about', field: 'story_img2', value: '/portrait/portrait (3).png' },
        { section: 'about', field: 'btl_left1', value: '/landscape/landscape (1).png' },
        { section: 'about', field: 'btl_left2', value: '/landscape/landscape (2).png' },
        { section: 'about', field: 'btl_left3', value: '/landscape/landscape (3).png' },
        { section: 'about', field: 'btl_center', value: '/portrait/portrait (2).png' },
        { section: 'about', field: 'btl_right1', value: '/landscape/landscape (4).png' },
        { section: 'about', field: 'btl_right2', value: '/portrait/portrait (3).png' },
        { section: 'about', field: 'btl_right3', value: '/portrait/portrait (4).png' },
        { section: 'about', field: 'team_photo', value: '/landscape/landscape (5).png' },

        // Footer Content
        { section: 'footer', field: 'studio_description', value: 'Mengabadikan momen abadi dan menciptakan kenangan indah yang bertahan selamanya.' },
        { section: 'footer', field: 'copyright_text', value: '© 2026 Studio Photography. All rights reserved.' },
        { section: 'footer', field: 'tagline', value: 'Made with ♥ for capturing love' },
        { section: 'footer', field: 'email', value: 'widymotret@gmail.com' },
        { section: 'footer', field: 'phone', value: '+62 895-3511-15777' },
        { section: 'footer', field: 'address', value: 'Jl. Raya Pernasidi No.3, Cilongok, Banyumas – Jawa Tengah' },
    ];

    for (const item of defaultContent) {
        await prisma.content.upsert({
            where: { section_field: { section: item.section, field: item.field } },
            update: {},
            create: item,
        });
    }

    console.log(`✅ ${defaultContent.length} content fields seeded`);
    console.log('🎉 Seeding complete!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
