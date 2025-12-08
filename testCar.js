const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');

puppeteer.use(StealthPlugin());

async function testCars() {
    console.log('Tarayıcı başlatılıyor...');
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--start-maximized'],
        defaultViewport: null
    });

    try {
        const page = await browser.newPage();

        // car_Urls.json'dan URL'leri oku
        const carUrlsData = JSON.parse(fs.readFileSync('car_Urls.json', 'utf-8'));
        const testUrls = carUrlsData.urls; // Tüm URL'leri al

        const carsData = [];

        for (let i = 0; i < testUrls.length; i++) {
            const url = testUrls[i];
            console.log(`\n[${i + 1}/${testUrls.length}] ${url}`);

            await page.goto(url, { waitUntil: 'networkidle2', timeout: 90000 });
            await new Promise(resolve => setTimeout(resolve, 8000));

            const carData = await page.evaluate((url) => {
                const data = { url: url };

                // .property-item yapısından tüm verileri çek
                const tempData = {};
                const propertyItems = document.querySelectorAll('.property-item');

                propertyItems.forEach(item => {
                    const keyElement = item.querySelector('.property-key');
                    const valueElement = item.querySelector('.property-value');

                    if (keyElement && valueElement) {
                        let key = keyElement.textContent.trim();
                        let value = valueElement.textContent.trim();

                        key = key.replace(/[\n\r\t]+/g, ' ').replace(/\s+/g, ' ').trim();
                        value = value.replace(/[\n\r\t]+/g, ' ').replace(/\s+/g, ' ').trim();

                        // Kopyalandı yazısını temizle
                        value = value.replace('Kopyalandı', '').trim();

                        if (key && value) {
                            tempData[key] = value;
                        }
                    }
                });

                // Sıralı yapı
                data['İlan No'] = tempData['İlan No'] || null;
                data['İlan Tarihi'] = tempData['İlan Tarihi'] || null;

                // Lokasyon bilgisi (ilçe ve il - mahalle olmadan)
                data.ilce = null;
                data.il = null;

                const locationSpan = document.querySelector('.product-location span');
                if (locationSpan) {
                    const locationText = locationSpan.textContent.trim();
                    // "Halkapınar Mh. Konak, İzmir" formatından sadece "Konak, İzmir" kısmını al
                    // Son virgülden sonrası il, virgülden önceki son kelime ilçe
                    const parts = locationText.split(',');
                    if (parts.length >= 2) {
                        data.il = parts[parts.length - 1].trim(); // Son kısım: İzmir
                        // İlçe için virgülden önceki kısmın son kelimesini al
                        const beforeComma = parts[parts.length - 2].trim();
                        // "Halkapınar Mh. Konak" -> "Konak" (son kelime)
                        const words = beforeComma.split(/\s+/);
                        data.ilce = words[words.length - 1];
                    }
                }

                // Fiyat - birden fazla kaynaktan dene
                data.fiyat = null;

                // 1. Fiyat class'larından
                const priceElements = document.querySelectorAll('.price, [class*="price"], .product-price');
                for (let el of priceElements) {
                    const text = el.textContent.trim();
                    const match = text.match(/(\d{1,3}(?:\.\d{3})*)\s*(?:TL|₺)/i);
                    if (match) {
                        data.fiyat = match[1] + ' TL';
                        break;
                    }
                }

                // 2. Başlıktan
                if (!data.fiyat) {
                    const titleElement = document.querySelector('h1');
                    if (titleElement) {
                        const titleText = titleElement.textContent.trim();
                        const priceMatch = titleText.match(/(\d{1,3}(?:\.\d{3})*)\s*(?:TL|₺)/i);
                        if (priceMatch) {
                            data.fiyat = priceMatch[1] + ' TL';
                        }
                    }
                }

                // 3. Tüm sayfada ara (son çare)
                if (!data.fiyat) {
                    const bodyText = document.body.textContent;
                    const priceMatches = bodyText.match(/(\d{3}\.\d{3})\s*TL/g);
                    if (priceMatches && priceMatches.length > 0) {
                        // İlk bulduğu fiyat genelde doğrudur
                        data.fiyat = priceMatches[0];
                    }
                }

                data.Marka = tempData['Marka'] || null;
                data.Seri = tempData['Seri'] || null;
                data.Model = tempData['Model'] || null;
                data.Yıl = tempData['Yıl'] || null;
                data.Kilometre = tempData['Kilometre'] || null;
                data['Vites Tipi'] = tempData['Vites Tipi'] || null;
                data['Yakıt Tipi'] = tempData['Yakıt Tipi'] || null;
                data['Kasa Tipi'] = tempData['Kasa Tipi'] || null;
                data.Renk = tempData['Renk'] || null;
                data['Motor Hacmi'] = tempData['Motor Hacmi'] || null;
                data['Motor Gücü'] = tempData['Motor Gücü'] || null;
                data.Çekiş = tempData['Çekiş'] || null;
                data['Araç Durumu'] = tempData['Araç Durumu'] || null;
                data['Ort. Yakıt Tüketimi'] = tempData['Ort. Yakıt Tüketimi'] || null;
                data['Yakıt Deposu'] = tempData['Yakıt Deposu'] || null;
                data['Boya-değişen'] = tempData['Boya-değişen'] || null;
                data['Takasa Uygun'] = tempData['Takasa Uygun'] || null;
                data.Kimden = tempData['Kimden'] || null;

                // Hasar bilgileri
                data.hasar_bilgileri = {
                    boya: { orjinal: 0, lokal_boyali: 0, boyali: 0, degismis: 0 },
                    degisen: { degismis: 0 },
                    tramer: { detay: 'Belirtilmemiş', kayit_var: false },
                    parcalar: []
                };

                try {
                    const scripts = document.querySelectorAll('script');
                    let damageData = null;

                    for (let script of scripts) {
                        const scriptText = script.textContent;
                        if (scriptText.includes('window.damage')) {
                            const match = scriptText.match(/window\.damage\s*=\s*(\[.*?\]);/s);
                            if (match) {
                                damageData = JSON.parse(match[1]);
                                break;
                            }
                        }
                    }

                    if (damageData && Array.isArray(damageData)) {
                        damageData.forEach(part => {
                            data.hasar_bilgileri.parcalar.push({
                                ad: part.Name,
                                durum: part.ValueDescription
                            });

                            const value = parseInt(part.Value);
                            if (value === 1) data.hasar_bilgileri.boya.orjinal++;
                            else if (value === 2) {
                                data.hasar_bilgileri.boya.degismis++;
                                data.hasar_bilgileri.degisen.degismis++;
                            }
                            else if (value === 3) data.hasar_bilgileri.boya.boyali++;
                            else if (value === 4) data.hasar_bilgileri.boya.lokal_boyali++;
                        });
                    }
                } catch (e) {
                    console.error('Hasar parse hatası:', e);
                }

                return data;
            }, url);

            carsData.push(carData);

            console.log(`✓ Marka: ${carData.Marka} ${carData.Model}`);
            console.log(`  Yıl: ${carData.Yıl} | KM: ${carData.Kilometre} | Fiyat: ${carData.fiyat}`);
            console.log(`  Vites: ${carData['Vites Tipi']} | Yakıt: ${carData['Yakıt Tipi']}`);
            console.log(`  Lokasyon: ${carData.ilce}, ${carData.il}`);
        }

        console.log('\n' + '='.repeat(60));
        console.log('TEST TAMAMLANDI');
        console.log('='.repeat(60));

        fs.writeFileSync('test-5-cars-result.json', JSON.stringify(carsData, null, 2), 'utf-8');
        console.log('\n✓ Sonuçlar "test-5-cars-result.json" dosyasına kaydedildi.');

        console.log('\n=== İLK ARAÇ DETAYI ===');
        console.log(JSON.stringify(carsData[0], null, 2));

    } catch (error) {
        console.error('Hata:', error);
    } finally {
        await browser.close();
    }
}

console.log('='.repeat(60));
console.log('5 ARAÇ TEST');
console.log('='.repeat(60));

testCars().then(() => {
    console.log('\n✓ Test bitti!');
    process.exit(0);
}).catch(error => {
    console.error('Fatal:', error);
    process.exit(1);
});
