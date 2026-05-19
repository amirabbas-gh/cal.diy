// TODO: ReadonlyURLSearchParams — narrow to TanStack Route search types (best-effort alias): https://tanstack.com/router/latest/docs/framework/react/guide/search-params
type ReadonlyURLSearchParams = URLSearchParams;


export function getUtmTrackingParameters(searchParams: ReadonlyURLSearchParams | null) {
  if (!searchParams) return undefined;

  const utmParams = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];

  const tracking = Object.fromEntries(
    utmParams.map((param) => [param, searchParams.get(param) ?? undefined])
  );

  return Object.values(tracking).every((value) => value === undefined) ? undefined : tracking;
}
