# 🕷️ Arabam.com Web Scraper

[![Node.js](https://img.shields.io/badge/Node.js-14+-green.svg)](https://nodejs.org/)
[![Puppeteer](https://img.shields.io/badge/Puppeteer-24.31.0-blue.svg)](https://pptr.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**İzmir bölgesindeki ikinci el araç ilanlarını otomatik olarak toplayan web scraper.**

Bu proje, arabam.com sitesinden İzmir bölgesindeki ikinci el araç ilanlarını Puppeteer kullanarak otomatik olarak toplar ve yapılandırılmış veri formatında (JSON/CSV) kaydeder. Toplanan veriler, makine öğrenmesi modelleri için veri seti oluşturmak amacıyla kullanılabilir.

---

## 📋 İçindekiler

- [Özellikler](#-özellikler)
- [Teknolojiler](#-teknolojiler)
- [Kurulum](#-kurulum)
- [Kullanım](#-kullanım)
- [Çıktı Dosyaları](#-çıktı-dosyaları)
- [Proje Yapısı](#-proje-yapısı)
- [Toplanan Veriler](#-toplanan-veriler)
- [Önemli Notlar](#-önemli-notlar)
- [İlgili Proje](#-i̇lgili-proje)
- [Katkıda Bulunma](#-katkıda-bulunma)
- [Lisans](#-lisans)

---

## ✨ Özellikler

- 🚀 **Otomatik Veri Toplama:** 50 sayfa boyunca araç ilanlarını otomatik tarar
- 🎯 **Detaylı Bilgi:** Her araç için 20+ farklı özellik toplar
- 🛡️ **Bot Tespiti Önleme:** Puppeteer Stealth plugin ile bot tespitini engeller
- 📊 **Çoklu Format:** JSON ve CSV formatlarında veri çıktısı
- 🔄 **İki Aşamalı Süreç:** URL toplama ve detay çekme ayrı scriptler
- ⏱️ **Rate Limiting:** Her istek arasında 8 saniye bekleme
- 🖥️ **Görsel Mod:** Headless olmayan mod ile süreç takibi

---

## 🛠 Teknolojiler

### Ana Kütüphaneler
- **[Puppeteer](https://pptr.dev/)** 24.31.0 - Headless Chrome automation
- **[Puppeteer Extra](https://github.com/berstend/puppeteer-extra)** 3.3.6 - Plugin sistemi
- **[Puppeteer Stealth Plugin](https://github.com/berstend/puppeteer-extra/tree/master/packages/puppeteer-extra-plugin-stealth)** 2.11.2 - Bot tespiti önleme

### Gereksinimler
- **Node.js** 14 veya üzeri
- **npm** 6 veya üzeri
- **İnternet bağlantısı**
- **Yeterli disk alanı** (~1 GB önerilir)

---

## 🔧 Kurulum

### 1. Projeyi Klonlayın

```bash
git clone https://github.com/kullaniciadi/webScraper.git
cd webScraper
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

Bu komut aşağıdaki paketleri yükleyecek:
- puppeteer (24.31.0)
- puppeteer-extra (3.3.6)
- puppeteer-extra-plugin-stealth (2.11.2)

---

## ▶️ Kullanım

### Adım 1: URL Toplama

İlk olarak, arabam.com'daki tüm araç ilanlarının URL'lerini toplayın:

```bash
node collectCarUrl.js
```

**Ne Yapar:**
- İzmir bölgesindeki araç ilanlarını tarar
- 50 sayfa boyunca tarama yapar
- Her sayfada ~50 araç ilanı bulur
- Toplam ~2,500 URL toplar
- Sonuçları `car_Urls.json` dosyasına kaydeder

**Çıktı Örneği:**
```
============================================================
İZMİR ARAÇ URL TOPLAMA
============================================================
Tarayıcı başlatılıyor...

[1/50] Sayfa taranıyor: https://www.arabam.com/ikinci-el/otomobil-izmir?take=50
  ✓ 50 araç bulundu
    1. https://www.arabam.com/ilan/...
    2. https://www.arabam.com/ilan/...
    3. https://www.arabam.com/ilan/...
    ... ve 47 araç daha

[2/50] Sayfa taranıyor: ...
...

============================================================
TOPLAM 2500 ARAÇ URL'Sİ TOPLANDI
============================================================

✓ Sonuçlar "car_URLs.json" dosyasına kaydedildi.
```

### Adım 2: Araç Detaylarını Çekme

Toplanan URL'lerden araç detaylarını çekin:

```bash
node testCar.js
```

**Ne Yapar:**
- `car_Urls.json` dosyasından URL'leri okur
- Her URL'yi ziyaret eder
- Araç detaylarını çeker
- Her istek arasında 8 saniye bekler
- Sonuçları JSON ve CSV formatında kaydeder

**Çıktı Örneği:**
```
============================================================
ARAÇ DETAY ÇEKME
============================================================

[1/2500] https://www.arabam.com/ilan/...
✓ Marka: Toyota Corolla
  Yıl: 2019 | KM: 85.000 km | Fiyat: 450.000 TL
  Vites: Manuel | Yakıt: Dizel
  Lokasyon: Bornova, İzmir

[2/2500] https://www.arabam.com/ilan/...
...
```

---

## 📦 Çıktı Dosyaları

### 1. `car_Urls.json`
URL toplama scriptinin çıktısı.

```json
{
  "toplam_arac": 2500,
  "tarih": "2026-01-03T20:00:00.000Z",
  "sayfa_sayisi": 50,
  "urls": [
    "https://www.arabam.com/ilan/...",
    "https://www.arabam.com/ilan/...",
    ...
  ]
}
```

### 2. `test-5-cars-result.json`
Araç detaylarının JSON formatı.

```json
[
  {
    "url": "https://www.arabam.com/ilan/...",
    "İlan No": "12345678",
    "İlan Tarihi": "01 Ocak 2026",
    "ilce": "Bornova",
    "il": "İzmir",
    "fiyat": "450.000 TL",
    "Marka": "Toyota",
    "Seri": "Corolla",
    "Model": "1.6 D-4D Advance",
    "Yıl": "2019",
    "Kilometre": "85.000 km",
    "Vites Tipi": "Manuel",
    "Yakıt Tipi": "Dizel",
    "Kasa Tipi": "Sedan",
    "Renk": "Beyaz",
    "Motor Hacmi": "1600 cc",
    "Motor Gücü": "116 hp",
    "Çekiş": "Önden Çekiş",
    "Araç Durumu": "İkinci El",
    "Ort. Yakıt Tüketimi": "5,2 lt",
    "Yakıt Deposu": "50 lt",
    "Takasa Uygun": "Takasa Uygun",
    "Kimden": "Sahibinden",
    "hasar_bilgileri": {
      "boya": {
        "orjinal": 10,
        "lokal_boyali": 2,
        "boyali": 1,
        "degismis": 0
      },
      "degisen": {
        "degismis": 0
      },
      "tramer": {
        "detay": "Belirtilmemiş",
        "kayit_var": false
      },
      "parcalar": [...]
    }
  }
]
```

### 3. `testCarResults.csv`
Araç detaylarının CSV formatı (Excel'de açılabilir).

**Boyut:** ~936 KB  
**Satır Sayısı:** ~2,500 araç

---

## 📂 Proje Yapısı

```
webScraper/
│
├── collectCarUrl.js          # URL toplama scripti
├── testCar.js                # Araç detay çekme scripti
├── package.json              # Node.js bağımlılıkları
├── package-lock.json         # Bağımlılık kilidi
├── .gitignore                # Git ignore kuralları
├── README.md                 # Bu dosya
│
├── car_Urls.json             # Toplanan URL'ler (çıktı)
├── test-5-cars-result.json   # Araç detayları JSON (çıktı)
└── testCarResults.csv        # Araç detayları CSV (çıktı)
```

---

## 📊 Toplanan Veriler

Her araç için aşağıdaki bilgiler toplanır:

| Kategori | Alanlar |
|----------|---------|
| **Temel Bilgiler** | URL, İlan No, İlan Tarihi |
| **Lokasyon** | İlçe, İl |
| **Fiyat** | Fiyat (TL) |
| **Araç Özellikleri** | Marka, Seri, Model, Yıl |
| **Teknik Özellikler** | Kilometre, Vites Tipi, Yakıt Tipi, Kasa Tipi |
| **Motor** | Motor Hacmi, Motor Gücü, Çekiş |
| **Yakıt** | Ort. Yakıt Tüketimi, Yakıt Deposu |
| **Diğer** | Renk, Araç Durumu, Kimden, Takasa Uygun |
| **Hasar Bilgileri** | Boya durumu, Değişen parçalar, Tramer kaydı |

**Toplam:** 20+ farklı özellik

---

## ⚠️ Önemli Notlar

### Etik Kullanım
- ⚖️ Bu proje **eğitim amaçlı** geliştirilmiştir
- 📜 Arabam.com'un **kullanım şartlarına** uygun davranılmalıdır
- 🚫 Ticari amaçla kullanılmamalıdır
- 🤝 Veriler yalnızca **akademik ve eğitim** amaçlı kullanılmalıdır

### Teknik Notlar
- ⏱️ **Rate Limiting:** Her istek arasında 8 saniye bekleme süresi vardır
- 🖥️ **Headless Mod:** Tarayıcı görsel modda çalışır (headless: false)
- 🔄 **Yeniden Deneme:** Hata durumunda script otomatik olarak durmaz
- 💾 **Disk Alanı:** ~1 GB boş alan önerilir
- 🌐 **İnternet:** Stabil internet bağlantısı gereklidir

### Performans
- **URL Toplama:** ~10-15 dakika (50 sayfa)
- **Detay Çekme:** ~5-6 saat (2,500 araç × 8 saniye)
- **Toplam Süre:** ~6 saat

### Sorun Giderme

#### Tarayıcı Açılmıyor
```bash
# Chromium'u manuel olarak yükleyin
npx puppeteer browsers install chrome
```

#### "Module not found" Hatası
```bash
# Bağımlılıkları yeniden yükleyin
rm -rf node_modules package-lock.json
npm install
```

#### Bot Tespiti
- Stealth plugin otomatik olarak çalışır
- Gerekirse bekleme sürelerini artırın
- VPN kullanmayı deneyin

---

## 🔗 İlgili Proje

Bu web scraper ile toplanan veriler, **İzmir İkinci El Araç Fiyat Tahmin Sistemi** projesinde kullanılmıştır:

**Repository:** [github.com/sezeryigitt/car-price-predictor](https://github.com/sezeryigitt/car-price-predictor)

Bu projede:
- Toplanan veriler temizlenir ve işlenir
- CatBoost ML modeli ile fiyat tahmini yapılır
- FastAPI backend ve React frontend ile web uygulaması sunulur
- %89 R² skoru ile yüksek doğrulukta tahminler yapılır

---

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Projeye katkıda bulunmak için:

1. **Fork** edin
2. Feature branch oluşturun:
   ```bash
   git checkout -b feature/YeniOzellik
   ```
3. Değişikliklerinizi commit edin:
   ```bash
   git commit -m 'feat: Yeni özellik eklendi'
   ```
4. Branch'inizi push edin:
   ```bash
   git push origin feature/YeniOzellik
   ```
5. **Pull Request** açın

### Geliştirme Fikirleri
- [ ] Farklı şehirler için destek
- [ ] Paralel scraping (çoklu tarayıcı)
- [ ] Hata yönetimi iyileştirmeleri
- [ ] Progress bar ekleme
- [ ] Otomatik CSV dönüşümü
- [ ] Database entegrasyonu
- [ ] Docker containerization

---

## 📝 Lisans

Bu proje **MIT Lisansı** altında lisanslanmıştır.

```
MIT License

Copyright (c) 2026 Arabam.com Web Scraper

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```


<div align="center">

**⚠️ Yasal Uyarı**

Bu araç eğitim amaçlıdır. Web scraping yaparken hedef sitenin kullanım şartlarına ve robots.txt dosyasına uygun davranmak kullanıcının sorumluluğundadır.

Made with ❤️ for Education

</div>
