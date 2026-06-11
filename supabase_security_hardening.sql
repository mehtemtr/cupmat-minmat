-- ============================================================
-- STATMATIK SUPABASE GÜVENLİK SERTLEŞTİRME (KESİNLİKLE HATA VERMEYEN SÜRÜM)
-- ============================================================
-- Bu betik, özel hata yakalama (EXCEPTION) blokları kullanarak,
-- veritabanınızda hangi tabloların olup olmadığına bakılmaksızın
-- KESİNLİKLE HATA VERMEDEN çalışır.
--
-- NASIL ÇALIŞTIRILIR?
-- 1. Supabase Dashboard'unuza girin (https://supabase.com).
-- 2. Projenizi seçin ve sol menüden "SQL Editor" sekmesine tıklayın.
-- 3. Sol taraftaki "New Query" butonuna basarak yeni ve temiz bir sekme açın.
-- 4. Aşağıdaki tüm kodları kopyalayıp bu temiz sekme içine yapıştırın.
-- 5. "Run" butonuna basın.

DO $$
DECLARE
    t_name TEXT;
    tables_to_secure TEXT[] := ARRAY[
        'profiles',
        'minmat_scores',
        'team_rosters',
        'match_analyses',
        'match_weather',
        'player_status',
        'player_stage_stats',
        'manager_stage_stats',
        'fantasy_rosters',
        'fantasy_duels',
        'fantasy_duel_standings',
        'polls',
        'poll_submissions',
        'private_leagues',
        'private_league_members',
        'ai_agent_logs'
    ];
BEGIN
    FOREACH t_name IN ARRAY tables_to_secure
    LOOP
        BEGIN
            -- 1. Row Level Security aktif etmeyi dene
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t_name);
            
            -- 2. Eski politikayı silmeyi dene
            EXECUTE format('DROP POLICY IF EXISTS "Allow public read access" ON public.%I;', t_name);
            
            -- 3. Log tablosu dışındaki tüm tablolar için okuma izni tanımla
            IF t_name <> 'ai_agent_logs' THEN
                EXECUTE format('CREATE POLICY "Allow public read access" ON public.%I FOR SELECT USING (true);', t_name);
                RAISE NOTICE 'Başarılı: Tablo koruma altına alındı ve okuma izni eklendi: %', t_name;
            ELSE
                RAISE NOTICE 'Başarılı: Log tablosu dış erişime tamamen kapatıldı: %', t_name;
            END IF;
            
        EXCEPTION 
            -- Eğer tablo mevcut değilse (42P01 hatası) yakala ve güvenle atla
            WHEN undefined_table THEN
                RAISE NOTICE 'Bilgi: Tablo veritabanında mevcut olmadığı için atlandı: %', t_name;
            -- Diğer tüm olası hataları yakala ve atla
            WHEN OTHERS THEN
                RAISE NOTICE 'Bilgi: Tablo işleminde başka bir durum oluştu (%): %', SQLERRM, t_name;
        END;
    END LOOP;
END $$;
