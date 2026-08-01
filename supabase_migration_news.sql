-- ============================================================
-- NEWS & NEWS FETCH LOGS TABLES - SUPABASE MIGRATION
-- ============================================================

-- 1. Create news table for storing background fetched news
CREATE TABLE IF NOT EXISTS news (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    country_id UUID REFERENCES countries(id) ON DELETE CASCADE NOT NULL,
    category VARCHAR(50) DEFAULT 'General' NOT NULL, -- Standard values: Science, Technology, Health, Environment, Economy, General, Statmatik
    title TEXT NOT NULL,
    link TEXT UNIQUE NOT NULL,
    source VARCHAR(255),
    snippet TEXT,
    published_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Ensure category column exists if news table was already created
ALTER TABLE news ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'General' NOT NULL;

-- Index for fast lookup by country, category, and publication date
CREATE INDEX IF NOT EXISTS idx_news_country_id ON news(country_id);
CREATE INDEX IF NOT EXISTS idx_news_category ON news(category);
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news(published_at DESC);

-- 2. Create news_fetch_logs table for tracking execution logs
CREATE TABLE IF NOT EXISTS news_fetch_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    countries_scanned INTEGER DEFAULT 0 NOT NULL,
    news_found INTEGER DEFAULT 0 NOT NULL,
    news_inserted INTEGER DEFAULT 0 NOT NULL,
    news_skipped INTEGER DEFAULT 0 NOT NULL,
    status VARCHAR(50) DEFAULT 'success' NOT NULL,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Index for fast lookup of recent logs
CREATE INDEX IF NOT EXISTS idx_news_fetch_logs_created_at ON news_fetch_logs(created_at DESC);
