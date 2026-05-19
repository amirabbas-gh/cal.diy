import { defaultResponderForAppDir } from "app/api/defaultResponderForAppDir";
import packageJson from "package.json";

async function getHandler() {
  return Response.json({ version: packageJson.version });
}

export const GET = defaultResponderForAppDir(getHandler);
