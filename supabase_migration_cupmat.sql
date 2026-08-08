-- CupMat (StatMatik) Match Center Tables

-- 1. Tournaments Table
CREATE TABLE IF NOT EXISTS public.cupmat_tournaments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    api_id INTEGER UNIQUE NOT NULL, -- API-Football league ID (e.g. 2 for UCL, 3 for UEL)
    name VARCHAR(255) NOT NULL, -- "UEFA Champions League"
    type VARCHAR(50), -- "Cup"
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Matches Table
CREATE TABLE IF NOT EXISTS public.cupmat_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    api_id INTEGER UNIQUE NOT NULL, -- API-Football fixture ID
    tournament_id UUID REFERENCES public.cupmat_tournaments(id) ON DELETE CASCADE,
    season INTEGER NOT NULL, -- e.g., 2026
    round VARCHAR(255), -- e.g., "Group Stage - 1", "Semi-finals"
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50), -- e.g., "FT", "NS", "PEN"
    venue_name VARCHAR(255),
    
    -- Home Team
    home_team_id INTEGER NOT NULL,
    home_team_name VARCHAR(255) NOT NULL,
    home_team_logo TEXT,
    home_score INTEGER,
    home_penalty_score INTEGER,
    home_is_winner BOOLEAN,
    
    -- Away Team
    away_team_id INTEGER NOT NULL,
    away_team_name VARCHAR(255) NOT NULL,
    away_team_logo TEXT,
    away_score INTEGER,
    away_penalty_score INTEGER,
    away_is_winner BOOLEAN,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_cupmat_matches_tournament ON public.cupmat_matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_cupmat_matches_date ON public.cupmat_matches(date DESC);
CREATE INDEX IF NOT EXISTS idx_cupmat_matches_season ON public.cupmat_matches(season);

-- RLS Policies
ALTER TABLE public.cupmat_tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cupmat_matches ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access for cupmat_tournaments" 
ON public.cupmat_tournaments FOR SELECT USING (true);

CREATE POLICY "Allow public read access for cupmat_matches" 
ON public.cupmat_matches FOR SELECT USING (true);

-- Allow service role full access (for cron job insertions)
CREATE POLICY "Allow service role full access for cupmat_tournaments" 
ON public.cupmat_tournaments FOR ALL USING (true);

CREATE POLICY "Allow service role full access for cupmat_matches" 
ON public.cupmat_matches FOR ALL USING (true);
