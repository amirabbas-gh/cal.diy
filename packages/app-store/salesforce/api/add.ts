import jsforce from "@jsforce/jsforce-node";
import { WEBAPP_URL_FOR_OAUTH } from "@calcom/lib/constants";

import getAppKeysFromSlug from "../../_utils/getAppKeysFromSlug";
import { encodeOAuthState } from "../../_utils/oauth/encodeOAuthState";

// TODO: `next/types erasure (R4j)`: replace `any` with real types (`Route.useParams`, `useLoaderData`, `FileRoutesByPath`, etc.) — https://tanstack.com/router/latest/docs/framework/react/guide/router-context
export default async function handler(req: any, res: any) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

  let consumerKey = "";
  const appKeys = await getAppKeysFromSlug("salesforce");
  if (typeof appKeys.consumer_key === "string") consumerKey = appKeys.consumer_key;
  if (!consumerKey) return res.status(400).json({ message: "Salesforce client id missing." });

  const salesforceClient = new jsforce.Connection({
    oauth2: {
      clientId: consumerKey,
      redirectUri: `${WEBAPP_URL_FOR_OAUTH}/api/integrations/salesforce/callback`,
    },
  });

  const state = encodeOAuthState(req);

  const url = salesforceClient.oauth2.getAuthorizationUrl({
    scope: "refresh_token full",
    ...(state && { state }),
  });
  res.status(200).json({ url });
}
