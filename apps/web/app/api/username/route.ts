import { checkUsername } from "@calcom/features/profile/lib/checkUsername";
import { buildLegacyRequest } from "@lib/buildLegacyCtx";
import { defaultResponderForAppDir } from "app/api/defaultResponderForAppDir";

// TODO: next/headers migration (R4f): `getCookie` / `getHeaders` / `setCookie` / `deleteCookie` / `getCookies` — TanStack Start server context only; `draftMode` / other `next/headers` usage — https://tanstack.com/start/latest/docs/framework/react/guide/server-functions
import { getCookies, getHeaders } from "@tanstack/start/server";



import { z } from "zod";

const bodySchema = z.object({
  username: z.string(),
  orgSlug: z.string().optional(),
});

async function postHandler(request: Request) {
  try {
    const body = await request.json();
    const { username, orgSlug } = bodySchema.parse(body);

    const legacyReq = buildLegacyRequest(new Headers(Object.entries(getHeaders()).map(([k, v]) => [k, Array.isArray(v) ? v.join(", ") : String(v ?? "")] as [string, string])), { getAll: () => Object.entries(getCookies()).map(([name, value]) => ({ name, value: String(value ?? "") })) });

    // Get current org domain from request headers
    const currentOrgDomain = null;
  const isValidOrgDomain = false;

    const result = await checkUsername(username, currentOrgDomain || orgSlug);

    return Response.json(result);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to check username availability" }, { status: 400 });
  }
}

export const POST = defaultResponderForAppDir(postHandler);
