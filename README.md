# 1. Alanya Mahalle Ligi

Dr. Ali Nazım Köseoğlu Sezonu web sitesi: gruplar, canlı puan durumu, fikstür, gol ve asist krallığı, kart istatistikleri, takım kadroları, final yolu ve yönetici paneli.

Site tek bir `index.html` dosyasıdır (kaynak parçaları `src/` altında; düzenledikten sonra `python src/build.py` ile birleştirilir) ve GitHub Pages'te çalışır. Sonuçlar ve oyuncular Firebase Firestore'da tutulur; yönetici girişi Firebase Authentication (e-posta + şifre) ile yapılır.

## Dosyalar

| Dosya | Görevi |
|---|---|
| `index.html` | Sitenin tamamı |
| `firebase-config.js` | Firebase bağlantı ayarları ve yönetici e-postaları |
| `firestore.rules` | Veritabanı güvenlik kuralları (herkes okur, sadece yönetici yazar) |

## Firebase kurulumu (bir kez, ~5 dakika)

1. https://console.firebase.google.com adresinde **Proje ekle** ile yeni proje açın (Google Analytics gerekmez).
2. **Build > Firestore Database > Create database** ile veritabanını oluşturun. Konum olarak `eur3 (europe-west)` seçilebilir, **production mode** ile başlayın.
3. **Firestore > Rules** sekmesine `firestore.rules` dosyasının içeriğini yapıştırın, `admin@ornek.com` yerine yönetici e-postalarını yazın, **Publish** deyin.
4. **Build > Authentication > Get started > Email/Password**'ü açın.
5. **Authentication > Users > Add user** ile yönetici hesabını (e-posta + şifre) oluşturun.
6. **Authentication > Settings > User actions** altında **Enable create (sign-up)** seçeneğini kapatın; böylece siteden kimse yeni hesap açamaz.
7. **Authentication > Settings > Authorized domains** listesine `KULLANICI-ADI.github.io` adresini ekleyin.
8. **Proje ayarları > Genel > Uygulamalarınız > Web (</>)** ile bir web uygulaması ekleyin, verilen `firebaseConfig` değerlerini `firebase-config.js` dosyasına yapıştırın ve `admins` listesine aynı yönetici e-postalarını yazın.

## GitHub Pages

Repo ayarlarında **Settings > Pages > Source: Deploy from a branch**, branch `main`, klasör `/ (root)` seçin. Site birkaç dakika içinde `https://KULLANICI-ADI.github.io/REPO-ADI/` adresinde yayına girer.

## Veri modeli

- `matches/{id}`: grup maçları `g-YYYY-MM-DD-sıra` (sıra 0–3 → 19:30, 20:40, 21:50, 23:00), eleme maçları `KO-M1`…`KO-M8`, `KO-CF1`…`KO-CF4`, `KO-YF1`, `KO-YF2`, `KO-F`, `KO-3`. Alanlar: `played`, `hs`, `as`, `ev` (olaylar: `t` G/OG/Y/R, `s` h/a, `p` oyuncu id, `m` dakika, `as` asist oyuncu id); eleme maçlarında ayrıca `h`, `a`, `pen`.
- `players/{id}`: `team`, `name`, `no`, `pos`.

Firebase ayarlanmadan da site açılır; fikstür, gruplar ve final yolu görünür, sonuç girişi kapalı kalır.

## Hesap türleri

- **Yönetici** (UID'si `firebase-config.js` ve `firestore.rules` içinde): maç sonuçları, olaylar, duyurular, tüm kadrolar, takım hesabı onayları.
- **Takım hesabı**: Sitedeki "Giriş > Takım hesabı oluştur" ile açılır ve `requests/{uid}` başvurusu oluşturur. Yönetici "Takım hesapları" sekmesinden onaylayınca `managers/{uid}` kaydı oluşur; bu hesap yalnızca kendi mahallesinin oyuncularını, fotoğraflarını, logosunu ve takım bilgilerini düzenleyebilir.

Fotoğraflar ve logolar tarayıcıda 320 piksel kareye küçültülüp `photos/{oyuncuId}` ve `logos/{takım}` belgelerinde JPEG olarak saklanır (Firebase Storage gerekmez).
