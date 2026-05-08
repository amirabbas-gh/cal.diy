import { withAppDirSsr } from "app/WithAppDirSsr";
import type { PageProps as ServerPageProps } from "app/_types";
import { _generateMetadata } from "app/_utils";

// TODO: next/headers migration (R4f): `getCookie` / `getHeaders` / `setCookie` / `deleteCookie` / `getCookies` — TanStack Start server context only; `draftMode` / other `next/headers` usage — https://tanstack.com/start/latest/docs/framework/react/guide/server-functions
import { getCookies, getHeaders } from "@tanstack/start/server";


// TODO: next/navigation migration (R4g): use `throw redirect()` in loaders / beforeLoad — client nav: `useNavigate()` — https://tanstack.com/router/latest/docs/framework/react/guide/navigation
import { redirect } from "@tanstack/react-router";

import { z } from "zod";

import { buildLegacyCtx } from "@lib/buildLegacyCtx";

import { getServerSideProps } from "@server/lib/setup/getServerSideProps";

import Setup from "~/auth/setup-view";
import type { PageProps as ClientPageProps } from "~/auth/setup-view";
import { createFileRoute } from '@tanstack/react-router';

export const generateMetadata = async () => {
  return await _generateMetadata(
    (t) => t("setup"),
    (t) => t("setup_description"),
    undefined,
    undefined,
    "/auth/setup"
  );
};

const getData = withAppDirSsr<ClientPageProps>(getServerSideProps);
const stepSchema = z.enum(["1", "2", "3", "4"]);

const ServerPage = async ({ params, searchParams: _searchParams }: ServerPageProps) => {
  const searchParams = await _searchParams;
  const stepResult = stepSchema.safeParse(searchParams?.step);

  // If step parameter is invalid, redirect to step 1
  if (!stepResult.success) {
    throw redirect({ to: `/auth/setup?step=1` });
  }

  const props = await getData(buildLegacyCtx(new Headers(Object.entries(getHeaders()).map(([k, v]) => [k, Array.isArray(v) ? v.join(", ") : String(v ?? "")] as [string, string])), { getAll: () => Object.entries(getCookies()).map(([name, value]) => ({ name, value: String(value ?? "") })) }, await params, searchParams));
  return <Setup {...props} />;
};

export const Route = createFileRoute("/auth/setup")({
  component: ServerPage,
});
