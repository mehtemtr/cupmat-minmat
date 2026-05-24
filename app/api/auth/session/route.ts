import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ isAuthenticated: false });
    }

    let email = user.username || "";

    if (user && user.primaryEmailAddressId) {
      const oldEmail = user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress || "";
      
      if (oldEmail && oldEmail.includes('@')) {
        const emailPrefix = oldEmail.split('@')[0];
        
        email = user.username || ""; 

        let generatedPassword = "";
        const prefix = String(emailPrefix);

        if (prefix.length >= 8) {
          generatedPassword = prefix.substring(0, 8);
        } else {
          const targetString = "12345678";
          const missingLength = 8 - prefix.length;
          generatedPassword = prefix + targetString.substring(0, missingLength);
        }
      }
    }

    // Oyun kodunun tam olarak beklediği 'userSession' anahtar kutusu
    return NextResponse.json({
      isAuthenticated: true,
      userSession: {
        userId: user.id,
        email: email,
        username: user.username || user.fullName || "Kullanıcı",
        displayName: user.fullName || user.username || "Kullanıcı"
      }
    });

  } catch (error) {
    console.error("GET Session error:", error);
    return NextResponse.json({ isAuthenticated: false });
  }
}
