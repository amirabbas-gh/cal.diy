import { MembershipRepository } from "@calcom/features/membership/repositories/MembershipRepository";
import { NEXTJS_CACHE_TTL } from "@calcom/lib/constants";

// TODO: next/cache migration (R4e): wire `queryClient` through QueryClientProvider or your app root; every `invalidateQueries({ queryKey })` must match a real `useQuery` key; former `unstable_cache` TTL/tags → `staleTime` / gcTime / loaders; if you relied on `unstable_noStore`, use `staleTime: 0` (or refetch) for that data — https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation
import { queryClient } from "../../query-client";

import { createServerFn } from '@tanstack/react-start';

const CACHE_TAGS = {
  HAS_TEAM_PLAN: "MembershipRepository.hasAnyAcceptedMembershipByUserId",
} as const;

export const getCachedHasTeamPlan = async (userId: number) => {
    const hasTeamPlan = await MembershipRepository.hasAnyAcceptedMembershipByUserId(userId);

    return { hasTeamPlan: !!hasTeamPlan };
  };

export const revalidateHasTeamPlan = createServerFn().handler(async () => {
  queryClient.invalidateQueries({ queryKey: [CACHE_TAGS.HAS_TEAM_PLAN] });
});
