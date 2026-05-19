import type { PageProps } from "app/_types";
import { _generateMetadata } from "app/_utils";

// TODO: next/headers migration (R4f): `getCookie` / `getHeaders` / `setCookie` / `deleteCookie` / `getCookies` — TanStack Start server context only; `draftMode` / other `next/headers` usage — https://tanstack.com/start/latest/docs/framework/react/guide/server-functions
import { getCookies, getHeaders } from "@tanstack/start/server";


// TODO: next/navigation migration (R4g): use `throw redirect()` in loaders / beforeLoad — client nav: `useNavigate()` — https://tanstack.com/router/latest/docs/framework/react/guide/navigation
import { notFound, redirect } from "@tanstack/react-router";


import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import { WebhookRepository } from "@calcom/features/webhooks/lib/repository/WebhookRepository";
import prisma from "@calcom/prisma";
import { APP_NAME } from "@calcom/lib/constants";
import { MembershipRole } from "@calcom/prisma/enums";

import { buildLegacyRequest } from "@lib/buildLegacyCtx";

import { EditWebhookView } from "~/webhooks/views/webhook-edit-view";
import { createFileRoute } from '@tanstack/react-router';

export const generateMetadata = async ({ params }: { params: Promise<{ id: string }> }) =>
  await _generateMetadata(
    (t) => t("webhooks"),
    (t) => t("add_webhook_description", { appName: APP_NAME }),
    undefined,
    undefined,
    `/settings/developer/webhooks/${(await params).id}`
  );

const Page = async ({ params: _params }: PageProps) => {
  const session = await getServerSession({ req: buildLegacyRequest(new Headers(Object.entries(getHeaders()).map(([k, v]) => [k, Array.isArray(v) ? v.join(", ") : String(v ?? "")] as [string, string])), { getAll: () => Object.entries(getCookies()).map(([name, value]) => ({ name, value: String(value ?? "") })) }) });
  if (!session?.user?.id) {
    throw redirect({ to: "/auth/login" });
  }

  const params = await _params;
  const id = typeof params?.id === "string" ? params.id : undefined;

  const webhookRepository = WebhookRepository.getInstance();
  const webhook = await webhookRepository.findByWebhookId(id);

  // Ownership check: verify user has access to this webhook
  if (webhook.teamId) {
    const membership = await prisma.membership.findFirst({
      where: {
        userId: session.user.id,
        teamId: webhook.teamId,
        role: { in: [MembershipRole.ADMIN, MembershipRole.OWNER, MembershipRole.MEMBER] },
      },
      select: { id: true },
    });
    if (!membership) {
      throw notFound();
    }
  } else if (webhook.userId !== session.user.id) {
    throw notFound();
  }

  return <EditWebhookView webhook={webhook} />;
};

export const Route = createFileRoute("/settings/developer/webhooks/$id")({
  component: Page,
});
