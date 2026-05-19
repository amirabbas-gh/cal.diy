
// TODO: next/cache migration (R4e): wire `queryClient` through QueryClientProvider or your app root; align `useQuery({ queryKey })` with `['next-cache', 'tag', …]` / `['next-cache', 'path', …]` from `revalidateTag` / `revalidatePath`; former `unstable_cache` / `cache` TTL/tags → `staleTime` / `gcTime` / loaders; if you relied on `unstable_noStore`, use `staleTime: 0` (or refetch) for that data — https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation
import { queryClient } from "../../query-client";


import { TravelScheduleRepository } from "@calcom/features/travelSchedule/repositories/TravelScheduleRepository";
import { NEXTJS_CACHE_TTL } from "@calcom/lib/constants";
import { unstable_cache } from "@calcom/lib/unstable_cache";
import { createServerFn } from '@tanstack/react-start';

const CACHE_TAGS = {
  TRAVEL_SCHEDULES: "TravelRepository.findTravelSchedulesByUserId",
} as const;

export const getTravelSchedule = unstable_cache(
  async (userId: number) => {
    return await TravelScheduleRepository.findTravelSchedulesByUserId(userId);
  },
  ["getTravelSchedule"],
  {
    revalidate: NEXTJS_CACHE_TTL,
    tags: [CACHE_TAGS.TRAVEL_SCHEDULES],
  }
);

export const revalidateTravelSchedules = createServerFn().handler(async () => {
  queryClient.invalidateQueries({ queryKey: ['next-cache', 'tag', CACHE_TAGS.TRAVEL_SCHEDULES] });
});
