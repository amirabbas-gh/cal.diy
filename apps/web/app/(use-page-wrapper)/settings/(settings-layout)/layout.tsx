import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import { buildLegacyRequest } from "@lib/buildLegacyCtx";

// TODO: next/headers migration (R4f): `getCookie` / `getHeaders` / `setCookie` / `deleteCookie` / `getCookies` — TanStack Start server context only; `draftMode` / other `next/headers` usage — https://tanstack.com/start/latest/docs/framework/react/guide/server-functions
import { getCookies, getHeaders } from "@tanstack/start/server";


// TODO: next/navigation migration (R4g): use `throw redirect()` in loaders / beforeLoad — client nav: `useNavigate()` — https://tanstack.com/router/latest/docs/framework/react/guide/navigation
import { redirect } from "@tanstack/react-router";

import type { SettingsLayoutProps } from "./SettingsLayoutAppDirClient";
import SettingsLayoutAppDirClient from "./SettingsLayoutAppDirClient";

export default async function SettingsLayoutAppDir(props: SettingsLayoutProps) {
  const session = await getServerSession({ req: buildLegacyRequest(new Headers(Object.entries(getHeaders()).map(([k, v]) => [k, Array.isArray(v) ? v.join(", ") : String(v ?? "")] as [string, string])), { getAll: () => Object.entries(getCookies()).map(([name, value]) => ({ name, value: String(value ?? "") })) }) });
  const userId = session?.user?.id;
  if (!userId) {
    throw redirect({ to: "/auth/login" });
  }

  return (
    <SettingsLayoutAppDirClient
      {...props}
      teamFeatures={{}}
      permissions={{
        canViewRoles: false,
        canViewOrganizationBilling: false,
        canUpdateOrganization: false,
      }}
    />
  );
}
