@account-access
Feature: Public account access
  Users can register, verify their email address, and recover a forgotten password.

  Background:
    Given the public account API is available

  Scenario: Register a local account
    When I register a local frontend account
    Then the registration instructions should be visible
    And the normalized registration data should have been submitted

  Scenario: Verify an email link
    When I open a frontend email-verification link
    Then the email-verification confirmation should be visible
    And the verification token should have been submitted once

  Scenario: Resend an email-verification link without account enumeration
    When I request another frontend verification email
    Then the generic verification-email response should be visible

  Scenario: Request a password reset without account enumeration
    When I request a frontend password reset
    Then the generic password-reset response should be visible

  Scenario: Set a new password
    When I open a frontend password-reset link
    And I submit a new frontend password
    Then the password-change confirmation should be visible
    And the password-reset token should have been submitted
