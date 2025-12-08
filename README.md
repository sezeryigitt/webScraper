# Web Scraper - Arabam.com

Arabam.com sitesinden araç bilgilerini otomatik olarak çekip JSON dosyasına kaydeden web scraper.

## Kurulum

```bash
npm install
```

## Kullanım

### 1. URL'leri Topla
```bash
node collectCarUrl.js
```
Bu komut `car_Urls.json` dosyasını oluşturacak ve araç URL'lerini kaydedecek.

### 2. Test Et (5 araç ile)
```bash
node testCar.js
```
`car_Urls.json` dosyasındaki tüm URL'leri test edecek ve sonuçları JSON formatında kaydedecek.

## Çıktı Dosyaları

- `car_Urls.json` - Toplanan araç URL'leri
- `test-5-cars-result.json` - Test sonuçları (JSON format)
- `testCarResults.csv` - Test sonuçları (CSV format)

## Gereksinimler

- Node.js 14+
- Internet bağlantısı

## Notlar

- Scraper Puppeteer kullanmaktadır
- Her URL için 8 saniye bekleme süresi vardır
- Tarayıcı headless modda çalışmaz (görüntü açık kalacak)
