// TODO: next/headers migration (R4f): `getCookie` / `getHeaders` / `setCookie` / `deleteCookie` / `getCookies` — TanStack Start server context only; `draftMode` / other `next/headers` usage — https://tanstack.com/start/latest/docs/framework/react/guide/server-functions
import { deleteCookie, getCookie } from "@tanstack/start/server";



export async function validateCsrfToken(csrfToken: string): Promise<Response | null> {
  const cookieToken = getCookie("calcom.csrf_token");

  if (!cookieToken || cookieToken !== csrfToken) {
    return Response.json({ success: false, message: "Invalid CSRF token" }, { status: 403 });
  }
  deleteCookie("calcom.csrf_token");
  return null;
}
