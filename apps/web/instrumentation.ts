import * as Sentry from "@sentry/nextjs";
// TODO: remaining `next` root import — value imports (e.g. `createServer`, `Instrumentation`) have no TanStack twin; port boots/server wiring manually; type-only imports should have been erased by R4j — https://tanstack.com/start/latest/docs/framework/react/migrate-from-next-js
import { type Instrumentation } from "next";

export async function register() {
  if (process.env.NODE_ENV === "production") {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN && process.env.NEXT_RUNTIME === "nodejs") {
      await import("./sentry.server.config");
    }
    if (process.env.NEXT_PUBLIC_SENTRY_DSN && process.env.NEXT_RUNTIME === "edge") {
      await import("./sentry.edge.config");
    }
  }
}

export const onRequestError: Instrumentation.onRequestError = (err, request, context) => {
  if (process.env.NODE_ENV === "production") {
    Sentry.captureRequestError(err, request, context);
  }
};
