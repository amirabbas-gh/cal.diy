import { createRouterCaller } from "app/_trpc/context";
import { _generateMetadata } from "app/_utils";

// TODO: next/headers migration (R4f): `getCookie` / `getHeaders` / `setCookie` / `deleteCookie` / `getCookies` — TanStack Start server context only; `draftMode` / other `next/headers` usage — https://tanstack.com/start/latest/docs/framework/react/guide/server-functions
import { getCookies, getHeaders } from "@tanstack/start/server";


// TODO: next/navigation migration (R4g): use `throw redirect()` in loaders / beforeLoad — client nav: `useNavigate()` — https://tanstack.com/router/latest/docs/framework/react/guide/navigation
import { redirect } from "@tanstack/react-router";


import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import { meRouter } from "@calcom/trpc/server/routers/viewer/me/_router";
import { getTravelSchedule } from "@calcom/web/app/cache/travelSchedule";

import { buildLegacyRequest } from "@lib/buildLegacyCtx";

import GeneralView from "~/settings/my-account/general-view";
import { createFileRoute } from '@tanstack/react-router';

export const generateMetadata = async () =>
  await _generateMetadata(
    (t) => t("general"),
    (t) => t("general_description"),
    undefined,
    undefined,
    "/settings/my-account/general"
  );

const Page = async () => {
  const session = await getServerSession({ req: buildLegacyRequest(new Headers(Object.entries(getHeaders()).map(([k, v]) => [k, Array.isArray(v) ? v.join(", ") : String(v ?? "")] as [string, string])), { getAll: () => Object.entries(getCookies()).map(([name, value]) => ({ name, value: String(value ?? "") })) }) });
  const userId = session?.user?.id;
  const redirectUrl = "/auth/login?callbackUrl=/settings/my-account/general";

  if (!userId) {
    throw redirect({ to: redirectUrl });
  }

  const meCaller = await createRouterCaller(meRouter);
  const [user, travelSchedules] = await Promise.all([meCaller.get(), getTravelSchedule(userId)]);
  if (!user) {
    throw redirect({ to: redirectUrl });
  }
  return <GeneralView user={user} travelSchedules={travelSchedules ?? []} />;
};

export const Route = createFileRoute("/settings/my-account/general")({
  component: Page,
});
