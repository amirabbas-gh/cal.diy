import { EventTypesSkeleton } from "../(use-page-wrapper)/(main-nav)/event-types/skeleton";
import { createFileRoute } from '@tanstack/react-router';

function Loading() {
  return <EventTypesSkeleton />;
}

export const Route = createFileRoute("/event-types")({
  pendingComponent: Loading,
});
