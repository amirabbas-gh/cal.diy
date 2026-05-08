"use client";

import { useLocation } from "@tanstack/react-router";

import type { ComponentProps } from "react";
import React from "react";

import type { UserPermissionRole } from "@calcom/prisma/enums";
import { ErrorBoundary } from "@calcom/ui/components/errorBoundary";

import type Shell from "~/shell/Shell";

export type AdminLayoutProps = {
  children: React.ReactNode;
  userRole: UserPermissionRole | "INACTIVE_ADMIN" | undefined;
} & ComponentProps<typeof Shell>;
export default function AdminLayoutAppDirClient({ children }: AdminLayoutProps) {
  const pathname = useLocation().pathname;

  const isAppsPage = pathname?.startsWith("/settings/admin/apps");
  return (
    <div className="divide-subtle bg-default mx-auto flex max-w-4xl flex-row divide-y">
      <div className={isAppsPage ? "min-w-0" : "*:flex-1 flex flex-1"}>
        <ErrorBoundary>{children}</ErrorBoundary>
      </div>
    </div>
  );
}
