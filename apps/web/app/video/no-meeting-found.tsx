import { _generateMetadata } from "app/_utils";

import NoMeetingFound from "~/videos/views/videos-no-meeting-found-single-view";
import { createFileRoute } from '@tanstack/react-router';

export const generateMetadata = async () =>
  await _generateMetadata(
    (t) => t("no_meeting_found"),
    (t) => t("no_meeting_found"),
    undefined,
    undefined,
    "/video/no-meeting-found"
  );

const ServerPage = async () => {
  return <NoMeetingFound />;
};

export const Route = createFileRoute("/video/no-meeting-found")({
  component: ServerPage,
});
