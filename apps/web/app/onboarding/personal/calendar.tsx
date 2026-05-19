import { _generateMetadata } from "app/_utils";

// TODO: next/headers migration (R4f): `getCookie` / `getHeaders` / `setCookie` / `deleteCookie` / `getCookies` — TanStack Start server context only; `draftMode` / other `next/headers` usage — https://tanstack.com/start/latest/docs/framework/react/guide/server-functions
import { getCookies, getHeaders } from "@tanstack/start/server";


// TODO: next/navigation migration (R4g): use `throw redirect()` in loaders / beforeLoad — client nav: `useNavigate()` — https://tanstack.com/router/latest/docs/framework/react/guide/navigation
import { redirect } from "@tanstack/react-router";


import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import { APP_NAME } from "@calcom/lib/constants";

import { buildLegacyRequest } from "@lib/buildLegacyCtx";

import { PersonalCalendarView } from "~/onboarding/personal/calendar/personal-calendar-view";
import { createFileRoute } from '@tanstack/react-router';

export const generateMetadata = async () => {
  return await _generateMetadata(
    (t) => `${APP_NAME} - ${t("connect_calendar")}`,
    () => "",
    true,
    undefined,
    "/onboarding/personal/calendar"
  );
};

const ServerPage = async () => {
  const session = await getServerSession({ req: buildLegacyRequest(new Headers(Object.entries(getHeaders()).map(([k, v]) => [k, Array.isArray(v) ? v.join(", ") : String(v ?? "")] as [string, string])), { getAll: () => Object.entries(getCookies()).map(([name, value]) => ({ name, value: String(value ?? "") })) }) });

  if (!session?.user?.id) {
    throw redirect({ to: "/auth/login" });
  }

  const userEmail = session.user.email || "";

  return <PersonalCalendarView userEmail={userEmail} />;
};

export const Route = createFileRoute("/onboarding/personal/calendar")({
  component: ServerPage,
});
