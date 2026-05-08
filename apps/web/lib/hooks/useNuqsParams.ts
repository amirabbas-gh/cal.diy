"use client";

// TODO: remaining `next/navigation` usage was not auto-ported (e.g. `notFound`, `useSelectedLayoutSegments`, `router.prefetch`, multi-arg `redirect`, or redirects in components) — move auth to route loaders when possible — https://tanstack.com/router/latest/docs/framework/react/guide/navigation
import { usePathname } from "next/navigation";
import { useMemo } from "react";

export function useNuqsParams() {
  const pathname = usePathname();
  const isBookingsPage = pathname?.startsWith("/bookings/");

  return useMemo(() => {
    if (isBookingsPage) {
      return { processUrlSearchParams: putUidFirstInQueryParams };
    }
    return {};
  }, [isBookingsPage]);
}

function putUidFirstInQueryParams(searchParams: URLSearchParams) {
  const params = new URLSearchParams(searchParams);
  const entries = Array.from(params.entries());

  // Clear existing params
  entries.forEach(([key]) => params.delete(key));

  // Sort entries with "uid" first, then alphabetically
  const sortedEntries = entries.sort(([keyA], [keyB]) => {
    if (keyA === "uid") return -1;
    if (keyB === "uid") return 1;
    return keyA.localeCompare(keyB);
  });

  // Re-add sorted entries
  sortedEntries.forEach(([key, value]) => params.append(key, value));

  return params;
}
