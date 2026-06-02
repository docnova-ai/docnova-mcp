/**
 * API key → JWT exchange via POST /auth/login { apiKey }.
 * Response contains jwt + expirationDate + lastCompanyId.
 * R-Auth header JWT bekliyor, Bearer prefix YOK.
 */

const BASE_URL = process.env.DOCNOVA_BASE_URL ?? "https://api.docnova.ai";
const API_KEY = process.env.DOCNOVA_API_KEY!;

interface TokenCache {
  jwt: string;
  expiresAt: number;
  defaultCompanyId: string | null;
}

let cache: TokenCache | null = null;

export async function getJwt(): Promise<string> {
  const now = Date.now();
  if (cache && cache.expiresAt - now > 60_000) return cache.jwt;

  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey: API_KEY }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Auth failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as {
    jwt: string;
    expirationDate: string;
    lastCompanyId?: string;
  };

  cache = {
    jwt: data.jwt,
    expiresAt: new Date(data.expirationDate).getTime(),
    defaultCompanyId: data.lastCompanyId ?? null,
  };
  console.error("[docnova-mcp] authenticated, expires:", data.expirationDate);
  return data.jwt;
}

export async function getDefaultCompanyId(): Promise<string | null> {
  await getJwt(); // ensures cache populated
  return cache?.defaultCompanyId ?? null;
}
