import type { BookingToDelete } from "../getBookingToDelete";

export type AppRouterRequest = { appDirRequestBody: unknown };
// TODO: `next/types erasure (R4j)`: replace `any` with real types (`Route.useParams`, `useLoaderData`, `FileRoutesByPath`, etc.) — https://tanstack.com/router/latest/docs/framework/react/guide/router-context
export type CustomRequest = (any | AppRouterRequest) & {
  userId?: number;
  bookingToDelete?: BookingToDelete;
  platformClientId?: string;
  platformRescheduleUrl?: string;
  platformCancelUrl?: string;
  platformBookingUrl?: string;
  arePlatformEmailsEnabled?: boolean;
};
