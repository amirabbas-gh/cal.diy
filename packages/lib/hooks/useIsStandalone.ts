"use client";

import { useSearch } from "@tanstack/react-router";


export const useIsStandalone = () => {
  const searchParams = useSearch();
  return searchParams?.get("standalone") === "true";
};
