import { withAppDirSsr } from "app/WithAppDirSsr";
import type { PageProps as ServerPageProps } from "app/_types";
import { getTranslate } from "app/_utils";

// TODO: next/headers migration (R4f): `getCookie` / `getHeaders` / `setCookie` / `deleteCookie` / `getCookies` — TanStack Start server context only; `draftMode` / other `next/headers` usage — https://tanstack.com/start/latest/docs/framework/react/guide/server-functions
import { getCookies, getHeaders } from "@tanstack/start/server";


import { APP_NAME, SEO_IMG_OGIMG_VIDEO, WEBSITE_URL } from "@calcom/lib/constants";

import { buildLegacyCtx } from "@lib/buildLegacyCtx";
import { getServerSideProps } from "@lib/video/[uid]/getServerSideProps";

import type { PageProps as ClientPageProps } from "~/videos/views/videos-single-view";
import VideosSingleView from "~/videos/views/videos-single-view";
import { createFileRoute } from '@tanstack/react-router';

export const generateMetadata = async () => {
  const t = await getTranslate();
  return {
    title: `${APP_NAME} Video`,
    description: t("quick_video_meeting"),
    openGraph: {
      title: `${APP_NAME} Video`,
      description: t("quick_video_meeting"),
      url: `${WEBSITE_URL}/video`,
      images: [
        {
          url: SEO_IMG_OGIMG_VIDEO,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${APP_NAME} Video`,
      description: t("quick_video_meeting"),
      images: [SEO_IMG_OGIMG_VIDEO],
    },
  };
};

const getData = withAppDirSsr<ClientPageProps>(getServerSideProps);

const ServerPage = async ({ params, searchParams }: ServerPageProps) => {
  const context = buildLegacyCtx(new Headers(Object.entries(getHeaders()).map(([k, v]) => [k, Array.isArray(v) ? v.join(", ") : String(v ?? "")] as [string, string])), { getAll: () => Object.entries(getCookies()).map(([name, value]) => ({ name, value: String(value ?? "") })) }, await params, await searchParams);

  const props = await getData(context);
  return <VideosSingleView {...props} />;
};

export const Route = createFileRoute("/video/$uid")({
  component: ServerPage,
});
