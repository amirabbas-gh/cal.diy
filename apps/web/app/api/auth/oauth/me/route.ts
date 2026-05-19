import { defaultResponderForAppDir } from "app/api/defaultResponderForAppDir";

import isAuthorized from "@calcom/features/auth/lib/oAuthAuthorization";

async function handler(req: Request) {
  const requiredScopes = ["READ_PROFILE"];
  const token = req.headers.get("authorization")?.split(" ")[1] || "";
  const account = await isAuthorized(token, requiredScopes);

  if (!account) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  return Response.json({ username: account.name }, { status: 201 });
}
export const GET = defaultResponderForAppDir(handler);
export const POST = defaultResponderForAppDir(handler);
