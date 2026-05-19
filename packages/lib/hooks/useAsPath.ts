import { useLocation, useSearch } from "@tanstack/react-router";

import { useMemo } from "react";

export function useAsPath() {
  const pathname = useLocation().pathname;
  const searchParams = useSearch();
  const asPath = useMemo(
    () => `${pathname}${searchParams ? `?${searchParams.toString()}` : ""}`,
    [pathname, searchParams]
  );
  return asPath;
}
