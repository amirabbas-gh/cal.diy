import { BookingRepository } from "@calcom/features/bookings/repositories/BookingRepository";
import { prisma } from "@calcom/prisma";

import { type inferSSRProps } from "@lib/types/inferSSRProps";

export type PageProps = inferSSRProps<typeof getServerSideProps>;
// TODO: `next/types erasure (R4j)`: replace `any` with real types (`Route.useParams`, `useLoaderData`, `FileRoutesByPath`, etc.) — https://tanstack.com/router/latest/docs/framework/react/guide/router-context
export async function getServerSideProps(context: any) {
  const bookingRepo = new BookingRepository(prisma);
  const booking = await bookingRepo.findBookingForMeetingEndedPage({
    bookingUid: context.query.uid as string,
  });

  if (!booking) {
    const redirect = {
      redirect: {
        destination: "/video/no-meeting-found",
        permanent: false,
      },
    } as const;

    return redirect;
  }

  // Booking Object DTO, we should not expose any sensitive data through getServerSideProps + server components
  const bookingObj = Object.assign(
    {},
    {
      title: booking.title,
      startTime: booking.startTime.toString(),
      endTime: booking.endTime.toString(),
    }
  );

  return {
    props: {
      booking: bookingObj,
    },
  };
}
