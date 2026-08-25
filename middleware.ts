import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isProtectedRoute = createRouteMatcher(["/auth-redirect(.*)"]);

const hasClerkKey = !!(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  process.env.CLERK_SECRET_KEY
);

// 9 Supported Languages
const SUPPORTED_LOCALES = new Set(["tr", "en", "es", "fr", "de", "it", "pt", "ar", "ko"]);

// Legacy path prefixes that should be 301 permanently redirected to homepage
const LEGACY_PREFIXES = [
  "/ulkeler",
  "/futbolcular",
  "/stadyumlar",
  "/stadlar",
  "/stadiums",
  "/venues",
  "/hakemler",
  "/referees",
  "/teams",
  "/groups",
  "/tahminler",
  "/predictions",
  "/kupa-yolu",
  "/bracket",
  "/polls",
  "/stats",
  "/leagues",
  "/countries",
  "/players",
];

// Common 3-letter country codes from old tournament setup
const LEGACY_COUNTRY_CODES = new Set([
  "mex", "can", "usa", "kor", "qat", "sui", "cmr", "par", "aus", "tur",
  "ita", "esp", "ger", "fra", "arg", "bra", "eng", "ned", "por", "bel",
  "cro", "mar", "sen", "jpn", "irn", "ksa", "egy", "nga", "col", "uru",
  "chi", "per", "ecu", "nzl", "aut", "swe", "pol", "ukr", "wal", "sco",
  "cze", "svk", "rou", "hun", "gre", "nor", "den", "fin", "isl", "irl",
  "nir", "alg", "gha", "civ", "tun", "mli", "rsa", "mar", "pan", "crc",
  "jam", "hon", "slv", "hai", "tri", "bol", "ven", "uzb", "jor", "irq",
  "uae", "omn", "bhr", "chn", "ind", "vie", "tha", "mys", "ina", "phi",
  "cba", "dom", "cur", "sur", "guy", "gua", "cub", "zam", "zim", "cgo",
]);

function checkLegacyRedirect(req: NextRequest): NextResponse | null {
  const { pathname, searchParams } = req.nextUrl;
  const segments = pathname.toLowerCase().split("/").filter(Boolean);

  if (segments.length === 0) return null;

  let detectedLocale: string | null = null;
  let remainingSegments = [...segments];

  // Check if first segment is a supported locale (e.g. /en/ulkeler/mex or /de/aus)
  if (SUPPORTED_LOCALES.has(remainingSegments[0])) {
    detectedLocale = remainingSegments[0];
    remainingSegments.shift();
  }

  // If search param has lang or locale
  const queryLang = searchParams.get("lang") || searchParams.get("locale");
  if (queryLang && SUPPORTED_LOCALES.has(queryLang.toLowerCase())) {
    detectedLocale = queryLang.toLowerCase();
  }

  // Check if remaining path matches any legacy routes or single country code
  const isLegacyPath =
    remainingSegments.length > 0 &&
    (LEGACY_PREFIXES.some((prefix) => {
      const cleanPrefix = prefix.replace(/^\//, "");
      return remainingSegments[0] === cleanPrefix;
    }) ||
      (remainingSegments.length === 1 && LEGACY_COUNTRY_CODES.has(remainingSegments[0])) ||
      (remainingSegments.length === 2 && LEGACY_COUNTRY_CODES.has(remainingSegments[1])));

  if (isLegacyPath) {
    const redirectUrl = new URL("/", req.url);
    if (detectedLocale && detectedLocale !== "tr") {
      redirectUrl.searchParams.set("lang", detectedLocale);
    }
    const response = NextResponse.redirect(redirectUrl, 301);
    if (detectedLocale) {
      response.cookies.set("wc2026-locale", detectedLocale, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
      });
    }
    return response;
  }

  return null;
}

const clerkHandler = clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export default async function middleware(req: NextRequest, evt: any) {
  // 1. Check for legacy 301 redirects first
  const legacyRedirect = checkLegacyRedirect(req);
  if (legacyRedirect) {
    return legacyRedirect;
  }

  // 2. Process Clerk middleware for protected routes
  if (!hasClerkKey) {
    return NextResponse.next();
  }
  try {
    return await clerkHandler(req, evt);
  } catch (e) {
    console.warn("[Middleware] Clerk middleware bypassed due to missing key:", e);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

