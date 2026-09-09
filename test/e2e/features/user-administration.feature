@user-administration
Feature: User and session administration
  Administrators manage account activation and active sessions.

  Scenario: Activate a verified user and revoke a session
    Given the frontend user-administration API is available
    When I sign in as a frontend Administrator
    And I open frontend user administration
    And I select the pending user
    And I activate the selected user
    Then the user should be active in frontend administration
    When I revoke the selected user's active session
    Then the session should be shown as revoked
