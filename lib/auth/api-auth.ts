import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export type ApiAuthSuccess = {
  ok: true;
  userId: string;
  displayName: string;
  email: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
};

export type ApiAuthFailure = {
  ok: false;
  response: NextResponse;
};

export async function requireApiAuth(): Promise<ApiAuthSuccess | ApiAuthFailure> {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Oturum gerekli. Lütfen giriş yapın." },
        { status: 401 },
      ),
    };
  }

  let user = null;
  try {
    user = await currentUser();
  } catch (e) {
    console.error("[requireApiAuth] currentUser() threw an error:", e);
  }

  if (!user) {
    console.log("[requireApiAuth] currentUser() is null or threw, attempting fallback to clerkClient...");
    try {
      const client = await clerkClient();
      user = await client.users.getUser(userId);
    } catch (e) {
      console.error("[requireApiAuth] fallback clerkClient error:", e);
    }
  }
  
  const firstName = user?.firstName || null;
  const lastName = user?.lastName || null;
  
  let displayName = user?.username || user?.fullName || "";
  
  if (!displayName && firstName && lastName) {
    displayName = `${firstName} ${lastName}`;
  } else if (!displayName && firstName) {
    displayName = firstName;
  } else if (!displayName) {
    displayName = "KaraKartal1923";
  }
  
  let email = "";
  if (user?.primaryEmailAddressId) {
    email = user.emailAddresses?.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress || "";
  }
  
  if (!email && user?.emailAddresses && user.emailAddresses.length > 0) {
    email = user.emailAddresses[0]?.emailAddress || "";
  }

  // Fallback to sessionClaims email if available
  if (!email && sessionClaims) {
    const claims = sessionClaims as any;
    email = claims.email || claims.primary_email_address || claims.primaryEmailAddress || "";
  }

  // Final fallback to avoid DB NOT NULL / UNIQUE constraints crashing the profile insertion
  if (!email) {
    email = `${userId}@no-email.statmatik.com`;
  }

  return { ok: true, userId, displayName, email, username: user?.username || null, firstName, lastName };
}

export function verifyAdminSecret(
  request: Request,
  body?: { adminSecret?: string },
): boolean {
  const expected = process.env.ADMIN_API_SECRET;
  if (!expected || expected.length < 8) {
    return false;
  }
  const headerSecret = request.headers.get("x-admin-secret");
  return headerSecret === expected || body?.adminSecret === expected;
}

/** Taraftar / dönem puanını düşüren veya silen eylemler API üzerinden kabul edilmez. */
const BLOCKED_ACTION_PATTERNS = [
  /^delete/i,
  /^remove/i,
  /^reset/i,
  /sil$/i,
  /clear/i,
];

export function isBlockedGamificationAction(action: string): boolean {
  return BLOCKED_ACTION_PATTERNS.some((pattern) => pattern.test(action));
}

export const ALLOWED_GAMIFICATION_ACTIONS = new Set([
  "login",
  "stay_30s",
  "player_scout",
  "help_clicked",
  "about_clicked",
  "earn_minmat_time",
  "earn_prediction_right",
  "use_minmat_time",
  "use_prediction_right",
]);

export function isAllowedGamificationAction(action: string): boolean {
  if (ALLOWED_GAMIFICATION_ACTIONS.has(action)) {
    return true;
  }
  if (action.startsWith("stay_")) {
    return true;
  }
  return false;
}
