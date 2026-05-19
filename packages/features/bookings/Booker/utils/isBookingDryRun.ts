// TODO: ReadonlyURLSearchParams — narrow to TanStack Route search types (best-effort alias): https://tanstack.com/router/latest/docs/framework/react/guide/search-params
type ReadonlyURLSearchParams = URLSearchParams;


export const isBookingDryRun = (searchParams: URLSearchParams | ReadonlyURLSearchParams) => {
  return searchParams.get("cal.isBookingDryRun") === "true";
};
