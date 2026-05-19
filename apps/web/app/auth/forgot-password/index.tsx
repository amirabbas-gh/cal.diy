import type { PageProps as ServerPageProps } from "app/_types";
import { _generateMetadata } from "app/_utils";
import { getCsrfToken } from "next-auth/react";

// TODO: next/headers migration (R4f): `getCookie` / `getHeaders` / `setCookie` / `deleteCookie` / `getCookies` — TanStack Start server context only; `draftMode` / other `next/headers` usage — https://tanstack.com/start/latest/docs/framework/react/guide/server-functions
import { getCookies, getHeaders } from "@tanstack/start/server";


// TODO: next/navigation migration (R4g): use `throw redirect()` in loaders / beforeLoad — client nav: `useNavigate()` — https://tanstack.com/router/latest/docs/framework/react/guide/navigation
import { redirect } from "@tanstack/react-router";


import { getServerSession } from "@calcom/features/auth/lib/getServerSession";

import { buildLegacyCtx } from "@lib/buildLegacyCtx";

import ForgotPassword from "~/auth/forgot-password/forgot-password-view";
import { createFileRoute } from '@tanstack/react-router';

export const generateMetadata = async () => {
  return await _generateMetadata(
    (t) => t("forgot_password"),
    (t) => t("request_password_reset"),
    undefined,
    undefined,
    "/auth/forgot-password"
  );
};

const ServerPage = async ({ params, searchParams }: ServerPageProps) => {
  const context = buildLegacyCtx(new Headers(Object.entries(getHeaders()).map(([k, v]) => [k, Array.isArray(v) ? v.join(", ") : String(v ?? "")] as [string, string])), { getAll: () => Object.entries(getCookies()).map(([name, value]) => ({ name, value: String(value ?? "") })) }, await params, await searchParams);
  const session = await getServerSession({ req: context.req });

  if (session) {
    throw redirect({ to: "/" });
  }

  const csrfToken = await getCsrfToken(context);

  return <ForgotPassword csrfToken={csrfToken} />;
};

export const Route = createFileRoute("/auth/forgot-password")({
  component: ServerPage,
});
