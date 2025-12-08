const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');

puppeteer.use(StealthPlugin());

async function collectCarUrls() {
    console.log('Tarayıcı başlatılıyor...');
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--start-maximized'],
        defaultViewport: null
    });

    try {
        const page = await browser.newPage();
        const baseUrl = 'https://www.arabam.com/ikinci-el/otomobil-izmir?take=50';
        const allCarUrls = [];

        // 10 sayfa tarama
        for (let pageNum = 1; pageNum <= 50; pageNum++) {
            const url = pageNum === 1 ? baseUrl : `${baseUrl}?page=${pageNum}`;

            console.log(`\n[${pageNum}/50] Sayfa taranıyor: ${url}`);

            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Sayfadaki araç URL'lerini topla
            const carUrls = await page.evaluate(() => {
                const urls = [];
                // tr[id^="listing"] ile başlayan satırları bul
                const listings = document.querySelectorAll('tr[id^="listing"]');

                listings.forEach(listing => {
                    // Her listing içindeki ilk a href'i bul
                    const linkElement = listing.querySelector('a[href^="/ilan/"]');
                    if (linkElement) {
                        const href = linkElement.getAttribute('href');
                        if (href) {
                            urls.push('https://www.arabam.com' + href);
                        }
                    }
                });

                return urls;
            });

            console.log(`  ✓ ${carUrls.length} araç bulundu`);
            allCarUrls.push(...carUrls);

            // Her sayfayı yazdır
            carUrls.slice(0, 3).forEach((url, idx) => {
                console.log(`    ${idx + 1}. ${url}`);
            });
            if (carUrls.length > 3) {
                console.log(`    ... ve ${carUrls.length - 3} araç daha`);
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log(`TOPLAM ${allCarUrls.length} ARAÇ URL'Sİ TOPLANDI`);
        console.log('='.repeat(60));

        // JSON dosyasına kaydet
        const data = {
            toplam_arac: allCarUrls.length,
            tarih: new Date().toISOString(),
            sayfa_sayisi: 50,
            urls: allCarUrls
        };

        fs.writeFileSync('car_URLs.json', JSON.stringify(data, null, 2), 'utf-8');
        console.log('\n✓ Sonuçlar "car_URLs.json" dosyasına kaydedildi.');

    } catch (error) {
        console.error('Hata:', error);
    } finally {
        await browser.close();
    }
}

console.log('='.repeat(60));
console.log('İZMİR ARAÇ URL TOPLAMA');
console.log('='.repeat(60));

collectCarUrls().then(() => {
    console.log('\n✓ URL toplama tamamlandı!');
    process.exit(0);
}).catch(error => {
    console.error('Fatal:', error);
    process.exit(1);
});
