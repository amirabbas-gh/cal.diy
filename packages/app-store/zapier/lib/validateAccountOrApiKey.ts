import isAuthorized from "@calcom/features/auth/lib/oAuthAuthorization";
import { HttpError } from "@calcom/lib/http-error";
import { findValidApiKey } from "../../_utils/findValidApiKey";

// TODO: `next/types erasure (R4j)`: replace `any` with real types (`Route.useParams`, `useLoaderData`, `FileRoutesByPath`, etc.) — https://tanstack.com/router/latest/docs/framework/react/guide/router-context
export async function validateAccountOrApiKey(req: any, requiredScopes: string[] = []) {
  const apiKey = req.query.apiKey as string;

  if (!apiKey) {
    const token = req.headers.authorization?.split(" ")[1] || "";
    const authorizedAccount = await isAuthorized(token, requiredScopes);
    if (!authorizedAccount) throw new HttpError({ statusCode: 401, message: "Unauthorized" });
    return { account: authorizedAccount, appApiKey: undefined };
  }

  const validKey = await findValidApiKey(apiKey, "zapier");
  if (!validKey) throw new HttpError({ statusCode: 401, message: "API key not valid" });
  return { account: null, appApiKey: validKey };
}
