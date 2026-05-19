import { generateStaticParamsFor, importPage } from "nextra/pages";
import { useMDXComponents as getMDXComponents } from "../mdx-components";
import { createFileRoute } from '@tanstack/react-router';

export const generateStaticParams = generateStaticParamsFor("mdxPath");

export async function generateMetadata(props: {
  params: Promise<{ mdxPath?: string[] }>;
}) {
  const params = await props.params;
  const { metadata } = await importPage(params.mdxPath);
  return metadata;
}

const Wrapper = getMDXComponents().wrapper;

// TODO: move async data fetching into Route.loader (or a server function); avoid heavy awaits in route components - https://tanstack.com/router/latest/docs/framework/react/guide/data-loading
async function Page(props: {
  params: Promise<{ mdxPath?: string[] }>;
}) {
  const params = await props.params;
  const { default: MDXContent, toc, metadata, sourceCode } = await importPage(
    params.mdxPath,
  );
  return (
    <Wrapper toc={toc} metadata={metadata} sourceCode={sourceCode}>
      <MDXContent {...props} params={params} />
    </Wrapper>
  );
}

export const Route = createFileRoute("/$")({
  component: Page,
});
