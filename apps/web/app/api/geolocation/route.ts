import { defaultResponderForAppDir } from "app/api/defaultResponderForAppDir";

// TODO: next/headers migration (R4f): `getCookie` / `getHeaders` / `setCookie` / `deleteCookie` / `getCookies` — TanStack Start server context only; `draftMode` / other `next/headers` usage — https://tanstack.com/start/latest/docs/framework/react/guide/server-functions
import { getHeaders } from "@tanstack/start/server";



async function getHandler() {
  const headersList = new Headers(Object.entries(getHeaders()).map(([k, v]) => [k, Array.isArray(v) ? v.join(", ") : String(v ?? "")] as [string, string]));
  const country = headersList.get("x-vercel-ip-country") || "Unknown";

  const response = Response.json({ country });
  response.headers.set("Cache-Control", "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400");

  return response;
}

export const GET = defaultResponderForAppDir(getHandler);
