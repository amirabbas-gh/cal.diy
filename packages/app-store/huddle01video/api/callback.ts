import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import { getSafeRedirectUrl } from "@calcom/lib/getSafeRedirectUrl";

import getInstalledAppPath from "../../_utils/getInstalledAppPath";
import { decodeOAuthState } from "../../_utils/oauth/decodeOAuthState";
import { storeHuddle01Credential } from "../utils/storage";

// TODO: `next/types erasure (R4j)`: replace `any` with real types (`Route.useParams`, `useLoaderData`, `FileRoutesByPath`, etc.) — https://tanstack.com/router/latest/docs/framework/react/guide/router-context
export default async function handler(req: any, res: any) {
  const session = await getServerSession({ req });

  const state = decodeOAuthState(req);

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userId = session.user.id;

  const { identityToken } = req.query;

  const token = Array.isArray(identityToken) ? identityToken[0] : identityToken;
  if (!token) {
    return res.status(401).json({
      message: "Something went wrong",
    });
  }

  await storeHuddle01Credential(userId, token);

  res.redirect(
    getSafeRedirectUrl(state?.returnTo) ?? getInstalledAppPath({ variant: "conferencing", slug: "huddle01" })
  );
}
