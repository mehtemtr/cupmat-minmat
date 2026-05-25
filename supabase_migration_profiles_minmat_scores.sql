-- 1. PROFILLER TABLOSU (Clerk ID ile senkronize) 
CREATE TABLE IF NOT EXISTS public.profiles ( 
    id TEXT PRIMARY KEY, -- Clerk'ten gelen user_id 
    email TEXT UNIQUE NOT NULL, 
    nickname TEXT UNIQUE, 
    cupmat_general_score INTEGER DEFAULT 0, 
    cupmat_reward_score INTEGER DEFAULT 0, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL 
); 
 
-- 2. MINMAT PUAN TABLOSU (Kategorilere göre en yüksek skorlar) 
CREATE TABLE IF NOT EXISTS public.minmat_scores ( 
    id BIGSERIAL PRIMARY KEY, 
    user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE, 
    category VARCHAR(20) NOT NULL, -- 'topla', 'cikar', 'carp', 'bol', 'karisik' 
    high_score INTEGER DEFAULT 0, 
    reward_score INTEGER DEFAULT 0, -- 3 günlük periyotta aldığı en yüksek puan 
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL, 
    UNIQUE(user_id, category) -- Her kullanıcının bir kategoride sadece 1 en yüksek puanı olabilir 
);
