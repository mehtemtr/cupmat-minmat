# StatMatik Puanlama ve Oyunlaştırma (Gamification) Sistemi

Bu belge, StatMatik ekosistemindeki (MinMat, MinLan, NewsGlo) oyun ve etkinliklerin puanlama mantığını ve ödül sistemlerini açıklamaktadır.

## 1. Genel Puanlama ve "Taraftar Puanı" Sistemi
Kullanıcıların site içindeki etkileşimleri "Taraftar Puanı" (ve mevcut periyot puanı) olarak birikir.
- **Günlük Giriş:** +10 Taraftar Puanı ve +2 saniye MinMat Ek Süresi.
- **Aktif Katılım (Sayfada Kalma / Keşif):** +10 Puan ve +2 saniye MinMat Ek Süresi (Aynı sayfadan günlük maksimum 5 kez alınabilir, 2 saat bekleme süresi vardır).
- **Yardım / Hakkında Tıklama:** +5 Puan (Günde 1 kez).

**Periyot (Dönem) Sistemi:** Liderlik tablosu her 72 saatte (3 günde) bir sıfırlanır. Dönem birincileri kalıcı olarak "Geçmiş Şampiyonlar" (Hall of Fame) listesine eklenir ve diğer oyunlarda avantaj sağlayan bonuslar kazanır.

## 2. MinMat (Sayı Avı) Puanlaması
- 4 işlem (Toplama, Çıkarma, Çarpma, Bölme) ve Karışık mod tabanlı hızlı matematik oyunu.
- **Taban Puan:** Oyun moduna göre değişir. Toplama: `10`, Çıkarma: `11`, Çarpma: `12`, Bölme: `13`, Karışık: `15`. Puan Formülü: `(Taban Puan + (Tur - 1) + Kombo) * 5`. Puanlar tur seviyesiyle birlikte artar.
- **Kart Sınırı ve Süre:** Kartlar her turda artar ve 16. turda maksimum **36 karta (18 eşleşme)** ulaşarak orada sabitlenir. Her eşleşme için oyuncuya yaklaşık `5 saniye` verilir, böylece maksimum kartta (36 kart) tur süresi 90 saniye tabanına (artı bonuslar) sabitlenir.
- **Seri (Combo) Bonusu:** Arka arkaya yanlışsız yapılan her eşleşme kombo sayacını artırır ve kazanılan puanı doğrudan katlar.
- **Can / Süre Ödülleri:** 4, 7 ve 9 kombolarda oyuncuya ekstra +1 Can verilir. Eğer can zaten maksimum (5) ise +123 Puan can bonusu kazanır.
- **Usta Bonusu (Logaritmik Dönüm Noktası):** Tıpkı MinLan gibi, kombolar bozulsada oyun boyunca yapılan toplam doğru eşleşme sayısı sayılır. 20, 50, 88, 132, 180 ve sonrasında her 50 eşleşmede bir Usta Bonusu kazanılır (Can < 5 ise **+1 Can**, Can = 5 ise **+10 Saniye ve 1000 Puan**).
- **Zaman / Tur Bonusu:** Tur tamamlandığında kalan sürenin yarısı sonraki tura devreder. Ayrıca 6. turdan itibaren tur tamamlandıkça (örneğin 9. turda +9 sn) ek süre bonusu verilir.
- **Taraftar Puanı (Periyot Puanı):** Puan tablosundaki (Leaderboard) derecelere göre oyuncular Periyot Puanı (Taraftar Puanı) kazanır.
- **Oyun Sonu:** Oyuncunun dönem içinde yaptığı *en yüksek skor* liderlik tablosuna yansır (kümülatif değil, "High Score" mantığı).

## 3. MinLan (Dil ve Hafıza Oyunu) Puanlaması
- Eşleştirme tabanlı hafıza oyunu.
- **Taban Puan:** Doğru eşleşme başına `100 + (Tur * 10)` formülüyle hesaplanan artan puan verilir.
- **Kart Sınırı ve Süre Eğrisi:** 1. turda 6 kartla başlar, her tur 2 kart artar. 10. turda maksimum **24 karta (12 eşleşme)** ulaşır ve kart sayısı sabitlenir. Başlangıçta artan süre, 11. turdan itibaren giderek azalarak (102, 101...96, 94...85...73) **25. turda 70 saniyede** (alt sınır) sabitlenir.
- **Seri (Combo) Bonusu:** Arka arkaya doğru eşleştirme yapmak (yanlış yapmadan) ekstra puan (+20 * Seri Sayısı) kazandırır.
- **Can / Süre Ödülleri:** Art arda 4, 7 ve 9 doğru eşleşme ekstra +1 Can verir. Maksimum cana (5) ulaşılmışsa +5 saniye süre ve +500 puan bonus verir.
- **Usta Bonusu (Logaritmik Dönüm Noktası):** Oyun boyunca kombolar kopsa bile toplam doğru eşleşme sayısı sayılır. Oyuncu sırasıyla 20, 50, 88, 132, 180 ve sonrasında her 50 eşleşmede bir büyük "Usta Bonusu" kazanır. (Canı <5 ise **+1 Can**, Canı = 5 ise **+10 saniye ve +1000 puan**).
- **Zaman Bonusu:** Eşleşme yapıldığında kalan süreye (timeLeft * 5) bağlı olarak ekstra puan eklenir. Tur bitince artan sürenin yarısı sonraki tura devreder.
- **Yanlış Eşleşme:** Doğru eşleşme yapıldığında yanlış sayacı (mistakes) sıfırlanır. Peş peşe 3 yanlış yapmak 1 can kaybına neden olur.
