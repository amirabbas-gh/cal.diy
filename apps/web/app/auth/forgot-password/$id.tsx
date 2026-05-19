import { withAppDirSsr } from "app/WithAppDirSsr";
import type { PageProps as ServerPageProps } from "app/_types";
import { _generateMetadata } from "app/_utils";

// TODO: next/headers migration (R4f): `getCookie` / `getHeaders` / `setCookie` / `deleteCookie` / `getCookies` — TanStack Start server context only; `draftMode` / other `next/headers` usage — https://tanstack.com/start/latest/docs/framework/react/guide/server-functions
import { getCookies, getHeaders } from "@tanstack/start/server";


import { buildLegacyCtx } from "@lib/buildLegacyCtx";

import { getServerSideProps } from "@server/lib/auth/forgot-password/[id]/getServerSideProps";

import type { PageProps as ClientPageProps } from "~/auth/forgot-password/[id]/forgot-password-single-view";
import SetNewUserPassword from "~/auth/forgot-password/[id]/forgot-password-single-view";
import { createFileRoute } from '@tanstack/react-router';

export const generateMetadata = async ({ params }: { params: Promise<{ id: string }> }) => {
  return await _generateMetadata(
    (t) => t("reset_password"),
    (t) => t("change_your_password"),
    undefined,
    undefined,
    `/auth/forgot-password/${(await params).id}`
  );
};

const getData = withAppDirSsr<ClientPageProps>(getServerSideProps);
const ServerPage = async ({ params, searchParams }: ServerPageProps) => {
  const context = buildLegacyCtx(new Headers(Object.entries(getHeaders()).map(([k, v]) => [k, Array.isArray(v) ? v.join(", ") : String(v ?? "")] as [string, string])), { getAll: () => Object.entries(getCookies()).map(([name, value]) => ({ name, value: String(value ?? "") })) }, await params, await searchParams);
  const props = await getData(context);

  return <SetNewUserPassword {...props} />;
};

export const Route = createFileRoute("/auth/forgot-password/$id")({
  component: ServerPage,
});
