import { defaultResponder } from "@calcom/lib/server/defaultResponder";

import checkSession from "../../_utils/auth";
import getInstalledAppPath from "../../_utils/getInstalledAppPath";
import { checkInstalled, createDefaultInstallation } from "../../_utils/installation";
import appConfig from "../config.json";

// TODO: `next/types erasure (R4j)`: replace `any` with real types (`Route.useParams`, `useLoaderData`, `FileRoutesByPath`, etc.) — https://tanstack.com/router/latest/docs/framework/react/guide/router-context
export async function getHandler(req: any) {
  const session = checkSession(req);
  const slug = appConfig.slug;
  const appType = appConfig.type;
  const returnTo = req.query?.returnTo;

  await checkInstalled(slug, session.user.id);
  await createDefaultInstallation({
    appType,
    user: session.user,
    slug,
    key: {},
  });

  return { url: returnTo ?? getInstalledAppPath({ variant: "conferencing", slug: "riverside" }) };
}

export default defaultResponder(getHandler);
