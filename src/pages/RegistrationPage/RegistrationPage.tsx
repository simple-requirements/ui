import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useState } from "react";
import { Link } from "react-router";

import { registerUser } from "@/api/authApi";
import {
  isValidEmail,
  isValidPassword,
  isValidUsername,
} from "@/auth/accountValidation";
import { LOGIN_ROUTE } from "@/auth/authRoutes";

import "@/pages/PublicAccountPage/PublicAccountPage.scss";

type FormState = Readonly<{
  username: string;
  email: string;
  displayName: string;
  password: string;
  confirmPassword: string;
}>;

const emptyForm: FormState = {
  username: "",
  email: "",
  displayName: "",
  password: "",
  confirmPassword: "",
};

export function RegistrationPage() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const passwordsMatch = form.password === form.confirmPassword;
  const valid =
    isValidUsername(form.username) &&
    isValidEmail(form.email) &&
    form.displayName.trim().length > 0 &&
    form.displayName.trim().length <= 120 &&
    isValidPassword(form.password) &&
    passwordsMatch;

  function update(field: keyof FormState, value: string): void {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(): Promise<void> {
    if (!valid || pending) return;
    setPending(true);
    setErrorMessage(undefined);

    try {
      await registerUser({
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        displayName: form.displayName.trim(),
        password: form.password,
      });
      setSubmitted(true);
    } catch {
      setErrorMessage(
        "Registration could not be submitted. Check the form values and try again.",
      );
    } finally {
      setPending(false);
    }
  }

  if (submitted) {
    return (
      <main className="public-account-page">
        <section
          className="public-account-page__panel"
          aria-labelledby="registration-received-title"
        >
          <h1 id="registration-received-title">Registration received</h1>
          <p className="public-account-page__status" role="status">
            Check your email and verify the address. An Administrator must
            activate the account before you can sign in.
          </p>
          <div className="public-account-page__actions">
            <Link to="/verify-email/resend">Resend verification email</Link>
            <Link to={LOGIN_ROUTE}>Return to sign in</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="public-account-page">
      <section
        className="public-account-page__panel"
        aria-labelledby="registration-title"
      >
        <h1 id="registration-title">Create account</h1>
        <p>
          Register a local account. Email verification and Administrator
          activation are required.
        </p>
        {errorMessage !== undefined && (
          <p className="public-account-page__error" role="alert">
            {errorMessage}
          </p>
        )}
        <form
          className="public-account-page__form"
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          <label htmlFor="registration-username">Username</label>
          <InputText
            id="registration-username"
            name="username"
            autoComplete="username"
            autoFocus
            value={form.username}
            disabled={pending}
            onChange={(event) => update("username", event.currentTarget.value)}
          />
          <label htmlFor="registration-email">Email address</label>
          <input
            id="registration-email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            disabled={pending}
            onChange={(event) => update("email", event.currentTarget.value)}
          />
          <label htmlFor="registration-display-name">Display name</label>
          <InputText
            id="registration-display-name"
            name="displayName"
            autoComplete="name"
            maxLength={120}
            value={form.displayName}
            disabled={pending}
            onChange={(event) =>
              update("displayName", event.currentTarget.value)
            }
          />
          <label htmlFor="registration-password">Password</label>
          <input
            id="registration-password"
            name="new-password"
            type="password"
            autoComplete="new-password"
            minLength={15}
            maxLength={128}
            value={form.password}
            disabled={pending}
            onChange={(event) => update("password", event.currentTarget.value)}
          />
          <small>Use between 15 and 128 characters.</small>
          <label htmlFor="registration-confirm-password">
            Confirm password
          </label>
          <input
            id="registration-confirm-password"
            name="confirm-password"
            type="password"
            autoComplete="new-password"
            value={form.confirmPassword}
            disabled={pending}
            aria-invalid={form.confirmPassword.length > 0 && !passwordsMatch}
            onChange={(event) =>
              update("confirmPassword", event.currentTarget.value)
            }
          />
          {form.confirmPassword.length > 0 && !passwordsMatch && (
            <small className="public-account-page__validation-error">
              Passwords must match.
            </small>
          )}
          <Button
            type="submit"
            label="Register"
            loading={pending}
            disabled={!valid || pending}
          />
        </form>
        <div className="public-account-page__actions">
          <Link to={LOGIN_ROUTE}>Return to sign in</Link>
        </div>
      </section>
    </main>
  );
}
