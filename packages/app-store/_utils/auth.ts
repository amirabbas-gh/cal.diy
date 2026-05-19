import { HttpError } from "@calcom/lib/http-error";

// TODO: `next/types erasure (R4j)`: replace `any` with real types (`Route.useParams`, `useLoaderData`, `FileRoutesByPath`, etc.) — https://tanstack.com/router/latest/docs/framework/react/guide/router-context
export default function checkSession(req: any) {
  if (!req.session?.user?.id) {
    throw new HttpError({ statusCode: 401, message: "Unauthorized" });
  }
  return req.session;
}
