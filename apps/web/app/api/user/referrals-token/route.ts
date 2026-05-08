import { defaultResponderForAppDir } from "app/api/defaultResponderForAppDir";

// TODO: next/headers migration (R4f): `getCookie` / `getHeaders` / `setCookie` / `deleteCookie` / `getCookies` — TanStack Start server context only; `draftMode` / other `next/headers` usage — https://tanstack.com/start/latest/docs/framework/react/guide/server-functions
import { getCookies, getHeaders } from "@tanstack/start/server";


// TODO: next/server migration (R4h): confirm `Request`/`Response` types match your runtime; port remaining `next/server` helpers — https://tanstack.com/start/latest/docs/framework/react/guide/server-routes


import { dub } from "@calcom/feature-auth/lib/dub";
import { getServerSession } from "@calcom/feature-auth/lib/getServerSession";
import { IS_DUB_REFERRALS_ENABLED } from "@calcom/lib/constants";

import { buildLegacyRequest } from "@lib/buildLegacyCtx";

export const dynamic = "force-dynamic";

const handler = async () => {
  // Return early if the feature is disabled
  if (!IS_DUB_REFERRALS_ENABLED) {
    return Response.json({ error: "Referrals feature is disabled" }, { status: 404 });
  }

  const session = await getServerSession({ req: buildLegacyRequest(new Headers(Object.entries(getHeaders()).map(([k, v]) => [k, Array.isArray(v) ? v.join(", ") : String(v ?? "")] as [string, string])), { getAll: () => Object.entries(getCookies()).map(([name, value]) => ({ name, value: String(value ?? "") })) }) });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { publicToken } = await dub.embedTokens.referrals({
    programId: process.env.NEXT_PUBLIC_DUB_PROGRAM_ID as string,
    tenantId: session.user.id.toString(),
    partner: {
      name: session?.user.name || session?.user.email || "",
      email: session?.user.email || session?.user.name || "",
      username: session?.user.username || "",
      image: session?.user.image || null,
      tenantId: session?.user.id.toString() || "",
    },
  });

  return Response.json({ publicToken });
};

export const GET = defaultResponderForAppDir(handler);
