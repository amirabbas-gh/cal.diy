"use client";

import { useParams, useSearch } from "@tanstack/react-router";

// TODO: ReadonlyURLSearchParams — narrow to TanStack Route search types (best-effort alias): https://tanstack.com/router/latest/docs/framework/react/guide/search-params
type ReadonlyURLSearchParams = URLSearchParams;


export const useCompatSearchParams = () => {
  const _searchParams = useSearch() ?? new URLSearchParams();
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
