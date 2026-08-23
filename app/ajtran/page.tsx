import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export const dynamic = "force-dynamic";

export default async function AjtranPage() {
  let logs: any[] = [];
  try {
    const rawLogs = await redis.lrange("cupmat:cron_logs", 0, 49);
    // Redis returns strings for objects, we parse them
    logs = rawLogs.map(log => typeof log === "string" ? JSON.parse(log) : log);
  } catch (error) {
    console.error("Failed to fetch cron logs", error);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 p-8 font-mono">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-emerald-400 mb-6 flex items-center gap-3">
          <span>🕵️</span> AJTRAN SECRET LOGS
        </h1>
        
        {logs.length === 0 ? (
          <div className="p-4 bg-slate-900 rounded border border-slate-800">
            Henüz log kaydı yok veya cron çalışmadı.
          </div>
        ) : (
          <div className="space-y-6">
            {logs.map((log, idx) => (
              <div key={idx} className={`p-4 rounded border ${log.success ? 'border-emerald-900 bg-emerald-950/20' : 'border-rose-900 bg-rose-950/20'}`}>
                <div className="flex flex-wrap items-center justify-between mb-4 pb-2 border-b border-slate-800/50">
                  <div className="font-bold text-sm text-slate-400">{new Date(log.timestamp).toLocaleString("tr-TR")}</div>
                  <div className="flex gap-4 text-sm font-semibold">
                    <span className="text-emerald-500">Eklendi: {log.inserted}</span>
                    <span className="text-blue-500">Güncellendi: {log.updated}</span>
                  </div>
                </div>
                
                <div className="space-y-1 text-xs">
                  {log.logs && log.logs.map((msg: string, mIdx: number) => (
                    <div key={mIdx} className="break-words">
                      {msg.includes("[ERROR]") ? <span className="text-rose-400">{msg}</span> : msg}
                    </div>
                  ))}
                  {(!log.logs || log.logs.length === 0) && (
                    <div className="text-slate-500 italic">Log detayı yok.</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
