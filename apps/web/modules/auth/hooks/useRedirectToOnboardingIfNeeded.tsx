"use client";


// TODO: next/navigation migration (R4g): use `throw redirect()` in loaders / beforeLoad — client nav: `useNavigate()` — https://tanstack.com/router/latest/docs/framework/react/guide/navigation
import { useLocation, useNavigate } from "@tanstack/react-router";

import { useEffect } from "react";

import dayjs from "@calcom/dayjs";
import { useFlagMap } from "@calcom/features/flags/context/provider";
import type { User } from "@calcom/prisma/client";
import useMeQuery from "@calcom/trpc/react/hooks/useMeQuery";

const shouldShowOnboarding = (
  user: Pick<User, "createdDate" | "completedOnboarding"> & {
    organizationId: number | null;
  }
) => {
  return (
    !user.completedOnboarding &&
    !user.organizationId &&
    dayjs(user.createdDate).isAfter(ONBOARDING_INTRODUCED_AT)
  );
};

export const ONBOARDING_INTRODUCED_AT = dayjs("September 1 2021").toISOString();

export const ONBOARDING_NEXT_REDIRECT = {
  redirect: {
    permanent: false,
    destination: "/getting-started",
  },
} as const;

export function useRedirectToOnboardingIfNeeded() {
  const router = useNavigate();
  const pathname = useLocation().pathname;
  const { data: user, isLoading } = useMeQuery();
  const flags = useFlagMap();

  const needsEmailVerification =
    !user?.emailVerified && user?.identityProvider === "CAL" && flags["email-verification"];

  const shouldRedirectToOnboarding = user && shouldShowOnboarding(user);
  // Don't redirect if already on an onboarding page (works for both old [[...step]] and v3 flows)
  const isOnOnboardingPage = pathname?.startsWith("/onboarding/") || pathname?.startsWith("/getting-started");
  const canRedirect =
    !isLoading && shouldRedirectToOnboarding && !needsEmailVerification && !isOnOnboardingPage;

  useEffect(() => {
    if (canRedirect) {
      const gettingStartedPath = flags["onboarding-v3"] ? "/onboarding/getting-started" : "/getting-started";
      router({ to: gettingStartedPath, replace: true });
    }
  }, [canRedirect, router, flags, pathname]);

  return {
    isLoading,
    shouldRedirectToOnboarding,
  };
}
