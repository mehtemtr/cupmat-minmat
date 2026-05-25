-- ============================================================
-- AKILLI DÜNYA KUPASI YAPAY ZEKA AJANI - SUPABASE MIGRATION
-- ============================================================

-- 1. TAKIM KADROLARI TABLOSU (ROSTER TABLE)
CREATE TABLE IF NOT EXISTS team_rosters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id TEXT NOT NULL,
    player_name TEXT NOT NULL,
    player_position TEXT,
    player_number INTEGER,
    is_captain BOOLEAN DEFAULT false,
    date_of_birth DATE,
    club TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, player_name)
);

CREATE INDEX IF NOT EXISTS idx_team_rosters_team_id ON team_rosters(team_id);

-- 2. MAÇ ANALİZLERİ TABLOSU (MATCH ANALYSIS TABLE)
CREATE TABLE IF NOT EXISTS match_analyses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id TEXT NOT NULL UNIQUE,
    home_team_id TEXT,
    away_team_id TEXT,
    match_date TIMESTAMP WITH TIME ZONE,
    
    -- TAHMİN YÜZDELERİ
    prediction_home_win REAL DEFAULT 33.33,
    prediction_draw REAL DEFAULT 33.33,
    prediction_away_win REAL DEFAULT 33.33,
    predicted_scoreline TEXT,
    
    -- DİNAMİK VERİLER
    weather_data JSONB,
    injury_data JSONB,
    suspension_data JSONB,
    geopolitical_data JSONB,
    
    -- YAPAY ZEKA YORUMU
    ai_commentary_tr TEXT,
    ai_commentary_en TEXT,
    ai_commentary_es TEXT,
    ai_commentary_fr TEXT,
    ai_commentary_de TEXT,
    
    -- METADATA
    analysis_confidence REAL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_match_analyses_match_id ON match_analyses(match_id);
CREATE INDEX IF NOT EXISTS idx_match_analyses_match_date ON match_analyses(match_date);

-- 3. HAVA DURUMU VERİLERİ TABLOSU (WEATHER TABLE)
CREATE TABLE IF NOT EXISTS match_weather (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id TEXT NOT NULL,
    city TEXT,
    temperature REAL,
    condition TEXT,
    wind_speed REAL,
    humidity REAL,
    precipitation_chance REAL,
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(match_id, fetched_at)
);

CREATE INDEX IF NOT EXISTS idx_match_weather_match_id ON match_weather(match_id);

-- 4. OYUNCU DURUMU TABLOSU (PLAYER STATUS)
CREATE TABLE IF NOT EXISTS player_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_name TEXT NOT NULL,
    team_id TEXT,
    status TEXT NOT NULL, -- 'fit', 'injured', 'suspended'
    injury_type TEXT,
    expected_return DATE,
    suspension_reason TEXT,
    suspension_matches INTEGER,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(player_name, team_id)
);

CREATE INDEX IF NOT EXISTS idx_player_status_team_id ON player_status(team_id);
CREATE INDEX IF NOT EXISTS idx_player_status_status ON player_status(status);

-- 5. AJAN ÇALIŞMA KAYDI TABLOSU (AGENT LOG)
CREATE TABLE IF NOT EXISTS ai_agent_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_name TEXT NOT NULL,
    task_type TEXT NOT NULL, -- 'roster_update', 'prediction', 'commentary'
    status TEXT NOT NULL, -- 'success', 'failed', 'partial'
    items_processed INTEGER DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_ms INTEGER
);

CREATE INDEX IF NOT EXISTS idx_ai_agent_logs_task_type ON ai_agent_logs(task_type);
CREATE INDEX IF NOT EXISTS idx_ai_agent_logs_status ON ai_agent_logs(status);
CREATE INDEX IF NOT EXISTS idx_ai_agent_logs_started_at ON ai_agent_logs(started_at);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) - İSTEĞE BAĞLI (GÜVENLİK)
-- ============================================================

-- ALTER TABLE team_rosters ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE match_analyses ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE match_weather ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE player_status ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE ai_agent_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- GUNCELLEME TRIGGERLARI (AUTO-UPDATED AT)
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- team_rosters için trigger
CREATE TRIGGER update_team_rosters_updated_at 
    BEFORE UPDATE ON team_rosters 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- player_status için trigger
CREATE TRIGGER update_player_status_updated_at 
    BEFORE UPDATE ON player_status 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
