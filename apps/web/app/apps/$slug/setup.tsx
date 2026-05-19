import { withAppDirSsr } from "app/WithAppDirSsr";
import type { PageProps as ServerPageProps } from "app/_types";
import { _generateMetadata } from "app/_utils";

// TODO: next/headers migration (R4f): `getCookie` / `getHeaders` / `setCookie` / `deleteCookie` / `getCookies` — TanStack Start server context only; `draftMode` / other `next/headers` usage — https://tanstack.com/start/latest/docs/framework/react/guide/server-functions
import { getCookies, getHeaders } from "@tanstack/start/server";


import { getServerSideProps } from "@calcom/app-store/_pages/setup/_getServerSideProps";

import { buildLegacyCtx } from "@lib/buildLegacyCtx";

import SetupView, { type PageProps as ClientPageProps } from "~/apps/[slug]/setup/setup-view";
import { createFileRoute } from '@tanstack/react-router';

export const generateMetadata = async ({ params: _params }: ServerPageProps) => {
  const params = await _params;
  const metadata = await _generateMetadata(
    () => `${params.slug}`,
    () => "",
    undefined,
    undefined,
    `/apps/${params.slug}/setup`
  );
  return {
    ...metadata,
    robots: {
      index: false,
      follow: false,
    },
  };
};

const getData = withAppDirSsr<ClientPageProps>(getServerSideProps);

const ServerPage = async ({ params, searchParams }: ServerPageProps) => {
  const context = buildLegacyCtx(new Headers(Object.entries(getHeaders()).map(([k, v]) => [k, Array.isArray(v) ? v.join(", ") : String(v ?? "")] as [string, string])), { getAll: () => Object.entries(getCookies()).map(([name, value]) => ({ name, value: String(value ?? "") })) }, await params, await searchParams);

  const props = await getData(context);
  return <SetupView {...props} />;
};

export const Route = createFileRoute("/apps/$slug/setup")({
  component: ServerPage,
});
