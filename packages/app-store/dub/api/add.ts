import { HttpError } from "@calcom/lib/http-error";
import { defaultHandler } from "@calcom/lib/server/defaultHandler";
import { defaultResponder } from "@calcom/lib/server/defaultResponder";

import getParsedAppKeysFromSlug from "../../_utils/getParsedAppKeysFromSlug";
import { dubAppKeysSchema, scopeString } from "../lib/utils";

// TODO: `next/types erasure (R4j)`: replace `any` with real types (`Route.useParams`, `useLoaderData`, `FileRoutesByPath`, etc.) — https://tanstack.com/router/latest/docs/framework/react/guide/router-context
async function handler(req: any, res: any) {
  const loggedInUser = req.session?.user;

  if (!loggedInUser) {
    throw new HttpError({ statusCode: 401, message: "You must be logged in to do this" });
  }

  // Ideally this should never happen, as email is there in session user but typings aren't accurate it seems
  // TODO: So, confirm and later fix the typings
  if (!loggedInUser.email) {
    throw new HttpError({ statusCode: 400, message: "Session user must have an email" });
  }

  const { teamId } = req.query;
  const { client_id, redirect_uris } = await getParsedAppKeysFromSlug("dub", dubAppKeysSchema);

  const url = new URL("https://app.dub.co/oauth/authorize");
  url.searchParams.append("client_id", client_id);
  url.searchParams.append("redirect_uri", redirect_uris);
  url.searchParams.append("response_type", "code");
  url.searchParams.append("scope", scopeString);
  if (typeof teamId === "string" && !Number.isNaN(Number(teamId))) {
    url.searchParams.append("state", JSON.stringify({ teamId: Number(teamId) }));
  }
  const oauthUrl = url.toString();

  return res.status(200).json({ url: oauthUrl });
}

export default defaultHandler({
  GET: Promise.resolve({ default: defaultResponder(handler) }),
});
