import { SkeletonLoader } from "~/settings/my-account/general-skeleton";
import { createFileRoute } from '@tanstack/react-router';

function Loading() {
  return <SkeletonLoader />;
}

export const Route = createFileRoute("/settings/my-account/general")({
  pendingComponent: Loading,
});
