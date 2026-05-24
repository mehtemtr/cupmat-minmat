import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ isAuthenticated: false });
    }

    let username = user.username || "";
    let displayName = "";
    
    if (!username && user.primaryEmailAddressId) {
      const oldEmail = user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress || "";
      if (oldEmail && oldEmail.includes('@')) {
        const emailPrefix = oldEmail.split('@')[0];
        username = emailPrefix;
      }
    }
    
    if (!username && user.firstName && user.lastName) {
      username = (user.firstName + user.lastName).toLowerCase().replace(/\s+/g, "");
    }
    
    if (!username) {
      username = "Kullanici";
    }
    
    displayName = user.fullName || user.username || username || "Kullanıcı";

    // Oyun kodunun tam olarak beklediği 'userSession' anahtar kutusu
    return NextResponse.json({
      isAuthenticated: true,
      userSession: {
        userId: user.id,
        email: user.username || username,
        username: username,
        displayName: displayName
      }
    });

  } catch (error) {
    console.error("GET Session error:", error);
    return NextResponse.json({ isAuthenticated: false });
  }
}
