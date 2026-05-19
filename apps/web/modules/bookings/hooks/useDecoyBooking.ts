"use client";


// TODO: next/navigation migration (R4g): use `throw redirect()` in loaders / beforeLoad — client nav: `useNavigate()` — https://tanstack.com/router/latest/docs/framework/react/guide/navigation
import { useNavigate } from "@tanstack/react-router";

import { useEffect, useState } from "react";

import { getDecoyBooking } from "@calcom/features/bookings/lib/client/decoyBookingStore";
import type { DecoyBookingData } from "@calcom/features/bookings/lib/client/decoyBookingStore";

/**
 * Hook to retrieve and manage decoy booking data from localStorage
 * @param uid - The booking uid
 * @returns The booking data or null if not found/expired
 */
export function useDecoyBooking(uid: string) {
  const router = useNavigate();
  const [bookingData, setBookingData] = useState<DecoyBookingData | null>(null);

  useEffect(() => {
    const data = getDecoyBooking(uid);

    if (!data) {
      router({ to: "/404" });
      return;
    }

    setBookingData(data);
  }, [uid, router]);

  return bookingData;
}
