import { AvailabilityScheduleSkeleton } from "../../(use-page-wrapper)/availability/[schedule]/skeleton";
import { createFileRoute } from '@tanstack/react-router';

function Loading() {
  return <AvailabilityScheduleSkeleton />;
}

export const Route = createFileRoute("/availability/$schedule")({
  pendingComponent: Loading,
});
