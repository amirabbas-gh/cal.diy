// TODO: next/dist migration (R4dist): `import("next/headers")` in types → `getHeaders` / `getCookies` from @tanstack/start/server — verify `ReturnType`
export type Params = {
  [param: string]: string | string[] | undefined;
};

export type SearchParams = {
  [param: string]: string | string[] | undefined;
};

export type PageProps = {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
};

export type LayoutProps = { params: Promise<Params>; children: React.ReactElement };

export type ReadonlyHeaders = Awaited<ReturnType<typeof import("@tanstack/start/server").getHeaders>>;
export type ReadonlyRequestCookies = Awaited<ReturnType<typeof import("@tanstack/start/server").getCookies>>;
