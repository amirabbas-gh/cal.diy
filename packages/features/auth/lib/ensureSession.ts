import { HttpError } from "@calcom/lib/http-error";

import { getSession } from "./getSession";

// TODO: `next/types erasure (R4j)`: replace `any` with real types (`Route.useParams`, `useLoaderData`, `FileRoutesByPath`, etc.) — https://tanstack.com/router/latest/docs/framework/react/guide/router-context
type CtxOrReq = { req: any; ctx?: never } | { ctx: { req: any }; req?: never };

export const ensureSession = async (ctxOrReq: CtxOrReq) => {
  const session = await getSession(ctxOrReq);
  if (!session?.user.id) throw new HttpError({ statusCode: 401, message: "Unauthorized" });
  return session;
};
