import { DynamicComponent } from "@calcom/app-store/_components/DynamicComponent";
import { lazy } from 'react';

export const AppSetupMap = {
  alby: lazy(() => import("@calcom/web/components/apps/alby/Setup")),
  "apple-calendar": lazy(() => import("@calcom/web/components/apps/applecalendar/Setup")),
  exchange: lazy(() => import("@calcom/web/components/apps/exchangecalendar/Setup")),
  "exchange2013-calendar": lazy(() => import("@calcom/web/components/apps/exchange2013calendar/Setup")),
  "exchange2016-calendar": lazy(() => import("@calcom/web/components/apps/exchange2016calendar/Setup")),
  "caldav-calendar": lazy(() => import("@calcom/web/components/apps/caldavcalendar/Setup")),
  "ics-feed": lazy(() => import("@calcom/web/components/apps/ics-feedcalendar/Setup")),
  make: lazy(() => import("@calcom/web/components/apps/make/Setup")),
  sendgrid: lazy(() => import("@calcom/web/components/apps/sendgrid/Setup")),
  stripe: lazy(() => import("@calcom/web/components/apps/stripepayment/Setup")),
  paypal: lazy(() => import("@calcom/web/components/apps/paypal/Setup")),
  hitpay: lazy(() => import("@calcom/web/components/apps/hitpay/Setup")),
  btcpayserver: lazy(() => import("@calcom/web/components/apps/btcpayserver/Setup")),
};

export const AppSetupPage = (props: { slug: string }) => {
  return <DynamicComponent<typeof AppSetupMap> componentMap={AppSetupMap} {...props} />;
};

export default AppSetupPage;
