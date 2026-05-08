import { stringify } from "node:querystring";

import { WEBAPP_URL_FOR_OAUTH } from "@calcom/lib/constants";

import getAppKeysFromSlug from "../../_utils/getAppKeysFromSlug";
import { encodeOAuthState } from "../../_utils/oauth/encodeOAuthState";

// TODO: `next/types erasure (R4j)`: replace `any` with real types (`Route.useParams`, `useLoaderData`, `FileRoutesByPath`, etc.) — https://tanstack.com/router/latest/docs/framework/react/guide/router-context
export default async function handler(req: any, res: any) {
  if (req.method === "GET") {
    let clientId = "";
    const appKeys = await getAppKeysFromSlug("intercom");
    if (typeof appKeys.client_id === "string") clientId = appKeys.client_id;
    if (!clientId) return res.status(400).json({ message: "Intercom client_id missing." });

    const state = encodeOAuthState(req);

    const params = {
      client_id: clientId,
      redirect_uri: `${WEBAPP_URL_FOR_OAUTH}/api/integrations/intercom/callback`,
      state,
      response_type: "code",
    };

    const authUrl = `https://app.intercom.com/oauth?${stringify(params)}`;

    res.status(200).json({ url: authUrl });
  }
}
