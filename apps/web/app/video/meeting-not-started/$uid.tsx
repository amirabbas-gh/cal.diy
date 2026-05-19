import { withAppDirSsr } from "app/WithAppDirSsr";
import type { PageProps as ServerPageProps } from "app/_types";
import { _generateMetadata } from "app/_utils";

// TODO: next/headers migration (R4f): `getCookie` / `getHeaders` / `setCookie` / `deleteCookie` / `getCookies` — TanStack Start server context only; `draftMode` / other `next/headers` usage — https://tanstack.com/start/latest/docs/framework/react/guide/server-functions
import { getCookies, getHeaders } from "@tanstack/start/server";


// TODO: next/navigation migration (R4g): use `throw redirect()` in loaders / beforeLoad — client nav: `useNavigate()` — https://tanstack.com/router/latest/docs/framework/react/guide/navigation
import { notFound } from "@tanstack/react-router";

import { z } from "zod";

import { BookingRepository } from "@calcom/features/bookings/repositories/BookingRepository";
import { prisma } from "@calcom/prisma";

import { buildLegacyCtx } from "@lib/buildLegacyCtx";
import { getServerSideProps } from "@lib/video/meeting-not-started/[uid]/getServerSideProps";

import type { PageProps as ClientPageProps } from "~/videos/views/videos-meeting-not-started-single-view";
import MeetingNotStarted from "~/videos/views/videos-meeting-not-started-single-view";
import { createFileRoute } from '@tanstack/react-router';

const querySchema = z.object({
  uid: z.string(),
});

export const generateMetadata = async ({ params }: ServerPageProps) => {
  const parsed = querySchema.safeParse(await params);
  if (!parsed.success) {
    throw notFound();
  }
  const bookingRepo = new BookingRepository(prisma);
  const booking = await bookingRepo.findBookingByUid({
    bookingUid: parsed.data.uid,
  });

  return await _generateMetadata(
    (t) => t("this_meeting_has_not_started_yet"),
    () => booking?.title ?? "",
    undefined,
    undefined,
    `/video/meeting-not-started/${parsed.data.uid}`
  );
};

const getData = withAppDirSsr<ClientPageProps>(getServerSideProps);

const ServerPage = async ({ params, searchParams }: ServerPageProps) => {
  const context = buildLegacyCtx(new Headers(Object.entries(getHeaders()).map(([k, v]) => [k, Array.isArray(v) ? v.join(", ") : String(v ?? "")] as [string, string])), { getAll: () => Object.entries(getCookies()).map(([name, value]) => ({ name, value: String(value ?? "") })) }, await params, await searchParams);

  const props = await getData(context);
  return <MeetingNotStarted {...props} />;
};

export const Route = createFileRoute("/video/meeting-not-started/$uid")({
  component: ServerPage,
});
