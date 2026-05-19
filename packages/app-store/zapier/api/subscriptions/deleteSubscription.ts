import z from "zod";

import { deleteSubscription } from "@calcom/features/webhooks/lib/scheduleTrigger";
import { defaultHandler } from "@calcom/lib/server/defaultHandler";
import { defaultResponder } from "@calcom/lib/server/defaultResponder";

import { validateAccountOrApiKey } from "../../lib/validateAccountOrApiKey";

const querySchema = z.object({
  apiKey: z.string(),
  id: z.string(),
});

// TODO: `next/types erasure (R4j)`: replace `any` with real types (`Route.useParams`, `useLoaderData`, `FileRoutesByPath`, etc.) — https://tanstack.com/router/latest/docs/framework/react/guide/router-context
async function handler(req: any, res: any) {
  const { id } = querySchema.parse(req.query);

  const { account, appApiKey } = await validateAccountOrApiKey(req, ["READ_BOOKING", "READ_PROFILE"]);

  const deleteEventSubscription = await deleteSubscription({
    appApiKey,
    account,
    webhookId: id,
    appId: "zapier",
  });

  if (!deleteEventSubscription) {
    return res.status(500).json({ message: "Could not delete subscription." });
  }
  res.status(204).json({ message: "Subscription is deleted." });
}

export default defaultHandler({
  DELETE: Promise.resolve({ default: defaultResponder(handler) }),
});
