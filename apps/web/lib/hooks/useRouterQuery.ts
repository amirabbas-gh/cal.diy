
// TODO: next/navigation migration (R4g): use `throw redirect()` in loaders / beforeLoad — client nav: `useNavigate()` — https://tanstack.com/router/latest/docs/framework/react/guide/navigation
import { useLocation, useNavigate } from "@tanstack/react-router";

import { useCallback } from "react";

import { useCompatSearchParams } from "@calcom/lib/hooks/useCompatSearchParams";

export default function useRouterQuery<T extends string>(name: T) {
  const searchParams = useCompatSearchParams();
  const pathname = useLocation().pathname;
  const router = useNavigate();

  const setQuery = useCallback(
    (newValue: string | number | null | undefined) => {
      const _searchParams = new URLSearchParams(searchParams ?? undefined);
      if (typeof newValue === "undefined") {
        // when newValue is of type undefined, clear the search param.
        _searchParams.delete(name);
      } else {
        _searchParams.set(name, newValue as string);
      }
      router({ to: `${pathname}?${_searchParams.toString()}`, replace: true });
    },
    [name, pathname, router, searchParams]
  );

  return { [name]: searchParams?.get(name), setQuery } as {
    [K in T]: string | undefined;
  } & { setQuery: typeof setQuery };
}
