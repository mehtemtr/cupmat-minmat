import { NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/api-auth";
import { getOrCreateProfile, getStore, saveStore } from "@/lib/store/gamification-store";

export async function POST(request: Request) {
  try {
    const authResult = await requireApiAuth();
    if (!authResult.ok) {
      return authResult.response;
    }

    const userId = authResult.userId;
    const body = await request.json();
    const { levels } = body;

    if (!levels || typeof levels !== "object") {
      return NextResponse.json({ error: "Invalid levels payload" }, { status: 400 });
    }

    // Get current profile
    const profile = await getOrCreateProfile(userId);
    if (!profile.minmatMaxLevels) {
      profile.minmatMaxLevels = { add: 1, sub: 1, mul: 1, div: 1, mix: 1 };
    }

    // Update incoming levels (only allow strictly increasing levels)
    const modes = ["add", "sub", "mul", "div", "mix"] as const;
    let changed = false;
    for (const mode of modes) {
      const val = parseInt(levels[mode]);
      if (!isNaN(val) && val > 0 && val <= 100) {
        if (val > (profile.minmatMaxLevels[mode] || 1)) {
          profile.minmatMaxLevels[mode] = val;
          changed = true;
        }
      }
    }

    if (changed) {
      const store = await getStore();
      const idx = store.userActivities.findIndex(u => u.userId === userId);
      if (idx >= 0) {
        store.userActivities[idx] = profile;
        await saveStore(store);
      }
    }

    return NextResponse.json({ success: true, minmatMaxLevels: profile.minmatMaxLevels });
  } catch (error: any) {
    console.error("Progress save error:", error);
    return NextResponse.json({ error: error.message || "Progress save error" }, { status: 500 });
  }
}
