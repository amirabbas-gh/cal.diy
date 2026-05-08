import { EventTypeEditPageSkeleton } from "./skeleton";
import { createFileRoute } from '@tanstack/react-router';

function Loading() {
  return <EventTypeEditPageSkeleton />;
}

export const Route = createFileRoute("/event-types/$type")({
  pendingComponent: Loading,
});
