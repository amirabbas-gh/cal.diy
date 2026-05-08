import { createRouterCaller } from "app/_trpc/context";
import type { PageProps as ServerPageProps } from "app/_types";
import { _generateMetadata } from "app/_utils";

// TODO: next/headers migration (R4f): `getCookie` / `getHeaders` / `setCookie` / `deleteCookie` / `getCookies` — TanStack Start server context only; `draftMode` / other `next/headers` usage — https://tanstack.com/start/latest/docs/framework/react/guide/server-functions
import { getCookies, getHeaders } from "@tanstack/start/server";


// TODO: next/navigation migration (R4g): use `throw redirect()` in loaders / beforeLoad — client nav: `useNavigate()` — https://tanstack.com/router/latest/docs/framework/react/guide/navigation
import { redirect } from "@tanstack/react-router";


import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import { UserRepository } from "@calcom/features/users/repositories/UserRepository";
import { APP_NAME } from "@calcom/lib/constants";
import prisma from "@calcom/prisma";
import { meRouter } from "@calcom/trpc/server/routers/viewer/me/_router";

import { buildLegacyRequest } from "@lib/buildLegacyCtx";

import Page from "~/getting-started/[[...step]]/onboarding-view";
import { createFileRoute } from '@tanstack/react-router';

export const generateMetadata = async ({ params }: ServerPageProps) => {
  const stepParam = (await params).step;
  const step = stepParam && Array.isArray(stepParam) ? stepParam.join("/") : "";
  return await _generateMetadata(
    (t) => `${APP_NAME} - ${t("getting_started")}`,
    () => "",
    true,
    undefined,
    `/getting-started${step ? `/${step}` : ""}`
  );
};

const ServerPage = async ({ params, searchParams }: ServerPageProps) => {
  const session = await getServerSession({ req: buildLegacyRequest(new Headers(Object.entries(getHeaders()).map(([k, v]) => [k, Array.isArray(v) ? v.join(", ") : String(v ?? "")] as [string, string])), { getAll: () => Object.entries(getCookies()).map(([name, value]) => ({ name, value: String(value ?? "") })) }) });

  if (!session?.user?.id) {
    throw redirect({ to: "/auth/login" });
  }

  const userRepo = new UserRepository(prisma);
  const meCaller = await createRouterCaller(meRouter);

  const [userTeams, user] = await Promise.all([
    userRepo.findUserTeams({
      id: session.user.id,
    }),
    meCaller.get(),
  ]);

  if (!userTeams || !user) {
    throw redirect({ to: "/auth/login" });
  }

  return <Page user={user} hasPendingInvites={!!userTeams.teams.find((team) => team.accepted === false)} />;
};

export const Route = createFileRoute("/getting-started/$")({
  component: ServerPage,
});
