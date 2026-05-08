import { CalendarListContainerSkeletonLoader } from "@components/apps/CalendarListContainer";
import { createFileRoute } from '@tanstack/react-router';

function Loading() {
  return <CalendarListContainerSkeletonLoader />;
}

export const Route = createFileRoute("/settings/my-account/calendars")({
  pendingComponent: Loading,
});
