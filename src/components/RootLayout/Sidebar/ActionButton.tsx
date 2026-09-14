import { Button } from "primereact/button";

import "@/components/RootLayout/Sidebar/ActionButton.scss";

type Props = Readonly<{
  disabled?: boolean;
  onSynchronize?: () => void;
}>;

export function ActionButton({ disabled = false, onSynchronize }: Props) {
  return (
    <Button
      type="button"
      icon="pi pi-cloud-download"
      aria-label="Synchronize projects"
      disabled={disabled}
      onClick={onSynchronize}
      pt={{
        root: {
          className: "sidebar-action-button sidebar-action-button--ghost",
        },
        icon: { className: "sidebar-action-button__icon" },
      }}
    />
  );
}
