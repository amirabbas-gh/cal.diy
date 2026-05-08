import { UserListTableSkeleton } from "@calcom/web/modules/users/components/UserTable/UserListTableSkeleton";
import { createFileRoute } from '@tanstack/react-router';

function Loading() {
  return <UserListTableSkeleton />;
}

export const Route = createFileRoute("/members")({
  pendingComponent: Loading,
});
