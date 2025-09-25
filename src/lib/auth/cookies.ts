const isProduction = process.env.NODE_ENV === "production";

export const ACCESS_TOKEN_COOKIE = "ga.access-token";
export const REFRESH_TOKEN_COOKIE = "ga.refresh-token";

export const ACCESS_TOKEN_MAX_AGE = 60 * 60; // 1 hora
export const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30; // 30 dias

export function buildSessionCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isProduction,
    path: "/",
    maxAge
  };
}
