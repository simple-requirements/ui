import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";
import { useSelector } from "@tanstack/react-store";

import { getAuthenticatedUser, login } from "@/api/authApi";
import { getSafeReturnTo } from "@/auth/authRoutes";
import { authStore, setAuthenticatedSession } from "@/stores/authStore";

import "@/pages/LoginPage/LoginPage.scss";

const LOGIN_ERROR_MESSAGE =
  "The username or password is invalid, or the account is unavailable.";

type LoginPageProps = Readonly<{ notice?: string }>;

export function LoginPage({ notice }: LoginPageProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const authenticationStatus = useSelector(authStore, (state) => state.status);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const returnTo = getSafeReturnTo(location.state);
  const sessionExpired =
    typeof location.state === "object" &&
    location.state !== null &&
    "reason" in location.state &&
    location.state.reason === "session-expired";
  const valid = username.trim().length > 0 && password.length > 0;

  if (authenticationStatus === "authenticated") {
    return <Navigate to={returnTo} replace />;
  }

  async function handleSubmit(): Promise<void> {
    if (!valid || pending) {
      return;
    }

    setPending(true);
    setErrorMessage(undefined);

    try {
      const response = await login({ username: username.trim(), password });
      const currentUser = await getAuthenticatedUser(response.data.accessToken);
      setAuthenticatedSession({
        accessToken: response.data.accessToken,
        user: currentUser.data,
      });
      void navigate(returnTo, { replace: true });
    } catch {
      setErrorMessage(LOGIN_ERROR_MESSAGE);
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-page__panel" aria-labelledby="login-title">
        <h1 id="login-title">Sign in</h1>
        <p>Sign in with your local account.</p>

        {(notice !== undefined || sessionExpired) && (
          <p className="login-page__notice" role="status">
            {notice ?? "Your session has ended. Sign in again to continue."}
          </p>
        )}

        {errorMessage !== undefined && (
          <p className="login-page__error" role="alert">
            {errorMessage}
          </p>
        )}

        <form
          className="login-page__form"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmit();
          }}
        >
          <label htmlFor="login-username">Username</label>
          <InputText
            id="login-username"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            disabled={pending}
            onChange={(event) => setUsername(event.currentTarget.value)}
          />

          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            disabled={pending}
            onChange={(event) => setPassword(event.currentTarget.value)}
          />

          <Button
            type="submit"
            label="Sign in"
            loading={pending}
            disabled={!valid || pending}
          />
        </form>
        <div className="login-page__links">
          <Link to="/register">Create account</Link>
          <Link to="/forgot-password">Forgot password?</Link>
          <Link to="/verify-email/resend">Resend verification email</Link>
        </div>
      </section>
    </main>
  );
}
