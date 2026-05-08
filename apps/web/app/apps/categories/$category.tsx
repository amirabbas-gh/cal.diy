import type { PageProps } from "app/_types";

// TODO: next/navigation migration (R4g): use `throw redirect()` in loaders / beforeLoad — client nav: `useNavigate()` — https://tanstack.com/router/latest/docs/framework/react/guide/navigation
import { redirect } from "@tanstack/react-router";

import { z } from "zod";

import { AppCategories } from "@calcom/prisma/enums";

import { getStaticProps } from "@lib/apps/categories/[category]/getStaticProps";

import CategoryPage from "~/apps/categories/[category]/category-view";
import { createFileRoute } from '@tanstack/react-router';

const querySchema = z.object({
  category: z.enum(Object.values(AppCategories) as [AppCategories, ...AppCategories[]]),
});

// TODO: move async data fetching into Route.loader (or a server function); avoid heavy awaits in route components — https://tanstack.com/router/latest/docs/framework/react/guide/data-loading
async function Page() {
  const parsed = querySchema.safeParse({ ...(Route.useParams()), ...(Route.useSearch()) });
  if (!parsed.success) {
    throw redirect({ to: "/apps/categories/calendar" });
  }

  const props = await getStaticProps(parsed.data.category);

  return <CategoryPage {...props} />;
}

export const Route = createFileRoute("/apps/categories/$category")({
  component: Page,
});
