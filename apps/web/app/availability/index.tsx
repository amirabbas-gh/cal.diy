import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import { getScheduleListItemData } from "@calcom/lib/schedules/transformers/getScheduleListItemData";
import { availabilityRouter } from "@calcom/trpc/server/routers/viewer/availability/_router";
import { buildLegacyRequest } from "@lib/buildLegacyCtx";
import { createRouterCaller, getTRPCContext } from "app/_trpc/context";
import type { PageProps, ReadonlyHeaders, ReadonlyRequestCookies } from "app/_types";
import { _generateMetadata, getTranslate } from "app/_utils";

// TODO: next/cache migration (R4e): unwrap + optional `*QueryOptions` for `useQuery`/`ensureQueryData`; align with `invalidateQueries` / route loaders — https://tanstack.com/query/latest/docs/framework/react/guides/caching · https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation

// TODO: next/headers migration (R4f): `getCookie` / `getHeaders` / `setCookie` / `deleteCookie` / `getCookies` — TanStack Start server context only; `draftMode` / other `next/headers` usage — https://tanstack.com/start/latest/docs/framework/react/guide/server-functions
import { getHeaders } from "@tanstack/start/server";


// TODO: next/navigation migration (R4g): use `throw redirect()` in loaders / beforeLoad — client nav: `useNavigate()` — https://tanstack.com/router/latest/docs/framework/react/guide/navigation
import { redirect } from "@tanstack/react-router";

import { AvailabilityCTA, AvailabilityList } from "~/availability/availability-view";
import { ShellMainAppDir } from "../(use-page-wrapper)/(main-nav)/ShellMainAppDir";
import { createFileRoute } from '@tanstack/react-router';

export const generateMetadata = async () => {
  return await _generateMetadata(
    (t) => t("availability"),
    (t) => t("configure_availability"),
    undefined,
    undefined,
    "/availability"
  );
};

const getCachedAvailabilities = async (headers: ReadonlyHeaders, cookies: ReadonlyRequestCookies) => {
    const availabilityCaller = await createRouterCaller(
      availabilityRouter,
      await getTRPCContext(headers, cookies)
    );
    return await availabilityCaller.list();
  };

export const getCachedAvailabilitiesQueryOptions = {
  queryKey: ['next-cache', "viewer.availability.list"] as const,
  queryFn: getCachedAvailabilities,
  staleTime: 3600000,
};

const Page = async ({ searchParams: _searchParams }: PageProps) => {
  const searchParams = await _searchParams;
  const t = await getTranslate();
  const _headers = new Headers(Object.entries(getHeaders()).map(([k, v]) => [k, Array.isArray(v) ? v.join(", ") : String(v ?? "")] as [string, string]));
  
  const session = await getServerSession({ req: buildLegacyRequest(_headers, _cookies) });
  if (!session?.user?.id) {
    throw redirect({ to: "/auth/login" });
  }

  const cachedAvailabilities = await getCachedAvailabilities(_headers, _cookies);

  // Transform the data to ensure startTime, endTime, and date are Date objects
  // This is because the data is cached and as a result the data is converted to a string
  const availabilities = {
    ...cachedAvailabilities,
    schedules: cachedAvailabilities.schedules.map((schedule) => getScheduleListItemData(schedule)),
  };

  return (
    <ShellMainAppDir
      heading={t("availability")}
      subtitle={t("configure_availability")}
      CTA={<AvailabilityCTA />}>
      <AvailabilityList availabilities={availabilities ?? { schedules: [] }} />
    </ShellMainAppDir>
  );
};

export const Route = createFileRoute("/availability")({
  component: Page,
});
