// TODO: remaining `next/navigation` usage was not auto-ported (e.g. `notFound`, `useSelectedLayoutSegments`, `router.prefetch`, multi-arg `redirect`, or redirects in components) — move auth to route loaders when possible — https://tanstack.com/router/latest/docs/framework/react/guide/navigation
import { useRouter } from "next/navigation";

import { useAsPath } from "./useAsPath";

/** @see https://www.joshwcomeau.com/nextjs/refreshing-server-side-props/ */
export function useRefreshData() {
  const router = useRouter();
  const asPath = useAsPath();
  const refreshData = () => {
    if ("refresh" in router) {
      // Refresh the server components
      router.refresh();
    }
    router.replace(asPath);
  };
  return refreshData;
}
