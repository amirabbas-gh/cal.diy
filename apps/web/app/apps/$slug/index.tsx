import type { PageProps as _PageProps } from "app/_types";
import { generateAppMetadata } from "app/_utils";

// TODO: next/navigation migration (R4g): use `throw redirect()` in loaders / beforeLoad — client nav: `useNavigate()` — https://tanstack.com/router/latest/docs/framework/react/guide/navigation
import { notFound } from "@tanstack/react-router";

import { z } from "zod";

import { getStaticProps } from "@lib/apps/[slug]/getStaticProps";

import AppView from "~/apps/[slug]/slug-view";
import { createFileRoute } from '@tanstack/react-router';

const paramsSchema = z.object({
  slug: z.string(),
});

export const generateMetadata = async ({ params }: _PageProps) => {
  const p = paramsSchema.safeParse(await params);

  if (!p.success) {
    throw notFound();
  }
  const slugFromUrl = p.data.slug;
  const props = await getStaticProps(slugFromUrl);

  if (!props) {
    throw notFound();
  }
  const { name, logo, dirName: appStoreDirSlug, slug: appSlug, description } = props.data;

  return await generateAppMetadata(
    { slug: appStoreDirSlug ?? appSlug, logoUrl: logo, name, description },
    () => name,
    () => description,
    undefined,
    undefined,
    `/apps/${appSlug}`
  );
};

// TODO: move async data fetching into Route.loader (or a server function); avoid heavy awaits in route components - https://tanstack.com/router/latest/docs/framework/react/guide/data-loading
async function Page() {
  const p = paramsSchema.safeParse(Route.useParams());

  if (!p.success) {
    throw notFound();
  }

  const props = await getStaticProps(p.data.slug);

  if (!props) {
    throw notFound();
  }

  return <AppView {...props} />;
}

export const Route = createFileRoute("/apps/$slug")({
  component: Page,
});
