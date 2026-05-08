import { _generateMetadata } from "app/_utils";

import { APP_NAME } from "@calcom/lib/constants";

import LegacyPage from "~/maintenance/maintenance-view";
import { createFileRoute } from '@tanstack/react-router';

export const generateMetadata = async () => {
  return await _generateMetadata(
    (t) => t("under_maintenance"),
    (t) => t("under_maintenance_description", { appName: APP_NAME }),
    undefined,
    undefined,
    "/maintenance"
  );
};

export const Route = createFileRoute("/maintenance")({
  component: LegacyPage,
});
