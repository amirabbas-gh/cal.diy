import { defaultResponderForAppDir } from "app/api/defaultResponderForAppDir";

import { handleWebhookScheduledTriggers } from "@calcom/features/webhooks/lib/handleWebhookScheduledTriggers";
import prisma from "@calcom/prisma";

async function postHandler(req: Request) {
  const apiKey = req.headers.get("authorization") || new URL(req.url).searchParams.get("apiKey");

  if (process.env.CRON_API_KEY !== apiKey) {
    return Response.json({ message: "Not authenticated" }, { status: 401 });
  }

  await handleWebhookScheduledTriggers(prisma);

  return Response.json({ ok: true });
}

export const POST = defaultResponderForAppDir(postHandler);
