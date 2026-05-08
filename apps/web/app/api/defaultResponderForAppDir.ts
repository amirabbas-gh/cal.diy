// TODO: Next.js pages/api route — convert the handler to TanStack Start server route handlers (Web Request/Response) — https://tanstack.com/start/latest/docs/framework/react/guide/server-routes
import type { Params } from "app/_types";
// TODO: port or remove this `next/dist/server/api-utils` import for TanStack Start — https://tanstack.com/start/latest/docs/framework/react/migrate-from-next-js
import { ApiError } from "next/dist/server/api-utils";

// TODO: next/server migration (R4h): confirm `Request`/`Response` types match your runtime; port remaining `next/server` helpers — https://tanstack.com/start/latest/docs/framework/react/guide/server-routes



import { HttpError } from "@calcom/lib/http-error";
import { getServerErrorFromUnknown } from "@calcom/lib/server/getServerErrorFromUnknown";
import { performance } from "@calcom/lib/server/perfObserver";

import { TRPCError } from "@trpc/server";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";

type Handler<T extends Response | Response = Response> = (
  req: Request,
  { params }: { params: Promise<Params> }
) => Promise<T>;

export const defaultResponderForAppDir = <T extends Response | Response = Response>(
  handler: Handler<T>,
  endpointRoute?: string
) => {
  return async (req: Request, { params }: { params: Promise<Params> }) => {
    let ok = false;
    try {
      performance.mark("Start");
      let result: T | undefined;
      if (process.env.NODE_ENV === "development" || !endpointRoute) {
        result = await handler(req, { params });
      } else {
        const { wrapApiHandlerWithSentry } = await import("@sentry/nextjs");
        result = await wrapApiHandlerWithSentry(async () => await handler(req, { params }), endpointRoute)();
      }

      ok = true;
      if (result) {
        return result;
      }

      return Response.json({});
    } catch (error) {
      let serverError: HttpError;

      if (error instanceof TRPCError) {
        const statusCode = getHTTPStatusCodeFromError(error);
        serverError = new HttpError({ statusCode, message: error.message });
      } else if (error instanceof ApiError) {
        serverError = new HttpError({
          message: error.message,
          statusCode: error.statusCode,
          url: req.url,
          method: req.method,
        });
      } else {
        serverError = getServerErrorFromUnknown(error);
      }

      // Don't report 400-499 errors to Sentry/console
      if (!(serverError.statusCode >= 400 && serverError.statusCode < 500)) {
        console.error(serverError);
        const { captureException } = await import("@sentry/nextjs");
        captureException(error);
      }

      return Response.json(
        {
          message: serverError.message,
          url: serverError.url,
          method: serverError.method,
        },
        {
          status: serverError.statusCode,
        }
      );
    } finally {
      performance.mark("End");
      performance.measure(`[${ok ? "OK" : "ERROR"}][${req.method}] '${req.url}'`, "Start", "End");
    }
  };
};
