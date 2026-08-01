-- ============================================================
-- NEWS FILTERS TABLE & SEED DATA - SUPABASE MIGRATION
-- ============================================================

CREATE TABLE IF NOT EXISTS news_filters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    filter_type VARCHAR(50) NOT NULL CHECK (filter_type IN ('keyword', 'source')),
    filter_value TEXT UNIQUE NOT NULL,
    enabled BOOLEAN DEFAULT true NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Index for fast lookup of enabled filters
CREATE INDEX IF NOT EXISTS idx_news_filters_enabled ON news_filters(enabled);
CREATE INDEX IF NOT EXISTS idx_news_filters_type ON news_filters(filter_type);

-- Trigger for auto updating updated_at
DROP TRIGGER IF EXISTS update_news_filters_updated_at ON news_filters;
CREATE TRIGGER update_news_filters_updated_at
    BEFORE UPDATE ON news_filters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Seed initial filter records
INSERT INTO news_filters (filter_type, filter_value, enabled, description) VALUES
('source', 'Fotomaç', true, 'Spor gazetesi ve portalı'),
('source', 'Fanatik', true, 'Spor gazetesi ve portalı'),
('keyword', 'futbol', true, 'Futbol ile ilgili haber kısıtlaması'),
('keyword', 'maç', true, 'Maç sonuçları ve haber kısıtlaması'),
('keyword', 'gol', true, 'Gol haberleri kısıtlaması'),
('keyword', 'transfer', true, 'Transfer ve oyuncu haber kısıtlaması'),
('keyword', 'UEFA', true, 'UEFA haber kısıtlaması'),
('keyword', 'FIFA', true, 'FIFA haber kısıtlaması'),
('keyword', 'Süper Lig', true, 'Süper lig kısıtlaması'),
('keyword', 'Premier League', true, 'Premier league kısıtlaması'),
('keyword', 'Champions League', true, 'Şampiyonlar ligi kısıtlaması')
ON CONFLICT (filter_value) DO UPDATE SET
  enabled = EXCLUDED.enabled,
  filter_type = EXCLUDED.filter_type,
  description = EXCLUDED.description;
