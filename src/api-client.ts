import { getJwt } from "./auth.js";

const BASE_URL = process.env.DOCNOVA_BASE_URL ?? "https://api.docnova.ai";

export async function apiGet<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
    }
  }
  return request<T>(url.toString(), { method: "GET" });
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  return request<T>(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function apiPostMultipart<T>(path: string, jsonPart: unknown, query?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v) url.searchParams.set(k, v);
    }
  }
  const form = new FormData();
  form.append("data", new Blob([JSON.stringify(jsonPart)], { type: "application/json" }), "data.json");
  return request<T>(url.toString(), { method: "POST", body: form });
}

async function request<T>(url: string, init: RequestInit): Promise<T> {
  const jwt = await getJwt();
  const res = await fetch(url, {
    ...init,
    headers: {
      "R-Auth": jwt,
      ...(init.headers ?? {}),
    },
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    const text = await res.text();
    const hint = res.status === 401
      ? " Check that your DOCNOVA_API_KEY is valid."
      : res.status === 403
      ? " You may not have permission for this resource."
      : res.status === 404
      ? " The resource was not found. Check the ID is correct."
      : res.status === 429
      ? " Rate limit exceeded. Wait a moment before retrying."
      : "";
    throw new Error(`API ${res.status}:${hint} ${text}`.trim());
  }

  return res.json() as Promise<T>;
}
