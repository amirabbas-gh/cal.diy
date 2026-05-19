import { withAppDirSsr } from "app/WithAppDirSsr";
import type { PageProps } from "app/_types";

// TODO: next/headers migration (R4f): `getCookie` / `getHeaders` / `setCookie` / `deleteCookie` / `getCookies` — TanStack Start server context only; `draftMode` / other `next/headers` usage — https://tanstack.com/start/latest/docs/framework/react/guide/server-functions
import { getCookies, getHeaders } from "@tanstack/start/server";


import { buildLegacyCtx } from "@lib/buildLegacyCtx";
import { getServerSideProps } from "@lib/reschedule/[uid]/getServerSideProps";
import { createFileRoute } from '@tanstack/react-router';

const getData = withAppDirSsr(getServerSideProps);

const Page = async ({ params, searchParams }: PageProps) => {
  const legacyCtx = buildLegacyCtx(new Headers(Object.entries(getHeaders()).map(([k, v]) => [k, Array.isArray(v) ? v.join(", ") : String(v ?? "")] as [string, string])), { getAll: () => Object.entries(getCookies()).map(([name, value]) => ({ name, value: String(value ?? "") })) }, await params, await searchParams);

  await getData(legacyCtx);

  return null;
};

export const Route = createFileRoute("/reschedule/$uid")({
  component: Page,
});
