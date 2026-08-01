-- ==========================================
-- SUPABASE MIGRATION: MINLAN TABLES
-- ==========================================

-- 1. MinLan Categories Table
CREATE TABLE IF NOT EXISTS minlan_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(50) UNIQUE NOT NULL,
  name_tr VARCHAR(100) NOT NULL,
  icon VARCHAR(50) DEFAULT '🔤',
  tier INT DEFAULT 1 NOT NULL, -- 1: Open, 2: Countdown, 3: Coming Soon, 4: Secret Mystery
  unlock_requirement_level INT DEFAULT 1,
  countdown_target_date TIMESTAMP WITH TIME ZONE,
  display_order INT DEFAULT 0,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. MinLan Words Table (9 Languages + Frequency Order 1 to 100)
CREATE TABLE IF NOT EXISTS minlan_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES minlan_categories(id) ON DELETE CASCADE,
  word_order INT DEFAULT 1 NOT NULL, -- 1 to 100 frequency rank
  lang_tr VARCHAR(255) NOT NULL,
  lang_en VARCHAR(255) NOT NULL,
  lang_de VARCHAR(255) NOT NULL,
  lang_fr VARCHAR(255) NOT NULL,
  lang_es VARCHAR(255) NOT NULL,
  lang_zh VARCHAR(255) NOT NULL,
  lang_ja VARCHAR(255) NOT NULL,
  lang_ru VARCHAR(255) NOT NULL,
  lang_ar VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. MinLan User Progress Table
CREATE TABLE IF NOT EXISTS minlan_user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  category_id UUID REFERENCES minlan_categories(id) ON DELETE CASCADE,
  native_lang VARCHAR(10) DEFAULT 'tr' NOT NULL,
  target_lang VARCHAR(10) DEFAULT 'en' NOT NULL,
  current_level INT DEFAULT 1 NOT NULL,
  max_round_reached INT DEFAULT 1 NOT NULL,
  total_matches_count INT DEFAULT 0 NOT NULL,
  total_score INT DEFAULT 0 NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, category_id, native_lang, target_lang)
);

-- 4. MinLan Community Global Stats Table
CREATE TABLE IF NOT EXISTS minlan_community_stats (
  id INT PRIMARY KEY DEFAULT 1,
  total_card_matches BIGINT DEFAULT 18420 NOT NULL,
  target_card_matches BIGINT DEFAULT 25000 NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Default Community Stats Row
INSERT INTO minlan_community_stats (id, total_card_matches, target_card_matches)
VALUES (1, 18420, 25000)
ON CONFLICT (id) DO NOTHING;
