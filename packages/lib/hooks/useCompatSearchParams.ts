"use client";

// TODO: remaining `next/navigation` usage was not auto-ported (e.g. `notFound`, `useSelectedLayoutSegments`, `router.prefetch`, multi-arg `redirect`, or redirects in components) — move auth to route loaders when possible — https://tanstack.com/router/latest/docs/framework/react/guide/navigation
import { ReadonlyURLSearchParams, useParams, useSearchParams } from "next/navigation";

export const useCompatSearchParams = () => {
  const _searchParams = useSearchParams() ?? new URLSearchParams();
  const params = useParams() ?? {};

  const searchParams = new URLSearchParams(_searchParams.toString());
  Object.getOwnPropertyNames(params).forEach((key) => {
    searchParams.delete(key);

    // Though useParams is supposed to return a string/string[] as the key's value but it is found to return undefined as well.
    // Maybe it happens for pages dir when using optional catch-all routes.
    const param = params[key] || "";
    const paramArr = typeof param === "string" ? param.split("/") : param;

    paramArr.forEach((p) => {
      searchParams.append(key, p);
    });
  });

  return new ReadonlyURLSearchParams(searchParams);
};
