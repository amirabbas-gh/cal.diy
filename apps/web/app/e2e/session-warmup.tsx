import process from "node:process";


// TODO: next/navigation migration (R4g): use `throw redirect()` in loaders / beforeLoad — client nav: `useNavigate()` — https://tanstack.com/router/latest/docs/framework/react/guide/navigation
import { notFound, createFileRoute } from "@tanstack/react-router";


/**
 * E2E-only page for warming up the NextAuth session.
 * This triggers the jwt and session callbacks that populate the session
 * with profile, org, and other important data.
 *
 * Only available when NEXT_PUBLIC_IS_E2E=1 is set (automatically set by playwright.config.ts)
 * or in development mode.
 */
const Page = (): JSX.Element => {
  // Gate this page to E2E test mode or dev only
  if (process.env.NEXT_PUBLIC_IS_E2E !== "1" && process.env.NODE_ENV !== "development") {
    throw notFound();
  }

  return <div></div>;
};

export const Route = createFileRoute("/e2e/session-warmup")({
  component: Page,
});
