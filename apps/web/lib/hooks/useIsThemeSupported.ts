"use client";

// TODO: remaining `next/navigation` usage was not auto-ported (e.g. `notFound`, `useSelectedLayoutSegments`, `router.prefetch`, multi-arg `redirect`, or redirects in components) — move auth to route loaders when possible — https://tanstack.com/router/latest/docs/framework/react/guide/navigation
import { usePathname } from "next/navigation";

const THEME_UNSUPPORTED_ROUTES = ["/auth/setup"];

export default function useIsThemeSupported(): boolean {
  const pathname = usePathname();

  // Check if current pathname matches any unsupported route
  const isUnsupportedRoute = THEME_UNSUPPORTED_ROUTES.some((route) => pathname?.startsWith(route));

  return !isUnsupportedRoute;
}
