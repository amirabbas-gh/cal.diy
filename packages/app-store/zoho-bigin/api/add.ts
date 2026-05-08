import axios from "axios";
import { WEBAPP_URL } from "@calcom/lib/constants";

import getAppKeysFromSlug from "../../_utils/getAppKeysFromSlug";
import { encodeOAuthState } from "../../_utils/oauth/encodeOAuthState";
import appConfig from "../config.json";

// TODO: `next/types erasure (R4j)`: replace `any` with real types (`Route.useParams`, `useLoaderData`, `FileRoutesByPath`, etc.) — https://tanstack.com/router/latest/docs/framework/react/guide/router-context
export default async function handler(req: any, res: any) {
  if (req.method === "GET") {
    const appKeys = await getAppKeysFromSlug(appConfig.slug);

    const clientId = typeof appKeys.client_id === "string" ? appKeys.client_id : "";
    if (!clientId) return res.status(400).json({ message: "Zoho Bigin client_id missing." });

    const redirectUri = `${WEBAPP_URL}/api/integrations/zoho-bigin/callback`;

    const authUrl = axios.getUri({
      url: "https://accounts.zoho.com/oauth/v2/auth",
      params: {
        scope: appConfig.scope,
        client_id: clientId,
        response_type: "code",
        redirect_uri: redirectUri,
        access_type: "offline",
        state: encodeOAuthState(req),
      },
    });

    res.status(200).json({ url: authUrl });
    return;
  }
  res.status(400).json({ message: "Invalid request method." });
}
