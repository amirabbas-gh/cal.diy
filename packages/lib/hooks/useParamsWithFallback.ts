"use client";

import { useNavigate as useCompatRouter, useParams } from "@tanstack/react-router";

// TODO: remaining `next/navigation` usage was not auto-ported (e.g. `notFound`, `useSelectedLayoutSegments`, `router.prefetch`, multi-arg `redirect`, or redirects in components) — move auth to route loaders when possible — https://tanstack.com/router/latest/docs/framework/react/guide/navigation
import { useParams } from "next/navigation";
import type { ParsedUrlQuery } from "node:querystring";

interface Params {
  [key: string]: string | string[];
}

/**
 * This hook is a workaround until pages are migrated to app directory.
 */
export function useParamsWithFallback(): Params | ParsedUrlQuery {
  const params = useParams(); // always `null` in pages router
  const router = useCompatRouter(); // always `null` in app router
  return params ?? router?.query ?? {};
}
