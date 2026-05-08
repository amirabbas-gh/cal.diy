// TODO: remaining `next/navigation` usage was not auto-ported (e.g. `notFound`, `useSelectedLayoutSegments`, `router.prefetch`, multi-arg `redirect`, or redirects in components) — move auth to route loaders when possible — https://tanstack.com/router/latest/docs/framework/react/guide/navigation
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo } from "react";

export function useAsPath() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const asPath = useMemo(
    () => `${pathname}${searchParams ? `?${searchParams.toString()}` : ""}`,
    [pathname, searchParams]
  );
  return asPath;
}
