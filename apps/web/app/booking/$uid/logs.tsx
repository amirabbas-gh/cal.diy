// Added as a separate route for now to ease the testing of the audit logs feature
// It partially matches the figma design - https://www.figma.com/design/wleA2SR6rn60EK7ORxAfMy/Cal.diy-New-Features?node-id=5641-6732&p=f
// TOOD: Move it to the booking page side bar later
import { ShellMainAppDir } from "app/(use-page-wrapper)/(main-nav)/ShellMainAppDir";
import type { PageProps } from "app/_types";
import { _generateMetadata, getTranslate } from "app/_utils";

// TODO: next/headers migration (R4f): `getCookie` / `getHeaders` / `setCookie` / `deleteCookie` / `getCookies` — TanStack Start server context only; `draftMode` / other `next/headers` usage — https://tanstack.com/start/latest/docs/framework/react/guide/server-functions
import { getCookies, getHeaders } from "@tanstack/start/server";


// TODO: next/navigation migration (R4g): use `throw redirect()` in loaders / beforeLoad — client nav: `useNavigate()` — https://tanstack.com/router/latest/docs/framework/react/guide/navigation
import { redirect } from "@tanstack/react-router";


import { getServerSession } from "@calcom/features/auth/lib/getServerSession";

import { buildLegacyRequest } from "@lib/buildLegacyCtx";

import { BookingHistoryPage } from "@calcom/web/modules/booking-audit/components/BookingHistoryPage";
import { createFileRoute } from '@tanstack/react-router';

export const generateMetadata = async ({ params }: { params: Promise<{ uid: string }> }) =>
  await _generateMetadata(
    (t) => t("booking_history"),
    (t) => t("booking_history_description"),
    undefined,
    undefined,
    `/booking/${(await params).uid}/logs`
  );

const Page = async ({ params }: PageProps) => {
  const resolvedParams = await params;
  const bookingUid = resolvedParams.uid;

  if (!bookingUid || typeof bookingUid !== "string") {
    throw redirect({ to: "/bookings/upcoming" });
  }

  const t = await getTranslate();
  const session = await getServerSession({ req: buildLegacyRequest(new Headers(Object.entries(getHeaders()).map(([k, v]) => [k, Array.isArray(v) ? v.join(", ") : String(v ?? "")] as [string, string])), { getAll: () => Object.entries(getCookies()).map(([name, value]) => ({ name, value: String(value ?? "") })) }) });

  if (!session?.user?.id) {
    throw redirect({ to: "/auth/login" });
  }

  return (
    <ShellMainAppDir heading={t("booking_history")} subtitle={t("booking_history_description")}>
      <BookingHistoryPage bookingUid={bookingUid} />
    </ShellMainAppDir>
  );
};

export const Route = createFileRoute("/booking/$uid/logs")({
  component: Page,
});
