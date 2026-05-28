import { validateNickname, getEagleWord } from "../lib/auth/nickname-helper";

function runTests() {
  console.log("=== START NICKNAME HELPER TESTS ===");

  // 1. Test getEagleWord
  const testEmails = [
    { email: "user@domain.tr", expected: "Kartal" },
    { email: "user@domain.de", expected: "Adler" },
    { email: "user@domain.es", expected: "Aguila" },
    { email: "user@domain.fr", expected: "Aigle" },
    { email: "user@domain.com", expected: "Eagle" },
    { email: "", expected: "Eagle" }
  ];

  for (const { email, expected } of testEmails) {
    const res = getEagleWord(email);
    console.log(`Email: ${email.padEnd(20)} => Got: ${res.padEnd(10)} [${res === expected ? "PASS" : "FAIL"}]`);
  }

  const testLocales = [
    { locale: "tr-TR", expected: "Kartal" },
    { locale: "de", expected: "Adler" },
    { locale: "es", expected: "Aguila" },
    { locale: "fr-FR", expected: "Aigle" },
    { locale: "en-US", expected: "Eagle" },
    { locale: "ko", expected: "Eagle" } // not mapped yet, defaults to Eagle
  ];

  for (const { locale, expected } of testLocales) {
    const res = getEagleWord(undefined, locale);
    console.log(`Locale: ${locale.padEnd(20)} => Got: ${res.padEnd(10)} [${res === expected ? "PASS" : "FAIL"}]`);
  }

  // 2. Test validateNickname
  const testNicknames = [
    { nick: "Kartal_1923", expected: true },
    { nick: "Adler_1923", expected: true },
    { nick: "독수리_1923", expected: true }, // Korean
    { nick: "نسر_1923", expected: true }, // Arabic
    { nick: "Ka", expected: false }, // too short
    { nick: "Kartal_1234567890123", expected: false }, // too long (18 chars)
    { nick: "Kartal 1923", expected: false }, // contains space
    { nick: "Kartal<script>", expected: false }, // contains invalid chars
    { nick: "Kartal-1923", expected: false } // contains hyphen (we decided on letters, numbers, and underscore only)
  ];

  for (const { nick, expected } of testNicknames) {
    const res = validateNickname(nick);
    console.log(`Nick: ${nick.padEnd(25)} => Valid: ${String(res.isValid).padEnd(5)} [${res.isValid === expected ? "PASS" : "FAIL"}]`);
  }

  console.log("=== END TESTS ===");
}

runTests();
