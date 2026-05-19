import { captureException } from "@sentry/nextjs";
import { HttpError } from "@calcom/lib/http-error";
import { getServerErrorFromUnknown } from "@calcom/lib/server/getServerErrorFromUnknown";

import { TRPCError } from "@trpc/server";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";

// TODO: `next/types erasure (R4j)`: replace `any` with real types (`Route.useParams`, `useLoaderData`, `FileRoutesByPath`, etc.) — https://tanstack.com/router/latest/docs/framework/react/guide/router-context
type OnErrorOptions = {
  error: TRPCError;
  req?: any;
  res?: any;
};

export function onErrorHandler({ error }: OnErrorOptions) {
  let httpError: HttpError;
  if (error instanceof TRPCError) {
    const statusCode = getHTTPStatusCodeFromError(error);
    httpError = new HttpError({ statusCode, message: error.message });
  } else {
    httpError = getServerErrorFromUnknown(error);
  }

  // Log errors that aren't client errors (400s)
  if (httpError.statusCode >= 500) {
    captureException(error);
    console.error("Something went wrong", error);
  }
}
