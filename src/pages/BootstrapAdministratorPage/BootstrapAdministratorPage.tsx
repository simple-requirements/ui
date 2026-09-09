import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useState } from "react";

import { bootstrapAdministrator } from "@/api/authApi";
import { ApiError } from "@/api/fetch";

import "@/pages/BootstrapAdministratorPage/BootstrapAdministratorPage.scss";

type Props = Readonly<{
  onContinueToLogin: () => void;
  onBootstrapUnavailable: () => void;
}>;

type FormState = Readonly<{
  username: string;
  email: string;
  displayName: string;
  password: string;
  confirmPassword: string;
  bootstrapSecret: string;
}>;

const emptyForm: FormState = {
  username: "",
  email: "",
  displayName: "",
  password: "",
  confirmPassword: "",
  bootstrapSecret: "",
};

const USERNAME_PATTERN = /^[A-Za-z0-9._-]{3,64}$/u;

export function BootstrapAdministratorPage({
  onContinueToLogin,
  onBootstrapUnavailable,
}: Props) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const passwordsMatch = form.password === form.confirmPassword;
  const valid =
    USERNAME_PATTERN.test(form.username.trim()) &&
    form.email.trim().length > 0 &&
    form.displayName.trim().length > 0 &&
    form.displayName.trim().length <= 120 &&
    form.password.length >= 15 &&
    form.password.length <= 128 &&
    passwordsMatch &&
    form.bootstrapSecret.trim().length > 0;

  function updateForm(field: keyof FormState, value: string): void {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(): Promise<void> {
    if (!valid || pending) {
      return;
    }

    setPending(true);
    setErrorMessage(undefined);

    try {
      await bootstrapAdministrator({
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        displayName: form.displayName.trim(),
        password: form.password,
        bootstrapSecret: form.bootstrapSecret.trim(),
      });
      setSubmitted(true);
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        onBootstrapUnavailable();
        return;
      }

      setErrorMessage(
        error instanceof ApiError && error.status === 429
          ? "Too many registration attempts. Wait before trying again."
          : "Initial Administrator registration could not be completed. Check the bootstrap secret and form values.",
      );
    } finally {
      setPending(false);
    }
  }

  if (submitted) {
    return (
      <main className="bootstrap-page">
        <section
          className="bootstrap-page__panel"
          aria-labelledby="bootstrap-complete-title"
        >
          <h1 id="bootstrap-complete-title">Check your email</h1>
          <p role="status">
            Initial Administrator registration was received. Verify the email
            address before signing in.
          </p>
          <Button
            type="button"
            label="Continue to sign in"
            onClick={onContinueToLogin}
          />
        </section>
      </main>
    );
  }

  return (
    <main className="bootstrap-page">
      <section
        className="bootstrap-page__panel"
        aria-labelledby="bootstrap-title"
      >
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
            void submit();
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
            onChange={(event) =>
              updateForm("username", event.currentTarget.value)
            }
          />

          <label htmlFor="bootstrap-email">Email address</label>
          <input
            id="bootstrap-email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            disabled={pending}
            onChange={(event) => updateForm("email", event.currentTarget.value)}
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
              updateForm("displayName", event.currentTarget.value)
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
            onChange={(event) =>
              updateForm("password", event.currentTarget.value)
            }
          />
          <small id="bootstrap-password-help">
            Use between 15 and 128 characters.
          </small>

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
              updateForm("confirmPassword", event.currentTarget.value)
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
              updateForm("bootstrapSecret", event.currentTarget.value)
            }
          />

          <Button
            type="submit"
            label="Create Administrator"
            loading={pending}
            disabled={!valid || pending}
          />
        </form>
      </section>
    </main>
  );
}
