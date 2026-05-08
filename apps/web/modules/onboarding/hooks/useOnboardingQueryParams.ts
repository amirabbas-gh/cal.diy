"use client";

// TODO: remaining `next/navigation` usage was not auto-ported (e.g. `notFound`, `useSelectedLayoutSegments`, `router.prefetch`, multi-arg `redirect`, or redirects in components) — move auth to route loaders when possible — https://tanstack.com/router/latest/docs/framework/react/guide/navigation
import { useSearchParams } from "next/navigation";

export const useOnboardingQueryParams = () => {
  const searchParams = useSearchParams();

  const bpParam = searchParams?.get("bp");
  const billingPeriod = bpParam === "a" ? ("ANNUALLY" as const) : ("MONTHLY" as const);

  const getQueryString = () => {
    const migrateParam = searchParams?.get("migrate");
    const queryParams = new URLSearchParams();
    if (migrateParam) queryParams.set("migrate", migrateParam);
    if (bpParam) queryParams.set("bp", bpParam);
    return queryParams.toString() ? `?${queryParams.toString()}` : "";
  };

  return { billingPeriod, getQueryString };
};
