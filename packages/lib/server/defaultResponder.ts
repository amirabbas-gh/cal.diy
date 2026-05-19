import { type TraceContext } from "@calcom/lib/tracing";
import { TracedError } from "@calcom/lib/tracing/error";
import { distributedTracing } from "@calcom/lib/tracing/factory";

import { HttpError } from "../http-error";
import { safeStringify } from "../safeStringify";
import { getServerErrorFromUnknown } from "./getServerErrorFromUnknown";
import { performance } from "./perfObserver";
import { getHTTPStatusCodeFromTRPCErrorLike, isTRPCErrorLike } from "./trpcErrorUtils";

// TODO: `next/types erasure (R4j)`: replace `any` with real types (`Route.useParams`, `useLoaderData`, `FileRoutesByPath`, etc.) — https://tanstack.com/router/latest/docs/framework/react/guide/router-context
export interface TracedRequest extends any {
  traceContext: TraceContext;
}

// TODO: `next/types erasure (R4j)`: replace `any` with real types (`Route.useParams`, `useLoaderData`, `FileRoutesByPath`, etc.) — https://tanstack.com/router/latest/docs/framework/react/guide/router-context
type Handle<T> = (req: TracedRequest, res: any) => Promise<T>;

/** Allows us to get type inference from API handler responses */
export function defaultResponder<T>(
  f: Handle<T>,
  /** If set we will wrap the handle with sentry tracing */
  endpointRoute?: string
) {
  // TODO: `next/types erasure (R4j)`: replace `any` with real types (`Route.useParams`, `useLoaderData`, `FileRoutesByPath`, etc.) — https://tanstack.com/router/latest/docs/framework/react/guide/router-context
  return async (req: any, res: any) => {
    let ok = false;
    const operation = endpointRoute ? endpointRoute.replace(/^\//, "").replace(/\//g, "_") : "api_request";
    const traceContext = distributedTracing.createTrace(operation, {
      meta: {
        method: req.method || "",
        url: req.url || "",
      },
    });
    const tracingLogger = distributedTracing.getTracingLogger(traceContext);

    const tracedReq = req as TracedRequest;
    tracedReq.traceContext = traceContext;

    try {
      performance.mark("Start");

      let result: T | undefined;
      if (process.env.NODE_ENV === "development" || !endpointRoute) {
        result = await f(tracedReq, res);
      } else {
        const { wrapApiHandlerWithSentry } = await import("@sentry/nextjs");
        result = await wrapApiHandlerWithSentry(f, endpointRoute)(tracedReq, res);
      }

      ok = true;
      if (result && !res.writableEnded) {
        res.setHeader("X-Trace-Id", traceContext.traceId);
        return res.json(result);
      }
    } catch (err) {
      tracingLogger.error(`${operation} request failed`, safeStringify(err));
      const tracedError = TracedError.createFromError(err, traceContext);
      let error: HttpError;
      if (isTRPCErrorLike(err)) {
        const statusCode = getHTTPStatusCodeFromTRPCErrorLike(err);
        error = new HttpError({ statusCode, message: err.message });
      } else {
        error = getServerErrorFromUnknown(tracedError);
      }
      // we don't want to report Bad Request errors to Sentry / console
      if (!(error.statusCode >= 400 && error.statusCode < 500)) {
        console.error(error);
        const { captureException } = await import("@sentry/nextjs");
        captureException(tracedError);
      }
      res.setHeader("X-Trace-Id", tracedError.traceId);
      return res
        .status(error.statusCode)
        .json({ message: error.message, url: error.url, method: error.method, data: error?.data || null });
    } finally {
      performance.mark("End");
      performance.measure(`[${ok ? "OK" : "ERROR"}][$1] ${req.method} '${req.url}'`, "Start", "End");
    }
  };
}
