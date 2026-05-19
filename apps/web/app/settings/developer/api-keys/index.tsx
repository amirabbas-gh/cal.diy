import { _generateMetadata } from "app/_utils";

// TODO: next/cache migration (R4e): unwrap + optional `*QueryOptions` for `useQuery`/`ensureQueryData`; align with `invalidateQueries` / route loaders — https://tanstack.com/query/latest/docs/framework/react/guides/caching · https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation

// TODO: next/headers migration (R4f): `getCookie` / `getHeaders` / `setCookie` / `deleteCookie` / `getCookies` — TanStack Start server context only; `draftMode` / other `next/headers` usage — https://tanstack.com/start/latest/docs/framework/react/guide/server-functions
import { getCookies, getHeaders } from "@tanstack/start/server";


// TODO: next/navigation migration (R4g): use `throw redirect()` in loaders / beforeLoad — client nav: `useNavigate()` — https://tanstack.com/router/latest/docs/framework/react/guide/navigation
import { redirect } from "@tanstack/react-router";


import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import { PrismaApiKeyRepository } from "@calcom/features/api-keys-legacy/api-keys/repositories/PrismaApiKeyRepository";
import { APP_NAME } from "@calcom/lib/constants";

import { buildLegacyRequest } from "@lib/buildLegacyCtx";

import ApiKeysView from "~/settings/developer/api-keys-view";
import { createFileRoute } from '@tanstack/react-router';

export const generateMetadata = async () =>
  await _generateMetadata(
    (t) => t("api_keys"),
    (t) => t("create_first_api_key_description", { appName: APP_NAME }),
    undefined,
    undefined,
    "/settings/developer/api-keys"
  );

const getCachedApiKeys = async (userId: number) => {
    const apiKeyRepository = await PrismaApiKeyRepository.withGlobalPrisma();
    return await apiKeyRepository.findApiKeysFromUserId({ userId });
  };

export const getCachedApiKeysQueryOptions = {
  queryKey: ['next-cache', 'getCachedApiKeys'] as const,
  queryFn: getCachedApiKeys,
  staleTime: 3600000,
};

const Page = async () => {
  const session = await getServerSession({ req: buildLegacyRequest(new Headers(Object.entries(getHeaders()).map(([k, v]) => [k, Array.isArray(v) ? v.join(", ") : String(v ?? "")] as [string, string])), { getAll: () => Object.entries(getCookies()).map(([name, value]) => ({ name, value: String(value ?? "") })) }) });

  if (!session) {
    throw redirect({ to: "/auth/login?callbackUrl=/settings/developer/api-keys" });
  }

  const userId = session.user.id;
  const apiKeys = await getCachedApiKeys(userId);

  return <ApiKeysView apiKeys={apiKeys} />;
};

export const Route = createFileRoute("/settings/developer/api-keys")({
  component: Page,
});
