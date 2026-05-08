import { createRouterCaller } from "app/_trpc/context";
import type { PageProps } from "app/_types";
import { _generateMetadata } from "app/_utils";

// TODO: next/headers migration (R4f): `getCookie` / `getHeaders` / `setCookie` / `deleteCookie` / `getCookies` — TanStack Start server context only; `draftMode` / other `next/headers` usage — https://tanstack.com/start/latest/docs/framework/react/guide/server-functions
import { getCookies, getHeaders } from "@tanstack/start/server";


// TODO: next/navigation migration (R4g): use `throw redirect()` in loaders / beforeLoad — client nav: `useNavigate()` — https://tanstack.com/router/latest/docs/framework/react/guide/navigation
import { redirect } from "@tanstack/react-router";

import { z } from "zod";

import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import { AppCategories } from "@calcom/prisma/enums";
import { appsRouter } from "@calcom/trpc/server/routers/viewer/apps/_router";
import { calendarsRouter } from "@calcom/trpc/server/routers/viewer/calendars/_router";

import { buildLegacyRequest } from "@lib/buildLegacyCtx";

import InstalledApps from "~/apps/installed/[category]/installed-category-view";
import { createFileRoute } from '@tanstack/react-router';

const querySchema = z.object({
  category: z.nativeEnum(AppCategories),
});

export const generateMetadata = async ({ params }: { params: Promise<{ category: string }> }) => {
  return await _generateMetadata(
    (t) => t("installed_apps"),
    (t) => t("manage_your_connected_apps"),
    undefined,
    undefined,
    `/apps/installed/${(await params).category}`
  );
};

const InstalledAppsWrapper = async ({ params }: PageProps) => {
  const parsedParams = querySchema.safeParse(await params);

  if (!parsedParams.success) {
    throw redirect({ to: "/apps/installed/calendar" });
  }

  const session = await getServerSession({ req: buildLegacyRequest(new Headers(Object.entries(getHeaders()).map(([k, v]) => [k, Array.isArray(v) ? v.join(", ") : String(v ?? "")] as [string, string])), { getAll: () => Object.entries(getCookies()).map(([name, value]) => ({ name, value: String(value ?? "") })) }) });
  if (!session?.user?.id) {
    throw redirect({ to: "/auth/login" });
  }

  const [calendarsCaller, appsCaller] = await Promise.all([
    createRouterCaller(calendarsRouter),
    createRouterCaller(appsRouter),
  ]);

  const [connectedCalendars, installedCalendars] = await Promise.all([
    calendarsCaller.connectedCalendars(),
    appsCaller.integrations({
      variant: "calendar",
      onlyInstalled: true,
    }),
  ]);

  return (
    <InstalledApps
      connectedCalendars={connectedCalendars}
      installedCalendars={installedCalendars}
      category={parsedParams.data.category}
    />
  );
};

export const Route = createFileRoute("/apps/installed/$category")({
  component: InstalledAppsWrapper,
});
