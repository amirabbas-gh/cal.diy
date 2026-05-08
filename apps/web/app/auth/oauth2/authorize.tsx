import { _generateMetadata } from "app/_utils";

import Page from "~/auth/oauth2/authorize-view";
import { createFileRoute } from '@tanstack/react-router';

export const generateMetadata = async () => {
  return await _generateMetadata(
    (t) => t("authorize"),
    () => "",
    undefined,
    undefined,
    "/auth/oauth2/authorize"
  );
};

const ServerPageWrapper = async () => {
  return <Page />;
};

export const Route = createFileRoute("/auth/oauth2/authorize")({
  component: ServerPageWrapper,
});
