import { handleButtonAndInvitationStep } from "../lib/configure/button";
import { handleLinkStep } from "../lib/configure/link";

// TODO: `next/types erasure (R4j)`: replace `any` with real types (`Route.useParams`, `useLoaderData`, `FileRoutesByPath`, etc.) — https://tanstack.com/router/latest/docs/framework/react/guide/router-context
export default async function handler(req: any, res: any) {
  const { input_values, current_canvas } = req.body;

  console.dir(req.body);

  const linkStepResult = current_canvas?.stored_data?.submit_booking_url
    ? current_canvas.stored_data.submit_booking_url
    : await handleLinkStep(req);
  if (typeof linkStepResult !== "string") {
    return res.status(200).json(linkStepResult);
  }
  const buttonAndInvitationStepResult = await handleButtonAndInvitationStep(req);
  console.log(buttonAndInvitationStepResult);
  if (buttonAndInvitationStepResult) {
    return res.status(200).json(buttonAndInvitationStepResult);
  }

  return res.status(200).json({
    results: {
      ...input_values,
      submit_booking_url: current_canvas?.stored_data?.submit_booking_url,
    },
  });
}
