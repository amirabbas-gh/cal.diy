"use client";

import { trpc } from "@calcom/trpc/react";
// TODO: remaining `next/navigation` usage was not auto-ported (e.g. `notFound`, `useSelectedLayoutSegments`, `router.prefetch`, multi-arg `redirect`, or redirects in components) — move auth to route loaders when possible — https://tanstack.com/router/latest/docs/framework/react/guide/navigation
import { useSearchParams } from "next/navigation";

export const useMigrationFlow = () => {
  const searchParams = useSearchParams();
  const migrateParam = searchParams?.get("migrate");
  const isMigrationFlow = migrateParam === "true";

  const teams = { data: [] as unknown[] };
  const isLoading = false;

  const hasTeams = (teams?.data?.length ?? 0) > 0;

  return {
    isMigrationFlow,
    hasTeams,
    teams: teams ?? [],
    isLoading,
  };
};
