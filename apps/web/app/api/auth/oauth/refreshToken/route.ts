import { defaultResponderForAppDir } from "app/api/defaultResponderForAppDir";
import { parseUrlFormData } from "app/api/parseRequestData";

import { getOAuthService } from "@calcom/features/oauth/di/OAuthService.container";
import { OAUTH_ERROR_REASONS } from "@calcom/features/oauth/services/OAuthService";
import { ErrorWithCode } from "@calcom/lib/errors";
import { getHttpStatusCode } from "@calcom/lib/server/getServerErrorFromUnknown";

async function handler(req: Request) {
  const { client_id, client_secret, grant_type, refresh_token } = await parseUrlFormData(req);

  if (!process.env.CALENDSO_ENCRYPTION_KEY) {
    return Response.json({ message: OAUTH_ERROR_REASONS["encryption_key_missing"] }, { status: 500 });
  }

  if (!client_id) {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }

  if (grant_type !== "refresh_token") {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }
  try {
    const oAuthService = getOAuthService();
    const refreshTokenValue = refresh_token || req.headers.get("authorization")?.split(" ")[1] || "";
    const tokens = await oAuthService.refreshAccessToken(client_id, refreshTokenValue, client_secret);

    return Response.json(
      {
        access_token: tokens.accessToken,
        token_type: "bearer",
        refresh_token: tokens.refreshToken,
        expires_in: tokens.expiresIn,
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          "Cache-Control": "no-store",
          Pragma: "no-cache",
        },
      }
    );
  } catch (err) {
    if (err instanceof ErrorWithCode) {
      return Response.json({ error: err.message }, { status: getHttpStatusCode(err) });
    }
    return Response.json({ error: "server_error" }, { status: 500 });
  }
}

export const POST = defaultResponderForAppDir(handler);
