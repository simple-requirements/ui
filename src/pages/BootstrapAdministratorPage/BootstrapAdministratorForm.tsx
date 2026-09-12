import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

import type {
  BootstrapAdministratorFormField,
  BootstrapAdministratorFormState,
} from "@/pages/BootstrapAdministratorPage/bootstrapAdministratorTypes";

type Props = Readonly<{
  form: BootstrapAdministratorFormState;
  pending: boolean;
  errorMessage: string | undefined;
  passwordsMatch: boolean;
  canSubmit: boolean;
  onUpdate: (field: BootstrapAdministratorFormField, value: string) => void;
  onSubmit: () => Promise<void>;
}>;

export function BootstrapAdministratorForm({
  form,
  pending,
  errorMessage,
  passwordsMatch,
  canSubmit,
  onUpdate,
  onSubmit,
}: Props) {
  return (
    <section className="bootstrap-page__panel" aria-labelledby="bootstrap-title">
      <h1 id="bootstrap-title">Create initial Administrator</h1>
      <p>
        No Administrator exists yet. Create the first local administration
        account.
      </p>

      {errorMessage !== undefined && (
        <p className="bootstrap-page__error" role="alert">
          {errorMessage}
        </p>
      )}

      <form
        className="bootstrap-page__form"
        onSubmit={(event) => {
          event.preventDefault();
          void onSubmit();
        }}
      >
        <label htmlFor="bootstrap-username">Username</label>
        <InputText
          id="bootstrap-username"
          name="username"
          autoComplete="username"
          autoFocus
          minLength={3}
          maxLength={64}
          pattern="[A-Za-z0-9._-]{3,64}"
          value={form.username}
          disabled={pending}
          onChange={(event) => onUpdate("username", event.currentTarget.value)}
        />

        <label htmlFor="bootstrap-email">Email address</label>
        <input
          id="bootstrap-email"
          name="email"
          type="email"
          autoComplete="email"
          value={form.email}
          disabled={pending}
          onChange={(event) => onUpdate("email", event.currentTarget.value)}
        />

        <label htmlFor="bootstrap-display-name">Display name</label>
        <InputText
          id="bootstrap-display-name"
          name="displayName"
          autoComplete="name"
          maxLength={120}
          value={form.displayName}
          disabled={pending}
          onChange={(event) =>
            onUpdate("displayName", event.currentTarget.value)
          }
        />

        <label htmlFor="bootstrap-password">Password</label>
        <input
          id="bootstrap-password"
          name="new-password"
          type="password"
          autoComplete="new-password"
          minLength={15}
          maxLength={128}
          value={form.password}
          disabled={pending}
          aria-describedby="bootstrap-password-help"
          onChange={(event) => onUpdate("password", event.currentTarget.value)}
        />
        <small id="bootstrap-password-help">Use between 15 and 128 characters.</small>

        <label htmlFor="bootstrap-confirm-password">Confirm password</label>
        <input
          id="bootstrap-confirm-password"
          name="confirm-password"
          type="password"
          autoComplete="new-password"
          value={form.confirmPassword}
          disabled={pending}
          aria-invalid={form.confirmPassword.length > 0 && !passwordsMatch}
          onChange={(event) =>
            onUpdate("confirmPassword", event.currentTarget.value)
          }
        />
        {form.confirmPassword.length > 0 && !passwordsMatch && (
          <small className="bootstrap-page__validation-error">
            Passwords must match.
          </small>
        )}

        <label htmlFor="bootstrap-secret">Bootstrap secret</label>
        <input
          id="bootstrap-secret"
          name="bootstrap-secret"
          type="password"
          autoComplete="off"
          value={form.bootstrapSecret}
          disabled={pending}
          onChange={(event) =>
            onUpdate("bootstrapSecret", event.currentTarget.value)
          }
        />

        <Button
          type="submit"
          label="Create Administrator"
          loading={pending}
          disabled={!canSubmit || pending}
        />
      </form>
    </section>
  );
}
