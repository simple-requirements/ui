import { BootstrapAdministratorForm } from "@/pages/BootstrapAdministratorPage/BootstrapAdministratorForm";
import { BootstrapAdministratorSuccessPanel } from "@/pages/BootstrapAdministratorPage/BootstrapAdministratorSuccessPanel";
import { useBootstrapAdministratorForm } from "@/pages/BootstrapAdministratorPage/useBootstrapAdministratorForm";

import "@/pages/BootstrapAdministratorPage/BootstrapAdministratorPage.scss";

type Props = Readonly<{
  onContinueToLogin: () => void;
  onBootstrapUnavailable: () => void;
}>;

export function BootstrapAdministratorPage({
  onContinueToLogin,
  onBootstrapUnavailable,
}: Props) {
  const {
    form,
    pending,
    submitted,
    errorMessage,
    passwordsMatch,
    canSubmit,
    updateForm,
    submit,
  } = useBootstrapAdministratorForm({ onBootstrapUnavailable });

  return (
    <main className="bootstrap-page">
      {submitted ? (
        <BootstrapAdministratorSuccessPanel onContinueToLogin={onContinueToLogin} />
      ) : (
        <BootstrapAdministratorForm
          form={form}
          pending={pending}
          errorMessage={errorMessage}
          passwordsMatch={passwordsMatch}
          canSubmit={canSubmit}
          onUpdate={updateForm}
          onSubmit={submit}
        />
      )}
    </main>
  );
}
