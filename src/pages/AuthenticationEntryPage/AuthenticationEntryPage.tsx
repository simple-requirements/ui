import { Button } from "primereact/button";
import { useCallback, useEffect, useState } from "react";

import { getAuthenticationBootstrapStatus } from "@/api/authApi";
import { BootstrapAdministratorPage } from "@/pages/BootstrapAdministratorPage/BootstrapAdministratorPage";
import { LoginPage } from "@/pages/LoginPage/LoginPage";

import "@/pages/LoginPage/LoginPage.scss";

type BootstrapAvailability = "loading" | "available" | "unavailable" | "error";

function readRegistrationAvailability(value: unknown): boolean {
  if (
    typeof value !== "object" ||
    value === null ||
    !("registrationAvailable" in value) ||
    typeof value.registrationAvailable !== "boolean"
  ) {
    throw new Error("The bootstrap status response is invalid.");
  }

  return value.registrationAvailable;
}

export function AuthenticationEntryPage() {
  const [availability, setAvailability] =
    useState<BootstrapAvailability>("loading");
  const [loginNotice, setLoginNotice] = useState<string>();

  const loadBootstrapStatus = useCallback(async (): Promise<void> => {
    try {
      const response = await getAuthenticationBootstrapStatus();
      const registrationAvailable = readRegistrationAvailability(response.data);

      setAvailability(registrationAvailable ? "available" : "unavailable");
    } catch {
      setAvailability("error");
    }
  }, []);

  useEffect(() => {
    void loadBootstrapStatus();
  }, [loadBootstrapStatus]);

  if (availability === "available") {
    return (
      <BootstrapAdministratorPage
        onContinueToLogin={() => {
          setLoginNotice(
            "Initial Administrator registration is complete. Sign in after verifying your email address.",
          );
          setAvailability("unavailable");
        }}
        onBootstrapUnavailable={() => {
          setLoginNotice(
            "Initial Administrator registration has already been completed.",
          );
          setAvailability("unavailable");
        }}
      />
    );
  }

  if (availability === "unavailable") {
    return <LoginPage notice={loginNotice} />;
  }

  return (
    <main className="login-page">
      <section
        className="login-page__panel"
        aria-labelledby="authentication-entry-title"
      >
        <h1 id="authentication-entry-title">Authentication</h1>
        {availability === "loading" ? (
          <p role="status">Checking application setup…</p>
        ) : (
          <>
            <p className="login-page__error" role="alert">
              The application setup status could not be loaded.
            </p>
            <Button
              type="button"
              label="Try again"
              onClick={() => {
                setAvailability("loading");
                void loadBootstrapStatus();
              }}
            />
          </>
        )}
      </section>
    </main>
  );
}
