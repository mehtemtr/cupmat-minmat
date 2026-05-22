export function buildSignInUrl(returnTo?: string | null): string {
  const params = new URLSearchParams();
  params.set("fresh", "1");
  if (returnTo) {
    params.set("redirect_url", returnTo);
  }
  return `/sign-in?${params.toString()}`;
}

export function buildSignOutUrl(returnTo?: string | null): string {
  const params = new URLSearchParams();
  if (returnTo) {
    params.set("redirect", returnTo);
  }
  return `/auth-signout${params.toString() ? `?${params.toString()}` : ""}`;
}
