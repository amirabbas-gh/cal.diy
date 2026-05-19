/**
 * This implementation is adapted from https://github.com/vercel/next.js/issues/51613#issuecomment-1892644565.
 * It is a wrapper around `unstable_cache` that adds serialization and deserialization
 */

// TODO: next/cache migration (R4e): unwrap + optional `*QueryOptions` for `useQuery`/`ensureQueryData`; align with `invalidateQueries` / route loaders — https://tanstack.com/query/latest/docs/framework/react/guides/caching · https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation
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

export const cachedFnQueryOptions = {
  queryKey: ['next-cache', 'cachedFn'] as const,
  queryFn: cachedFn,
};
