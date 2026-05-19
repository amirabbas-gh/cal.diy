import { _generateMetadata } from "app/_utils";

import Page from "~/more/more-page-view";
import { createFileRoute } from '@tanstack/react-router';

export const generateMetadata = async () => {
  return await _generateMetadata(
    (t) => t("more"),
    () => "",
    undefined,
    undefined,
    "/more"
  );
};

const ServerPageWrapper = async () => {
  return <Page />;
};

export const Route = createFileRoute("/more")({
  component: ServerPageWrapper,
});
