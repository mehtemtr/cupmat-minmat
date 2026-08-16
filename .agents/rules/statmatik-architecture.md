# StatMatik Projesi Temel Mimari ve Kuralları

Bu proje için geliştirme yaparken aşağıdaki değişmez kurallara uyulması zorunludur:

## 1. Temel İletişim Kuralları
- **Dil:** Kullanıcı ile BÜTÜN etkileşimlerde (açıklamalar, onay pencereleri, sorular, modal seçenekleri) sadece **Türkçe** kullanılacaktır. Sistemden kaynaklı İngilizce uyarılar mümkün olduğunca önlenecek, zorunlu ise kullanıcıya sebebini Türkçe açıklayarak belirtilecektir.

## 2. Altyapı ve Sunucu
- **Platform:** Proje Vercel DEĞİL, **Cloudflare Pages ve Cloudflare Workers** üzerinde barındırılmaktadır. 
- **Zaman Aşımı (Timeout) Hassasiyeti:** Cloudflare'in katı CPU ve çalışma süresi limitleri vardır. Supabase veya dış API (API-Football) çağrılarında döngü içinde (`for`) tek tek `await` ile sıralı (sequential) veritabanı isteği ATILAMAZ. Mutlaka `.in()` ile toplu veri çekilmeli ve `Promise.all` ile paralel işlemler (batch) yapılmalıdır.
- **Cron Görevleri:** Zamanlanmış görevler `wrangler.json` üzerinden ayarlanır ve `app/api/cron/` içerisindeki rotaları tetikler.

## 3. Modüller (4 Ana Sütun)
Proje `app/page.tsx` üzerinde 4 ana karttan (2x2 grid) oluşan bir ekosistemdir:
1. **MinMat:** Matematik ağırlıklı, puanlamalı zeka ve hız oyunu.
2. **MinLan:** Dil öğrenme, kelime pratiği ve eğitim modülü.
3. **CupMat:** Başta Şampiyonlar Ligi, Libertadores, UEFA Avrupa Ligi olmak üzere global futbol kupa maçlarının skorlarını anlık takip eden modül. Skorlar API-Football'dan otomatik çekilir.
4. **NewsGlo:** Futbol dünyasından güncel haberlerin çekildiği haberleşme ağı.

## 4. Teknik Yapı ve i18n
- **Framework:** Next.js (App Router), Tailwind CSS.
- **Veritabanı:** Supabase (PostgreSQL). Bağlantılar `lib/supabase.ts` dosyasındaki `supabaseAdmin` üzerinden yapılır.
- **Çoklu Dil (9 Dil):** Proje 9 dili destekler (TR, EN, DE, FR, ES, PT, AR, KO, IT). Çeviriler `dictionaries/` altında tutulur, `contexts/LocaleContext.tsx` ile dağıtılır. Çeviri fonksiyonu `t("anahtar")` şeklindedir.
- **Oyunlaştırma (Gamification):** Kullanıcının sitede kalma süresi, yardım menülerini okuması, skor takibi gibi eylemleri "Taraftar Puanı"na çevrilerek kullanıcıyı teşvik eden bir altyapı vardır.

## 5. Görsellik ve UI
- Alt menüler (`BottomNavbar.tsx`), "Daha Fazla" çekmecesi (Drawer) ve Header statik logoları, standart ikonlar yerine daima projeye özgü resimli logolar (`/minmat/icon.png`, `/logo_s_clean.png` vb.) kullanılarak tasarlanmıştır. Bu görsellik bozulmamalıdır.
