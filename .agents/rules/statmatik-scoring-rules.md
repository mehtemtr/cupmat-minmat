# StatMatik Puanlama ve Oyunlaştırma (Gamification) Sistemi

Bu belge, StatMatik ekosistemindeki (MinMat, MinLan, CupMat, NewsGlo) oyun ve etkinliklerin puanlama mantığını ve ödül sistemlerini açıklamaktadır.

## 1. Genel Puanlama ve "Taraftar Puanı" Sistemi
Kullanıcıların site içindeki etkileşimleri "Taraftar Puanı" (ve mevcut periyot puanı) olarak birikir.
- **Günlük Giriş:** +10 Taraftar Puanı ve +2 saniye MinMat Ek Süresi.
- **Aktif Katılım (Sayfada Kalma / Keşif):** +10 Puan ve +2 saniye MinMat Ek Süresi (Aynı sayfadan günlük maksimum 5 kez alınabilir, 2 saat bekleme süresi vardır).
- **Yardım / Hakkında Tıklama:** +5 Puan (Günde 1 kez).
- **Futbolcu Keşif (Scout):** +3 Puan.
- **Anket Cevaplama:** +10 Puan.

**Periyot (Dönem) Sistemi:** Liderlik tablosu her 72 saatte (3 günde) bir sıfırlanır. Dönem birincileri kalıcı olarak "Geçmiş Şampiyonlar" (Hall of Fame) listesine eklenir ve diğer oyunlarda avantaj sağlayan bonuslar kazanır (Örn: CupMat şampiyonlarına MinMat'ta ek süre, MinMat şampiyonlarına CupMat'ta ekstra tahmin hakkı ve global puan).

## 2. MinMat (Matematik Oyunu) Puanlaması
- Puanlar matematiksel işlemin doğruluğuna ve hızına göre hesaplanır.
- **Bölüm (Level):** Bölüm ilerledikçe kazanılan taban puan artar.
- **Zaman Bonusu:** Hızlı cevaplar ekstra çarpan (combo) puanı getirir.
- **Oyun Sonu:** Oyuncunun dönem içinde yaptığı *en yüksek skor* liderlik tablosuna yansır (kümülatif değil, "High Score" mantığı).

## 3. MinLan (Dil ve Hafıza Oyunu) Puanlaması
- Eşleştirme tabanlı hafıza oyunu.
- **Taban Puan:** Doğru eşleşme başına 100 puan.
- **Seri (Combo) Bonusu:** Arka arkaya doğru eşleştirme yapmak (yanlış yapmadan) ekstra puan (+20 * Seri Sayısı) kazandırır.
- **Can / Süre Ödülleri:** Art arda 4, 7 ve 9 doğru eşleşme ekstra +1 Can verir. Maksimum cana (5) ulaşılmışsa +5 saniye süre ve +500 puan bonus verir.
- **Zaman Bonusu:** Eşleşme yapıldığında kalan süreye (timeLeft * 5) bağlı olarak ekstra puan eklenir.
- **Yanlış Eşleşme:** Doğru eşleşme yapıldığında yanlış sayacı (mistakes) sıfırlanır. Peş peşe 3 yanlış yapmak 1 can kaybına neden olur.

## 4. CupMat (Futbol Tahmin) Puanlaması
Maç skorlarını doğru tahmin etmeye dayalı sistem:
- **Tam Skor Tahmini:** Maçın sonucunu ve tam skorunu (örn: 2-1) doğru bilmek maksimum puanı kazandırır.
- **Sonuç Tahmini:** Skoru tam tutturamayıp sadece kazananı/beraberliği doğru bilmek daha düşük bir teselli puanı kazandırır.
- **Tahmin Güncelleme Hakkı:** Kullanıcılar tahminlerini sonradan değiştirmek için "Tahmin Güncelleme Hakkı"na ihtiyaç duyar. Bu haklar genel sistem puanlarından veya dönem birinciliklerinden kazanılır.
