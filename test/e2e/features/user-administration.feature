@frontend-real-backend
Feature: User administration
  Administrators manage user account metadata from the dedicated administration workspace.

  Scenario: Open user administration details
    Given a real frontend Administrator session is available
    When I open frontend user administration as a real Administrator
    And I select the Administrator user
    Then the selected user account details should be visible
