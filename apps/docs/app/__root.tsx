import { Footer, Layout, Navbar } from "nextra-theme-docs";
import { Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import "nextra-theme-docs/style.css";
import "./logo.css";
import "./fonts.css";
import { Outlet, createRootRoute, HeadContent, Scripts } from '@tanstack/react-router';
import appCss from './globals.css?url';



const navbar: React.ReactElement = (
  <Navbar
    logo={
      <>
        <img
          src="/cal-docs-logo.svg"
          alt="Cal.diy Docs"
          height={26}
          className="logo-light"
          style={{ height: 26 }}
        />
        <img
          src="/cal-docs-logo-white.svg"
          alt="Cal.diy Docs"
          height={26}
          className="logo-dark"
          style={{ height: 26 }}
        />
      </>
    }
  />
);

const footer: React.ReactElement = (
  <Footer>
    <small>
      Cal.diy is the open source community edition of Cal.com. Cal.diy® and Cal®
      are a registered trademark by Cal.com, Inc. All rights reserved.
    </small>
  </Footer>
);



export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout()
    head: () => ({
      meta: [{ title: "Cal.diy Docs" }, { name: "description", content: "Cal.diy self-hosting documentation" }],
    }), {
  return (
    <html
      lang="en"
      dir="ltr"
      suppressHydrationWarning
      className={"font-sans antialiased"}
    >
      <Head />
      <head>
        <HeadContent />
      </head>
      <body>
        <Layout
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/calcom/cal.diy/tree/main/apps/docs"
          footer={footer}
        >
          <Outlet />
        </Layout>
      </
        <Scripts />
      </body>
    </html>
  );
}
