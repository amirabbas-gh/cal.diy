import { getDownloadLinkOfCalVideoByRecordingId } from "@calcom/features/conferencing/lib/videoClient";
import { verifyVideoToken } from "@calcom/lib/videoTokens";
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute("/api/video/recording")({
  server: {
    handlers: {
      GET: async (request: Request) => {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get("token");

        if (!token) {
          return new Response("Missing token", { status: 401 });
        }

        const verification = verifyVideoToken(token);
        if (!verification.valid || !verification.recordingId) {
          return new Response("Invalid or expired token", { status: 401 });
        }

        try {
          const recordingLink = await getDownloadLinkOfCalVideoByRecordingId(verification.recordingId);
          if (!recordingLink) {
            return new Response("Recording not found", { status: 404 });
          }
          return Response.redirect(recordingLink.download_link, { status: 302 });
        } catch (error) {
          console.error("Failed to get recording:", error);
          return new Response("Failed to get recording", { status: 500 });
        }
      },
    },
  },
});
