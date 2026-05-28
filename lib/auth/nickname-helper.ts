import { supabaseAdmin } from "@/lib/supabase";

const EAGLE_TRANSLATIONS: Record<string, string> = {
  tr: "Kartal",
  de: "Adler",
  en: "Eagle",
  es: "Aguila",
  fr: "Aigle",
};

/**
 * E-posta uzantısına veya dil koduna göre "Kartal" kelimesinin çevirisini döndürür.
 */
export function getEagleWord(email?: string, locale?: string): string {
  // 1. E-posta uzantısını kontrol et
  if (email) {
    const lowerEmail = email.toLowerCase().trim();
    if (lowerEmail.endsWith(".tr")) return EAGLE_TRANSLATIONS.tr;
    if (lowerEmail.endsWith(".de")) return EAGLE_TRANSLATIONS.de;
    if (lowerEmail.endsWith(".es")) return EAGLE_TRANSLATIONS.es;
    if (lowerEmail.endsWith(".fr")) return EAGLE_TRANSLATIONS.fr;
  }

  // 2. Dil kodunu kontrol et (örn: "en-US" -> "en")
  if (locale) {
    const cleanLocale = locale.toLowerCase().split("-")[0];
    if (EAGLE_TRANSLATIONS[cleanLocale]) {
      return EAGLE_TRANSLATIONS[cleanLocale];
    }
  }

  // 3. Varsayılan İngilizce
  return EAGLE_TRANSLATIONS.en;
}

/**
 * Belirlenen önek ile 1923'ten başlayarak boşta olan ilk sıradaki ismi bulur (örn: Kartal_1923, Adler_1923).
 */
export async function generateSequentialNickname(
  email?: string,
  locale?: string
): Promise<string> {
  const prefix = getEagleWord(email, locale);
  let counter = 1923;

  while (true) {
    const candidateNickname = `${prefix}_${counter}`;
    
    // Supabase profiles tablosunda bu nick var mı kontrol et
    const { count, error } = await supabaseAdmin
      .from("profiles")
      .select("nickname", { count: "exact", head: true })
      .eq("nickname", candidateNickname);

    if (!error && count === 0) {
      return candidateNickname;
    }
    
    counter++;
    // Güvenlik sınırı: Çok büyük döngüleri engelle
    if (counter > 200000) {
      return `${prefix}_${Date.now()}`;
    }
  }
}

/**
 * Kullanıcı adının uzunluğunu (3-16 karakter), boşluksuz olmasını 
 * ve sadece Unicode harf/rakam/alt çizgi içermesini doğrular.
 */
export function validateNickname(nickname: string): { isValid: boolean; errorKey?: string } {
  if (!nickname) {
    return { isValid: false, errorKey: "nickname_empty" };
  }

  const trimmed = nickname.trim();
  
  // 1. Uzunluk kontrolü (3-16 karakter)
  if (trimmed.length < 3 || trimmed.length > 16) {
    return { isValid: false, errorKey: "nickname_length" };
  }

  // 2. Boşluk kontrolü (Metin içinde herhangi bir yerde boşluk)
  if (/\s/.test(trimmed)) {
    return { isValid: false, errorKey: "nickname_whitespace" };
  }

  // 3. Karakter kontrolü (Harfler, sayılar ve alt çizgi. Unicode destekli)
  // \p{L}: Tüm dillerdeki harf karakterleri
  // \p{N}: Tüm dillerdeki sayısal karakterler
  // _: Alt çizgi
  const unicodeRegex = /^[\p{L}\p{N}_]+$/u;
  if (!unicodeRegex.test(trimmed)) {
    return { isValid: false, errorKey: "nickname_invalid_chars" };
  }

  return { isValid: true };
}
