import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ isAuthenticated: false });
    }

// Sizin Muhteşem Güvenlik ve Dönüşüm Algoritmanız
let email = user.username || "";

// Eğer sisteme girmeye çalışan kişi eski bir kullanıcıysa (Clerk ID'si yerine eski maili duruyorsa)
if (user && user.primaryEmailAddressId) {
  const oldEmail = user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress || "";
  
  if (oldEmail && oldEmail.includes('@')) {
    const emailPrefix = oldEmail.split('@')[0]; // @ işaretinden önceki kısım
    
    // 1. ADIM: İsim ve soyisimi boşluksuz, küçük harfli Nick yapar (Örn: yukselkartal)
    email = user.username || ""; 
    // 2. ADIM: Sizin Özel Güvenlik Algoritmanız (Eksik karakter kadar '123' serisinden ekleyip TAM 8 haneye tamamlar)
    let generatedPassword = "";
    const prefix = String(emailPrefix);

    if (prefix.length >= 8) {
      generatedPassword = prefix.substring(0, 8); // 8 hane ve üzeriyse ilk 8 karakteri şifre yapar
    } else {
      const targetString = "12345678"; // Tamamlama serisi
      const missingLength = 8 - prefix.length; // Kaç karakter eksik olduğunu hesaplar (Örn: 8 - 6 = 2)
      generatedPassword = prefix + targetString.substring(0, missingLength); // Eksik kadarını (Örn: '12') sonuna ekler
    }

    return NextResponse.json({
      isAuthenticated: true,
      userId: user.id,
      email: email,
      username: user.username || user.fullName || "Kullanıcı",
    displayName: user.fullName || user.username || "Kullanıcı",
  });
} catch (error) {
    console.error("GET Session error:", error);
    return NextResponse.json({ isAuthenticated: false });
  }
