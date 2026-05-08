import { EventTypesSkeleton } from "./skeleton";
import { createFileRoute } from '@tanstack/react-router';

function Loading() {
  return <EventTypesSkeleton />;
}

export const Route = createFileRoute("/event-types")({
  pendingComponent: Loading,
});
