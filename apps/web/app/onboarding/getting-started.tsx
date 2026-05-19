import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import { MembershipRepository } from "@calcom/features/membership/repositories/MembershipRepository";
import { APP_NAME } from "@calcom/lib/constants";
import { buildLegacyRequest } from "@lib/buildLegacyCtx";
import { _generateMetadata } from "app/_utils";

// TODO: next/headers migration (R4f): `getCookie` / `getHeaders` / `setCookie` / `deleteCookie` / `getCookies` — TanStack Start server context only; `draftMode` / other `next/headers` usage — https://tanstack.com/start/latest/docs/framework/react/guide/server-functions
import { getCookies, getHeaders } from "@tanstack/start/server";


// TODO: next/navigation migration (R4g): use `throw redirect()` in loaders / beforeLoad — client nav: `useNavigate()` — https://tanstack.com/router/latest/docs/framework/react/guide/navigation
import { redirect } from "@tanstack/react-router";


import { OnboardingView } from "~/onboarding/getting-started/onboarding-view";
import { createFileRoute } from '@tanstack/react-router';

export const generateMetadata = async () => {
  return await _generateMetadata(
    (t) => `${APP_NAME} - ${t("getting_started")}`,
    () => "",
    true,
    undefined,
    "/onboarding/getting-started"
  );
};

const ServerPage = async () => {
  const session = await getServerSession({ req: buildLegacyRequest(new Headers(Object.entries(getHeaders()).map(([k, v]) => [k, Array.isArray(v) ? v.join(", ") : String(v ?? "")] as [string, string])), { getAll: () => Object.entries(getCookies()).map(([name, value]) => ({ name, value: String(value ?? "") })) }) });

  if (!session?.user?.id) {
    throw redirect({ to: "/auth/login" });
  }

  // If user has any team membership (pending or accepted), redirect them directly to personal onboarding
  // This handles the case where users sign up with an invite token (membership is auto-accepted)
  const hasTeamMembership = await MembershipRepository.hasAnyTeamMembershipByUserId({
    userId: session.user.id,
  });
  if (hasTeamMembership) {
    throw redirect({ to: "/onboarding/personal/settings" });
  }

  const userEmail = session.user.email || "";

  return <OnboardingView userEmail={userEmail} />;
};

export const Route = createFileRoute("/onboarding/getting-started")({
  component: ServerPage,
});
