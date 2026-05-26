import { createClient } from "@supabase/supabase-js";

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Self-healing: if URL is empty or points to public supabase website, construct the actual project URL from service role key JWT.
if (!supabaseUrl || supabaseUrl === "https://supabase.com" || !supabaseUrl.includes(".supabase.co")) {
  if (supabaseServiceKey && supabaseServiceKey.includes(".")) {
    try {
      const parts = supabaseServiceKey.split(".");
      if (parts.length === 3) {
        let payload = "";
        if (typeof window === "undefined") {
          payload = Buffer.from(parts[1], "base64").toString("utf8");
        } else {
          const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
          payload = decodeURIComponent(
            atob(base64)
              .split("")
              .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
              .join("")
          );
        }
        const claims = JSON.parse(payload);
        if (claims && claims.ref) {
          supabaseUrl = `https://${claims.ref}.supabase.co`;
          console.log(`[Supabase Auto-Recovery] Constructed URL from JWT: ${supabaseUrl}`);
        }
      }
    } catch (e) {
      console.error("[Supabase Auto-Recovery] Failed to parse JWT payload:", e);
    }
  }
}

// Fallback to avoid createClient throwing during module import
const safeUrl = supabaseUrl || "https://placeholder-project-ref.supabase.co";
const safeAnonKey = supabaseAnonKey || "placeholder-anon-key";
const safeServiceKey = supabaseServiceKey || "placeholder-service-key";

// İstemci tarafı için (tarayıcı)
export const supabase = createClient(safeUrl, safeAnonKey);

// Sunucu tarafı için (API rotaları)
export const supabaseAdmin = createClient(safeUrl, safeServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
