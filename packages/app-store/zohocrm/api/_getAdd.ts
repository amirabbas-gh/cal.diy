import { stringify } from "node:querystring";

import { WEBAPP_URL } from "@calcom/lib/constants";

import getAppKeysFromSlug from "../../_utils/getAppKeysFromSlug";
import { encodeOAuthState } from "../../_utils/oauth/encodeOAuthState";

// TODO: `next/types erasure (R4j)`: replace `any` with real types (`Route.useParams`, `useLoaderData`, `FileRoutesByPath`, etc.) — https://tanstack.com/router/latest/docs/framework/react/guide/router-context
export default async function handler(req: any, res: any) {
  let clientId = "";
  const appKeys = await getAppKeysFromSlug("zohocrm");
  if (typeof appKeys.client_id === "string") clientId = appKeys.client_id;
  if (!clientId) return res.status(400).json({ message: "zohocrm client id missing." });
  const state = encodeOAuthState(req);

  const params = {
    client_id: clientId,
    response_type: "code",
    redirect_uri: `${WEBAPP_URL}/api/integrations/zohocrm/callback`,
    scope: ["ZohoCRM.modules.ALL", "ZohoCRM.users.READ", "AaaServer.profile.READ"],
    access_type: "offline",
    state,
    prompt: "consent",
  };

  const query = stringify(params);
  const url = `https://accounts.zoho.com/oauth/v2/auth?${query}`;

  res.status(200).json({ url });
}
