-- Migration: Haberleri Öne Çıkarma (Featured News)
-- Description: Adds a 'featured_order' column to the 'news' table to allow manual ordering of news items.

ALTER TABLE public.news
ADD COLUMN featured_order integer;

-- İsteğe bağlı: Supabase üzerinden bu alana yorum eklemek isterseniz:
COMMENT ON COLUMN public.news.featured_order IS 'Haberleri öne çıkarmak için sıra numarası (örn. 1, 2, 3). Boş (NULL) ise normal tarihe göre sıralanır.';
