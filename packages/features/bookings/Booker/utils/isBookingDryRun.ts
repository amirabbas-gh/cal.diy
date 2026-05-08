// TODO: remaining `next/navigation` usage was not auto-ported (e.g. `notFound`, `useSelectedLayoutSegments`, `router.prefetch`, multi-arg `redirect`, or redirects in components) — move auth to route loaders when possible — https://tanstack.com/router/latest/docs/framework/react/guide/navigation
import type { ReadonlyURLSearchParams } from "next/navigation";

export const isBookingDryRun = (searchParams: URLSearchParams | ReadonlyURLSearchParams) => {
  return searchParams.get("cal.isBookingDryRun") === "true";
};
