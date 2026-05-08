/**
 * This implementation is adapted from https://github.com/vercel/next.js/issues/51613#issuecomment-1892644565.
 * It is a wrapper around `unstable_cache` that adds serialization and deserialization
 */

// TODO: next/cache migration (R4e): wire `queryClient` through QueryClientProvider or your app root; every `invalidateQueries({ queryKey })` must match a real `useQuery` key; former `unstable_cache` TTL/tags → `staleTime` / gcTime / loaders; if you relied on `unstable_noStore`, use `staleTime: 0` (or refetch) for that data — https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation
import { parse, stringify } from "superjson";

export const cache = <T, P extends unknown[]>(
  fn: (...params: P) => Promise<T>,
  keys: Parameters<typeof unstable_cache>[1],
  opts: Parameters<typeof unstable_cache>[2]
) => {
  const wrap = async (params: unknown[]): Promise<string> => {
    const result = await fn(...(params as P));
    return stringify(result);
  };

  const cachedFn = wrap;

  return async (...params: P): Promise<T> => {
    const result = await cachedFn(params);
    return parse(result);
  };
};
