/**
 * Typescript class based component for custom-error
 * @link https://nextjs.org/docs/advanced-features/custom-error-page
 */
// TODO: next/dist migration (R4dist): `next/error` was replaced with a local fallback component; customize your global error UI
const NextError = ({ statusCode = 500 }: { statusCode?: number }) => (
  <div role="alert">Unexpected error</div>
);
import React from "react";

import "@calcom/embed-core/src/embed-iframe";
import { getErrorFromUnknown } from "@calcom/lib/errors";
import { HttpError } from "@calcom/lib/http-error";
import logger from "@calcom/lib/logger";
import { redactError } from "@calcom/lib/redactError";

import { ErrorPage } from "@components/error/error-page";

// Adds HttpException to the list of possible error types.
// TODO: `next/types erasure (R4j)`: replace `any` with real types (`Route.useParams`, `useLoaderData`, `FileRoutesByPath`, etc.) — https://tanstack.com/router/latest/docs/framework/react/guide/router-context
type AugmentedError = (NonNullable<any["err"]> & HttpError) | null;
// TODO: `next/types erasure (R4j)`: replace `any` with real types (`Route.useParams`, `useLoaderData`, `FileRoutesByPath`, etc.) — https://tanstack.com/router/latest/docs/framework/react/guide/router-context
type CustomErrorProps = {
  err?: AugmentedError;
  message?: string;
  hasGetInitialPropsRun?: boolean;
} & Omit<any, "err">;

// TODO: `next/types erasure (R4j)`: replace `any` with real types (`Route.useParams`, `useLoaderData`, `FileRoutesByPath`, etc.) — https://tanstack.com/router/latest/docs/framework/react/guide/router-context
type AugmentedNextPageContext = Omit<any, "err"> & {
  err: AugmentedError;
};

const log = logger.getSubLogger({ prefix: ["[error]"] });

// TODO: `next/types erasure (R4j)`: replace `any` with real types (`Route.useParams`, `useLoaderData`, `FileRoutesByPath`, etc.) — https://tanstack.com/router/latest/docs/framework/react/guide/router-context
const CustomError: any<CustomErrorProps> = (props) => {
  const { statusCode, err, message, hasGetInitialPropsRun } = props;

  if (!hasGetInitialPropsRun && err) {
    // getInitialProps is not called in case of
    // https://github.com/vercel/next.js/issues/8592. As a workaround, we pass
    // err via _app.tsx so it can be captured
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const e = getErrorFromUnknown(err);
    // can be captured here
    // e.g. Sentry.captureException(e);
  }
  return <ErrorPage statusCode={statusCode} error={err} message={message} />;
};

/**
 * Partially adapted from the example in
 * https://github.com/vercel/next.js/tree/canary/examples/with-sentry
 */
CustomError.getInitialProps = async (ctx: AugmentedNextPageContext) => {
  const { res, err, asPath } = ctx;
  // TODO: `next/types erasure (R4j)`: replace `any` with real types (`Route.useParams`, `useLoaderData`, `FileRoutesByPath`, etc.) — https://tanstack.com/router/latest/docs/framework/react/guide/router-context
  const errorInitialProps = (await NextError.getInitialProps({
    res,
    err,
  } as any)) as CustomErrorProps;

  // Workaround for https://github.com/vercel/next.js/issues/8592, mark when
  // getInitialProps has run
  errorInitialProps.hasGetInitialPropsRun = true;

  // If a HttpError message, let's override defaults
  if (err instanceof HttpError) {
    const redactedError = redactError(err);
    errorInitialProps.statusCode = err.statusCode;
    errorInitialProps.title = redactedError.name;
    errorInitialProps.message = redactedError.message;
    errorInitialProps.err = {
      ...redactedError,
      url: err.url,
      statusCode: err.statusCode,
      cause: err.cause,
      method: err.method,
    };
  }

  if (res) {
    // Running on the server, the response object is available.
    //
    // Next.js will pass an err on the server if a page's `getInitialProps`
    // threw or returned a Promise that rejected

    // Overrides http status code if present in errorInitialProps
    res.statusCode = errorInitialProps.statusCode;

    log.debug(`server side logged this: ${err?.toString() ?? JSON.stringify(err)}`);
    log.info("return props, ", errorInitialProps);

    return errorInitialProps;
  } else {
    // Running on the client (browser).
    //
    // Next.js will provide an err if:
    //
    //  - a page's `getInitialProps` threw or returned a Promise that rejected
    //  - an exception was thrown somewhere in the React lifecycle (render,
    //    componentDidMount, etc) that was caught by Next.js's React Error
    //    Boundary. Read more about what types of exceptions are caught by Error
    //    Boundaries: https://reactjs.org/docs/error-boundaries.html
    if (err) {
      log.info("client side logged this", err);
      return errorInitialProps;
    }
  }

  // If this point is reached, getInitialProps was called without any
  // information about what the error might be. This is unexpected and may
  // indicate a bug introduced in Next.js
  new Error(`_error.tsx getInitialProps missing data at path: ${asPath}`);

  return errorInitialProps;
};

export default CustomError;
