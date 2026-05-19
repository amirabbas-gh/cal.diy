import AvailabilityLoader from "app/(use-page-wrapper)/(main-nav)/availability/skeleton";
import { createFileRoute } from '@tanstack/react-router';

function Loading() {
  return <AvailabilityLoader />;
}

export const Route = createFileRoute("/availability")({
  pendingComponent: Loading,
});
