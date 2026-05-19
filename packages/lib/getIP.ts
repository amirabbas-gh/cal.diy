import process from "node:process";
import z from "zod";
import logger from "./logger";

export function parseIpFromHeaders(value: string | string[]) {
  return Array.isArray(value) ? value[0] : value.split(",")[0];
}

/**
 * Tries to extract IP address from a request.
 *
 * Header priority (CF → Vercel setup):
 *  1. cf-connecting-ip  – set by Cloudflare with the real client IP
 *  2. true-client-ip    – set by Cloudflare (Enterprise / Managed Transforms)
 *  3. x-forwarded-for   – first IP is the real client; survives the CF → Vercel hop
 *  4. x-real-ip         – set by Vercel to the *connecting* IP (CF edge IP when
 *                         behind Cloudflare, so least reliable)
 *
 * @see https://github.com/vercel/examples/blob/main/edge-functions/ip-blocking/lib/get-ip.ts
 **/
// TODO: `next/types erasure (R4j)`: replace `any` with real types (`Route.useParams`, `useLoaderData`, `FileRoutesByPath`, etc.) — https://tanstack.com/router/latest/docs/framework/react/guide/router-context
export default function getIP(request: Request | any) {
  const headers: readonly string[] = ["cf-connecting-ip", "true-client-ip", "x-forwarded-for", "x-real-ip"];

  for (const header of headers) {
    const value = request instanceof Request ? request.headers.get(header) : request.headers[header];
    if (value) {
      return parseIpFromHeaders(value);
    }
  }

  return "127.0.0.1";
}

const banlistSchema = z.array(z.string());

// TODO: `next/types erasure (R4j)`: replace `any` with real types (`Route.useParams`, `useLoaderData`, `FileRoutesByPath`, etc.) — https://tanstack.com/router/latest/docs/framework/react/guide/router-context
export function isIpInBanlist(request: Request | any) {
  const IP = getIP(request);
  const rawBanListJson = process.env.IP_BANLIST || "[]";
  const banList = banlistSchema.parse(JSON.parse(rawBanListJson));
  if (banList.includes(IP)) {
    logger.warn(`Found banned IP: ${IP} in IP_BANLIST`);
    return true;
  }
  return false;
}

export function isIpInBanListString(identifer: string) {
  const rawBanListJson = process.env.IP_BANLIST || "[]";
  const banList = banlistSchema.parse(JSON.parse(rawBanListJson));
  if (banList.includes(identifer)) {
    logger.warn(`Found banned IP: ${identifer} in IP_BANLIST`);
    return true;
  }
  return false;
}
