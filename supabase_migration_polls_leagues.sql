-- ============================================================
-- CUPMAT & MINMAT - PRIVATE LEAGUES AND POLLS/TRIVIA MIGRATION
-- ============================================================

-- 1. POLLS & TRIVIA QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.polls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question_tr TEXT NOT NULL,
    question_en TEXT NOT NULL,
    question_es TEXT,
    question_fr TEXT,
    question_de TEXT,
    question_pt TEXT,
    question_it TEXT,
    question_ko TEXT,
    question_ar TEXT,
    options JSONB NOT NULL, -- Format: [{"tr": "Option A", "en": "Option A", ...}, ...]
    correct_option_index INTEGER NOT NULL DEFAULT -1, -- -1 means opinion poll (any option yields points), >=0 means trivia correct index
    points_reward INTEGER DEFAULT 10 NOT NULL,
    active_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. POLL SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.poll_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
    selected_option_index INTEGER NOT NULL,
    is_correct BOOLEAN NOT NULL,
    points_awarded INTEGER NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(poll_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_poll_submissions_user_id ON public.poll_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_poll_submissions_poll_id ON public.poll_submissions(poll_id);

-- 3. PRIVATE LEAGUES TABLE
CREATE TABLE IF NOT EXISTS public.private_leagues (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    created_by TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
    join_code VARCHAR(10) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_private_leagues_created_by ON public.private_leagues(created_by);
CREATE INDEX IF NOT EXISTS idx_private_leagues_join_code ON public.private_leagues(join_code);

-- 4. PRIVATE LEAGUE MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.private_league_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    league_id UUID REFERENCES public.private_leagues(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(league_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_private_league_members_league_id ON public.private_league_members(league_id);
CREATE INDEX IF NOT EXISTS idx_private_league_members_user_id ON public.private_league_members(user_id);
