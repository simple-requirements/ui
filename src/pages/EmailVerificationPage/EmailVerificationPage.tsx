import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";

import { confirmEmailVerification } from "@/api/authApi";
import { LOGIN_ROUTE } from "@/auth/authRoutes";

import "@/pages/PublicAccountPage/PublicAccountPage.scss";

type ConfirmationState = "confirming" | "confirmed" | "invalid";

const confirmationRequests = new Map<string, Promise<ConfirmationState>>();

function confirmToken(token: string): Promise<ConfirmationState> {
  const pendingRequest = confirmationRequests.get(token);

  if (pendingRequest !== undefined) {
    return pendingRequest;
  }

  const request = confirmEmailVerification(token).then(
    () => "confirmed" as const,
    () => "invalid" as const,
  );
  confirmationRequests.set(token, request);

  return request;
}

export function EmailVerificationPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const [state, setState] = useState<ConfirmationState>(
    token.length > 0 ? "confirming" : "invalid",
  );

  useEffect(() => {
    if (token.length === 0) {
      return;
    }

    let isActive = true;

    void confirmToken(token).then((confirmationState) => {
      if (isActive) {
        setState(confirmationState);
      }
    });

    return () => {
      isActive = false;
    };
  }, [token]);

  return (
    <main className="public-account-page">
      <section
        className="public-account-page__panel"
        aria-labelledby="email-verification-title"
      >
        <h1 id="email-verification-title">Verify email address</h1>
        {state === "confirming" && (
          <p role="status">Verifying your email address…</p>
        )}
        {state === "confirmed" && (
          <>
            <p className="public-account-page__status" role="status">
              Your email address has been verified. Regular accounts can sign in
              after an Administrator has activated them.
            </p>
            <div className="public-account-page__actions">
              <Link to={LOGIN_ROUTE}>Continue to sign in</Link>
            </div>
          </>
        )}
        {state === "invalid" && (
          <>
            <p className="public-account-page__error" role="alert">
              The verification link is invalid or has expired.
            </p>
            <div className="public-account-page__actions">
              <Link to="/verify-email/resend">
                Request another verification email
              </Link>
              <Link to={LOGIN_ROUTE}>Return to sign in</Link>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
