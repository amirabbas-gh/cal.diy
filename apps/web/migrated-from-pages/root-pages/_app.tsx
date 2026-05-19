import type { IncomingMessage } from "node:http";
import { SessionProvider } from "next-auth/react";
import React from "react";
import CacheProvider from "react-inlinesvg/provider";

import { WebPushProvider } from "@calcom/web/modules/notifications/components/WebPushContext";
import { trpc } from "@calcom/trpc/react";

import type { AppProps } from "@lib/app-providers";

import "../styles/globals.css";

function MyApp(props: AppProps) {
  const { Component, pageProps } = props;

  return (
    <SessionProvider session={pageProps.session ?? undefined}>
      <WebPushProvider>
        {/* @ts-expect-error FIXME remove this comment when upgrading typescript to v5 */}
        <CacheProvider>
          {Component.PageWrapper ? <Component.PageWrapper {...props} /> : <Component {...pageProps} />}
        </CacheProvider>
      </WebPushProvider>
    </SessionProvider>
  );
}

declare global {
  interface Window {
    calNewLocale: string;
  }
}

// TODO: `next/types erasure (R4j)`: replace `any` with real types (`Route.useParams`, `useLoaderData`, `FileRoutesByPath`, etc.) — https://tanstack.com/router/latest/docs/framework/react/guide/router-context
MyApp.getInitialProps = async ({ ctx }: { ctx: any }) => {
  const { req } = ctx;

  let newLocale = "en";

  if (req) {
    const { getLocale } = await import("@calcom/features/auth/lib/getLocale");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    newLocale = await getLocale(req as IncomingMessage & { cookies: Record<string, any> });
  } else if (typeof window !== "undefined" && window.calNewLocale) {
    newLocale = window.calNewLocale;
  }

  return {
    pageProps: {
      newLocale,
    },
  };
};

const WrappedMyApp = trpc.withTRPC(MyApp);

// TODO: root layout shape not supported; convert manually to createRootRoute — https://tanstack.com/router/latest/docs/framework/react/api/router/createRootRouteFunction
export default WrappedMyApp;
