import { getTranslate } from "app/_utils";

import { IS_DUB_REFERRALS_ENABLED } from "@calcom/lib/constants";

import Shell from "~/shell/Shell";

import { DubReferralsPage } from "./DubReferralsPage";
import { createFileRoute } from '@tanstack/react-router';

// Export the appropriate component based on the feature flag
// TODO: move async data fetching into Route.loader (or a server function); avoid heavy awaits in route components — https://tanstack.com/router/latest/docs/framework/react/guide/data-loading
async function ReferralsPage() {
  const t = await getTranslate();

  return (
    <Shell withoutMain={true}>
      {IS_DUB_REFERRALS_ENABLED ? (
        <div className="-m-4 sm:-mt-6 md:-mt-4">
          <DubReferralsPage />
        </div>
      ) : (
        <div className="mx-auto max-w-4xl p-8 text-center">
          <h2 className="mb-4 text-xl font-semibold">{t("referral_program")}</h2>
          <p>{t("dub_disabled_error_message")}</p>
        </div>
      )}
    </Shell>
  );
}

export const Route = createFileRoute("/refer")({
    head: () => ({
      meta: [{ title: "Cal.diy referral program - Earn money by sharing your link" }, { name: "description", content: "Earn 20% recurring commissions for a full year by referring others to Cal.diy, while giving your referrals 20% off for 12 months. Share your link and start earning today!" }],
    }),
  component: ReferralsPage,
});
