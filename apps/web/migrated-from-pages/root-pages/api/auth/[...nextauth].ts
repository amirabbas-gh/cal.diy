import NextAuth from "next-auth";

import { getOptions } from "@calcom/features/auth/lib/next-auth-options";
import { getTrackingFromCookies } from "@calcom/lib/tracking";

// pass req to NextAuth: https://github.com/nextauthjs/next-auth/discussions/469
// TODO: `next/types erasure (R4j)`: replace `any` with real types (`Route.useParams`, `useLoaderData`, `FileRoutesByPath`, etc.) — https://tanstack.com/router/latest/docs/framework/react/guide/router-context
const handler = (req: any, res: any) =>
  NextAuth(
    req,
    res,
    getOptions({
      getDubId: () => req.cookies.dub_id || req.cookies.dclid,
      getTrackingData: () => getTrackingFromCookies(req.cookies, req.query),
    })
  );

export default handler;
