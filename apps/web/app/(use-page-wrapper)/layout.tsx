// TODO: next/headers migration (R4f): `getCookie` / `getHeaders` / `setCookie` / `deleteCookie` / `getCookies` — TanStack Start server context only; `draftMode` / other `next/headers` usage — https://tanstack.com/start/latest/docs/framework/react/guide/server-functions
import { getHeaders } from "@tanstack/start/server";

// TODO: replace `next/script` with plain <script>/<head> or TanStack router head APIs as needed — https://tanstack.com/start/latest/docs/framework/react/migrate-from-next-js
import Script from "next/script";

import PageWrapper from "@components/PageWrapperAppDir";

export default async function PageWrapperLayout({ children }: { children: React.ReactNode }) {
  const h = new Headers(Object.entries(getHeaders()).map(([k, v]) => [k, Array.isArray(v) ? v.join(", ") : String(v ?? "")] as [string, string]));
  const nonce = h.get("x-csp-nonce") ?? undefined;
  const headScript = process.env.NEXT_PUBLIC_HEAD_SCRIPTS;
  const bodyScript = process.env.NEXT_PUBLIC_BODY_SCRIPTS;

  const scripts = [
    {
      id: "injected-head-script",
      script: headScript ?? "",
    },
    {
      id: "injected-body-script",
      script: bodyScript ?? "",
    },
  ].filter((script): script is { id: string; script: string } => !!script.script);

  return (
    <>
      <PageWrapper requiresLicense={false} nonce={nonce}>
        {children}
        {scripts.map((script) => (
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Injected scripts from env vars
          <Script
            key={script.id}
            nonce={nonce}
            id={script.id}
            dangerouslySetInnerHTML={{
              __html: script.script,
            }}
          />
        ))}
      </PageWrapper>
    </>
  );
}
