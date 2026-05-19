import { SkeletonLoader } from "~/settings/my-account/appearance-skeleton";
import { createFileRoute } from '@tanstack/react-router';

function Loading() {
  return <SkeletonLoader />;
}

export const Route = createFileRoute("/settings/my-account/appearance")({
  pendingComponent: Loading,
});
