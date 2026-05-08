import { WEBAPP_URL_FOR_OAUTH } from "@calcom/lib/constants";
import * as hubspot from "@hubspot/api-client";
import getAppKeysFromSlug from "../../_utils/getAppKeysFromSlug";
import { encodeOAuthState } from "../../_utils/oauth/encodeOAuthState";

const scopes = ["crm.objects.contacts.read", "crm.objects.contacts.write", "crm.objects.owners.read"];

const hubspotClient = new hubspot.Client();

// TODO: `next/types erasure (R4j)`: replace `any` with real types (`Route.useParams`, `useLoaderData`, `FileRoutesByPath`, etc.) — https://tanstack.com/router/latest/docs/framework/react/guide/router-context
export default async function handler(req: any, res: any) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

  const appKeys = await getAppKeysFromSlug("hubspot");
  let clientId = "";
  if (typeof appKeys.client_id === "string") clientId = appKeys.client_id;
  if (!clientId) return res.status(400).json({ message: "HubSpot client id missing." });

  const redirectUri = `${WEBAPP_URL_FOR_OAUTH}/api/integrations/hubspot/callback`;
  const url = hubspotClient.oauth.getAuthorizationUrl(
    clientId,
    redirectUri,
    scopes.join(" "),
    undefined,
    encodeOAuthState(req)
  );
  res.status(200).json({ url });
}
