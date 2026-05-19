"use client";

import * as Sentry from "@sentry/nextjs";
// TODO: remaining `next` root import — value imports (e.g. `createServer`, `Instrumentation`) have no TanStack twin; port boots/server wiring manually; type-only imports should have been erased by R4j — https://tanstack.com/start/latest/docs/framework/react/migrate-from-next-js
import { type NextPage } from "next";
import { useEffect } from "react";

import CustomError from "./error";
import type { ErrorProps } from "./error";

export const GlobalError: NextPage<ErrorProps> = (props) => {
  useEffect(() => {
    Sentry.captureException(props.error);
  }, [props.error]);
  return (
    <html>
      <body>
        <CustomError {...props} />
      </body>
    </html>
  );
};

export default GlobalError;
