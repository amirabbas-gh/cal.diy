import { SkeletonLoader } from "~/webhooks/views/webhooks-skeleton";
import { createFileRoute } from '@tanstack/react-router';

function Loading() {
  return <SkeletonLoader />;
}

export const Route = createFileRoute("/settings/developer/webhooks")({
  pendingComponent: Loading,
});
