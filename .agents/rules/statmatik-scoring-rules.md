# StatMatik Puanlama ve Oyunlaştırma (Gamification) Sistemi

Bu belge, StatMatik ekosistemindeki (MinMat, MinLan, NewsGlo) oyun ve etkinliklerin puanlama mantığını ve ödül sistemlerini açıklamaktadır.

## 1. Genel Puanlama ve "Taraftar Puanı" Sistemi
Kullanıcıların site içindeki etkileşimleri "Taraftar Puanı" (ve mevcut periyot puanı) olarak birikir.
- **Günlük Giriş:** +10 Taraftar Puanı ve +2 saniye MinMat Ek Süresi.
- **Aktif Katılım (Sayfada Kalma / Keşif):** +10 Puan ve +2 saniye MinMat Ek Süresi (Aynı sayfadan günlük maksimum 5 kez alınabilir, 2 saat bekleme süresi vardır).
- **Yardım / Hakkında Tıklama:** +5 Puan (Günde 1 kez).

**Periyot (Dönem) Sistemi:** Liderlik tablosu her 72 saatte (3 günde) bir sıfırlanır. Dönem birincileri kalıcı olarak "Geçmiş Şampiyonlar" (Hall of Fame) listesine eklenir ve diğer oyunlarda avantaj sağlayan bonuslar kazanır.

## 2. MinMat (Matematik Oyunu) Puanlaması
- Puanlar matematiksel işlemin doğruluğuna ve hızına göre hesaplanır.
- **Bölüm (Level):** Bölüm ilerledikçe kazanılan taban puan artar.
- **Zaman Bonusu:** Hızlı cevaplar ekstra çarpan (combo) puanı getirir.
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
