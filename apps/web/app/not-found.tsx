import { _generateMetadata } from "app/_utils";

// TODO: next/headers migration (R4f): `getCookie` / `getHeaders` / `setCookie` / `deleteCookie` / `getCookies` — TanStack Start server context only; `draftMode` / other `next/headers` usage — https://tanstack.com/start/latest/docs/framework/react/guide/server-functions
import { getHeaders } from "@tanstack/start/server";


import PageWrapper from "@components/PageWrapperAppDir";

import { NotFound } from "./notFoundClient";

export const generateMetadata = async () => {
  const metadata = await _generateMetadata(
    (t) => t("404_page_not_found"),
    (t) => t("404_page_not_found")
  );
  return {
    ...metadata,
    robots: {
      index: false,
      follow: false,
    },
  };
};

const ServerPage = async () => {
  const h = new Headers(Object.entries(getHeaders()).map(([k, v]) => [k, Array.isArray(v) ? v.join(", ") : String(v ?? "")] as [string, string]));
  const nonce = h.get("x-csp-nonce") ?? undefined;
  const host = h.get("x-forwarded-host") ?? "";

  return (
    <PageWrapper requiresLicense={false} nonce={nonce}>
      <NotFound host={host} />
    </PageWrapper>
  );
};
export default ServerPage;
