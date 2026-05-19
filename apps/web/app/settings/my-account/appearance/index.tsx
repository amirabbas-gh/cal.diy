import { createRouterCaller } from "app/_trpc/context";
import { _generateMetadata } from "app/_utils";

// TODO: next/headers migration (R4f): `getCookie` / `getHeaders` / `setCookie` / `deleteCookie` / `getCookies` — TanStack Start server context only; `draftMode` / other `next/headers` usage — https://tanstack.com/start/latest/docs/framework/react/guide/server-functions
import { getCookies, getHeaders } from "@tanstack/start/server";


// TODO: next/navigation migration (R4g): use `throw redirect()` in loaders / beforeLoad — client nav: `useNavigate()` — https://tanstack.com/router/latest/docs/framework/react/guide/navigation
import { redirect } from "@tanstack/react-router";


import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import { IS_SELF_HOSTED } from "@calcom/lib/constants";
import hasKeyInMetadata from "@calcom/lib/hasKeyInMetadata";
import { meRouter } from "@calcom/trpc/server/routers/viewer/me/_router";
import { getCachedHasTeamPlan } from "@calcom/web/app/cache/membership";

import { buildLegacyRequest } from "@lib/buildLegacyCtx";

import AppearancePage from "~/settings/my-account/appearance-view";
import { createFileRoute } from '@tanstack/react-router';

export const generateMetadata = async () =>
  await _generateMetadata(
    (t) => t("appearance"),
    (t) => t("appearance_description"),
    undefined,
    undefined,
    "/settings/my-account/appearance"
  );

const Page = async () => {
  const session = await getServerSession({ req: buildLegacyRequest(new Headers(Object.entries(getHeaders()).map(([k, v]) => [k, Array.isArray(v) ? v.join(", ") : String(v ?? "")] as [string, string])), { getAll: () => Object.entries(getCookies()).map(([name, value]) => ({ name, value: String(value ?? "") })) }) });
  const userId = session?.user?.id;
  const redirectUrl = "/auth/login?callbackUrl=/settings/my-account/appearance";

  if (!userId) {
    throw redirect({ to: redirectUrl });
  }

  const [meCaller, hasTeamPlan] = await Promise.all([
    createRouterCaller(meRouter),
    getCachedHasTeamPlan(userId),
  ]);

  const user = await meCaller.get();

  if (!user) {
    throw redirect({ to: redirectUrl });
  }
  const isCurrentUsernamePremium =
    user && hasKeyInMetadata(user, "isPremium") ? !!user.metadata.isPremium : false;
  const hasPaidPlan = IS_SELF_HOSTED ? true : hasTeamPlan?.hasTeamPlan || isCurrentUsernamePremium;

  return <AppearancePage user={user} hasPaidPlan={hasPaidPlan} />;
};

export const Route = createFileRoute("/settings/my-account/appearance")({
  component: Page,
});
