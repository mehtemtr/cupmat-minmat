-- ==============================================================================
-- CLEANUP SCRIPT: Eski Dünya Kupası & Fantasy Tablolarını Silme
-- ==============================================================================

DROP TABLE IF EXISTS public.fantasy_duel_standings CASCADE;
DROP TABLE IF EXISTS public.fantasy_duels CASCADE;
DROP TABLE IF EXISTS public.fantasy_rosters CASCADE;
DROP TABLE IF EXISTS public.manager_stage_stats CASCADE;
DROP TABLE IF EXISTS public.match_analyses CASCADE;
DROP TABLE IF EXISTS public.match_weather CASCADE;
DROP TABLE IF EXISTS public.player_stage_stats CASCADE;
DROP TABLE IF EXISTS public.player_status CASCADE;
DROP TABLE IF EXISTS public.private_league_members CASCADE;
DROP TABLE IF EXISTS public.private_leagues CASCADE;
DROP TABLE IF EXISTS public.polls CASCADE;
DROP TABLE IF EXISTS public.poll_votes CASCADE;
