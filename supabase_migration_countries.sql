-- ============================================================
-- COUNTRIES TABLE & SEED DATA - SUPABASE MIGRATION
-- ============================================================

-- Create countries table if not exists
CREATE TABLE IF NOT EXISTS countries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    iso2 VARCHAR(10) UNIQUE,
    iso3 VARCHAR(10) UNIQUE,
    name_tr VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    short_name_tr VARCHAR(255) NOT NULL,
    short_name_en VARCHAR(255) NOT NULL,
    population BIGINT,
    flag_url TEXT,
    play_store_enabled BOOLEAN DEFAULT true NOT NULL,
    news_enabled BOOLEAN DEFAULT false NOT NULL,
    simulation_enabled BOOLEAN DEFAULT false NOT NULL,
    priority INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Index for fast lookup by code
CREATE INDEX IF NOT EXISTS idx_countries_iso2 ON countries(iso2);
CREATE INDEX IF NOT EXISTS idx_countries_iso3 ON countries(iso3);

-- Recreate trigger function if needed
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if it exists and recreate
DROP TRIGGER IF EXISTS update_countries_updated_at ON countries;
CREATE TRIGGER update_countries_updated_at
    BEFORE UPDATE ON countries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Seed data for countries

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('DE', 'DEU', 'Almanya Federal Cumhuriyeti', 'Federal Republic of Germany', 'Almanya', 'Germany', 83517030, '🇩🇪', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('US', 'USA', 'Amerika Birleşik Devletleri', 'United States of America', 'Amerika Birleşik Devletleri', 'United States', 340110988, '🇺🇸', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('AO', 'AGO', 'Angola Cumhuriyeti', 'Republic of Angola', 'Angola', 'Angola', 36170961, '🇦🇴', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('AG', 'ATG', 'Antigua ve Barbuda', 'Antigua and Barbuda', 'Antigua ve Barbuda', 'Antigua and Barbuda', 103603, '🇦🇬', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('AR', 'ARG', 'Arjantin Cumhuriyeti', 'Argentine Republic', 'Arjantin', 'Argentina', 46735004, '🇦🇷', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('AL', 'ALB', 'Arnavutluk Cumhuriyeti', 'Republic of Albania', 'Arnavutluk', 'Albania', 2363314, '🇦🇱', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('AW', 'ABW', 'Aruba', 'Aruba', 'Aruba', 'Aruba', 107566, '🇦🇼', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('AU', 'AUS', 'Avustralya Federal Devleti', 'Commonwealth of Australia', 'Avustralya', 'Australia', 27400013, '🇦🇺', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('AT', 'AUT', 'Avusturya Cumhuriyeti', 'Republic of Austria', 'Avusturya', 'Austria', 9200931, '🇦🇹', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('AZ', 'AZE', 'Azerbaycan Cumhuriyeti', 'Republic of Azerbaijan', 'Azerbaycan', 'Azerbaijan', 10241722, '🇦🇿', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('BS', 'BHS', 'Bahama Milletler Topluluğu', 'Commonwealth of the Bahamas', 'Bahamalar', 'Bahamas', 398165, '🇧🇸', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('BH', 'BHR', 'Bahreyn Krallığı', 'Kingdom of Bahrain', 'Bahreyn', 'Bahrain', 1594654, '🇧🇭', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('BD', 'BGD', 'Bangladeş Halk Cumhuriyeti', 'People''s Republic of Bangladesh', 'Bangladeş', 'Bangladesh', 169828911, '🇧🇩', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('BY', 'BLR', 'Belarus Cumhuriyeti', 'Republic of Belarus', 'Belarus', 'Belarus', 9109280, '🇧🇾', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('BE', 'BEL', 'Belçika Krallığı', 'Kingdom of Belgium', 'Belçika', 'Belgium', 11825551, '🇧🇪', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('BZ', 'BLZ', 'Belize', 'Belize', 'Belize', 'Belize', 417634, '🇧🇿', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('BJ', 'BEN', 'Benin Cumhuriyeti', 'Republic of Benin', 'Benin', 'Benin', 13224860, '🇧🇯', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('BM', 'BMU', 'Bermuda', 'Bermuda', 'Bermuda', 'Bermuda', 64055, '🇧🇲', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('AE', 'ARE', 'Birleşik Arap Emirlikleri', 'United Arab Emirates', 'Birleşik Arap Emirlikleri', 'United Arab Emirates', 10678556, '🇦🇪', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('GB', 'GBR', 'Büyük Britanya ve Kuzey İrlanda Birleşik Krallığı', 'United Kingdom of Great Britain and Northern Ireland', 'Birleşik Krallık', 'United Kingdom', 68265209, '🇬🇧', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('BO', 'BOL', 'Bolivya çokuluslu Devleti', 'Plurinational State of Bolivia', 'Bolivya', 'Bolivia', 11312620, '🇧🇴', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('BA', 'BIH', 'Bosna ve Hersek', 'Bosnia and Herzegovina', 'Bosna-Hersek', 'Bosnia and Herzegovina', 3422000, '🇧🇦', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('BW', 'BWA', 'Botsvana Cumhuriyeti', 'Republic of Botswana', 'Botsvana', 'Botswana', 2359609, '🇧🇼', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('BR', 'BRA', 'Brezilya Federal Cumhuriyeti', 'Federative Republic of Brazil', 'Brezilya', 'Brazil', 213421037, '🇧🇷', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('VG', 'VGB', 'Virjin Adaları', 'Virgin Islands', 'Virjin Adaları', 'British Virgin Islands', 39471, '🇻🇬', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('BG', 'BGR', 'Bulgaristan Cumhuriyeti', 'Republic of Bulgaria', 'Bulgaristan', 'Bulgaria', 6437360, '🇧🇬', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('BF', 'BFA', 'Burkina Faso', 'Burkina Faso', 'Burkina Faso', 'Burkina Faso', 24070553, '🇧🇫', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('CV', 'CPV', 'Yeşil Burun Cumhuriyeti', 'Republic of Cabo Verde', 'Yeşil Burun', 'Cape Verde', 491233, '🇨🇻', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('KY', 'CYM', 'Cayman Adaları', 'Cayman Islands', 'Cayman Adaları', 'Cayman Islands', 84738, '🇰🇾', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('GI', 'GIB', 'Cebelitarık', 'Gibraltar', 'Cebelitarık', 'Gibraltar', 38000, '🇬🇮', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('DZ', 'DZA', 'Cezayir Demokratik Halk Cumhuriyeti', 'People''s Democratic Republic of Algeria', 'Cezayir', 'Algeria', 47400000, '🇩🇿', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('DJ', 'DJI', 'Cibuti Cumhuriyeti', 'Republic of Djibouti', 'Cibuti', 'Djibouti', 1066809, '🇩🇯', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('CI', 'CIV', 'Fildişi Sahili', 'Republic of Côte d''Ivoire', 'Fildişi Sahili', 'Ivory Coast', 29389150, '🇨🇮', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('TD', 'TCD', 'çad Cumhuriyeti', 'Republic of Chad', 'çad', 'Chad', 19340757, '🇹🇩', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('CZ', 'CZE', 'çek Cumhuriyeti', 'Czech Republic', 'çekya', 'Czechia', 10876875, '🇨🇿', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('CN', 'CHN', 'çin Halk Cumhuriyeti', 'People''s Republic of China', 'çin', 'China', 1408280000, '🇨🇳', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('DK', 'DNK', 'Danimarka Krallığı', 'Kingdom of Denmark', 'Danimarka', 'Denmark', 6004342, '🇩🇰', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('DO', 'DOM', 'Dominik Cumhuriyeti', 'Dominican Republic', 'Dominik Cumhuriyeti', 'Dominican Republic', 10771504, '🇩🇴', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('DM', 'DMA', 'Dominika Topluluğu', 'Commonwealth of Dominica', 'Dominika', 'Dominica', 67408, '🇩🇲', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('EC', 'ECU', 'Ekvador Cumhuriyeti', 'Republic of Ecuador', 'Ekvador', 'Ecuador', 18103660, '🇪🇨', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('SV', 'SLV', 'El Salvador Cumhuriyeti', 'Republic of El Salvador', 'El Salvador', 'El Salvador', 6029976, '🇸🇻', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('ID', 'IDN', 'Endonezya Cumhuriyeti', 'Republic of Indonesia', 'Endonezya', 'Indonesia', 284438782, '🇮🇩', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('ER', 'ERI', 'Eritre Devleti', 'State of Eritrea', 'Eritre', 'Eritrea', 3607000, '🇪🇷', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('AM', 'ARM', 'Ermenistan Cumhuriyeti', 'Republic of Armenia', 'Ermenistan', 'Armenia', 3081100, '🇦🇲', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('EE', 'EST', 'Estonya Cumhuriyeti', 'Republic of Estonia', 'Estonya', 'Estonia', 1369995, '🇪🇪', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('MA', 'MAR', 'Fas Krallığı', 'Kingdom of Morocco', 'Fas', 'Morocco', 36828330, '🇲🇦', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('FJ', 'FJI', 'Fiji Cumhuriyeti', 'Republic of Fiji', 'Fiji', 'Fiji', 900869, '🇫🇯', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('PH', 'PHL', 'Filipinler Cumhuriyeti', 'Republic of the Philippines', 'Filipinler', 'Philippines', 114123600, '🇵🇭', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('PS', 'PSE', 'Filistin Devleti', 'State of Palestine', 'Filistin', 'Palestine', 5483450, '🇵🇸', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('FI', 'FIN', 'Finlandiya Cumhuriyeti', 'Republic of Finland', 'Finlandiya', 'Finland', 5645651, '🇫🇮', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('FR', 'FRA', 'Fransa Cumhuriyeti', 'French Republic', 'Fransa', 'France', 68688000, '🇫🇷', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('GA', 'GAB', 'Gabon Cumhuriyeti', 'Gabonese Republic', 'Gabon', 'Gabon', 2469296, '🇬🇦', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('GM', 'GMB', 'Gambiya Cumhuriyeti', 'Republic of the Gambia', 'Gambiya', 'Gambia', 2422712, '🇬🇲', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('GH', 'GHA', 'Gana Cumhuriyeti', 'Republic of Ghana', 'Gana', 'Ghana', 33742380, '🇬🇭', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('GN', 'GIN', 'Gine Cumhuriyeti', 'Republic of Guinea', 'Gine', 'Guinea', 14363931, '🇬🇳', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('GW', 'GNB', 'Gine-Bissau Cumhuriyeti', 'Republic of Guinea-Bissau', 'Gine-Bissau', 'Guinea-Bissau', 1781308, '🇬🇼', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('GD', 'GRD', 'Grenada', 'Grenada', 'Grenada', 'Grenada', 109021, '🇬🇩', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('GT', 'GTM', 'Guatemala Cumhuriyeti', 'Republic of Guatemala', 'Guatemala', 'Guatemala', 18079810, '🇬🇹', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('ZA', 'ZAF', 'Güney Afrika Cumhuriyeti', 'Republic of South Africa', 'Güney Afrika', 'South Africa', 63100945, '🇿🇦', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

-- Insert or update Güney Kıbrıs Rum Yönetimi (No ISO code)
INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
SELECT NULL, NULL, 'Güney Kıbrıs Rum Yönetimi', 'Greek Cypriot Administration', 'GKRY', 'GCA', 1251500, '🇨🇾', true, false, false, 0
WHERE NOT EXISTS (
    SELECT 1 FROM countries WHERE name_tr = 'Güney Kıbrıs Rum Yönetimi'
);

UPDATE countries SET
  name_en = 'Greek Cypriot Administration',
  short_name_tr = 'GKRY',
  short_name_en = 'GCA',
  population = 1251500,
  flag_url = '🇨🇾'
WHERE name_tr = 'Güney Kıbrıs Rum Yönetimi';

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('KR', 'KOR', 'Kore Cumhuriyeti', 'Republic of Korea', 'Güney Kore', 'South Korea', 51159889, '🇰🇷', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('GE', 'GEO', 'Gürcistan', 'Georgia', 'Gürcistan', 'Georgia', 3704500, '🇬🇪', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('HT', 'HTI', 'Haiti Cumhuriyeti', 'Republic of Haiti', 'Haiti', 'Haiti', 11867032, '🇭🇹', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('HR', 'HRV', 'Hırvatistan Cumhuriyeti', 'Republic of Croatia', 'Hırvatistan', 'Croatia', 3866233, '🇭🇷', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('IN', 'IND', 'Hindistan Cumhuriyeti', 'Republic of India', 'Hindistan', 'India', 1417492000, '🇮🇳', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('NL', 'NLD', 'Hollanda Krallığı', 'Kingdom of the Netherlands', 'Hollanda', 'Netherlands', 18080943, '🇳🇱', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('HN', 'HND', 'Honduras Cumhuriyeti', 'Republic of Honduras', 'Honduras', 'Honduras', 9892632, '🇭🇳', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('HK', 'HKG', 'çin Halk Cumhuriyeti Hong Kong özel İdari Bölgesi', 'Hong Kong Special Administrative Region of the People''s Republic of China', 'Hong Kong', 'Hong Kong', 7527500, '🇭🇰', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('IQ', 'IRQ', 'Irak Cumhuriyeti', 'Republic of Iraq', 'Irak', 'Iraq', 46118793, '🇮🇶', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('IR', 'IRN', 'İran İslam Cumhuriyeti', 'Islamic Republic of Iran', 'İran', 'Iran', 85961000, '🇮🇷', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('IE', 'IRL', 'İrlanda Cumhuriyeti', 'Republic of Ireland', 'İrlanda', 'Ireland', 5458600, '🇮🇪', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('ES', 'ESP', 'İspanya Krallığı', 'Kingdom of Spain', 'İspanya', 'Spain', 49315949, '🇪🇸', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('SE', 'SWE', 'İsveç Krallığı', 'Kingdom of Sweden', 'İsveç', 'Sweden', 10596652, '🇸🇪', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('CH', 'CHE', 'İsviçre Konfederasyonu', 'Swiss Confederation', 'İsviçre', 'Switzerland', 9082848, '🇨🇭', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('IT', 'ITA', 'İtalya Cumhuriyeti', 'Italian Republic', 'İtalya', 'Italy', 58919230, '🇮🇹', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('IS', 'ISL', 'İzlanda', 'Iceland', 'İzlanda', 'Iceland', 391810, '🇮🇸', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('JM', 'JAM', 'Jamaika', 'Jamaica', 'Jamaika', 'Jamaica', 2825544, '🇯🇲', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('JP', 'JPN', 'Japonya', 'Japan', 'Japonya', 'Japan', 123300000, '🇯🇵', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('KH', 'KHM', 'Kamboçya Krallığı', 'Kingdom of Cambodia', 'Kamboçya', 'Cambodia', 17577760, '🇰🇭', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('CM', 'CMR', 'Kamerun Cumhuriyeti', 'Republic of Cameroon', 'Kamerun', 'Cameroon', 29442327, '🇨🇲', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('CA', 'CAN', 'Kanada', 'Canada', 'Kanada', 'Canada', 41548787, '🇨🇦', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('QA', 'QAT', 'Katar Devleti', 'State of Qatar', 'Katar', 'Qatar', 3173024, '🇶🇦', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('KZ', 'KAZ', 'Kazakistan Cumhuriyeti', 'Republic of Kazakhstan', 'Kazakistan', 'Kazakhstan', 20407844, '🇰🇿', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('KE', 'KEN', 'Kenya Cumhuriyeti', 'Republic of Kenya', 'Kenya', 'Kenya', 53330978, '🇰🇪', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('KG', 'KGZ', 'Kırgız Cumhuriyeti', 'Kyrgyz Republic', 'Kırgızistan', 'Kyrgyzstan', 7281800, '🇰🇬', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('CO', 'COL', 'Kolombiya Cumhuriyeti', 'Republic of Colombia', 'Kolombiya', 'Colombia', 53057212, '🇨🇴', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('KM', 'COM', 'Komorlar Birliği', 'Union of the Comoros', 'Komorlar', 'Comoros', 870038, '🇰🇲', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('CG', 'COG', 'Kongo Cumhuriyeti', 'Republic of the Congo', 'Kongo Cumhuriyeti', 'Congo', 6142180, '🇨🇬', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('CD', 'COD', 'Kongo Demokratik Cumhuriyeti', 'Democratic Republic of the Congo', 'Kongo Demokratik Cumhuriyeti', 'DR Congo', 112832000, '🇨🇩', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('CR', 'CRI', 'Kosta Rika Cumhuriyeti', 'Republic of Costa Rica', 'Kosta Rika', 'Costa Rica', 5309625, '🇨🇷', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('KW', 'KWT', 'Kuveyt Devleti', 'State of Kuwait', 'Kuveyt', 'Kuwait', 4881254, '🇰🇼', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

-- Insert or update Kuzey Kıbrıs Türk Cumhuriyeti (No ISO code)
INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
SELECT NULL, NULL, 'Kuzey Kıbrıs Türk Cumhuriyeti', 'Turkish Republic of Northern Cyprus', 'KKTC', 'TRNC', 382230, '/flags/kktc.svg', true, false, false, 0
WHERE NOT EXISTS (
    SELECT 1 FROM countries WHERE name_tr = 'Kuzey Kıbrıs Türk Cumhuriyeti'
);

UPDATE countries SET
  name_en = 'Turkish Republic of Northern Cyprus',
  short_name_tr = 'KKTC',
  short_name_en = 'TRNC',
  population = 382230,
  flag_url = '/flags/kktc.svg'
WHERE name_tr = 'Kuzey Kıbrıs Türk Cumhuriyeti';

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('MK', 'MKD', 'Kuzey Makedonya Cumhuriyeti', 'Republic of North Macedonia', 'Kuzey Makedonya', 'North Macedonia', 1826247, '🇲🇰', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('CU', 'CUB', 'Küba Cumhuriyeti', 'Republic of Cuba', 'Küba', 'Cuba', 9748007, '🇨🇺', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('LA', 'LAO', 'Laos Demokratik Halk Cumhuriyeti', 'Lao People''s Democratic Republic', 'Laos', 'Laos', 7647000, '🇱🇦', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('LV', 'LVA', 'Letonya Cumhuriyeti', 'Republic of Latvia', 'Letonya', 'Latvia', 1830400, '🇱🇻', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('LR', 'LBR', 'Liberya Cumhuriyeti', 'Republic of Liberia', 'Liberya', 'Liberia', 5248621, '🇱🇷', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('LY', 'LBY', 'Libya Devleti', 'State of Libya', 'Libya', 'Libya', 7459000, '🇱🇾', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('LI', 'LIE', 'Lihtenştayn Prensliği', 'Principality of Liechtenstein', 'Lihtenştayn', 'Liechtenstein', 40900, '🇱🇮', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('LT', 'LTU', 'Litvanya Cumhuriyeti', 'Republic of Lithuania', 'Litvanya', 'Lithuania', 2894548, '🇱🇹', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('LB', 'LBN', 'Lübnan Cumhuriyeti', 'Lebanese Republic', 'Lübnan', 'Lebanon', 5490000, '🇱🇧', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('LU', 'LUX', 'Lüksemburg Büyük Dükalığı', 'Grand Duchy of Luxembourg', 'Lüksemburg', 'Luxembourg', 681973, '🇱🇺', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('HU', 'HUN', 'Macaristan', 'Hungary', 'Macaristan', 'Hungary', 9539502, '🇭🇺', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('MO', 'MAC', 'çin Halk Cumhuriyeti Makao özel İdari Bölgesi', 'Macao Special Administrative Region of the People''s Republic of China', 'Makao', 'Macau', 685900, '🇲🇴', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('MV', 'MDV', 'Maldivler Cumhuriyeti', 'Republic of the Maldives', 'Maldivler', 'Maldives', 515132, '🇲🇻', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('MY', 'MYS', 'Malezya', 'Malaysia', 'Malezya', 'Malaysia', 34231700, '🇲🇾', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('ML', 'MLI', 'Mali Cumhuriyeti', 'Republic of Mali', 'Mali', 'Mali', 22395489, '🇲🇱', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('MT', 'MLT', 'Malta Cumhuriyeti', 'Republic of Malta', 'Malta', 'Malta', 574250, '🇲🇹', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('MU', 'MUS', 'Mauritius Cumhuriyeti', 'Republic of Mauritius', 'Mauritius', 'Mauritius', 1243741, '🇲🇺', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('MX', 'MEX', 'Birleşik Meksika Devletleri', 'United Mexican States', 'Meksika', 'Mexico', 130575786, '🇲🇽', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('EG', 'EGY', 'Mısır Arap Cumhuriyeti', 'Arab Republic of Egypt', 'Mısır', 'Egypt', 107271260, '🇪🇬', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('FM', 'FSM', 'Mikronezya Federal Devletleri', 'Federated States of Micronesia', 'Mikronezya', 'Micronesia', 105564, '🇫🇲', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('MN', 'MNG', 'Moğolistan', 'Mongolia', 'Moğolistan', 'Mongolia', 3544835, '🇲🇳', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('MD', 'MDA', 'Moldova Cumhuriyeti', 'Republic of Moldova', 'Moldova', 'Moldova', 2381300, '🇲🇩', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('MC', 'MCO', 'Monako Prensliği', 'Principality of Monaco', 'Monako', 'Monaco', 38423, '🇲🇨', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('MZ', 'MOZ', 'Mozambik Cumhuriyeti', 'Republic of Mozambique', 'Mozambik', 'Mozambique', 34090466, '🇲🇿', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('MM', 'MMR', 'Myanmar Birliği Cumhuriyeti', 'Republic of the Union of Myanmar', 'Myanmar', 'Myanmar', 51316756, '🇲🇲', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('NA', 'NAM', 'Namibya Cumhuriyeti', 'Republic of Namibia', 'Namibya', 'Namibia', 3022401, '🇳🇦', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('NP', 'NPL', 'Nepal Federal Demokratik Cumhuriyeti', 'Federal Democratic Republic of Nepal', 'Nepal', 'Nepal', 29911840, '🇳🇵', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('NE', 'NER', 'Nijer Cumhuriyeti', 'Republic of Niger', 'Nijer', 'Niger', 26312034, '🇳🇪', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('NG', 'NGA', 'Nijerya Federal Cumhuriyeti', 'Federal Republic of Nigeria', 'Nijerya', 'Nigeria', 223800000, '🇳🇬', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('NI', 'NIC', 'Nikaragua Cumhuriyeti', 'Republic of Nicaragua', 'Nikaragua', 'Nicaragua', 6803886, '🇳🇮', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('NO', 'NOR', 'Norveç Krallığı', 'Kingdom of Norway', 'Norveç', 'Norway', 5606944, '🇳🇴', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('UZ', 'UZB', 'özbekistan Cumhuriyeti', 'Republic of Uzbekistan', 'özbekistan', 'Uzbekistan', 37859698, '🇺🇿', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('PK', 'PAK', 'Pakistan İslam Cumhuriyeti', 'Islamic Republic of Pakistan', 'Pakistan', 'Pakistan', 241499431, '🇵🇰', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('PA', 'PAN', 'Panama Cumhuriyeti', 'Republic of Panama', 'Panama', 'Panama', 4064780, '🇵🇦', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('PG', 'PNG', 'Papua Yeni Gine Bağımsız Devleti', 'Independent State of Papua New Guinea', 'Papua Yeni Gine', 'Papua New Guinea', 11781559, '🇵🇬', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('PY', 'PRY', 'Paraguay Cumhuriyeti', 'Republic of Paraguay', 'Paraguay', 'Paraguay', 6109644, '🇵🇾', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('PE', 'PER', 'Peru Cumhuriyeti', 'Republic of Peru', 'Peru', 'Peru', 34350244, '🇵🇪', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('PL', 'POL', 'Polonya Cumhuriyeti', 'Republic of Poland', 'Polonya', 'Poland', 37401000, '🇵🇱', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('PT', 'PRT', 'Portekiz Cumhuriyeti', 'Portuguese Republic', 'Portekiz', 'Portugal', 10749635, '🇵🇹', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('RO', 'ROU', 'Romanya', 'Romania', 'Romanya', 'Romania', 19036031, '🇷🇴', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('RW', 'RWA', 'Ruanda Cumhuriyeti', 'Republic of Rwanda', 'Ruanda', 'Rwanda', 14104969, '🇷🇼', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('RU', 'RUS', 'Rusya Federasyonu', 'Russian Federation', 'Rusya', 'Russia', 146028325, '🇷🇺', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('KN', 'KNA', 'Saint Kitts ve Nevis Federasyonu', 'Federation of Saint Christopher and Nevis', 'Saint Kitts ve Nevis', 'Saint Kitts and Nevis', 51320, '🇰🇳', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('LC', 'LCA', 'Saint Lucia', 'Saint Lucia', 'Saint Lucia', 'Saint Lucia', 184100, '🇱🇨', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('WS', 'WSM', 'Bağımsız Samoa Devleti', 'Independent State of Samoa', 'Bağımsız Samoa Devleti', 'Samoa', 205557, '🇼🇸', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('SM', 'SMR', 'San Marino Cumhuriyeti', 'Most Serene Republic of San Marino', 'San Marino', 'San Marino', 34132, '🇸🇲', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('SN', 'SEN', 'Senegal Cumhuriyeti', 'Republic of Senegal', 'Senegal', 'Senegal', 18593258, '🇸🇳', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('SC', 'SYC', 'Seyşeller Cumhuriyeti', 'Republic of Seychelles', 'Seyşeller', 'Seychelles', 122729, '🇸🇨', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('RS', 'SRB', 'Sırbistan Cumhuriyeti', 'Republic of Serbia', 'Sırbistan', 'Serbia', 6567783, '🇷🇸', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('SL', 'SLE', 'Sierra Leone Cumhuriyeti', 'Republic of Sierra Leone', 'Sierra Leone', 'Sierra Leone', 9077691, '🇸🇱', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('SG', 'SGP', 'Singapur Cumhuriyeti', 'Republic of Singapore', 'Singapur', 'Singapore', 6036900, '🇸🇬', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('SK', 'SVK', 'Slovak Cumhuriyeti', 'Slovak Republic', 'Slovakya', 'Slovakia', 5413813, '🇸🇰', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('SI', 'SVN', 'Slovenya Cumhuriyeti', 'Republic of Slovenia', 'Slovenya', 'Slovenia', 2130638, '🇸🇮', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('SB', 'SLB', 'Solomon Adaları', 'Solomon Islands', 'Solomon Adaları', 'Solomon Islands', 750325, '🇸🇧', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('SO', 'SOM', 'Somali Federal Cumhuriyeti', 'Federal Republic of Somalia', 'Somali', 'Somalia', 19655000, '🇸🇴', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('LK', 'LKA', 'Sri Lanka Demokratik Sosyalist Cumhuriyeti', 'Democratic Socialist Republic of Sri Lanka', 'Sri Lanka', 'Sri Lanka', 21763170, '🇱🇰', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('SD', 'SDN', 'Sudan Cumhuriyeti', 'Republic of the Sudan', 'Sudan', 'Sudan', 51662000, '🇸🇩', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('SR', 'SUR', 'Surinam Cumhuriyeti', 'Republic of Suriname', 'Surinam', 'Suriname', 616500, '🇸🇷', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('SA', 'SAU', 'Suudi Arabistan Krallığı', 'Kingdom of Saudi Arabia', 'Suudi Arabistan', 'Saudi Arabia', 35300280, '🇸🇦', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('CL', 'CHL', 'şili Cumhuriyeti', 'Republic of Chile', 'şili', 'Chile', 20206953, '🇨🇱', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('TJ', 'TJK', 'Tacikistan Cumhuriyeti', 'Republic of Tajikistan', 'Tacikistan', 'Tajikistan', 10499000, '🇹🇯', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('TZ', 'TZA', 'Tanzanya Birleşik Cumhuriyeti', 'United Republic of Tanzania', 'Tanzanya', 'Tanzania', 68153004, '🇹🇿', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('TH', 'THA', 'Tayland Krallığı', 'Kingdom of Thailand', 'Tayland', 'Thailand', 65859640, '🇹🇭', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('TW', 'TWN', 'çin Cumhuriyeti (Tayvan)', 'Republic of China (Taiwan)', 'Tayvan', 'Taiwan', 23337936, '🇹🇼', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('TG', 'TGO', 'Togo Cumhuriyeti', 'Togolese Republic', 'Togo', 'Togo', 8095498, '🇹🇬', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('TO', 'TON', 'Tonga Krallığı', 'Kingdom of Tonga', 'Tonga', 'Tonga', 100179, '🇹🇴', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('TT', 'TTO', 'Trinidad ve Tobago Cumhuriyeti', 'Republic of Trinidad and Tobago', 'Trinidad ve Tobago', 'Trinidad and Tobago', 1368333, '🇹🇹', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('TN', 'TUN', 'Tunus Cumhuriyeti', 'Tunisian Republic', 'Tunus', 'Tunisia', 11972169, '🇹🇳', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('TC', 'TCA', 'Turks ve Caicos Adaları', 'Turks and Caicos Islands', 'Turks ve Caicos Adaları', 'Turks and Caicos Islands', 50894, '🇹🇨', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('TR', 'TUR', 'Türkiye Cumhuriyeti', 'Republic of Türkiye', 'Türkiye', 'Türkiye', 85664944, '🇹🇷', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('TM', 'TKM', 'Türkmenistan', 'Turkmenistan', 'Türkmenistan', 'Turkmenistan', 7057841, '🇹🇲', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('UG', 'UGA', 'Uganda Cumhuriyeti', 'Republic of Uganda', 'Uganda', 'Uganda', 45905417, '🇺🇬', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('UA', 'UKR', 'Ukrayna', 'Ukraine', 'Ukrayna', 'Ukraine', 32862000, '🇺🇦', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('OM', 'OMN', 'Umman Sultanlığı', 'Sultanate of Oman', 'Umman', 'Oman', 5306976, '🇴🇲', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('UY', 'URY', 'Uruguay Doğu Cumhuriyeti', 'Oriental Republic of Uruguay', 'Uruguay', 'Uruguay', 3499451, '🇺🇾', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('JO', 'JOR', 'ürdün Hâşimi Krallığı', 'Hashemite Kingdom of Jordan', 'ürdün', 'Jordan', 11734000, '🇯🇴', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('VU', 'VUT', 'Vanuatu Cumhuriyeti', 'Republic of Vanuatu', 'Vanuatu', 'Vanuatu', 321409, '🇻🇺', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('VA', 'VAT', 'Vatikan şehir Devleti', 'Vatican City State', 'Vatikan', 'Vatican City', 882, '🇻🇦', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('VE', 'VEN', 'Bolivarcı Venezuela Cumhuriyeti', 'Bolivarian Republic of Venezuela', 'Venezuela', 'Venezuela', 28517000, '🇻🇪', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('VN', 'VNM', 'Vietnam Sosyalist Cumhuriyeti', 'Socialist Republic of Vietnam', 'Vietnam', 'Vietnam', 101343800, '🇻🇳', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('YE', 'YEM', 'Yemen Cumhuriyeti', 'Republic of Yemen', 'Yemen', 'Yemen', 32684503, '🇾🇪', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('NZ', 'NZL', 'Yeni Zelanda', 'New Zealand', 'Yeni Zelanda', 'New Zealand', 5324700, '🇳🇿', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('GR', 'GRC', 'Helen Cumhuriyeti', 'Hellenic Republic', 'Yunanistan', 'Greece', 10400720, '🇬🇷', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('ZM', 'ZMB', 'Zambiya Cumhuriyeti', 'Republic of Zambia', 'Zambiya', 'Zambia', 19693423, '🇿🇲', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;

INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES ('ZW', 'ZWE', 'Zimbabve Cumhuriyeti', 'Republic of Zimbabwe', 'Zimbabve', 'Zimbabwe', 17073087, '🇿🇼', true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;
