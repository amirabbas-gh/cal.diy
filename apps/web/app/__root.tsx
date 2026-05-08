import { getLocale } from "@calcom/features/auth/lib/getLocale";
import { loadTranslations } from "@calcom/i18n/server";
import { IconSprites } from "@calcom/ui/components/icon";
import { buildLegacyRequest } from "@lib/buildLegacyCtx";
import { dir } from "i18next";

// TODO: next/headers migration (R4f): `getCookie` / `getHeaders` / `setCookie` / `deleteCookie` / `getCookies` — TanStack Start server context only; `draftMode` / other `next/headers` usage — https://tanstack.com/start/latest/docs/framework/react/guide/server-functions
import { getCookies, getHeaders } from "@tanstack/start/server";

// TODO: replace `next/script` with plain <script>/<head> or TanStack router head APIs as needed — https://tanstack.com/start/latest/docs/framework/react/migrate-from-next-js
import Script from "next/script";
import type React from "react";

import "../styles/globals.css";
import { AppRouterI18nProvider } from "./AppRouterI18nProvider";
import { Providers } from "./providers";
import { SpeculationRules } from "./SpeculationRules";
import { Outlet, createRootRoute, HeadContent, Scripts } from '@tanstack/react-router';
import appCss from '../styles/globals.css?url';


const getInitialProps = async () => {
  const h = new Headers(Object.entries(getHeaders()).map(([k, v]) => [k, Array.isArray(v) ? v.join(", ") : String(v ?? "")] as [string, string]));
  const isEmbed = h.get("x-isEmbed") === "true";
  const embedColorScheme = h.get("x-embedColorScheme");
  const newLocale = (await getLocale(buildLegacyRequest(new Headers(Object.entries(getHeaders()).map(([k, v]) => [k, Array.isArray(v) ? v.join(", ") : String(v ?? "")] as [string, string])), { getAll: () => Object.entries(getCookies()).map(([name, value]) => ({ name, value: String(value ?? "") })) }))) ?? "en";
  const direction = dir(newLocale) ?? "ltr";

  return {
    isEmbed,
    embedColorScheme,
    locale: newLocale,
    direction,
  };
};

export const Route = // TODO: metadata.icons.other could not be mapped automatically
                     // TODO: metadata.manifest could not be mapped automatically
                     // TODO: metadata.other could not be mapped automatically
                     // TODO: metadata.robots could not be mapped automatically
                     createRootRoute({
    head: () => ({
      meta: [{ name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" }, { name: "theme-color", content: "#f9fafb", media: "(prefers-color-scheme: light)" }, { name: "theme-color", content: "#1C1C1C", media: "(prefers-color-scheme: dark)" }, { name: "twitter:site", content: "@calcom" }, { name: "twitter:creator", content: "@calcom" }, { name: "twitter:card", content: "summary_large_image" }],
      links: [{ rel: "icon", href: "/api/logo?type=favicon-32" }, { rel: "apple-touch-icon", href: "/api/logo?type=apple-touch-icon" }],
    }),
  component: RootLayout,
});

function RootLayout() {
  return (
    <html
      className="notranslate"
      translate="no"
      lang={locale}
      dir={direction}
      style={embedColorScheme ? { colorScheme: embedColorScheme as string } : undefined}
      suppressHydrationWarning
      data-nextjs-router="app">
      <head nonce={nonce}>
        <HeadContent />
        <style>{`
          :root {
            --font-sans: ${interFont.style.fontFamily.replace(/\'/g, "")};
            --font-cal: ${calFont.style.fontFamily.replace(/\'/g, "")};
          }
        `}</style>
        {process.env.NODE_ENV === "development" && (
          <Script
            src="//unpkg.com/react-grab/dist/index.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
            data-options='{"activationKey":"Meta+c"}'
          />
        )}
      </head>
      <body
        className="dark:bg-default bg-subtle antialiased"
        style={
          isEmbed
            ? {
                background: "transparent",
                // Keep the embed hidden till parent initializes and
                // - gives it the appropriate styles if UI instruction is there.
                // - gives iframe the appropriate height(equal to document height) which can only be known after loading the page once in browser.
                // - Tells iframe which mode it should be in (dark/light) - if there is a a UI instruction for that
                visibility: "hidden",
                // This in addition to visibility: hidden is to ensure that elements with specific opacity set are not visible
                opacity: 0,
              }
            : {
                visibility: "visible",
                opacity: 1,
              }
        }>
        <IconSprites />
        <SpeculationRules
          // URLs In Navigation
          prerenderPathsOnHover={[
            "/event-types",
            "/availability",
            "/bookings/upcoming",
            "/teams",
            "/apps",
          ]}
        />

        <Providers isEmbed={isEmbed} nonce={nonce} country={country}>
          <AppRouterI18nProvider translations={translations} locale={locale} ns={ns}>
            <Outlet />
          </AppRouterI18nProvider>
        </Providers>
        <Scripts />
      </body>
    </html>
  );
}
