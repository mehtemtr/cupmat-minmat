import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ isAuthenticated: false });
    }

    let email = "";
    if (user.primaryEmailAddressId) {
      email = user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress || "";
    }

    const displayName = user.fullName || user.username || email?.split('@')[0] || "Kullanıcı";

    return NextResponse.json({
      isAuthenticated: true,
      userSession: {
        userId: user.id,
        email: email,
        username: user.username || email?.split('@')[0],
        displayName: displayName
      }
    });

  } catch (error) {
    console.error("GET Session error:", error);
    return NextResponse.json({ isAuthenticated: false });
  }
}
