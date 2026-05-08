import { addSubscription } from "@calcom/features/webhooks/lib/scheduleTrigger";
import { defaultHandler } from "@calcom/lib/server/defaultHandler";
import { defaultResponder } from "@calcom/lib/server/defaultResponder";

import { validateAccountOrApiKey } from "../../lib/validateAccountOrApiKey";

// TODO: `next/types erasure (R4j)`: replace `any` with real types (`Route.useParams`, `useLoaderData`, `FileRoutesByPath`, etc.) — https://tanstack.com/router/latest/docs/framework/react/guide/router-context
async function handler(req: any, res: any) {
  const { subscriberUrl, triggerEvent } = req.body;
  const { account, appApiKey } = await validateAccountOrApiKey(req, ["READ_BOOKING", "READ_PROFILE"]);
  const createAppSubscription = await addSubscription({
    appApiKey,
    account,
    triggerEvent: triggerEvent,
    subscriberUrl: subscriberUrl,
    appId: "zapier",
  });

  if (!createAppSubscription) {
    return res.status(500).json({ message: "Could not create subscription." });
  }

  res.status(200).json(createAppSubscription);
}

export default defaultHandler({
  POST: Promise.resolve({ default: defaultResponder(handler) }),
});
