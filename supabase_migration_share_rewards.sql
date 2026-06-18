-- Add share_bonus_points column to fantasy_rosters table to track share rewards
ALTER TABLE fantasy_rosters ADD COLUMN IF NOT EXISTS share_bonus_points INTEGER DEFAULT 0;
