import { NextResponse } from "next/server";
import { currentUser, auth, clerkClient } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    // 1. Önce çerezler üzerinden (varsayılan) dene
    const user = await currentUser();
    if (user) {
      let email = "";
      if (user.primaryEmailAddressId) {
        email = user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress || "";
      }
      
      const { data: dbProfile } = await supabaseAdmin
        .from("profiles")
        .select("nickname")
        .eq("id", user.id)
        .maybeSingle();

      return NextResponse.json({
        isAuthenticated: true,
        userSession: {
          userId: user.id,
          email: email,
          username: user.username || null,
          displayName: dbProfile?.nickname || user.username || user.fullName || "KaraKartal1923"
        }
      });
    }

    // 2. Çerez yoksa (iframe içi), Authorization header (Bearer token) kontrol et
    const { userId } = await auth();
    if (userId) {
      const client = await clerkClient();
      const userFromSdk = await client.users.getUser(userId);
      if (userFromSdk) {
        let email = "";
        if (userFromSdk.primaryEmailAddressId) {
          email = userFromSdk.emailAddresses.find((e) => e.id === userFromSdk.primaryEmailAddressId)?.emailAddress || "";
        }

        const { data: dbProfile } = await supabaseAdmin
          .from("profiles")
          .select("nickname")
          .eq("id", userFromSdk.id)
          .maybeSingle();

        const displayName = dbProfile?.nickname || 
                            userFromSdk.username || 
                            userFromSdk.fullName || 
                            (userFromSdk.firstName && userFromSdk.lastName ? `${userFromSdk.firstName} ${userFromSdk.lastName}` : "KaraKartal1923");
        return NextResponse.json({
          isAuthenticated: true,
          userSession: {
            userId: userFromSdk.id,
            email: email,
            username: userFromSdk.username || null,
            displayName: displayName
          }
        });
      }
    }

    return NextResponse.json({ isAuthenticated: false });
  } catch (error) {
    console.error("GET Session error:", error);
    return NextResponse.json({ isAuthenticated: false });
  }
}
