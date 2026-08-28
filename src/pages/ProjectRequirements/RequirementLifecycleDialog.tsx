import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { useState } from "react";

import "@/pages/ProjectRequirements/RequirementLifecycleDialog.scss";

export type RequirementLifecycleDialogProps = Readonly<{
  visible: boolean;
  title: string;
  nameLabel?: string;
  reasonRequired?: boolean;
  warning?: string;
  confirmationBlocked?: boolean;
  pending?: boolean;
  onAbort: () => void;
  onConfirm: (name: string, reason?: string) => void | Promise<void>;
}>;

export function RequirementLifecycleDialog({
  visible,
  title,
  nameLabel = "Reviewer",
  reasonRequired = false,
  warning,
  confirmationBlocked = false,
  pending = false,
  onAbort,
  onConfirm,
}: RequirementLifecycleDialogProps) {
  const [name, setName] = useState("");
  const [reason, setReason] = useState("");
  const valid =
    name.trim().length > 0 && (!reasonRequired || reason.trim().length > 0);
  const fieldPrefix = title.toLowerCase().replaceAll(/[^a-z0-9]+/gu, "-");

  return (
    <Dialog
      visible={visible}
      modal
      dismissableMask={false}
      closable={false}
      closeOnEscape={!pending}
      draggable={false}
      resizable={false}
      header={
        <h2 className="requirement-lifecycle-dialog__heading">{title}</h2>
      }
      pt={{
        root: { className: "requirement-lifecycle-dialog" },
        header: { className: "requirement-lifecycle-dialog__header" },
        content: { className: "requirement-lifecycle-dialog__content" },
      }}
      onHide={onAbort}
    >
      <form
        className="requirement-lifecycle-dialog__form"
        onSubmit={(event) => {
          event.preventDefault();
          if (valid && !confirmationBlocked) {
            void onConfirm(
              name.trim(),
              reasonRequired ? reason.trim() : undefined,
            );
          }
        }}
      >
        {warning !== undefined && (
          <p className="requirement-lifecycle-dialog__warning">{warning}</p>
        )}
        <label htmlFor={`${fieldPrefix}-name`}>{nameLabel}</label>
        <InputText
          id={`${fieldPrefix}-name`}
          value={name}
          disabled={pending}
          onChange={(event) => setName(event.currentTarget.value)}
        />
        {reasonRequired && (
          <>
            <label htmlFor={`${fieldPrefix}-reason`}>Reason</label>
            <textarea
              id={`${fieldPrefix}-reason`}
              rows={5}
              value={reason}
              disabled={pending}
              onChange={(event) => setReason(event.currentTarget.value)}
            />
          </>
        )}
        <div className="requirement-lifecycle-dialog__actions">
          <Button
            type="button"
            outlined
            label="Abort"
            disabled={pending}
            pt={{
              root: {
                className:
                  "requirement-lifecycle-dialog__button requirement-lifecycle-dialog__button--abort",
              },
            }}
            onClick={onAbort}
          />
          <Button
            type="submit"
            label="OK"
            disabled={!valid || pending || confirmationBlocked}
            pt={{
              root: {
                className:
                  "requirement-lifecycle-dialog__button requirement-lifecycle-dialog__button--confirm",
              },
            }}
          />
        </div>
      </form>
    </Dialog>
  );
}
