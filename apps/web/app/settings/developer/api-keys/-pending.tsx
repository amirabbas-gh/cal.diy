import { SkeletonLoader } from "~/settings/developer/api-keys-skeleton";
import { createFileRoute } from '@tanstack/react-router';

function Loading() {
  return <SkeletonLoader />;
}

export const Route = createFileRoute("/settings/developer/api-keys")({
  pendingComponent: Loading,
});
