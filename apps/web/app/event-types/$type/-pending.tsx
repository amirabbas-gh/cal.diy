import { EventTypeEditPageSkeleton } from "../../(use-page-wrapper)/event-types/[type]/skeleton";
import { createFileRoute } from '@tanstack/react-router';

function Loading() {
  return <EventTypeEditPageSkeleton />;
}

export const Route = createFileRoute("/event-types/$type")({
  pendingComponent: Loading,
});
