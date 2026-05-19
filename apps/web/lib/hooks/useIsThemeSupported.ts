"use client";

import { useLocation } from "@tanstack/react-router";


const THEME_UNSUPPORTED_ROUTES = ["/auth/setup"];

export default function useIsThemeSupported(): boolean {
  const pathname = useLocation().pathname;

  // Check if current pathname matches any unsupported route
  const isUnsupportedRoute = THEME_UNSUPPORTED_ROUTES.some((route) => pathname?.startsWith(route));

  return !isUnsupportedRoute;
}
