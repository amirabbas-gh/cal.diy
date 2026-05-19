
// TODO: next/navigation migration (R4g): use `throw redirect()` in loaders / beforeLoad — client nav: `useNavigate()` — https://tanstack.com/router/latest/docs/framework/react/guide/navigation
import { useNavigate } from "@tanstack/react-router";

import type { Dispatch, SetStateAction } from "react";
import type { MutableRefObject } from "react";

import { Dialog } from "@calcom/features/components/controlled-dialog";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Button } from "@calcom/ui/components/button";
import { DialogContent, DialogFooter } from "@calcom/ui/components/dialog";

interface AssignmentWarningDialogProps {
  isOpenAssignmentWarnDialog: boolean;
  setIsOpenAssignmentWarnDialog: Dispatch<SetStateAction<boolean>>;
  pendingRoute: string;
  leaveWithoutAssigningHosts: MutableRefObject<boolean>;
  id: number;
}

const AssignmentWarningDialog = (props: AssignmentWarningDialogProps) => {
  const { t } = useLocale();
  const {
    isOpenAssignmentWarnDialog,
    setIsOpenAssignmentWarnDialog,
    pendingRoute,
    leaveWithoutAssigningHosts,
    id,
  } = props;
  const router = useNavigate();
  return (
    <Dialog open={isOpenAssignmentWarnDialog} onOpenChange={setIsOpenAssignmentWarnDialog}>
      <DialogContent
        title={t("leave_without_assigning_anyone")}
        description={`${t("leave_without_adding_attendees")} ${t("no_availability_shown_to_bookers")}`}
        Icon="circle-alert"
        enableOverflow
        type="confirmation">
        <DialogFooter className="mt-6">
          <Button
            onClick={(e) => {
              e.preventDefault();
              setIsOpenAssignmentWarnDialog(false);
              router({ to: "/event-types/$id", params: { id }, search: { tabName: "team" }, replace: true });
            }}
            color="minimal">
            {t("go_back_and_assign")}
          </Button>
          <Button
            onClick={(e) => {
              e.preventDefault();
              setIsOpenAssignmentWarnDialog(false);
              leaveWithoutAssigningHosts.current = true;
              router({ to: pendingRoute, replace: true });
            }}>
            {t("leave_without_assigning")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default AssignmentWarningDialog;
