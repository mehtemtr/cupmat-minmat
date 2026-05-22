/** Oturum / kullanıcıya özel tarayıcı verileri — çıkışta temizlenir. */
const LOCAL_STORAGE_PREFIXES = [
  "minmat_",
  "wc2026-",
  "discovery_",
  "__clerk",
];

const LOCAL_STORAGE_EXACT = ["scores"];

const SESSION_STORAGE_PREFIXES = ["discovered_", "__clerk"];

export function clearClientSessionStorage(): void {
  if (typeof window === "undefined") return;

  const localKeys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    if (
      LOCAL_STORAGE_EXACT.includes(key) ||
      LOCAL_STORAGE_PREFIXES.some((prefix) => key.startsWith(prefix))
    ) {
      localKeys.push(key);
    }
  }
  localKeys.forEach((key) => localStorage.removeItem(key));

  const sessionKeys: string[] = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (!key) continue;
    if (SESSION_STORAGE_PREFIXES.some((prefix) => key.startsWith(prefix))) {
      sessionKeys.push(key);
    }
  }
  sessionKeys.forEach((key) => sessionStorage.removeItem(key));
}
