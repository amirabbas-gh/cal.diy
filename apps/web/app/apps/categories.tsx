import { withAppDirSsr } from "app/WithAppDirSsr";
import type { PageProps } from "app/_types";

// TODO: next/headers migration (R4f): `getCookie` / `getHeaders` / `setCookie` / `deleteCookie` / `getCookies` — TanStack Start server context only; `draftMode` / other `next/headers` usage — https://tanstack.com/start/latest/docs/framework/react/guide/server-functions
import { getCookies, getHeaders } from "@tanstack/start/server";


import { getServerSideProps } from "@lib/apps/categories/getServerSideProps";
import { buildLegacyCtx } from "@lib/buildLegacyCtx";

import Page from "~/apps/categories/categories-view";
import { createFileRoute } from '@tanstack/react-router';

const getData = withAppDirSsr(getServerSideProps);

// TODO: move async data fetching into Route.loader (or a server function); avoid heavy awaits in route components — https://tanstack.com/router/latest/docs/framework/react/guide/data-loading
async function ServerPage() {
  const props = await getData(
    buildLegacyCtx(new Headers(Object.entries(getHeaders()).map(([k, v]) => [k, Array.isArray(v) ? v.join(", ") : String(v ?? "")] as [string, string])), { getAll: () => Object.entries(getCookies()).map(([name, value]) => ({ name, value: String(value ?? "") })) }, Route.useParams(), Route.useSearch())
  );

  return <Page {...props} />;
}

export const Route = createFileRoute("/apps/categories")({
  component: ServerPage,
});
