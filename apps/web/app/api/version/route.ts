import { defaultResponderForAppDir } from "app/api/defaultResponderForAppDir";

// TODO: next/server migration (R4h): confirm `Request`/`Response` types match your runtime; port remaining `next/server` helpers — https://tanstack.com/start/latest/docs/framework/react/guide/server-routes
import packageJson from "package.json";

async function getHandler() {
  return Response.json({ version: packageJson.version });
}

export const GET = defaultResponderForAppDir(getHandler);
