import type { PageProps } from "app/_types";
import { _generateMetadata } from "app/_utils";

// TODO: next/headers migration (R4f): `getCookie` / `getHeaders` / `setCookie` / `deleteCookie` / `getCookies` — TanStack Start server context only; `draftMode` / other `next/headers` usage — https://tanstack.com/start/latest/docs/framework/react/guide/server-functions
import { getCookies, getHeaders } from "@tanstack/start/server";


import { buildLegacyCtx } from "@lib/buildLegacyCtx";

import Logout from "~/auth/logout-view";
import { createFileRoute } from '@tanstack/react-router';

export const generateMetadata = async () => {
  return await _generateMetadata(
    (t) => t("logged_out"),
    (t) => t("youve_been_logged_out"),
    undefined,
    undefined,
    "/auth/logout"
  );
};

const Page = async ({ params, searchParams }: PageProps) => {
  // cookie will be cleared in `/apps/web/proxy.ts`
  const h = new Headers(Object.entries(getHeaders()).map(([k, v]) => [k, Array.isArray(v) ? v.join(", ") : String(v ?? "")] as [string, string]));
  const context = buildLegacyCtx(h, { getAll: () => Object.entries(getCookies()).map(([name, value]) => ({ name, value: String(value ?? "") })) }, await params, await searchParams);

  return <Logout query={context.query} />;
};

export const Route = createFileRoute("/auth/logout")({
  component: Page,
});
