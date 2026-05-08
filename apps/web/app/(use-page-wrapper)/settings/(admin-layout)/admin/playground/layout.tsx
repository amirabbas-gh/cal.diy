"use client";

import { useLocation } from "@tanstack/react-router";

import { Link } from '@tanstack/react-router';

export default function PlaygroundLayout({ children }: { children: React.ReactNode }) {
  const pathname = useLocation().pathname;

  const isPlaygroundRoot = pathname === "/settings/admin/playground";

  return isPlaygroundRoot ? (
    children
  ) : (
    <div>
      <Link to="/settings/admin/playground" className="text-sm underline">
        ← Playground
      </Link>
      <div className="h-8" />
      <div>{children}</div>
    </div>
  );
}
