import prisma from './lib/prisma';

async function main() {
    console.log('🌱 Seeding footer content...');

    const footerContent = [
        { section: 'footer', field: 'studio_description', value: 'Mengabadikan momen abadi dan menciptakan kenangan indah yang bertahan selamanya.' },
        { section: 'footer', field: 'copyright_text', value: '© 2026 Studio Photography. All rights reserved.' },
        { section: 'footer', field: 'tagline', value: 'Made with ♥ for capturing love' },
        { section: 'footer', field: 'email', value: 'widymotret@gmail.com' },
        { section: 'footer', field: 'phone', value: '+62 895-3511-15777' },
        { section: 'footer', field: 'address', value: 'Jl. Raya Pernasidi No.3, Cilongok, Banyumas – Jawa Tengah' },
        { section: 'footer', field: 'facebook_url', value: 'https://www.facebook.com/dalban.speed.71/' },
        { section: 'footer', field: 'instagram_url', value: 'https://www.instagram.com/widymotretstudio/' },
        { section: 'footer', field: 'whatsapp_url', value: 'https://api.whatsapp.com/send/?phone=62895351115777%3F&type=phone_number&app_absent=0' },
    ];

    for (const item of footerContent) {
        const result = await prisma.content.upsert({
            where: { section_field: { section: item.section, field: item.field } },
            update: { value: item.value },
            create: item,
        });
        console.log(`✅ ${item.field}: "${item.value.substring(0, 50)}..."`);
    }

    console.log(`🎉 ${footerContent.length} footer fields seeded successfully!`);
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
