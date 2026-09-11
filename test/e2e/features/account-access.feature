@account-access
Feature: Public account access
  Users can register and use public verification and recovery entry points without backend mocks.

  Background:
    Given the real public account API is available

  Scenario: Register a local account
    When I register a unique local frontend account
    Then the registration instructions should be visible
    And the normalized registration data should be visible to administration

  Scenario: Reject an invalid email-verification link
    When I open an invalid frontend email-verification link
    Then the email-verification invalid-link message should be visible

  Scenario: Resend an email-verification link without account enumeration
    When I request another frontend verification email
    Then the generic verification-email response should be visible

  Scenario: Request a password reset without account enumeration
    When I request a frontend password reset
    Then the generic password-reset response should be visible

  Scenario: Reject an invalid password-reset token
    When I open an invalid frontend password-reset link
    And I submit a new frontend password
    Then the password-reset invalid-link message should be visible
