-- ============================================================
-- CUPMAT FANTEZİ KADRO LİGİ & DÜELLO SİSTEMİ - SUPABASE MIGRATION
-- ============================================================

-- 1. OYUNCULARIN AŞAMALIK PERFORMANS İSTATİSTİKLERİ (PLAYER STAGE STATS)
CREATE TABLE IF NOT EXISTS player_stage_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_id UUID REFERENCES team_rosters(id) ON DELETE CASCADE,
    stage TEXT NOT NULL, -- e.g. 'matchday_1', 'matchday_2', 'matchday_3', 'round_of_32', 'round_of_16', 'quarter_finals', 'semi_finals', 'finals'
    goals INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    yellow_cards INTEGER DEFAULT 0,
    red_cards INTEGER DEFAULT 0,
    clean_sheet BOOLEAN DEFAULT false,
    minutes_played INTEGER DEFAULT 0,
    team_result TEXT DEFAULT 'draw', -- 'win', 'draw', 'loss'
    goals_conceded INTEGER DEFAULT 0,
    goal_difference INTEGER DEFAULT 0,
    own_goals INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    penalty_saved INTEGER DEFAULT 0,
    penalty_missed INTEGER DEFAULT 0,
    penalty_earned INTEGER DEFAULT 0,
    penalty_conceded INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(player_id, stage)
);

CREATE INDEX IF NOT EXISTS idx_player_stage_stats_player_id ON player_stage_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_player_stage_stats_stage ON player_stage_stats(stage);

-- 2. TEKNİK DİREKTÖRLERİN AŞAMALIK İSTATİSTİKLERİ (MANAGER STAGE STATS)
CREATE TABLE IF NOT EXISTS manager_stage_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    manager_id TEXT NOT NULL, -- e.g. 'tur', 'bra' (country code representing the manager)
    stage TEXT NOT NULL,
    result TEXT DEFAULT 'draw', -- 'win', 'draw', 'loss'
    goal_difference INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(manager_id, stage)
);

CREATE INDEX IF NOT EXISTS idx_manager_stage_stats_manager_id ON manager_stage_stats(manager_id);
CREATE INDEX IF NOT EXISTS idx_manager_stage_stats_stage ON manager_stage_stats(stage);

-- 3. KULLANICILARIN FANTEZİ KADROLARI (FANTASY ROSTERS)
CREATE TABLE IF NOT EXISTS fantasy_rosters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT, -- Clerk user_id
    team_name TEXT NOT NULL,
    stage TEXT NOT NULL,
    formation VARCHAR(10) NOT NULL DEFAULT '4-4-2',
    starters JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of player UUIDs
    bench JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of bench player UUIDs
    manager_id TEXT, -- Country code representing the selected national team manager
    points INTEGER DEFAULT 0,
    transfers_made INTEGER DEFAULT 0,
    team_index INTEGER DEFAULT 1, -- Can build up to 4 teams depending on MinMat success
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, stage, team_index)
);

CREATE INDEX IF NOT EXISTS idx_fantasy_rosters_user_id ON fantasy_rosters(user_id);
CREATE INDEX IF NOT EXISTS idx_fantasy_rosters_stage ON fantasy_rosters(stage);

-- 4. İKİLİ DÜELLO MAÇLARI (FANTASY DUELS)
CREATE TABLE IF NOT EXISTS fantasy_duels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stage TEXT NOT NULL,
    roster_id_1 UUID REFERENCES fantasy_rosters(id) ON DELETE CASCADE,
    roster_id_2 UUID REFERENCES fantasy_rosters(id) ON DELETE CASCADE,
    user_id_1 TEXT, -- Can be NULL for bots
    user_id_2 TEXT, -- Can be NULL for bots
    score_1 INTEGER DEFAULT 0,
    score_2 INTEGER DEFAULT 0,
    result VARCHAR(10), -- 'win_1', 'win_2', 'draw' or NULL if match is in progress
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fantasy_duels_stage ON fantasy_duels(stage);
CREATE INDEX IF NOT EXISTS idx_fantasy_duels_roster_id_1 ON fantasy_duels(roster_id_1);
CREATE INDEX IF NOT EXISTS idx_fantasy_duels_roster_id_2 ON fantasy_duels(roster_id_2);

-- 5. DÜELLO LİGİ PUAN DURUMU (FANTASY DUEL STANDINGS)
CREATE TABLE IF NOT EXISTS fantasy_duel_standings (
    user_id TEXT PRIMARY KEY, -- Clerk user_id
    nickname TEXT NOT NULL,
    played INTEGER DEFAULT 0,
    won INTEGER DEFAULT 0,
    drawn INTEGER DEFAULT 0,
    lost INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    total_roster_points INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fantasy_duel_standings_points ON fantasy_duel_standings(points DESC, total_roster_points DESC);
