import type { ReadonlyHeaders, ReadonlyRequestCookies } from "app/_types";

// TODO: next/headers migration (R4f): `getCookie` / `getHeaders` / `setCookie` / `deleteCookie` / `getCookies` — TanStack Start server context only; `draftMode` / other `next/headers` usage — https://tanstack.com/start/latest/docs/framework/react/guide/server-functions
import { getCookies, getHeaders } from "@tanstack/start/server";


import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import { createContext } from "@calcom/trpc/server/createContext";
import { createCallerFactory } from "@calcom/trpc/server/trpc";
import type { TRPCContext } from "@calcom/trpc/types/server/createContext";

import { buildLegacyRequest } from "@lib/buildLegacyCtx";

import type { AnyRouter } from "@trpc/server";

export const getTRPCContext = async (_headers?: ReadonlyHeaders, _cookies?: ReadonlyRequestCookies) => {
  const legacyReq = buildLegacyRequest(_headers ?? (new Headers(Object.entries(getHeaders()).map(([k, v]) => [k, Array.isArray(v) ? v.join(", ") : String(v ?? "")] as [string, string]))), _cookies ?? ({ getAll: () => Object.entries(getCookies()).map(([name, value]) => ({ name, value: String(value ?? "") })) }));
  return await createContext({ req: legacyReq, res: {} as any }, getServerSession);
};

export async function createRouterCaller<TRouter extends AnyRouter>(router: TRouter, context?: TRPCContext) {
  const trpcContext = context ? context : await getTRPCContext();
  const createCaller = createCallerFactory<TRouter>(router);
  return createCaller(trpcContext);
}
