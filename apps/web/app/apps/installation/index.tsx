import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/apps/installation")({
  beforeLoad: () => {
    throw redirect({
      to: "/apps/installation/$",
      params: { _splat: "" },
    });
  },
});
