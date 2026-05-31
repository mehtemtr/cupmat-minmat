-- Run this script in your Supabase SQL Editor (https://supabase.com dashboard):

ALTER TABLE public.team_rosters 
ADD COLUMN IF NOT EXISTS birth_place VARCHAR(100);
