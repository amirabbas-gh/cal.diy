import { WEBAPP_URL } from "@calcom/lib/constants";
import { getSafeRedirectUrl } from "@calcom/lib/getSafeRedirectUrl";
import type { Session } from "next-auth";
import { BillingPortalServiceFactory } from "../lib/BillingPortalService";

interface AuthenticatedUser {
  id: number;
}

// TODO: `next/types erasure (R4j)`: replace `any` with real types (`Route.useParams`, `useLoaderData`, `FileRoutesByPath`, etc.) — https://tanstack.com/router/latest/docs/framework/react/guide/router-context
interface RequestWithSession extends any {
  session?: Session | null;
}

// TODO: `next/types erasure (R4j)`: replace `any` with real types (`Route.useParams`, `useLoaderData`, `FileRoutesByPath`, etc.) — https://tanstack.com/router/latest/docs/framework/react/guide/router-context
export const validateAuthentication = (req: any): AuthenticatedUser | null => {
  const userId = (req as RequestWithSession).session?.user?.id;
  if (!userId) return null;
  return { id: userId };
};

export const buildReturnUrl = (returnTo?: string): string => {
  const defaultUrl = `${WEBAPP_URL}/settings/billing`;

  if (typeof returnTo !== "string") return defaultUrl;

  const safeRedirectUrl = getSafeRedirectUrl(returnTo);
  return safeRedirectUrl || defaultUrl;
};

// TODO: `next/types erasure (R4j)`: replace `any` with real types (`Route.useParams`, `useLoaderData`, `FileRoutesByPath`, etc.) — https://tanstack.com/router/latest/docs/framework/react/guide/router-context
export default async function handler(req: any, res: any) {
  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const user = validateAuthentication(req);
  if (!user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const returnUrl = buildReturnUrl(req.query.returnTo as string);

  try {
    const userService = BillingPortalServiceFactory.createUserService();
    return await userService.processBillingPortal(user.id, returnUrl, res);
  } catch (error) {
    throw error;
  }
}
