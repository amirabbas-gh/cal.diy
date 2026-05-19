
// TODO: next/navigation migration (R4g): use `throw redirect()` in loaders / beforeLoad — client nav: `useNavigate()` — https://tanstack.com/router/latest/docs/framework/react/guide/navigation
import { useNavigate, useRouter } from "@tanstack/react-router";


import { useAsPath } from "./useAsPath";

/** @see https://www.joshwcomeau.com/nextjs/refreshing-server-side-props/ */
export function useRefreshData() {
  const navigate = useNavigate();
  const router = useRouter();
  const asPath = useAsPath();
  const refreshData = () => {
    if ("refresh" in router) {
      // Refresh the server components
      router.invalidate();
    }
    navigate({ to: asPath, replace: true });
  };
  return refreshData;
}
