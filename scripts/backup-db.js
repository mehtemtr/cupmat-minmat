const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
const workspaceDir = path.resolve(__dirname, '..');
let envText = '';
if (fs.existsSync(path.join(workspaceDir, '.env.local'))) envText += fs.readFileSync(path.join(workspaceDir, '.env.local'), 'utf8') + '\n';
if (fs.existsSync(path.join(workspaceDir, '.env'))) envText += fs.readFileSync(path.join(workspaceDir, '.env'), 'utf8') + '\n';

const lines = envText.split(/\r?\n/);
const getEnv = (key) => {
  const line = lines.find(l => l.trim().startsWith(key + '='));
  if (!line) return '';
  const val = line.substring(line.indexOf('=') + 1).trim();
  return val.replace(/^['"]|['"]$/g, '');
};

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const supabaseServiceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY') || getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Supabase URL veya Key bulunamadı (.env.local kontrol edin).");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const TABLES_TO_BACKUP = [
  'minmat_leaderboard',
  'minlan_leaderboard',
  'minlan_user_progress',
  'minlan_mistakes',
  'minlan_community_stats',
  'cupmat_tournaments',
  'cupmat_leaderboard',
  'profiles'
];

async function runBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(workspaceDir, 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const backupData = {
    createdAt: new Date().toISOString(),
    tables: {}
  };

  console.log(`🚀 Yedekleme başlatılıyor: ${new Date().toLocaleString('tr-TR')}`);

  for (const tableName of TABLES_TO_BACKUP) {
    try {
      const { data, error } = await supabase.from(tableName).select('*');
      if (error) {
        console.warn(`⚠️ [${tableName}] tablosu yedeklenemedi:`, error.message);
        continue;
      }
      backupData.tables[tableName] = data || [];
      console.log(`✅ [${tableName}] ${data ? data.length : 0} kayıt yedeklendi.`);
    } catch (e) {
      console.error(`❌ [${tableName}] hata:`, e);
    }
  }

  // 1. Tarihli yedek dosyası (örn: backup_2026-08-26T20-55-00.json)
  const filename = `backup_${timestamp}.json`;
  const filePath = path.join(backupDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2), 'utf8');

  // 2. En güncel yedek (latest_backup.json)
  const latestPath = path.join(backupDir, 'latest_backup.json');
  fs.writeFileSync(latestPath, JSON.stringify(backupData, null, 2), 'utf8');

  console.log(`\n🎉 Yedek başarıyla tamamlandı!`);
  console.log(`📁 Dosya: ${filePath}`);
}

runBackup();
