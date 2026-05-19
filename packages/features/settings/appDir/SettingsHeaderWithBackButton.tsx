"use client";


// TODO: next/navigation migration (R4g): use `throw redirect()` in loaders / beforeLoad — client nav: `useNavigate()` — https://tanstack.com/router/latest/docs/framework/react/guide/navigation
import { useNavigate, useRouter } from "@tanstack/react-router";

import type { ReactNode } from "react";

import SettingsHeader from "./SettingsHeader";

type SettingsHeaderWithBackButtonProps = {
  children: ReactNode;
  title?: string;
  description?: string;
  CTA?: ReactNode;
  ctaClassName?: string;
  borderInShellHeader?: boolean;
};

export default function SettingsHeaderWithBackButton(props: SettingsHeaderWithBackButtonProps) {
  const navigate = useNavigate();
  const router = useRouter();

  return <SettingsHeader {...props} backButton={true} onBackButtonClick={() => router.history.back()} />;
}
