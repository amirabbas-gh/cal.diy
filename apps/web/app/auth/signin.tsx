import { withAppDirSsr } from "app/WithAppDirSsr";
import type { PageProps as ServerPageProps } from "app/_types";

// TODO: next/headers migration (R4f): `getCookie` / `getHeaders` / `setCookie` / `deleteCookie` / `getCookies` — TanStack Start server context only; `draftMode` / other `next/headers` usage — https://tanstack.com/start/latest/docs/framework/react/guide/server-functions
import { getCookies, getHeaders } from "@tanstack/start/server";


// TODO: next/navigation migration (R4g): use `throw redirect()` in loaders / beforeLoad — client nav: `useNavigate()` — https://tanstack.com/router/latest/docs/framework/react/guide/navigation
import { redirect } from "@tanstack/react-router";


import { getServerSession } from "@calcom/features/auth/lib/getServerSession";

import { buildLegacyCtx } from "@lib/buildLegacyCtx";

import { getServerSideProps } from "@server/lib/auth/signin/getServerSideProps";

import SignIn from "~/auth/signin-view";
import type { PageProps as ClientPageProps } from "~/auth/signin-view";
import { createFileRoute } from '@tanstack/react-router';

const getData = withAppDirSsr<ClientPageProps>(getServerSideProps);
const ServerPage = async ({ params, searchParams }: ServerPageProps) => {
  const context = buildLegacyCtx(new Headers(Object.entries(getHeaders()).map(([k, v]) => [k, Array.isArray(v) ? v.join(", ") : String(v ?? "")] as [string, string])), { getAll: () => Object.entries(getCookies()).map(([name, value]) => ({ name, value: String(value ?? "") })) }, await params, await searchParams);
  const session = await getServerSession({ req: context.req });
  if (session) {
    throw redirect({ to: "/" });
  }

  const props = await getData(context);
  return <SignIn {...props} />;
};
export const Route = createFileRoute("/auth/signin")({
  component: ServerPage,
});
