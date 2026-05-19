import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import { checkOnboardingRedirect } from "@calcom/features/auth/lib/onboardingUtils";
import { getTeamsFiltersFromQuery } from "@calcom/features/filters/lib/getTeamsFiltersFromQuery";
import type { RouterOutputs } from "@calcom/trpc/react";
import { eventTypesRouter } from "@calcom/trpc/server/routers/viewer/eventTypes/_router";
import { buildLegacyRequest } from "@lib/buildLegacyCtx";
import { createRouterCaller, getTRPCContext } from "app/_trpc/context";
import type { PageProps, ReadonlyHeaders, ReadonlyRequestCookies } from "app/_types";
import { _generateMetadata } from "app/_utils";

// TODO: next/cache migration (R4e): unwrap + optional `*QueryOptions` for `useQuery`/`ensureQueryData`; align with `invalidateQueries` / route loaders — https://tanstack.com/query/latest/docs/framework/react/guides/caching · https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation

// TODO: next/headers migration (R4f): `getCookie` / `getHeaders` / `setCookie` / `deleteCookie` / `getCookies` — TanStack Start server context only; `draftMode` / other `next/headers` usage — https://tanstack.com/start/latest/docs/framework/react/guide/server-functions
import { getHeaders } from "@tanstack/start/server";


// TODO: next/navigation migration (R4g): use `throw redirect()` in loaders / beforeLoad — client nav: `useNavigate()` — https://tanstack.com/router/latest/docs/framework/react/guide/navigation
import { redirect } from "@tanstack/react-router";

import type { ReactElement } from "react";

import { EventTypesWrapper } from "../(use-page-wrapper)/(main-nav)/event-types/EventTypesWrapper";
import { createFileRoute } from '@tanstack/react-router';

const getCachedEventGroups: (
  headers: ReadonlyHeaders,
  cookies: ReadonlyRequestCookies,
  filters?: {
    teamIds?: number[] | undefined;
    userIds?: number[] | undefined;
    upIds?: string[] | undefined;
  }
) => Promise<RouterOutputs["viewer"]["eventTypes"]["getUserEventGroups"]> = async (
    headers: ReadonlyHeaders,
    cookies: ReadonlyRequestCookies,
    filters?: {
      teamIds?: number[] | undefined;
      userIds?: number[] | undefined;
      upIds?: string[] | undefined;
    }
  ): Promise<RouterOutputs["viewer"]["eventTypes"]["getUserEventGroups"]> => {
    const eventTypesCaller = await createRouterCaller(
      eventTypesRouter,
      await getTRPCContext(headers, cookies)
    );
    return await eventTypesCaller.getUserEventGroups({ filters });
  };

export const getCachedEventGroupsQueryOptions = {
  queryKey: ['next-cache', "viewer.eventTypes.getUserEventGroups"] as const,
  queryFn: getCachedEventGroups,
  staleTime: 3600000,
};

const Page = async ({ searchParams }: PageProps): Promise<ReactElement> => {
  const _searchParams = await searchParams;
  const _headers = new Headers(Object.entries(getHeaders()).map(([k, v]) => [k, Array.isArray(v) ? v.join(", ") : String(v ?? "")] as [string, string]));
  

  const session = await getServerSession({
    req: buildLegacyRequest(_headers, _cookies),
  });
  if (!session?.user?.id) {
    throw redirect({ to: "/auth/login" });
  }

  // Check if user needs onboarding and redirect before fetching event types data
  // Use organizationId from session profile if available to avoid extra query
  const organizationId = session.user.profile?.organizationId ?? null;
  const onboardingPath = await checkOnboardingRedirect(session.user.id, {
    checkEmailVerification: true,
    organizationId,
  });
  if (onboardingPath) {
    throw redirect({ to: onboardingPath });
  }

  const filters = getTeamsFiltersFromQuery(_searchParams);
  const userEventGroupsData = await getCachedEventGroups(_headers, _cookies, filters);

  return <EventTypesWrapper userEventGroupsData={userEventGroupsData} user={session.user} />;
};

export const generateMetadata = async (): Promise<ReturnType<typeof _generateMetadata>> =>
  await _generateMetadata(
    (t) => t("event_types_page_title"),
    (t) => t("event_types_page_subtitle"),
    undefined,
    undefined,
    "/event-types"
  );

export const Route = createFileRoute("/event-types")({
  component: Page,
});
