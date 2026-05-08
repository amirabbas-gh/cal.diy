// TODO: remaining `next/navigation` usage was not auto-ported (e.g. `notFound`, `useSelectedLayoutSegments`, `router.prefetch`, multi-arg `redirect`, or redirects in components) — move auth to route loaders when possible — https://tanstack.com/router/latest/docs/framework/react/guide/navigation
import type { ReadonlyURLSearchParams } from "next/navigation";

export function getUtmTrackingParameters(searchParams: ReadonlyURLSearchParams | null) {
  if (!searchParams) return undefined;

  const utmParams = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];

  const tracking = Object.fromEntries(
    utmParams.map((param) => [param, searchParams.get(param) ?? undefined])
  );

  return Object.values(tracking).every((value) => value === undefined) ? undefined : tracking;
}
